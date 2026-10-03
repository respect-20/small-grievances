import {NextRequest, NextResponse} from 'next/server'
import {client, writeClient} from '@/sanity/lib/client'
import {syncWorkflowState} from '@/sanity/lib/workflow'

interface RulingResult {
  verdict: 'guilty' | 'not-guilty' | 'both-at-fault' | 'dismissed'
  reasoning: string
  penalty: string
}

async function askCommissioner(params: {
  personality: string
  honorific: string
  grievance: {
    title: string
    category: string
    severity: number
    complainant: string
    respondent: string
    description: string
  }
}): Promise<RulingResult> {
  const {personality, honorific, grievance} = params

  const systemPrompt = `You are ${honorific}, presiding over the Department of Small Grievances, a mock tribunal for petty everyday disputes. Your personality: ${personality}

You must rule on the case below. Respond with ONLY a JSON object, no markdown fences, matching this exact shape:
{"verdict": "guilty" | "not-guilty" | "both-at-fault" | "dismissed", "reasoning": "your written opinion, 2-4 sentences, in character", "penalty": "a specific, petty-but-fitting penalty for the losing party, or empty string if dismissed or not-guilty"}`

  const userPrompt = `CASE FILE
Category: ${grievance.category}
Pettiness Level: ${grievance.severity}/5
Complainant: ${grievance.complainant}
Respondent: ${grievance.respondent}
Complaint: ${grievance.title}

Full statement: ${grievance.description}

Issue your ruling.`

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const callGemini = () =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          systemInstruction: {parts: [{text: systemPrompt}]},
          contents: [{role: 'user', parts: [{text: userPrompt}]}],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            thinkingConfig: {thinkingBudget: 0},
          },
        }),
      },
    )

  // Gemini's free tier occasionally returns 503 "high demand" — worth a couple of
  // quick retries before giving up, rather than failing the whole ruling.
  let res = await callGemini()
  for (let attempt = 0; !res.ok && res.status === 503 && attempt < 2; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    res = await callGemini()
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Commissioner failed to respond: ${res.status} ${text}`)
  }

  const data = await res.json()
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)

  return {
    verdict: parsed.verdict,
    reasoning: parsed.reasoning,
    penalty: parsed.penalty || '',
  }
}

export async function POST(req: NextRequest) {
  try {
    const {grievanceId} = await req.json()
    if (!grievanceId) {
      return NextResponse.json({error: 'grievanceId is required'}, {status: 400})
    }

    const grievance = await client.fetch(
      `*[_type == "grievance" && _id == $id][0]{
        _id, title, category, severity, complainant, respondent, description
      }`,
      {id: grievanceId},
    )

    if (!grievance) {
      return NextResponse.json({error: 'Grievance not found'}, {status: 404})
    }

    const commissioner = await client.fetch(
      `*[_type == "commissioner" && active == true][0]{_id, name, honorific, personality}`,
    )

    if (!commissioner) {
      return NextResponse.json(
        {error: 'No active Commissioner found. Create one in the Studio first.'},
        {status: 400},
      )
    }

    // Move to "under review" so the workflow board reflects the agent picking it up.
    await writeClient.patch(grievanceId).set({status: 'under-review'}).commit()
    await syncWorkflowState(grievanceId, 'under-review')

    try {
      const result = await askCommissioner({
        personality: commissioner.personality,
        honorific: commissioner.honorific,
        grievance,
      })

      const ruling = await writeClient.create({
        _type: 'ruling',
        grievance: {_type: 'reference', _ref: grievanceId},
        commissioner: {_type: 'reference', _ref: commissioner._id},
        verdict: result.verdict,
        reasoning: result.reasoning,
        penalty: result.penalty,
        issuedAt: new Date().toISOString(),
      })

      await writeClient
        .patch(grievanceId)
        .set({status: 'ruling-issued', ruling: {_type: 'reference', _ref: ruling._id}})
        .commit()
      await syncWorkflowState(grievanceId, 'ruling-issued')

      return NextResponse.json({ruling})
    } catch (err) {
      // Revert to "filed" so the case isn't stuck showing "under review" with no ruling.
      await writeClient.patch(grievanceId).set({status: 'filed'}).commit()
      await syncWorkflowState(grievanceId, 'filed')
      throw err
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Unknown error'},
      {status: 500},
    )
  }
}
