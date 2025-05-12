'use client'
import { useEffect, useState } from 'react'

export default function Home() {
  const [cards, setCards] = useState([])
  const [name, setName] = useState('')
  const [value, setValue] = useState(0.5)

  useEffect(() => {
    fetch('/api/cards')
      .then(res => res.json())
      .then(setCards)
  }, [])

  const addCard = async () => {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value: parseFloat(value.toString()) })
    })
    location.reload()
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cards DB</h1>
      <div className="mb-4 space-x-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="border px-2 py-1"
          placeholder="Card name"
        />
        <select
          value={value}
          onChange={e => setValue(parseFloat(e.target.value))}
          className="border px-2 py-1"
        >
          <option value={0.25}>Low (0.25)</option>
          <option value={0.5}>Mid (0.5)</option>
          <option value={1}>High (1)</option>
          <option value={2}>Other (2)</option>
        </select>
        <button
          onClick={addCard}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {cards.map((card: any) => (
          <li key={card.id} className="border p-2 rounded">
            {card.name} - {card.value}
          </li>
        ))}
      </ul>
    </main>
  )
}
