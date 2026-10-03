import {NextRequest, NextResponse} from 'next/server'
import {client, writeClient} from '@/sanity/lib/client'

export async function GET() {
  try {
    const grievances = await client.fetch(
      `*[_type == "grievance"] | order(filedAt desc){
        _id, caseNumber, title, category, severity, complainant, respondent, status, filedAt,
        "ruling": ruling->{verdict, reasoning, penalty}
      }`,
    )
    return NextResponse.json({grievances})
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Unknown error', grievances: []},
      {status: 500},
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {title, category, severity, complainant, respondent, description} = body

    if (!title || !category || !severity || !complainant || !respondent || !description) {
      return NextResponse.json({error: 'All fields are required'}, {status: 400})
    }

    const count: number = await client.fetch(`count(*[_type == "grievance"])`)
    const caseNumber = `DSG-${String(count + 1).padStart(4, '0')}`

    const grievance = await writeClient.create({
      _type: 'grievance',
      caseNumber,
      title,
      category,
      severity,
      complainant,
      respondent,
      description,
      status: 'filed',
      filedAt: new Date().toISOString(),
    })

    return NextResponse.json({grievance})
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      {error: err instanceof Error ? err.message : 'Unknown error'},
      {status: 500},
    )
  }
}
