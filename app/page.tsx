'use client'

import {useState} from 'react'
import GrievanceForm from '@/components/GrievanceForm'
import Docket from '@/components/Docket'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main className="page">
      <header className="masthead">
        <div className="seal">&#9878;</div>
        <h1>The Department of Small Grievances</h1>
        <p className="tagline">
          A tribunal for the disputes too petty for a real court, presided over by an
          Artificial Commissioner with structured content and no patience for nonsense.
        </p>
        <a className="studio-link" href="/studio" target="_blank" rel="noreferrer">
          View the Studio &rarr;
        </a>
      </header>

      <section className="content-grid">
        <GrievanceForm onFiled={() => setRefreshKey((k) => k + 1)} />
        <Docket refreshKey={refreshKey} />
      </section>
    </main>
  )
}
