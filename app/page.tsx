import Pathword from '@/components/Pathword'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Pathword />
      <section className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-700">
        <h1 className="text-xl font-semibold mb-2">Pathword — Daily Word Puzzle Game</h1>
        <p className="mb-4">
          Pathword is a free, daily word puzzle where you chart a path through a letter grid to reveal a hidden six-letter word.
          Each move gives color feedback to guide your next choice. Come back every day for a new Pathword.
        </p>
        <h2 className="text-lg font-medium mb-2">How to play</h2>
        <p>
          Start on the top row and select a letter. Green means correct, yellow marks the nearest alphabetical neighbors among available letters,
          and red means you&apos;re moving further away. Work your way down one row at a time without reusing columns to uncover the daily word.
        </p>
      </section>
    </main>
  )
}
