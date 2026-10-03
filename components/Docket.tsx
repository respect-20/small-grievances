'use client'

import {useCallback, useEffect, useState} from 'react'
import Link from 'next/link'

interface Grievance {
  _id: string
  caseNumber: string
  title: string
  category: string
  severity: number
  complainant: string
  respondent: string
  status: string
  filedAt: string
  ruling?: {
    verdict: string
    reasoning: string
    penalty: string
  } | null
}

const STATUS_LABEL: Record<string, string> = {
  filed: 'Filed',
  'under-review': 'Under Review',
  'ruling-issued': 'Ruling Issued',
  appealed: 'Appealed',
  closed: 'Closed',
}

const VERDICT_LABEL: Record<string, string> = {
  guilty: 'Guilty',
  'not-guilty': 'Not Guilty',
  'both-at-fault': 'Both Parties at Fault',
  dismissed: 'Case Dismissed',
}

export default function Docket({refreshKey}: {refreshKey: number}) {
  const [cases, setCases] = useState<Grievance[]>([])
  const [loading, setLoading] = useState(true)
  const [judging, setJudging] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [judgeError, setJudgeError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/grievances', {cache: 'no-store'})
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load the docket')
      setCases(json.grievances || [])
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load the docket')
      setCases([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  async function submitForJudgment(id: string) {
    setJudging(id)
    setJudgeError(null)
    try {
      const res = await fetch('/api/rule', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({grievanceId: id}),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'The Commissioner could not reach a ruling')
      await load()
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : 'The Commissioner could not reach a ruling')
    } finally {
      setJudging(null)
    }
  }

  return (
    <div className="docket">
      <h2>The Docket</h2>
      {judgeError && <p className="form-error">{judgeError}</p>}
      {loading && <p className="docket-loading">Loading the docket...</p>}
      {!loading && loadError && (
        <p className="form-error">Could not reach the Department: {loadError}</p>
      )}
      {!loading && !loadError && cases.length === 0 && (
        <p className="docket-loading">No cases filed yet. The Department awaits.</p>
      )}
      {cases.map((c) => (
        <article key={c._id} className={`case-card status-${c.status}`}>
          <header>
            <Link href={`/docket/${c.caseNumber}`} className="case-number">
              {c.caseNumber}
            </Link>
            <span className="case-status">{STATUS_LABEL[c.status] || c.status}</span>
          </header>
          <h3>{c.title}</h3>
          <p className="case-meta">
            {c.complainant} v. {c.respondent} &middot; Pettiness {c.severity}/5
          </p>

          {c.ruling ? (
            <div className="ruling-box">
              <strong>{VERDICT_LABEL[c.ruling.verdict] || c.ruling.verdict}</strong>
              <p>{c.ruling.reasoning}</p>
              {c.ruling.penalty && <p className="penalty">Penalty: {c.ruling.penalty}</p>}
            </div>
          ) : (
            <button
              onClick={() => submitForJudgment(c._id)}
              disabled={judging === c._id}
              className="judge-button"
            >
              {judging === c._id ? 'The Commissioner is deliberating...' : 'Submit for Judgment'}
            </button>
          )}
        </article>
      ))}
    </div>
  )
}
