'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddCard() {
  const [name, setName] = useState('')
  const [value, setValue] = useState(0.5)
  const router = useRouter()

  const addCard = async () => {
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value }),
    })
    router.push('/cards')
  }

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">Add New Card</h1>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Card name"
        className="border p-2 w-full mb-2"
      />
      <select
        value={value}
        onChange={e => setValue(parseFloat(e.target.value))}
        className="border p-2 w-full mb-4"
      >
        <option value={0.25}>Low (0.25)</option>
        <option value={0.5}>Mid (0.5)</option>
        <option value={1}>High (1)</option>
        <option value={2}>Other</option>
      </select>
      <button
        onClick={addCard}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Save
      </button>
    </main>
  )
}
