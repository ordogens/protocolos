import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Protocolo Emocional</h1>
      <button
        type="button"
        onClick={() => setCount((count) => count + 1)}
      >
        Contador: {count}
      </button>
    </div>
  )
}

export default App
