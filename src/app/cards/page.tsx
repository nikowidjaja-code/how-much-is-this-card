'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CardList() {
  const [cards, setCards] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/cards')
      .then(res => res.json())
      .then(setCards)
  }, [])

  const filteredCards = cards.filter((card: any) =>
    card.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main>
      <h1 className="text-2xl font-bold mb-4">All Cards</h1>
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <ul className="space-y-2">
        {filteredCards.map((card: any) => (
          <li key={card.id} className="border p-3 rounded flex justify-between items-center">
            <span>{card.name} — {card.value}</span>
            <Link href={`/edit/${card.id}`} className="text-blue-500">Edit</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
