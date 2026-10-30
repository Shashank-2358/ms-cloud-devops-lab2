import { useEffect, useState } from 'react'

// nginx answers /whoami with its hostname. Inside Kubernetes the hostname is the Pod name.
async function askWhoAmI() {
  const res = await fetch('/whoami', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.text()).trim()
}

export default function App() {
  const [current, setCurrent] = useState(null)
  const [counts, setCounts] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    async function tick() {
      try {
        const pod = await askWhoAmI()
        setCurrent(pod)
        setCounts((c) => ({ ...c, [pod]: (c[pod] || 0) + 1 }))
        setError(null)
      } catch (e) {
        setError(e.message)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <main>
      <h1>Hello from Kubernetes 👋</h1>
      <p className="label">This answer came from</p>
      <p className="pod">{current ?? '…'}</p>
      {error && <p className="error">Cannot reach /whoami: {error}</p>}

      <h2>Answers so far</h2>
      <table>
        <thead>
          <tr><th>Pod</th><th>Requests</th></tr>
        </thead>
        <tbody>
          {Object.entries(counts).map(([pod, n]) => (
            <tr key={pod} className={pod === current ? 'now' : ''}>
              <td>{pod}</td><td>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">The page asks once a second. Each question opens a new connection, so the Service can pick a different Pod every time.</p>
    </main>
  )
}
