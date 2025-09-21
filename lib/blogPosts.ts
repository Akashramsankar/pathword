export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  timeRequired: string;
  summary: string;
  tags: string[];
  content: string[];
  highlights: string[];
  wordCount: number;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "pathword-tips-and-tricks",
    title: "Pathword Tips & Tricks: Solve in 6 Guesses (or Less)",
    date: "2025-09-21",
    readingTime: "5 min read",
    timeRequired: "PT7M",
    summary:
      "Master Pathword logic with clue decoding strategies, column control, and backtracking techniques so you can consistently solve the daily puzzle in six guesses or fewer.",
    tags: [
      "Pathword tips",
      "Word puzzle strategy",
      "Daily puzzle guide",
      "Logic puzzle",
    ],
    content: [
      "Pathword isn’t about luck — it’s about alphabetical logic and deduction. Your challenge: find the hidden six-letter word in six tries. Each guess, you must pick one letter per row — and no two letters can share the same column. The key to winning is learning how to use Pathword’s clues effectively. Here’s the complete guide to mastering them.",
      "The color feedback system is your map. Green means the letter is perfect and the column is sealed. Yellow signals that the correct letter is the immediate alphabetical neighbor of your guess — either one step before or after within that row. Red wipes out your guess and both of its neighbors, clearing three letters from contention in one shot.",
      "Consider a quick example. Imagine the row B D P Q T Z. If you pick Q and see 🔴, you instantly know the answer is not P, Q, or T. Only B, D, or Z remain. That’s powerful signal compression, especially in the early rows when information is scarce.",
      "With that foundation, here are eight tips to solve Pathword like a pro:",
      "1. Make your first guess strategic. Treat guess #1 as reconnaissance. Pick letters from different columns to keep options open, and choose alphabetically central letters so a yellow clue pulls you directly toward the correct tile.",
      "2. Turn yellow into a narrow search. Yellow doesn’t just mean “close” — it narrows you to exactly two choices. In the earlier example, a 🟡 on D says the answer is either B (before) or P (after). Use that binary to plan your next attempts.",
      "3. Use red to wipe out options. Red is your best eliminator. One red clue removes your guess and both neighbors, often clearing half the row in a single move. Stack reds from different rows to collapse the solution space fast.",
      "4. Lock in columns. Every green letter locks that column forever. That automatically reduces options for lower rows, forcing the solution path to emerge step by step.",
      "5. Think of guesses as branches. Guesses 1–3 are for information gathering; guesses 4–6 are for commitment. If your path looks impossible by guess #4, backtrack and try a different combination — you still have time.",
      "6. Crack middle rows early. Rows 3–4 often hold the puzzle’s pivot points. Once those letters lock in, the beginning and end of the word usually fall into place.",
      "7. Practice for pattern recognition. Use the date selector to replay past puzzles. With practice you learn where vowels tend to hide, which consonants pair together, and how trap yellows behave.",
      "The key takeaway: Pathword is part word hunt, part pure logic. 🟡 Yellow points exactly one step left or right in the alphabet. 🔴 Red wipes out whole clusters. ✅ Green locks your path and clears a column. Play your first few guesses like an investigation, and play your last guesses like a commitment. Master that balance and you’ll often finish with guesses to spare.",
    ],
    highlights: [
      "Yellow clues narrow you to a two-letter choice every time.",
      "Red feedback deletes three letters at once — use it to prune entire routes.",
      "Greens lock columns, so each success reduces future decision space.",
      "Early guesses gather intel; late guesses commit to the winning path.",
    ],
    wordCount: 890,
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
