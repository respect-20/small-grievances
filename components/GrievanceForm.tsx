'use client'

import {useState} from 'react'

const CATEGORIES = [
  {value: 'kitchen-crimes', label: 'Kitchen Crimes'},
  {value: 'shared-space', label: 'Shared Space Violations'},
  {value: 'digital-etiquette', label: 'Digital Etiquette'},
  {value: 'noise-pollution', label: 'Noise Pollution'},
  {value: 'miscellaneous', label: 'Miscellaneous Pettiness'},
]

export default function GrievanceForm({onFiled}: {onFiled: () => void}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filedCase, setFiledCase] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setFiledCase(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      title: data.get('title'),
      category: data.get('category'),
      severity: Number(data.get('severity')),
      complainant: data.get('complainant'),
      respondent: data.get('respondent'),
      description: data.get('description'),
    }

    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Filing failed')
      setFiledCase(json.grievance.caseNumber)
      form.reset()
      onFiled()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grievance-form">
      <h2>File a Grievance</h2>
      <p className="form-hint">
        All fields are required. Perjury before the Department is taken exactly as seriously as
        the offense itself.
      </p>

      <label>
        Short Description
        <input name="title" type="text" maxLength={120} required placeholder="e.g. Left dishes in the sink for four days" />
      </label>

      <div className="form-row">
        <label>
          Category
          <select name="category" required defaultValue="">
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pettiness Level (1-5)
          <select name="severity" required defaultValue="">
            <option value="" disabled>
              Select severity
            </option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Complainant (your name)
          <input name="complainant" type="text" required placeholder="Your name" />
        </label>
        <label>
          Respondent (the accused)
          <input name="respondent" type="text" required placeholder="Their name" />
        </label>
      </div>

      <label>
        Full Statement
        <textarea name="description" rows={5} minLength={20} required placeholder="State your case in full. The Commissioner has heard worse, probably." />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Filing...' : 'File Grievance'}
      </button>

      {error && <p className="form-error">{error}</p>}
      {filedCase && (
        <p className="form-success">
          Case {filedCase} has been filed. It now awaits review.
        </p>
      )}
    </form>
  )
}
