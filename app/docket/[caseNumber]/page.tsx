import {notFound} from 'next/navigation'
import Link from 'next/link'
import {client} from '@/sanity/lib/client'

const VERDICT_LABEL: Record<string, string> = {
  guilty: 'Guilty',
  'not-guilty': 'Not Guilty',
  'both-at-fault': 'Both Parties at Fault',
  dismissed: 'Case Dismissed',
}

async function getCase(caseNumber: string) {
  return client.fetch(
    `*[_type == "grievance" && caseNumber == $caseNumber][0]{
      _id, caseNumber, title, category, severity, complainant, respondent, description, status, filedAt,
      "ruling": ruling->{verdict, reasoning, penalty, issuedAt, "commissioner": commissioner->{name, honorific}}
    }`,
    {caseNumber},
  )
}

export default async function CasePage({
  params,
}: {
  params: Promise<{caseNumber: string}>
}) {
  const {caseNumber} = await params
  const item = await getCase(caseNumber)

  if (!item) notFound()

  return (
    <main className="page">
      <Link href="/" className="studio-link">
        &larr; Back to the Docket
      </Link>

      <article className="case-card" style={{marginTop: '1.5rem'}}>
        <header>
          <span className="case-number">{item.caseNumber}</span>
          <span className="case-status">{item.status}</span>
        </header>
        <h1 style={{marginTop: 0}}>{item.title}</h1>
        <p className="case-meta">
          {item.complainant} v. {item.respondent} &middot; Pettiness {item.severity}/5
        </p>
        <p>{item.description}</p>

        {item.ruling ? (
          <div className="ruling-box">
            <strong>{VERDICT_LABEL[item.ruling.verdict] || item.ruling.verdict}</strong>
            <p>{item.ruling.reasoning}</p>
            {item.ruling.penalty && <p className="penalty">Penalty: {item.ruling.penalty}</p>}
            <p style={{fontSize: '0.75rem', color: '#6b6350', marginTop: '0.5rem'}}>
              Ruled by {item.ruling.commissioner?.honorific} {item.ruling.commissioner?.name}
            </p>
          </div>
        ) : (
          <p className="docket-loading">This case has not yet been ruled on.</p>
        )}
      </article>
    </main>
  )
}
