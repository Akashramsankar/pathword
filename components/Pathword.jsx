// Pathword.jsx

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  HelpCircle,
  Share2,
  X as CloseIcon,
  ChevronDown, // <<<< ADD THIS
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import * as gtag from '../lib/gtag';

const helpSlidesData = [
  {
    id: 'welcome',
    imageUrl: '/pathword/images/help/pathword-grid-welcome.png',
    instruction: "Welcome to Pathword! Find the hidden word by charting a course through the letters from row 1 to 6.",
    altText: 'Pathword game grid with a welcoming message.'
  },
  {
    id: 'start-top',
    imageUrl: '/pathword/images/help/pathword-start-top.png',
    instruction: "Begin your expedition by selecting a letter from the <span class='font-semibold'>very first row</span>. <br/> If you chose the correct letter, it will turn <span class='text-green-600 font-semibold'>GREEN</span>.",
    altText: 'Illustration showing selecting a letter from the first row of the Pathword grid.'
  },
  {
    id: 'row-below',
    imageUrl: '/pathword/images/help/pathword-row-below.png',
    instruction: "If the chosen letter turns <span class='text-red-600 font-semibold'>RED</span>, it is alphabetically far from the correct letter!",
    altText: 'Illustration showing moving to a letter in the row directly below.'
  },
  {
    id: 'new-column',
    imageUrl: '/pathword/images/help/pathword-new-column.png',
    instruction: "If the chosen letter turns <span class='text-yellow-500 font-semibold'>YELLOW</span>, you are getting alphabetically closer!",
    altText: 'Illustration demonstrating that each letter must be from a new column.'
  },
  {
    id: 'complete-path',
    imageUrl: '/pathword/images/help/pathword-complete-path.png',
    instruction: "The chosen letter turns <span class='text-green-600 font-semibold'>GREEN</span>, <br/> when you arrive at the correct letter for that row!",
    altText: 'Illustration of a completed path forming the Pathword.'
  },
   {
    id: 'revealed-letter',
    imageUrl: '/pathword/images/help/pathword-revealed-letter.png',
    instruction: "Now let's move to the row right below. <br/> You <span class='font-semibold'>cannot revisit a column</span> once a letter from it has been chosen! ",
    altText: 'Illustration highlighting the pre-revealed green letter on the grid.'
  },
  {
    id: 'tries-limit',
    imageUrl: '/pathword/images/help/pathword-tries-limit.png', // You'll need to create this image
    instruction: "You have <span class='font-semibold'>6 tries</span> to find the 6-letter Pathword. Good luck!",
    altText: 'Illustration showing the 10 tries limit.'
  },
  {
    id: 'backtrack',
    imageUrl: '/pathword/images/help/pathword-backtrack.png',
    instruction: "Click on the stats icon to view your pathword journey log: </br> Track your streaks, paths found, and the tries it takes you to find the way!",
    altText: 'Illustration showing how to backtrack by clicking the last selected letter.'
  },
];

const dailyPuzzles = [
  // For "TEMPLE"
{
  date: "2025-06-19", // Set your desired date
  grid: [
    ["A", "G", "K", "T", "V", "R"], 
    ["E", "H", "O", "X", "R", "Y"], 
    ["B", "I", "N", "S", "M", "A"], 
    ["W", "P", "J", "O", "U", "D"],  
    ["G", "K", "Q", "V", "A", "L"], 
    ["H", "M", "E", "R", "W", "S"]   
  ],
  answer: "TEMPLE",
},
  // For "MOUNTS"
{
  date: "2025-06-18", // Set your desired date
  grid: [
    ["A", "K", "M", "P", "S", "T"],  
    ["E", "H", "U", "R", "V", "O"],  
    ["A", "U", "I", "N", "W", "Y"],  
    ["F", "D", "J", "N", "Q", "R"],  
    ["T", "K", "L", "P", "D", "G"], 
    ["E", "H", "T", "X", "S", "Y"]   
  ],
  answer: "MOUNTS",
},
  // For "PEPPER"
{
  date: "2025-06-17", // Set your desired date
  grid: [
    ["L", "P", "G", "B", "S", "Y"],  
    ["U", "H", "O", "T", "E", "A"],  
    ["P", "C", "I", "N", "U", "R"],  
    ["F", "D", "T", "K", "Q", "P"],  
    ["L", "G", "E", "R", "W", "A"],  
    ["C", "H", "S", "R", "T", "Y"]   
  ],
  answer: "PEPPER",
},
  // For "PEOPLE"
{
  date: "2025-06-16", // Set your desired date
  grid: [
    ["B", "G", "P", "L", "S", "Y"],  
    ["A", "H", "M", "R", "U", "E"],  
    ["O", "C", "I", "N", "U", "Y"],  
    ["F", "D", "J", "P", "Q", "V"],  
    ["K", "L", "G", "R", "W", "A"], 
    ["C", "H", "S", "X", "E", "Y"]   
  ],
  answer: "PEOPLE",
},
  // For "TREMOR"
{
  date: "2025-06-15", // Set your desired date
  grid: [
    ["A", "G", "T", "L", "P", "Y"],  
    ["B", "H", "O", "S", "U", "R"], 
    ["E", "C", "I", "N", "R", "W"],  
    ["E", "A", "K", "M", "L", "V"],  
    ["K", "O", "G", "P", "W", "A"], 
    ["C", "H", "S", "X", "R", "Y"]   
  ],
  answer: "TREMOR",
},
  // For "DESIGN"
{
  date: "2025-06-14", // Set your desired date
  grid: [
    ["A", "D", "K", "P", "W", "Y"], 
    ["R", "H", "L", "A", "E", "X"],  
    ["S", "C", "J", "M", "R", "Y"],  
    ["A", "G", "K", "P", "T", "I"], 
    ["B", "H", "G", "N", "U", "W"],  
    ["C", "J", "M", "N", "S", "X"]   
  ],
  answer: "DESIGN",
},
    // For "BANKER"
{
  date: "2025-06-13", // Set your desired date
  grid: [
    ["D", "B", "T", "Z", "P", "Q"], 
    ["H", "U", "R", "W", "A", "L"], 
    ["N", "E", "F", "Y", "L", "V"], 
    ["M", "O", "A", "X", "S", "K"],  
    ["U", "V", "E", "W", "A", "I"], 
    ["Z", "Y", "X", "R", "W", "V"]   
  ],
  answer: "BANKER",
  revealedLetter: { row: 5, col: 3, letter: "R" }, // Original col index
  clues: [ // Clues are for the new mechanics, not hints for the word itself
    { position: 1, description: "A bouncy letter, or begins 'blue'." },
    { position: 3, description: "I start every 'nap', but never in sleep." },
    { position: 5, description: "I am the start and end of 'everyone'!" },
  ]
},
  // For "IGNORE"
{
  date: "2025-06-12", // Set your desired date
  grid: [
    ["T", "D", "Z", "I", "P", "A"],  
    ["G", "L", "R", "Y", "O", "R"],  
    ["N", "A", "X", "U", "N", "D"],  
    ["E", "O", "V", "P", "M", "K"],  
    ["L", "M", "W", "T", "S", "R"],  
    ["Z", "Y", "E", "V", "W", "X"]   
  ],
  answer: "IGNORE",
  revealedLetter: { row: 5, col: 2, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "The 7th letter in the alphabetical order." },
    { position: 4, description: "A round vowel, or can mean zero." },
    { position: 5, description: "I start every 'run', 'race', and 'riot'. I’m not calm."},
  ]
},
  // For "TRAVEL"
{
  date: "2025-06-11", // Set your desired date
  grid: [
    ["X", "Y", "T", "Z", "P", "Q"],  
    ["H", "W", "Z", "O", "E", "R"],  
    ["N", "A", "Y", "I", "G", "U"], 
    ["I", "R", "Q", "V", "M", "S"],  
    ["E", "L", "X", "T", "C", "A"],  
    ["Y", "S", "R", "N", "L", "T"]   
  ],
  answer: "TRAVEL",
  revealedLetter: { row: 0, col: 2, letter: "T" }, // Original col index
  clues: [
    { position: 4, description: "Looks like the Roman numeral five." },
    { position: 5, description: "Without me 'severe' is only 3 letters. Which letter am I?"},
    { position: 6, description: "I start 'long' and end 'tall'"}
  ]
},
  // For "ABSENT"
{
  date: "2025-06-10", // Set your desired date
  grid: [
    ["M", "V", "Z", "A", "P", "Q"], 
    ["B", "R", "L", "O", "E", "Z"],  
    ["N", "O", "U", "G", "S", "X"],  
    ["H", "E", "I", "V", "L", "Y"],  
    ["Z", "Y", "X", "Z", "X", "N"],  
    ["G", "Y", "T", "S", "K", "W"]   
  ],
  answer: "ABSENT",
  revealedLetter: { row: 4, col: 5, letter: "N" }, // Original col index
  clues: [
    { position: 1, description: "The first vowel, or an apple's companion." },
    { position: 4, description: "It starts 'every' 'end'. Which letter?" },
    { position: 6, description: "Coffee is my nemesis." }
  ]
},
  // For "THIRTY"
{
  date: "2025-06-09", // Set your desired date
  grid: [
    ["C", "T", "W", "P", "Q", "S"],  
    ["A", "L", "R", "H", "X", "F"],  
    ["I", "G", "O", "D", "Q", "M"],  
    ["N", "O", "P", "C", "Z", "R"],  
    ["R", "V", "T", "S", "X", "O"],  
    ["Z", "X", "W", "Q", "Y", "F"]   
  ],
  answer: "THIRTY",
  revealedLetter: { row: 5, col: 4, letter: "Y" }, // Original col index
  clues: [
    { position: 2, description: "No 'hurry', no 'hype', no 'hugs' without me." },
    { position: 3, description: "I’m slim, straight, and all about myself. Narcissistic? Maybe." },
    { position: 5, description: "Without me, there’s no 'tick' or 'tock'. 'Time' would not exist!" },
  ]
},
  // For "BOOMER" 
{
  date: "2025-06-08",
  grid: [
    ["C", "B", "Y", "W", "Z", "S"],  
    ["Z", "Y", "X", "W", "O", "Q"],  
    ["O", "E", "R", "G", "Y", "M"],  
    ["A", "J", "K", "L", "U", "M"],  
    ["P", "T", "E", "S", "X", "U"], 
    ["N", "S", "H", "R", "Z", "Y"]   
  ],
  answer: "BOOMER",
  revealedLetter: { row: 1, col: 4, letter: "O" }, // Original col index
  clues: [
    { position: 1, description: "A buzzing insect. Which letter?" },
    { position: 3, description: "Repeats the second letter of this word." },
    { position: 6, description: "I start ‘rush’, ‘risk’, and ‘reckless’. Yeah, I live fast." }
  ]
},
  // For "BEFORE"
{
  date: "2025-06-07", // Set your desired date
  grid: [
    ["A", "B", "Y", "P", "Q", "W"],
    ["H", "I", "R", "L", "Y", "E"],  
    ["F", "N", "C", "D", "Z", "O"], 
    ["I", "J", "K", "O", "X", "S"], 
    ["T", "U", "R", "V", "W", "N"],  
    ["Y", "Z", "X", "Q", "E", "W"]   
  ],
  answer: "BEFORE",
  revealedLetter: { row: 5, col: 4, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "Often found at the start of 'end'." },
    { position: 4, description: "A round vowel, or can mean 'zero'." },
    { position: 5, description: "I chase Q and race past S. Who am I?" },
  ]
},
  // For "DIVINE" - Revised
{
  date: "2025-06-06",
  grid: [
    ["X", "T", "D", "G", "P", "Q"],  
    ["Y", "R", "U", "L", "A", "I"],  
    ["X", "V", "A", "C", "F", "U"], 
    ["Z", "T", "E", "I", "K", "S"],  
    ["N", "Z", "Y", "X", "V", "W"],  
    ["Q", "Y", "Z", "S", "E", "T"]   
  ],
  answer: "DIVINE",
  revealedLetter: { row: 4, col: 0, letter: "N" }, // Original col index
    clues: [
    { position: 2, description: "Roman numeral for one. Which letter?" },
    { position: 4, description: "Repeats the second letter of this word." },
    { position: 6, description: "The most frequent vowel in English. Who am I?" }
  ]
},
  // For "PLIGHT"
{
  date: "2025-06-05", // Set your desired date
  grid: [
    ["K", "P", "C", "B", "Z", "U"],  
    ["A", "N", "E", "R", "Y", "L"],  
    ["I", "O", "M", "G", "X", "R"],  
    ["S", "T", "U", "G", "Q", "W"],  
    ["S", "C", "H", "A", "W", "N"], 
    ["Z", "Y", "X", "W", "T", "V"]   
  ],
  answer: "PLIGHT",
  revealedLetter: { row: 5, col: 4, letter: "T" }, // Original col index
  clues: [
    { position: 2, description: "A tall letter, often found in 'like' or 'love'." },
    { position: 3, description: "A personal pronoun, or stands for 'one'." },
    { position: 5, description: "A breathy sound, or found at the start of 'hat'." },
  ]
},
  // For "WINNER"
{
  date: "2025-06-04", // Set your desired date
  grid: [
    ["A", "W", "Z", "L", "D", "M"],  
    ["Y", "R", "V", "O", "I", "L"],  
    ["N", "I", "X", "L", "U", "S"],  
    ["A", "E", "W", "V", "K", "N"],  
    ["Z", "Y", "E", "X", "W", "V"], 
    ["Y", "S", "H", "R", "N", "A"]   
  ],
  answer: "WINNER",
  revealedLetter: { row: 4, col: 2, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "A personal pronoun, or a single vertical line." },
    { position: 3, description: "Often found at the end of 'sun' or 'run'." },
    { position: 6, description: "Without me, ‘rain’ is just ‘ain’. Weird, right?" }
  ]
},
  // For "CLOSET"
{
  date: "2025-06-03", // Set your desired date
  grid: [
    ["D", "B", "Z", "C", "P", "Z"],  
    ["L", "A", "H", "Y", "R", "Y"],  
    ["I", "N", "G", "U", "O", "X"],  
    ["T", "S", "E", "K", "V", "W"],  
    ["X", "Y", "Z", "W", "V", "E"],  
    ["S", "R", "T", "Y", "M", "W"]   
  ],
  answer: "CLOSET",
  revealedLetter: { row: 4, col: 5, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "Start of ‘laugh’, end of ‘cool’. What letter?" },
    { position: 4, description: "Without me, ‘smile’ becomes ‘mile’. Guess me!" },
    { position: 6, description: "A hot beverage, or a type of shirt." }
  ]
},
  // For "RACING"
{
  date: "2025-06-02", // Set your desired date
  grid: [
    ["T", "R", "W", "L", "P", "X"],  
    ["R", "I", "Y", "H", "A", "Y"],  
    ["C", "S", "G", "I", "F", "Z"],  
    ["Z", "Y", "X", "V", "W", "I"],  
    ["E", "R", "N", "V", "T", "V"],  
    ["Y", "E", "A", "G", "S", "W"]   
  ],
  answer: "RACING",
  revealedLetter: { row: 3, col: 5, letter: "I" }, // Original col index
  clues: [
    { position: 2, description: "The first vowel, signifies a top grade." },
    { position: 5, description: "I start 'nothing'!" },
    { position: 6, description: "From ‘gold’ to ‘garbage’ — I’m everywhere." }
  ]
},
  // Revised For "DETECT"
{
  date: "2025-06-01",
  grid: [
    ["A", "S", "D", "Y", "G", "Z"],  
    ["O", "R", "L", "M", "E", "Y"],  
    ["T", "A", "P", "V", "U", "X"], 
    ["U", "V", "W", "X", "Y", "E"],  
    ["A", "C", "R", "N", "F", "V"],  
    ["S", "Y", "O", "T", "L", "W"]   
  ],
  answer: "DETECT",
  revealedLetter: { row: 3, col: 5, letter: "E" }, // Original col index
   clues: [
    { position: 2, description: "In ‘deep’, I double down. In ‘empty’, I vanish." },
    { position: 3, description: "Hot and strong, I’m the only letter you can sip. Who am I?" },
    { position: 6, description: "Repeats the third letter of this word!" }
  ]
},
  // For "QUIRKY"
{
  date: "2025-05-31", // Set your desired date
  grid: [
    ["T", "Q", "D", "L", "M", "Z"], 
    ["A", "Y", "R", "U", "H", "Y"],  
    ["I", "R", "O", "S", "T", "Q"],  
    ["Z", "Y", "X", "Q", "W", "R"],  
    ["V", "E", "K", "R", "T", "Y"],  
    ["S", "P", "E", "N", "Y", "X"]  
  ],
  answer: "QUIRKY",
  revealedLetter: { row: 3, col: 5, letter: "R" }, // Original col index
  clues: [
    { position: 2, description: "Without me, there’s no ‘you’. What letter?" },
    { position: 3, description: "I stand tall, one line — that’s all." },
    { position: 6, description: "'Why?'" }
  ]
},
  // For "NORMAL"
{
  date: "2025-05-30", // Set your desired date
  grid: [
    ["Z", "T", "N", "Q", "P", "C"],  
    ["Y", "L", "U", "R", "H", "O"], 
    ["X", "R", "A", "I", "L", "G"],  
    ["W", "I", "E", "M", "N", "S"],  
    ["A", "Z", "Y", "X", "W", "V"],  
    ["V", "R", "Y", "S", "L", "T"]  
  ],
  answer: "NORMAL",
  revealedLetter: { row: 4, col: 0, letter: "A" }, // Original col index
  clues: [
    { position: 2, description: "A round vowel, can also mean zero." },
    { position: 4, description: "Looks like two mountains together!" },
    { position: 6, description: "Starts ‘legend’, ends ‘cool’. What letter?" }
  ]
},
  // For "DABBLE"
{
  date: "2025-05-29", // Set your desired date
  grid: [
    ["L", "D", "E", "R", "Q", "W"],  
    ["X", "Y", "Z", "C", "A", "Q"],  
    ["B", "R", "I", "T", "Z", "L"],  
    ["A", "N", "O", "P", "V", "B"],  
    ["S", "T", "L", "R", "W", "O"],  
    ["S", "R", "N", "E", "Z", "Y"]   
  ],
  answer: "DABBLE",
  revealedLetter: { row: 1, col: 4, letter: "A" }, // Original col index
  clues: [
    { position: 3, description: "If you take me out of 'bold', you will just be old." },
    { position: 4, description: "I am an identical twin of the 3rd letter." },
    { position: 6, description: "I start 'everything'. Literally!" }
  ]
},
  // For "GARLIC"
{
  date: "2025-05-28", // Set your desired date
  grid: [
    ["R", "G", "X", "M", "P", "A"],  
    ["L", "E", "Y", "I", "A", "R"],  
    ["R", "E", "Z", "H", "O", "K"],  
    ["O", "P", "W", "U", "V", "L"],  
    ["V", "W", "I", "X", "Y", "Z"],  
    ["R", "Y", "Z", "C", "S", "N"]   
  ],
  answer: "GARLIC",
  revealedLetter: { row: 4, col: 2, letter: "I" }, // Original col index
  clues: [
    { position: 2, description: "I lead the line and still steal the spotlight. Which letter am I?" },
    { position: 3, description: "Starts 'ride', ends 'never'. Who am I?" },
    { position: 6, description: "I start ‘chaos’ and casually act innocent." }
  ]
},

  {
  date: "2025-05-27", // Set your desired date
  grid: [
    ["T", "B", "L", "D", "Q", "W"],  
    ["X", "Y", "Z", "Q", "I", "J"],  
    ["S", "C", "A", "M", "V", "L"],  
    ["O", "E", "K", "N", "W", "H"],  
    ["V", "A", "O", "R", "X", "M"], 
    ["S", "T", "E", "P", "Z", "Y"]   
  ],
  answer: "BISHOP",
  revealedLetter: { row: 1, col: 4, letter: "I" }, // Original col index
  clues: [
    { position: 3, description: "I hiss, I slither. What letter" },
    { position: 5, description: "It's one of the vowels in the row." },
    { position: 6, description: "Wanna start a 'party'? You literally need me." }
  ]
},
  {
  date: "2025-05-26", // Set your desired date
  grid: [
    ["A", "P", "N", "B", "X", "T"], 
    ["U", "E", "R", "L", "Q", "M"],  
    ["X", "Y", "Z", "Q", "R", "B"], 
    ["D", "E", "I", "T", "Y", "S"],  
    ["L", "M", "N", "O", "Z", "A"],  
    ["Y", "R", "U", "S", "W", "E"]   
  ],
  answer: "BUREAU",
  revealedLetter: { row: 2, col: 4, letter: "R" }, // Original col index
  clues: [
    { position: 2, description: "I follow Q everywhere." },
    { position: 4, description: "It's one of the vowels in the row" },
    { position: 5, description: "I’m so extra, I show up twice in ‘alphabet’." },
  ]
},
    {
  date: "2025-05-25", 
  grid: [
    ["H", "R", "D", "P", "X", "A"], 
    ["R", "E", "L", "A", "Z", "I"], 
    ["A", "R", "S", "T", "V", "B"], 
    ["M", "I", "L", "U", "Y", "R"], 
    ["A", "C", "D", "F", "T", "G"],
    ["E", "H", "S", "Y", "W", "O"]  
  ],
  answer: "HABITS",
  revealedLetter: { row: 1, col: 3, letter: "A" }, // Original col index
  clues: [
    { position: 2, description: "It's one of the vowels in the row" },
    { position: 4, description: "I’m the only letter that’s all about me!" },
    { position: 6, description: "A hissing sound, or a plural ending." }
  ]
},
  {
  date: "2025-05-24", // Day 4
  grid: [
    ["A", "B", "S", "R", "E", "X"], 
    ["N", "M", "I", "L", "O", "Y"], 
    ["Q", "W", "H", "Z", "X", "E"], 
    ["R", "S", "T", "K", "L", "W"], 
    ["L", "E", "G", "R", "A", "Z"], 
    ["R", "Y", "S", "E", "T", "V"]  
  ],
  answer: "EMERGE",
  revealedLetter: { row: 2, col: 5, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "It's one of the consonants in the row" },
    { position: 5, description: "Without me, you just 'ame' at any game." },
    { position: 6, description: "Same as the first letter!" }
  ]
},
   {
  date: "2025-05-23", // Day 2
  grid: [
    ["X", "D", "R", "M", "B", "C"], 
    ["O", "G", "H", "I", "J", "L"], 
    ["Y", "A", "R", "C", "N", "G"], 
    ["Z", "K", "E", "L", "I", "D"], 
    ["W", "R", "A", "N", "L", "E"], 
    ["Q", "E", "Y", "R", "S", "L"]  
  ],
  answer: "MONKEY",
  revealedLetter: { row: 1, col: 0, letter: "O" }, // Original col index
  clues: [
    { position: 3, description: "Without me, ‘never’ is ever." },
    { position: 5, description: "It's one of the vowels in the row" },
    { position: 6, description: "I end ‘happy’ and ask ‘why’" }
  ]
},
  {
  date: "2025-05-22", // Day 1
  grid: [
    ["X", "C", "T", "M", "P", "W"], 
    ["R", "E", "O", "R", "H", "L"], 
    ["A", "Y", "F", "G", "J", "K"], 
    ["L", "T", "M", "L", "R", "N"], 
    ["S", "E", "C", "L", "V", "R"], 
    ["Z", "Y", "S", "N", "R", "E"]  
  ],
  answer: "WHALES",
  revealedLetter: { row: 2, col: 0, letter: "A" }, // Original col index
  clues: [
    { position: 2, description: "I’m silent in 'hour', but loud in ‘haha'" },
    { position: 4, description: "It belongs to the first half of the alphabetical order." },
    { position: 6, description: "I make things plural." },
  ]
},
  {
  date: "2025-05-21", // Set your desired date
  grid: [
    ["T", "S", "F", "M", "D", "J"],
    ["L", "M", "N", "O", "P", "I"],
    ["E", "C", "L", "R", "N", "W"],
    ["I", "S", "E", "K", "A", "B"],
    ["L", "E", "R", "T", "H", "X"],
    ["R", "S", "T", "Y", "E", "P"]
  ],
  answer: "FICKLE",
  revealedLetter: { row: 1, col: 5, letter: "I" }, // Original col index
  clues: [
    { position: 1, description: "I’m the only grade you fear and the start of fun!" },
    { position: 5, description: "It belongs to the first half of the alphabetical order." },
    { position: 6, description: "The most used letter, but I stay silent in ‘queue’." }
  ]
},
  {
  date: "2025-05-20", // Set your desired date
  grid: [
    ["B", "R", "Z", "K", "C", "I"],
    ["S", "A", "Y", "T", "E", "R"], // Note: Original 'A' is grid[1][1]. grid[1][0] is another 'A'.
    ["P", "E", "V", "A", "T", "S"],
    ["U", "M", "X", "O", "N", "P"],
    ["S", "G", "A", "R", "D", "E"], // Note: Original 'A' is grid[4][2]
    ["Y", "R", "J", "L", "S", "P"]
  ],
  answer: "CASUAL",
  revealedLetter: { row: 4, col: 2, letter: "A" }, // Original col index
  clues: [ // Clues remain the same as they target the letters of CASUAL
    { position: 3, description: "It belongs to the second half of the alphabetical order." },
    { position: 4, description: "It's one of the vowels in the row" },
    { position: 6, description: "Without me, 'lol' is just oh." }
  ]
},
  {
  date: "2025-05-19", // Or your desired date
    grid: [
    ["A", "K", "B", "D", "J", "R"], // J
    ["H", "E", "X", "O", "L", "U"], // E1
    ["N", "S", "M", "C", "A", "R"], // R
    ["S", "K", "U", "T", "P", "L"], // S
    ["Z", "A", "E", "B", "C", "D"], // E2 - Distractors A, B, C, D around it
    ["L", "G", "H", "Y", "S", "R"]  // Y - Distractors F, G, H, I, K
  ],
  answer: "JERSEY",

  revealedLetter: { row: 4, col: 2, letter: "E" }, // Original col index
  clues: [
    { position: 2, description: "It's one of the vowels in the row" },
    { position: 3, description: "It belongs to the second half of the alphabetical order." },
    { position: 6, description: "'Why?'" }
  ]
},

{
  date: "2025-05-18", // Or your desired date
    grid: [
    ["K", "R", "A", "Q", "N", "I"],
    ["A", "C", "E", "J", "S", "D"], // Distractor 'G' near 'D'
    ["R", "V", "T", "X", "O", "M"], // 'J', 'K', 'L', 'M' are fairly neutral
    ["O", "P", "Q", "E", "W", "S"], // Distractor 'R', 'S'
    ["N", "E", "R", "Y", "A", "L"], // Fillers
    ["M", "S", "G", "H", "T", "Y"]  // Distractor 'H' near 'T'
  ],
  answer: "ADVENT",

  revealedLetter: { row: 3, col: 3, letter: "E" }, // Original col index
  clues: [
    { position: 1, description: "It's one of the vowels in the row" },
    { position: 5, description: "It belongs to the second half of the alphabetical order." },
    { position: 6, description: "It's 'TEA' time!" }
  ]
},

{
  date: "2025-05-17", // Or your desired date
    grid: [
    ["M", "F", "S", "P", "Z", "L"],
    ["Y", "U", "Q", "R", "A", "D"], // Distractor 'B' or 'C' could be near 'A'
    ["V", "M", "R", "N", "J", "I"], // 'E' could be a distractor for 'A' if player forgets column
    ["T", "U", "A", "P", "S", "O"], // Distractor 'S'
    ["E", "R", "U", "O", "Y", "N"], // 'X', 'Y', 'Z' are good neutral fillers
    ["G", "E", "Y", "R", "C", "S"]  // Distractor 'F' (first letter) and 'E'
  ],
  answer: "FAVOUR",

  revealedLetter: { row: 1, col: 4, letter: "A" }, // Original col index
  clues: [
    { position: 4, description: "It's one of the vowels in the row" },
    { position: 5, description: "It's 'YOU'" },
    { position: 6, description: "It belongs to the second half of the alphabetical order." }
  ]
}  // Add other puzzles here
];


function DateSelector({ availableDates, selectedDate, onDateChange }) {
  // Sort dates for display, newest first if not already
  const sortedDates = [...availableDates].sort((a, b) => new Date(b) - new Date(a));

  const formatDateForDisplay = (dateStr) => {
    const dateObj = new Date(dateStr + 'T00:00:00'); // Ensure local timezone interpretation
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dateObj.getTime() === today.getTime()) return "Today";
    if (dateObj.getTime() === yesterday.getTime()) return "Yesterday";
    return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="my-3 md:my-4 flex justify-center items-center relative">
          <CalendarDays className="h-5 w-5 text-gray-500 mr-2" />
      
      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md shadow-sm block w-auto
                   py-2.5 pl-3 pr-8 leading-tight hover:border-gray-400 cursor-pointer
                   transition-colors duration-150 ease-in-out" // Added appearance-none for custom arrow
        aria-label="Select puzzle date"
      >
        {sortedDates.map((dateStr) => (
          <option key={dateStr} value={dateStr}>
            {formatDateForDisplay(dateStr)}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow if appearance-none is used */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.642l-3.417 3.356c-.27.272-.63.408-.99.408s-.72-.136-.99-.408L5.516 9.19c-.408-.445-.436-1.197 0-1.642z"/>
        </svg>
      </div>
    </div>
  );
}


export default function Pathword() {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
    //return '2025-06-14';
  };

  

  const findTodaysPuzzle = useCallback(() => {
    const todayString = getTodayString();
    return (
      dailyPuzzles.find((p) => p.date === todayString) ||
      dailyPuzzles.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    ); // Fallback to latest if today not found
  }, []);

  // Fisher-Yates shuffle
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [currentPuzzle, setCurrentPuzzle] = useState(() => dailyPuzzles.find(p => p.date === selectedDate) || dailyPuzzles.sort((a,b) => new Date(b.date) - new Date(a.date))[0]);
  
  const [selectedPath, setSelectedPath] = useState([]);
  const [shareFeedback, setShareFeedback] = useState("");
  const [gameState, setGameState] = useState({ status: "playing", points: 0 }); // Points removed/repurposed
  const [tryCount, setTryCount] = useState(0); // Current try number. MAX_TRIES = 10
  const [incrementTryOnNextSelection, setIncrementTryOnNextSelection] = useState(false);
  const [isAlreadySolvedToday, setIsAlreadySolvedToday] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [pathCoords, setPathCoords] = useState([]);
  const [currentHelpSlide, setCurrentHelpSlide] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const [isStatsDistributionOpen, setIsStatsDistributionOpen] = useState(false); // Default to open

  const [userStats, setUserStats] = useState({
    streak: 0,
    // Solves will now track tries: { "1": 0, "2": 0, ..., "10": 0, "failed": 0 }
    solvesByTries: Object.fromEntries(Array.from({ length: 10 }, (_, i) => [String(i + 1), 0])),
    failedSolves: 0, // Separate count for failed (ran out of tries)
    lastSolveDate: null,
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [columnMapping, setColumnMapping] = useState(null);

  // Constants
  const MAX_TRIES = 6;
  const GAME_URL = "https://akashramsankar.github.io/pathword/";
  const STATS_KEY = "pathwordUserStats_v2"; // Changed key for new stats structure
  const HELP_VIEWED_KEY = "pathwordHelpViewed";
  const COLUMN_MAP_KEY_PREFIX = "pathwordColMap-";
  const TRY_COUNT_KEY_PREFIX = "pathwordTryCount-";
  const SOLVED_TODAY_KEY_PREFIX = "pathwordSolved-";

  const gridRef = useRef(null);
  const cellRefs = useRef({});
  const feedbackTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);

  const availablePuzzleDates = useMemo(() => {
    const todayStr = getTodayString();
    return dailyPuzzles
      .map(p => p.date)
      .filter(dateStr => dateStr <= todayStr)
      .sort((a, b) => new Date(b) - new Date(a));
  }, []);

  // --- Alphabetical Distance Logic ---
  const getAlphabeticalDistance = (char1, char2) => {
    return Math.abs(char1.toUpperCase().charCodeAt(0) - char2.toUpperCase().charCodeAt(0));
  };

  // Pathword.jsx

// ... (imports and other functions) ...

// Pathword.jsx

// ... (imports and other functions) ...

const getCharCode = (char) => char.toUpperCase().charCodeAt(0);

const getLetterCloseness = (selectedLetter, correctLetter, otherSelectableLettersInRow) => {
  if (selectedLetter.toUpperCase() === correctLetter.toUpperCase()) {
    return "green";
  }

  const selectedCode = getCharCode(selectedLetter);
  const correctCode = getCharCode(correctLetter);

  // Consolidate all unique "other" options, INCLUDING the selected letter itself
  // (if it's not the correct one), as these are all the non-green choices made from or available.
  const allOtherOptionChars = [...new Set(
    (otherSelectableLettersInRow || [])
      .map(s => s.toUpperCase())
      .concat(selectedLetter.toUpperCase()) // Add selected letter to the pool of "other options"
      .filter(s => s !== correctLetter.toUpperCase()) // Ensure correct letter is not in this pool
  )];

  console.log("allotheroptions ",allOtherOptionChars);


  if (allOtherOptionChars.length === 1) {
    // Only one "other" option exists (which must be the selectedLetter).
    // Use the simple distance/threshold logic.
    const distance = Math.abs(selectedCode - correctCode);
    const maxDistForSimpleYellow = Math.max(1, Math.floor(Math.max(
        Math.abs(getCharCode('A') - correctCode),
        Math.abs(getCharCode('Z') - correctCode)
    ) / 2));
    return distance <= maxDistForSimpleYellow ? "yellow" : "red";
  }

  // Multiple "other" options (>= 2)
  const optionsWithDistances = allOtherOptionChars.map(char => ({
    char: char,
    code: getCharCode(char),
    dist: Math.abs(getCharCode(char) - correctCode)
  })).sort((a, b) => a.dist - b.dist); // Sort by distance: closest first

  console.log("distance sort ",optionsWithDistances);

  const selectedOptionInfo = optionsWithDistances.find(opt => opt.code === selectedCode);
  if (!selectedOptionInfo) { // Should not happen if selectedLetter was included correctly
      console.log("fallback");
      return "yellow"; // Fallback
  }
  const selectedLetterDistance = selectedOptionInfo.dist;

  console.log("selected letter distance ",selectedLetterDistance);


  // Determine the number of letters for the "red band"
  const numRedLetters = Math.floor(optionsWithDistances.length / 2);

  console.log("number red ",numRedLetters);

  // The single closest is always yellow
  const closestYellowDistance = optionsWithDistances[0].dist;

  // Identify the distances that define the red band (the N furthest)
  // These are the last `numRedLetters` in the sorted `optionsWithDistances` array.
  const redDistanceThresholdStart = optionsWithDistances[optionsWithDistances.length - numRedLetters].dist;

  // Coloring logic:
  if (selectedLetterDistance === closestYellowDistance) {
    // If it's among the letters that share the absolute minimum distance
    // (could be multiple if equidistant, e.g. L and N around M)
    const allMinDistanceChars = optionsWithDistances.filter(opt => opt.dist === closestYellowDistance);
    if (allMinDistanceChars.some(opt => opt.code === selectedCode)) {
                console.log("closestYellowDistance");

        return "yellow";
    }
  }
  
  if (selectedLetterDistance >= redDistanceThresholdStart) {
    // If it's among the letters that fall into the "red band" distances
    const allMaxPortionDistanceChars = optionsWithDistances.slice(optionsWithDistances.length - numRedLetters);
     if (allMaxPortionDistanceChars.some(opt => opt.code === selectedCode)) {
        console.log("redDistanceThresholdStart");
        return "red";
    }
  }
  
  // For intermediate letters:
  // Compare to the closest "yellow" (which is closestYellowDistance)
  // and the closest "red" (which is redDistanceThresholdStart)
  const distToYellowBoundary = Math.abs(selectedLetterDistance - closestYellowDistance);
  const distToRedBoundary = Math.abs(selectedLetterDistance - redDistanceThresholdStart);

  console.log("distToYellowBoundary ",distToYellowBoundary);
    console.log("distToRedBoundary ",distToRedBoundary);


  if (distToYellowBoundary <= distToRedBoundary) {
    console.log("final yellow ");
    return "yellow"; // Closer to yellow boundary or equidistant
  } else {
        console.log("final red ");

    return "red";    // Closer to red boundary
  }
};


  // Effect for selectedDate changes (puzzle loading)
  useEffect(() => {
    if (isInitialMount.current && selectedDate === getTodayString()) {
      isInitialMount.current = false;
    } else {
      console.log(`EFFECT (selectedDate): selectedDate changed to: ${selectedDate}. Resetting game state for new puzzle.`);
      const newPuzzle = dailyPuzzles.find((p) => p.date === selectedDate) || dailyPuzzles.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
      setCurrentPuzzle(newPuzzle);
      
      // Reset game state for the new puzzle
      setSelectedPath([]);
      setPathCoords([]);
      setFeedbackMessage("");
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      setGameState({ status: "playing", points: 0 });
      setTryCount(1); // Start at try 1 for a new puzzle
      setIncrementTryOnNextSelection(false);
      // isAlreadySolvedToday will be determined by the main data loading effect below
      isInitialMount.current = false;
    }
  }, [selectedDate]);

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    },
    []
  );
  const setCellRef = (row, originalCol, element) => {
    if (element) cellRefs.current[`${row}-${originalCol}`] = element;
  };

  // Main data loading effect (runs on currentPuzzle change)
  useEffect(() => {
    // Load global stats (once)
    const loadedStats = localStorage.getItem(STATS_KEY);
    if (loadedStats) {
      try {
        const parsedStats = JSON.parse(loadedStats);
        setUserStats({
          streak: parsedStats.streak || 0,
          solvesByTries: parsedStats.solvesByTries || Object.fromEntries(Array.from({ length: MAX_TRIES }, (_, i) => [String(i + 1), 0])),
          failedSolves: parsedStats.failedSolves || 0,
          lastSolveDate: parsedStats.lastSolveDate || null,
        });
      } catch (e) { console.error("Failed to parse stats:", e); }
    }

    const puzzleDate = currentPuzzle.date;

    // Column Mapping
    const columnMapStorageKey = `${COLUMN_MAP_KEY_PREFIX}${puzzleDate}`;
    let todaysMappingStr = localStorage.getItem(columnMapStorageKey);
    let parsedMapping = null;
    const gridCols = currentPuzzle.grid[0]?.length;

    if (todaysMappingStr && gridCols) {
      try {
        parsedMapping = JSON.parse(todaysMappingStr);
        if (
          !Array.isArray(parsedMapping) ||
          parsedMapping.length !== gridCols
        ) {
          console.warn("Invalid column mapping length found. Regenerating.");
          parsedMapping = null;
        } else {
          const sorted = [...parsedMapping].sort((a, b) => a - b);
          let isValidPermutation = true;
          for (let i = 0; i < gridCols; i++) {
            if (sorted[i] !== i) {
              isValidPermutation = false;
              break;
            }
          }
          if (!isValidPermutation) {
            console.warn("Invalid column mapping content. Regenerating.");
            parsedMapping = null;
          }
        }
      } catch (e) {
        console.error("Failed to parse column mapping, regenerating.", e);
        parsedMapping = null;
      }
    }


    if (!parsedMapping && gridCols) {
      const initialMapping = Array.from({ length: gridCols }, (_, i) => i);
      parsedMapping = shuffleArray([...initialMapping]);
      localStorage.setItem(columnMapStorageKey, JSON.stringify(parsedMapping));
    }
    setColumnMapping(parsedMapping);

    // Solved Status
    const solvedTodayStorageKey = `${SOLVED_TODAY_KEY_PREFIX}${puzzleDate}`;
    const alreadySolved = localStorage.getItem(solvedTodayStorageKey);

    // Try Count for this puzzle
    const tryCountStorageKey = `${TRY_COUNT_KEY_PREFIX}${puzzleDate}`;
    const storedTryCount = localStorage.getItem(tryCountStorageKey);

    if (alreadySolved === "true" && parsedMapping) {
      setIsAlreadySolvedToday(true);
      setGameState({ status: "success", points: 0 });
      if (storedTryCount) {
        const parsedTryCount = parseInt(storedTryCount, 10);
        setTryCount(!isNaN(parsedTryCount) && parsedTryCount > 0 ? parsedTryCount : 1);
      } else {
        setTryCount(1); localStorage.setItem(tryCountStorageKey, "1");
      }
      setIncrementTryOnNextSelection(false);
      // Reconstruct solved path (using your existing robust logic for this)
      // ... (your path reconstruction logic)
        const answerLetters = currentPuzzle.answer.split('');
        let reconstructedSolvedPath = []; 
        const usedOriginalColsInReconstruction = new Set();
        for (let i = 0; i < answerLetters.length; i++) { /* ... (your reconstruction) ... */ 
            const letterToFind = answerLetters[i];
            const currentRow = i;
            let foundOriginalCol = -1;
            if (currentPuzzle.grid[currentRow]) {
                for (let c = 0; c < currentPuzzle.grid[currentRow].length; c++) {
                    if (currentPuzzle.grid[currentRow][c] === letterToFind && !usedOriginalColsInReconstruction.has(c)) {
                        foundOriginalCol = c;
                        usedOriginalColsInReconstruction.add(c);
                        break;
                    }
                }
            }
            if (foundOriginalCol !== -1) {
                reconstructedSolvedPath.push({ row: currentRow, col: foundOriginalCol, letter: letterToFind, 
                    isRevealed: false});
            } else {
                reconstructedSolvedPath.push({ row: currentRow, col: -1, letter: letterToFind, isRevealed: false });
            }
        }
        setSelectedPath(reconstructedSolvedPath.filter(p => p.col !== -1));
    } else { // Not solved or mapping not ready
      setIsAlreadySolvedToday(false);
      setGameState(prev => ({ ...prev, status: "playing" })); // Ensure playing state
      if (storedTryCount) {
        // If game is ongoing and there's a stored try count, load it.
        const parsedTryCount = parseInt(storedTryCount, 10);
        if (!isNaN(parsedTryCount) && parsedTryCount >= 0) {
          setTryCount(parsedTryCount);
          if(parsedTryCount >= MAX_TRIES){
              setGameState({ status: "failed", points: 0 });
            setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
            revealCorrectPath();
          }
        } else {
          setTryCount(0); // Fallback to 0
          localStorage.setItem(tryCountStorageKey, "0"); // Correct invalid storage
        }
        // If they refresh mid-try, we need to know if the next selection should increment.
        // This is tricky. For simplicity, on refresh, assume next selection is part of current tryCount
        // unless the path is empty.
        // For now, let's reset this flag on load if not solved; it gets set by user actions.
        setIncrementTryOnNextSelection(selectedPath.length === 0); // If path empty, next click is a "new" segment
      } else {

        // No stored try count, and not solved, so it's the first attempt session.
        setTryCount(0);
        localStorage.setItem(tryCountStorageKey, "0"); // Correct invalid storage

        setIncrementTryOnNextSelection(true); // First selection is part of try 1 by default
      }
      // First visit help logic (only if it's truly today's puzzle date)
      if (puzzleDate === getTodayString()){
        const helpViewed = localStorage.getItem(HELP_VIEWED_KEY);
        if (!helpViewed) {
            setIsFirstVisit(true);
            setIsHelpOpen(true);
            localStorage.setItem(HELP_VIEWED_KEY, "true");
        }
      }

        setIsHelpOpen(true);

       }
  }, [currentPuzzle]); // Main data load effect depends on currentPuzzle

  // Effect to save tryCount
  useEffect(() => {
    if (currentPuzzle && currentPuzzle.date && tryCount > 0) {
      const tryCountStorageKey = `${TRY_COUNT_KEY_PREFIX}${currentPuzzle.date}`;
      localStorage.setItem(tryCountStorageKey, String(tryCount));
    }
  }, [tryCount, currentPuzzle.date]);
  
  // Effect for path coordinates
  useEffect(() => {
    if (!columnMapping || !gridRef.current || selectedPath.length < 2) {
      setPathCoords([]);
      return;
    }
    const calculateCoords = () => {
      const gridRect = gridRef.current?.getBoundingClientRect();
      if (!gridRect) return;
      const newCoords = [];
      for (let i = 0; i < selectedPath.length - 1; i++) {
        const startItem = selectedPath[i]; // {row, col (original)}
        const endItem = selectedPath[i + 1]; // {row, col (original)}

        const startCellKey = `${startItem.row}-${startItem.col}`;
        const endCellKey = `${endItem.row}-${endItem.col}`;
        const startElem = cellRefs.current[startCellKey];
        const endElem = cellRefs.current[endCellKey];

        if (startElem && endElem) {
          const cellRadius = startElem.offsetWidth / 2; // Assuming cells are same size
          const startRect = startElem.getBoundingClientRect();
          const endRect = endElem.getBoundingClientRect();
          const cx1 = startRect.left + startRect.width / 2 - gridRect.left,
            cy1 = startRect.top + startRect.height / 2 - gridRect.top;
          const cx2 = endRect.left + endRect.width / 2 - gridRect.left,
            cy2 = endRect.top + endRect.height / 2 - gridRect.top;
          const dx = cx2 - cx1,
            dy = cy2 - cy1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist === 0) continue;
          const nx = dx / dist,
            ny = dy / dist;
          const x1 = cx1 + nx * cellRadius,
            y1 = cy1 + ny * cellRadius;
          const x2 = cx2 - nx * cellRadius,
            y2 = cy2 - ny * cellRadius;
          newCoords.push({
            x1,
            y1,
            x2,
            y2,
            id: `${startCellKey}_${endCellKey}`,
          });
        }
      }
      setPathCoords(newCoords);
    };
    calculateCoords();
    const resizeObserver = new ResizeObserver(calculateCoords);
    if (gridRef.current) resizeObserver.observe(gridRef.current);
    return () => resizeObserver.disconnect();
  }, [selectedPath, columnMapping]); // Ensure columnMapping is a dependency


  const saveStats = (stats) => { /* ... (saveStats remains same) ... */ try {localStorage.setItem(STATS_KEY, JSON.stringify(stats));} catch(e){console.error("Failed to save stats", e)} };

const canSelectCell = (row, originalCol) => {
  if (gameState.status !== 'playing') return false;

  // Rule 1: First letter selection (Row 0)
  if (selectedPath.length === 0) {
    return row === 0; // Can select any cell in the first row
  }

  // Rule 2: Subsequent letter selection
  const lastSelected = selectedPath[selectedPath.length - 1];

  // If trying to select in the SAME row as the last selected letter (for re-selection)
  if (row === lastSelected.row) {
    // Allow selection if it's not the already selected cell
    // AND the last selected cell was NOT green
    if (lastSelected.closeness !== "green") {
      // Check if this originalCol was used by any *previous rows'* selections
      const isColUsedByPreviousRows = selectedPath.some(
        (p) => p.row < row && p.col === originalCol
      );
      if (isColUsedByPreviousRows) {
        return false; // Cannot select if column was used by a previous row's selection
      }
      return originalCol !== lastSelected.col; // Can select other cells in the same row (that aren't in previously used columns)
    } else {
      return false; // Cannot re-select in the same row if previous was green
    }
  }

  // If trying to select in the NEXT row
  if (row === lastSelected.row + 1) {
    // Can only proceed to the next row if the last selected letter was GREEN
    if (lastSelected.closeness !== "green") {
      return false; // Previous selection was not correct, cannot move to next row
    }
    // Standard rules for next row apply:
    // Cannot select from a column already used in the path (by any previous selections)
    if (selectedPath.some(p => p.col === originalCol)) return false;
    return true;
  }

  // Otherwise, not selectable (e.g., trying to skip rows or go backwards incorrectly)
  return false;
};


// const handleCellSelect = (row, originalCol, letter) => {
//   if (gameState.status !== 'playing') return;
//   if (feedbackMessage) setFeedbackMessage("");
//   if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

//   const existingCellInPathAtThisRow = selectedPath.find(p => p.row === row);
//   const correctLetterInRow = currentPuzzle.answer[row];
//   let closeness = "";
//   let currentTry = tryCount; // Capture tryCount before potential increment

//   if (existingCellInPathAtThisRow) {
//     if (existingCellInPathAtThisRow.col === originalCol) {
//       if (selectedPath.length > 0 && selectedPath[selectedPath.length - 1].row === row && selectedPath[selectedPath.length - 1].col === originalCol) {
//         setSelectedPath(selectedPath.slice(0, -1));
//         setIncrementTryOnNextSelection(true);
//       }
//       return;
//     } else {
//       if (existingCellInPathAtThisRow.closeness !== "green") {
//         if (canSelectCell(row, originalCol)) {
//           if (currentTry < MAX_TRIES) { // Use captured currentTry
//             setTryCount(prev => prev + 1);
//             currentTry++; // Update local currentTry for immediate checks
//           } else {
//              currentTry = MAX_TRIES; // Stay at MAX_TRIES
//           }
//           setIncrementTryOnNextSelection(false);

//           closeness = getLetterCloseness(letter, correctLetterInRow, getOtherSelectableLettersInRow(row, letter, correctLetterInRow));
//           const newPathEntry = { row, col: originalCol, letter, closeness };
//           const newPath = selectedPath.slice(0, -1).concat(newPathEntry);
//           setSelectedPath(newPath);

//           if (newPath.length === currentPuzzle.grid.length) {
//             checkAnswer(newPath); // This will handle win or fail on full path
//           } else if (currentTry >= MAX_TRIES) { // Path not full, but max tries reached
//             // --- GAME OVER LOGIC (Max Tries, Incomplete Path) ---
//             setGameState({ status: "failed", points: 0 });
//             setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
//             const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
//             setUserStats(prevStats => {
//                 const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
//                 if (isSolvingTodaysPuzzle) newStats.streak = 0;
//                 saveStats(newStats);
//                 return newStats;
//             });
//             gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
//             revealCorrectPath(); // New function to reveal path
//             // --- END GAME OVER LOGIC ---
//           }
//         }
//       } else { return; }
//     }
//   } else { // Selecting in a NEW row OR first selection ever
//     if (canSelectCell(row, originalCol)) {
//       if (incrementTryOnNextSelection && selectedPath.length === 0) {
//          if (currentTry < MAX_TRIES) { // Use captured currentTry
//             setTryCount(prev => prev + 1);
//             currentTry++; // Update local currentTry
//          } else {
//             currentTry = MAX_TRIES;
//          }
//          setIncrementTryOnNextSelection(false);
//       } else if (currentTry === 0 && selectedPath.length === 0) { // For initial load if tryCount somehow was 0
//         setTryCount(1);
//         currentTry = 1;
//         setIncrementTryOnNextSelection(false);
//       }

//       closeness = getLetterCloseness(letter, correctLetterInRow, getOtherSelectableLettersInRow(row, letter, correctLetterInRow));
//       const newPathEntry = { row, col: originalCol, letter, closeness };
//       const newPath = [...selectedPath, newPathEntry];
//       setSelectedPath(newPath);

//       if (newPath.length === currentPuzzle.grid.length) {
//         checkAnswer(newPath); // This will handle win or fail on full path
//       } else if (currentTry >= MAX_TRIES) { // Path not full, but max tries reached by this selection
//         // --- GAME OVER LOGIC (Max Tries, Incomplete Path) ---
//         setGameState({ status: "failed", points: 0 });
//         setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
//         const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
//         setUserStats(prevStats => {
//             const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
//             if (isSolvingTodaysPuzzle) newStats.streak = 0;
//             saveStats(newStats);
//             return newStats;
//         });
//         gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
//         revealCorrectPath(); // New function to reveal path
//         // --- END GAME OVER LOGIC ---
//       }
//     }
//   }
// };


// Pathword.jsx

const handleCellSelect = (row, originalCol, letter) => {
  if (gameState.status !== 'playing') return;
  if (feedbackMessage) setFeedbackMessage("");
  if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

  const existingCellInPathAtThisRow = selectedPath.find(p => p.row === row);
  const correctLetterInRow = currentPuzzle.answer[row];
  let closeness = "";
  let currentTry = tryCount;

  if (existingCellInPathAtThisRow) { // A letter in this row is already selected
    if (existingCellInPathAtThisRow.col === originalCol) {
      // CLICKING THE EXACT SAME ALREADY SELECTED CELL
      // DO NOTHING - a selected cell cannot be deselected by clicking it again.
      // Backtracking must happen by selecting a *different* valid cell in the current row (if not green)
      // or by using the "Reset Path" button.
      return;
    } else { // Clicking a DIFFERENT cell in the SAME row where one is already selected
      if (existingCellInPathAtThisRow.closeness !== "green") {
        if (canSelectCell(row, originalCol)) {
          if (currentTry <= MAX_TRIES) {
            setTryCount(prev => prev + 1);
            currentTry++;
          } else {
             currentTry = MAX_TRIES;
          }
          setIncrementTryOnNextSelection(false);

          closeness = getLetterCloseness(letter, correctLetterInRow, getOtherSelectableLettersInRow(row, letter, correctLetterInRow));
          const newPathEntry = { row, col: originalCol, letter, closeness };
          const newPath = selectedPath.slice(0, -1).concat(newPathEntry);
          setSelectedPath(newPath);

          if (newPath.length === currentPuzzle.grid.length) {
            checkAnswer(newPath);
          } else if (currentTry > MAX_TRIES) {
            setGameState({ status: "failed", points: 0 });
            setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
            const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
            setUserStats(prevStats => {
                const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
                if (isSolvingTodaysPuzzle) newStats.streak = 0;
                saveStats(newStats);
                return newStats;
            });
            gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
            revealCorrectPath();
          }
          else if(currentTry == MAX_TRIES && closeness != "green"){
            setGameState({ status: "failed", points: 0 });
            setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
            const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
            setUserStats(prevStats => {
                const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
                if (isSolvingTodaysPuzzle) newStats.streak = 0;
                saveStats(newStats);
                return newStats;
            });
            gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
            revealCorrectPath();
          }
        }
      } else { return; } // Previous selection in this row was green, can't change.
    }
  } else { // No letter selected in this row yet OR selecting in a new row
    if (canSelectCell(row, originalCol)) {
      if (incrementTryOnNextSelection && selectedPath.length === 0) {
         if (currentTry < MAX_TRIES) {
            setTryCount(prev => prev + 1);
            currentTry++;
         } else {
            currentTry = MAX_TRIES;
         }
         setIncrementTryOnNextSelection(false);
      } else if (currentTry === 0 && selectedPath.length === 0) {
        setTryCount(1);
        currentTry = 1;
        setIncrementTryOnNextSelection(false);
      }

      closeness = getLetterCloseness(letter, correctLetterInRow, getOtherSelectableLettersInRow(row, letter, correctLetterInRow));
      const newPathEntry = { row, col: originalCol, letter, closeness };
      const newPath = [...selectedPath, newPathEntry];
      setSelectedPath(newPath);

      if (newPath.length === currentPuzzle.grid.length) {
        checkAnswer(newPath);
      } else if (currentTry > MAX_TRIES) {
        console.log("handle ulla");
        setGameState({ status: "failed", points: 0 });
        setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
        const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
        setUserStats(prevStats => {
            const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
            if (isSolvingTodaysPuzzle) newStats.streak = 0;
            saveStats(newStats);
            return newStats;
        });
        gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
        revealCorrectPath();
      }
      else if(currentTry == MAX_TRIES && closeness != "green"){
            setGameState({ status: "failed", points: 0 });
            setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
            const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();
            setUserStats(prevStats => {
                const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
                if (isSolvingTodaysPuzzle) newStats.streak = 0;
                saveStats(newStats);
                return newStats;
            });
            gtag.event({ action: "puzzle_failed_incomplete", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
            revealCorrectPath();
          }
    }
  }
};

// Pathword.jsx

// ... (inside Pathword component)

const revealCorrectPath = () => {
    const answerLetters = currentPuzzle.answer.split('');
    let correctPath = [];
    const usedOriginalColsInReconstruction = new Set();
    for (let i = 0; i < answerLetters.length; i++) {
        const letterToFind = answerLetters[i];
        const currentRow = i;
        let foundOriginalCol = -1;
        if (currentPuzzle.grid[currentRow]) {
            for (let c = 0; c < currentPuzzle.grid[currentRow].length; c++) {
                if (currentPuzzle.grid[currentRow][c] === letterToFind && !usedOriginalColsInReconstruction.has(c)) {
                    foundOriginalCol = c;
                    usedOriginalColsInReconstruction.add(c);
                    break;
                }
            }
        }
        if (foundOriginalCol !== -1) {
            correctPath.push({
                row: currentRow,
                col: foundOriginalCol,
                letter: letterToFind,
                closeness: "green", // Mark correct path items as green
                // isRevealed: false // Not needed anymore
            });
        } else {
            // Fallback if somehow a letter can't be found (shouldn't happen with valid puzzles)
            correctPath.push({ row: currentRow, col: -1, letter: letterToFind, closeness: "gray" });
        }
    }
    setSelectedPath(correctPath.filter(p => p.col !== -1));
};

// Helper function to get other selectable letters (you might want to move this or make it more robust)
const getOtherSelectableLettersInRow = (row, currentSelectedLetter, correctLetterInRow) => {
    let otherChoices = [];
    if (currentPuzzle.grid[row]) {
        for (let cIdx = 0; cIdx < currentPuzzle.grid[row].length; cIdx++) {
            const charInCell = currentPuzzle.grid[row][cIdx];
            // Is column available based on *path selections from previous rows*?
            const isColumnAvailableBasedOnPreviousRows = !selectedPath.some(p => p.row < row && p.col === cIdx);

            if (isColumnAvailableBasedOnPreviousRows &&
                charInCell.toUpperCase() !== currentSelectedLetter.toUpperCase() &&
                charInCell.toUpperCase() !== correctLetterInRow.toUpperCase()) {
                otherChoices.push(charInCell);
            }
        }
    }
    return otherChoices;
};

  const checkAnswer = (path) => {
    const pathWord = path.map((p) => p.letter).join("");
    const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString();

    if (pathWord === currentPuzzle.answer) {
      setGameState({ status: "success", points: 0 });
      setFeedbackMessage("");
      // Update stats
      setUserStats(prevStats => {
        const newSolvesByTries = { ...prevStats.solvesByTries };
        const currentTryStr = String(tryCount);
        newSolvesByTries[currentTryStr] = (newSolvesByTries[currentTryStr] || 0) + 1;
        
        let newStreak = prevStats.streak;
        let newLastSolveDate = prevStats.lastSolveDate;
        if (isSolvingTodaysPuzzle) { /* ... (streak logic as before) ... TODO: check existing code for this */
            newLastSolveDate = currentPuzzle.date;
            if (prevStats.lastSolveDate) {
                const lastDate = new Date(prevStats.lastSolveDate);
                const todayDate = new Date(currentPuzzle.date);
                const diffDays = Math.ceil((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) newStreak += 1;
                else if (diffDays > 1) newStreak = 1;
            } else newStreak = 1;
        }

        const newStats = { ...prevStats, streak: newStreak, solvesByTries: newSolvesByTries, lastSolveDate: newLastSolveDate };
        saveStats(newStats);
        return newStats;
      });

      gtag.event({
        action: "puzzle_solved",
        category: "Game",
        label: currentPuzzle.answer, // e.g., "ENIGMA"
        value: tryCount, // e.g., number of clues used
      });
      
      const solvedTodayStorageKey = `${SOLVED_TODAY_KEY_PREFIX}${currentPuzzle.date}`;
      localStorage.setItem(solvedTodayStorageKey, "true");
      if (isSolvingTodaysPuzzle) { // Only show auto popup for today's puzzle
        setTimeout(() => { setShowSuccessPopup(true); setIsStatsOpen(true); }, 2000);
      }
    } else { // Incorrect path
      if (tryCount > MAX_TRIES) {
        console.log("Entering trycount = maxtries ");
        setGameState({ status: "failed", points: 0 });
        setFeedbackMessage(`Max tries reached! The answer was: ${currentPuzzle.answer}`);
        // Update stats for failed attempt
        setUserStats(prevStats => {
            const newStats = { ...prevStats, failedSolves: (prevStats.failedSolves || 0) + 1 };
            // Potentially reset streak if it was today's puzzle and they failed
            if (isSolvingTodaysPuzzle) {
                newStats.streak = 0;
            }
            saveStats(newStats);
            return newStats;
        });
        gtag.event({ action: "puzzle_failed", category: "Game", label: currentPuzzle.answer, value: MAX_TRIES });
        // Reveal the correct path
        const answerLetters = currentPuzzle.answer.split('');
        let correctPath = []; /* ... (use your robust path reconstruction logic here) ... */
        const usedOriginalColsInReconstruction = new Set();
        for (let i = 0; i < answerLetters.length; i++) {
            const letterToFind = answerLetters[i]; const currentRow = i; let foundOriginalCol = -1;
            if (currentPuzzle.grid[currentRow]) {
                for (let c = 0; c < currentPuzzle.grid[currentRow].length; c++) {
                    if (currentPuzzle.grid[currentRow][c] === letterToFind && !usedOriginalColsInReconstruction.has(c)) {
                        foundOriginalCol = c; usedOriginalColsInReconstruction.add(c); break;
                    }
                }
            }
            if (foundOriginalCol !== -1) {
                correctPath.push({ row: currentRow, col: foundOriginalCol, letter: letterToFind, 
                    closeness: "green", // Mark correct path as green
                    isRevealed: false 
                });
            } else { correctPath.push({ row: currentRow, col: -1, letter: letterToFind, closeness: "gray", isRevealed: false }); }
        }
        setSelectedPath(correctPath.filter(p => p.col !== -1));

      } else {
        setIncrementTryOnNextSelection(true);
        setFeedbackMessage("Incorrect path. Try adjusting!");
        feedbackTimeoutRef.current = setTimeout(() => setFeedbackMessage(""), 3000);
      }
    }
  };

  const resetGame = () => {
    setSelectedPath([]);
    setPathCoords([]);
    setFeedbackMessage("");
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setGameState({ status: "playing", points: 0 });
    
    // if (tryCount < MAX_TRIES) {
    //     // Only increment tryCount on reset if not already at max or game over
    //     setTryCount(prev => prev + 1);
    // }
    setIncrementTryOnNextSelection(true); // The reset itself increments the conceptual "try"

    setShowSuccessPopup(false);
    setIsStatsOpen(false);
  };


const getCellClassName = (row, originalCol) => {
  const pathItem = selectedPath.find(p => p.row === row && p.col === originalCol);
  const isSelected = !!pathItem;
  
  const isPartOfDisplayedSolvedPath = (gameState.status === "success" || gameState.status === "failed") &&
                                      selectedPath.some(p => p.row === row && p.col === originalCol);

  // const isTheRevealedCell = /* ... REMOVED ... */;
  const isSelectable = canSelectCell(row, originalCol);

  let baseStyle = `w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-medium rounded-full relative transition-all duration-300 ease-in-out z-10`;
  let backgroundStyle = 'bg-transparent';
  let textStyle = 'text-gray-700';
  let interactionStyle = 'cursor-default';

  if (isPartOfDisplayedSolvedPath && (gameState.status === "success" || gameState.status === "failed")) {
      backgroundStyle = 'bg-green-300 scale-110 shadow-md'; textStyle = 'text-green-900 font-semibold';
  } else if (isSelected && pathItem) {
      if (pathItem.closeness === "green") backgroundStyle = 'bg-green-300';
      else if (pathItem.closeness === "yellow") backgroundStyle = 'bg-yellow-300';
      else if (pathItem.closeness === "red") backgroundStyle = 'bg-red-300';
      else backgroundStyle = 'bg-blue-300'; // Should ideally not happen
      backgroundStyle += ' scale-110 shadow-md';
      textStyle = pathItem.closeness === "green" ? 'text-green-900' : 
                  pathItem.closeness === "yellow" ? 'text-yellow-900' :
                  pathItem.closeness === "red" ? 'text-red-900' : 'text-blue-900';
      textStyle += ' font-semibold';
      interactionStyle = 'cursor-pointer';
  // REMOVED: else if (isTheRevealedCell && !isSelected) { ... } block
  } else if (gameState.status === 'playing') {
      if (isSelectable) {
          textStyle = 'text-black hover:text-blue-600'; interactionStyle = 'cursor-pointer hover:scale-105';
      } else {
          textStyle = 'text-gray-400'; interactionStyle = 'cursor-not-allowed opacity-50';
      }
  } else { 
      textStyle = 'text-gray-400 opacity-60';
  }
  return `${baseStyle} ${backgroundStyle} ${textStyle} ${interactionStyle}`;
};


  const copyToClipboard = async (fullClipboardText) => { /* ... (copyToClipboard remains same) ... */ setIsCopying(true);setShareFeedback("");try {await navigator.clipboard.writeText(fullClipboardText);setShareFeedback("Path Copied!");} catch(err){console.error("Ftc:",err);setShareFeedback("Failed to copy.");} finally {setTimeout(()=>{setIsCopying(false);setShareFeedback("");},2000);} };

  const handleShare = async () => {
    if (isCopying || !columnMapping || gameState.status !== 'success') return; // Only share successful solves
    setIsCopying(true);
    setShareFeedback("");

    let achievementText = `in ${tryCount} ${tryCount === 1 ? "try" : "tries"}!`;
    let streakText = "";
    if (userStats.streak > 1 && currentPuzzle.date === getTodayString()) {
        streakText = `\n🔥 Current Streak: ${userStats.streak} days!`;
    }

    let pathGridEmoji = ""; /* ... (emoji grid generation, WITHOUT clue indication) ... */
    const gridRows = currentPuzzle.grid.length; const gridCols = currentPuzzle.grid[0]?.length || 0;
    for (let r = 0; r < gridRows; r++) {
        for (let dc = 0; dc < gridCols; dc++) {
            let originalColAtThisDisplaySlot = -1;
            for (let i = 0; i < columnMapping.length; i++) if (columnMapping[i] === dc) { originalColAtThisDisplaySlot = i; break; }
            const pathCellData = selectedPath.find(p => p.row === r && p.col === originalColAtThisDisplaySlot);
            if (pathCellData) {
                const currentPathItemIndex = selectedPath.findIndex(p => p.row === pathCellData.row && p.col === pathCellData.col);
                if (currentPathItemIndex === selectedPath.length - 1) pathGridEmoji += "🟩🎯";
                else if (currentPathItemIndex !== -1) {
                    const nextPathItemOriginalCol = selectedPath[currentPathItemIndex + 1].col;
                    const nextPathItemDisplayCol = columnMapping[nextPathItemOriginalCol];
                    let directionEmoji = "";
                    if (nextPathItemDisplayCol < dc) directionEmoji = "↙️"; else if (nextPathItemDisplayCol > dc) directionEmoji = "↘️"; else directionEmoji = "⬇️";
                    pathGridEmoji += "🟩" + directionEmoji;
                } else pathGridEmoji += "🟩";
            } else pathGridEmoji += "⬜";
        }
        if (r < gridRows - 1) pathGridEmoji += "\n";
    }


    const shareTitle = `Pathword: ${currentPuzzle.date}`;
    let mainShareBody = `I navigated Pathword for ${currentPuzzle.date}! 🗺️\n\nMy Journey:\n${pathGridEmoji}\n\nSolved ${achievementText}`;
    if (streakText) mainShareBody += streakText;
    const gameUrl = GAME_URL;
    const hashtags = "\n#PathwordGame #DailyPuzzle";
    const fullShareText = `${mainShareBody}\n\nChart your own course: ${gameUrl}${hashtags}`;
    const nativeShareText = `${mainShareBody}\n\nChart your own course!${hashtags}`;

   gtag.event({
    action: "share_attempted",
    category: "Engagement",
    label: navigator.share ? "Native Share" : "Clipboard Copy",
  });

    if (navigator.share) { /* ... (navigator.share logic) ... */ 
        try { await navigator.share({ title: shareTitle, text: nativeShareText, url: gameUrl }); setShareFeedback("Shared!"); }
        catch (err) { if (err.name !== 'AbortError') { setShareFeedback("Share failed. Copied."); await copyToClipboard(fullShareText); return; } else { setShareFeedback("");}}
        finally { if (navigator.share && !(Error.name === 'AbortError' && shareFeedback.includes("Copied"))) { setTimeout(() => { setIsCopying(false); setShareFeedback(""); }, 1500);}}
    } else { await copyToClipboard(fullShareText); }
  };

  const renderGrid = () => { /* ... (renderGrid largely same, ensure it uses getCellClassName) ... */ 
    if (!columnMapping || !currentPuzzle.grid || currentPuzzle.grid.length === 0) return <div className="h-96 ...">Loading Grid...</div>;
    const gridRows = currentPuzzle.grid.length; const gridCols = currentPuzzle.grid[0].length; const gap = "0.75rem";
    const displayGridLetters = currentPuzzle.grid.map((originalRow) => {
      const displayedRow = new Array(gridCols);
      for (let originalCol = 0; originalCol < gridCols; originalCol++) {
        displayedRow[columnMapping[originalCol]] = originalRow[originalCol];
      }
      return displayedRow;
    });
    return (
      <div ref={gridRef} className="relative p-1 mx-auto mb-6" style={{ display: "grid", gridTemplateRows: `repeat(${gridRows}, 1fr)`, gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: gap, width: `calc(${gridCols} * 3.5rem + ${gridCols} * ${gap})`, maxWidth: "100%" }}>
        {displayGridLetters.map((rowLetters, rowIndex) =>
          rowLetters.map((letter, displayColIndex) => {
            let originalColIndex = -1;
            for (let i = 0; i < gridCols; i++) if (columnMapping[i] === displayColIndex) { originalColIndex = i; break; }
            if (originalColIndex === -1) return null;
            return (
              <div key={`${rowIndex}-${displayColIndex}`} className="relative flex items-center justify-center" style={{ zIndex: 1 }}>
                {/* ... (grid lines) ... */}
                <button ref={(el) => setCellRef(rowIndex, originalColIndex, el)} onClick={() => handleCellSelect(rowIndex, originalColIndex, letter)}
                  disabled={(gameState.status !== "playing" && !selectedPath.some(p => p.row === rowIndex && p.col === originalColIndex)) || (gameState.status === "failed")}
                  className={`${getCellClassName(rowIndex, originalColIndex)} z-10`}
                  aria-label={`Letter ${letter} at row ${rowIndex + 1}, displayed column ${displayColIndex + 1}`}
                ><span>{letter}</span></button>
              </div>);
          }))}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-5" style={{ overflow: "visible" }} aria-hidden="true">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: gameState.status === "success" || gameState.status === "failed" ? "rgb(134 239 172)" : "rgb(147 197 253)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: gameState.status === "success" || gameState.status === "failed" ? "rgb(74 222 128)" : "rgb(96 165 250)", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {pathCoords.map((coords) => <line key={coords.id} x1={coords.x1} y1={coords.y1} x2={coords.x2} y2={coords.y2} stroke="url(#lineGradient)" strokeWidth="5" strokeLinecap="round" className="transition-all duration-300 ease-in-out" />)}
        </svg>
      </div>);
  };


const renderSelectedPathPreview = () => {
  const pathLength = currentPuzzle.grid.length;
  const pathMap = selectedPath.reduce((acc, item) => {
    acc[item.row] = item.letter;
    return acc;
  }, {});
  // REMOVED: if (currentPuzzle.revealedLetter && ...) block for pathMap

  return (
    <div className="flex space-x-2 mt-6 mb-6 justify-center items-start h-16">
      {[...Array(pathLength)].map((_, index) => {
        const letter = pathMap[index];
        const itemInPath = selectedPath.find(p => p.row === index);
        // const isRevealedSlot = /* ... REMOVED ... */;
        const isSelected = !!itemInPath;

        let borderColor = "border-gray-300";
        let textColor = "text-gray-400";
        let bgColor = "bg-gray-50";

        if (gameState.status === "success" || gameState.status === "failed") {
            if (isSelected && itemInPath?.letter === currentPuzzle.answer[index]) {
                borderColor="border-green-400"; textColor="text-green-700"; bgColor="bg-green-50";
            }
        } else if (letter) { // Game is playing
            if (isSelected && itemInPath) {
                if (itemInPath.closeness === "green") { borderColor="border-green-400";textColor="text-green-700";bgColor="bg-green-50"; }
                else if (itemInPath.closeness === "yellow") { borderColor="border-yellow-400";textColor="text-yellow-700";bgColor="bg-yellow-50"; }
                else if (itemInPath.closeness === "red") { borderColor="border-red-400";textColor="text-red-700";bgColor="bg-red-50"; }
                // REMOVED: else if (isRevealedSlot) { ... }
                else { textColor="text-gray-800"; } // If simply in pathMap but not current selectedPath with closeness (e.g. before this change)
            } else { // Letter in pathMap but not currently part of `selectedPath` (e.g. after backtrack)
                textColor="text-gray-800";
            }
        } else { // Empty slot
            borderColor="border-gray-200";
        }
        
        return (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-10 h-10 md:w-12 md:h-12 border-2 rounded-lg flex items-center justify-center text-lg md:text-xl font-semibold transition-colors duration-300 shadow ${borderColor} ${textColor} ${bgColor}`}>
              {letter || ""}
            </div>
            <span className="mt-1 text-xs text-gray-500">{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
};
  
  // const renderCluesSection = () => { /* ... CLUES SECTION REMOVED ... */ };

  const isDisplayingTodaysPuzzle = currentPuzzle.date === getTodayString();

  return (
    <div className="max-w-full mx-auto p-4 md:p-6 font-sans bg-teal-50 min-h-screen flex flex-col items-center">
      <header className="text-center flex items-center justify-between px-4 md:px-0">
        <div className="w-16"></div>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-1">
            {" "}
            Pathword{" "}
          </h1>
          <p className="text-sm text-gray-600">
            {" "}
            Connect letters row by row to find the word.{" "}
          </p>
        </div>
        <div className="flex items-center justify-end">
          {/* Stats Dialog - Needs modification */}
      <Dialog open={isStatsOpen} onOpenChange={(open) => { setIsStatsOpen(open); if (!open) setShowSuccessPopup(false); }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="View Stats"><BarChart3 className="h-6 w-6 text-gray-600" /></Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl p-0">
  <DialogHeader className="flex flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-gray-200">
    <DialogTitle className="text-lg font-semibold text-gray-900">
      {showSuccessPopup ? "Path Conquered!" : gameState.status === "failed" ? "Better Luck Next Time!" : "Your Journey Stats"}
    </DialogTitle>
    {/* Optional: Add a DialogClose button here if you want one in the header,
        otherwise the default one in DialogContent from your ui/dialog might be active */}
  </DialogHeader>
  <div className="p-6 text-gray-700">
    {(showSuccessPopup || gameState.status === "failed") && (
      <p className={`text-center text-md font-medium mb-5 ${gameState.status === "failed" ? "text-red-600" : "text-green-600"}`}>
        {gameState.status === "failed" ? "The Pathword was:" : "Congratulations! You found:"} <span className="font-bold">{currentPuzzle.answer}</span>
        {gameState.status === "success" && ` in ${tryCount} ${tryCount === 1 ? "try" : "tries"}!`}
      </p>
    )}
    {/* Main Stats: Streak and Paths Found */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-emerald-700">
          {userStats.streak}
        </div>
        <div className="text-xs uppercase text-emerald-600 font-medium tracking-wide">
          Current Streak
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
        <div className="text-3xl font-bold text-emerald-700">
          {Object.values(userStats.solvesByTries || {}).reduce((a, b) => a + b, 0)}
        </div>
        <div className="text-xs uppercase text-emerald-600 font-medium tracking-wide">
          Paths Found
        </div>
      </div>
    </div>
     <div className="flex justify-center mb-6">
                  {" "}
                  {/* This flex container will center its child */}
                  <div className="w-full max-w-[calc(50%-0.5rem)] sm:max-w-[calc(50%-0.5rem)] md:max-w-[160x]">
                    {" "}
                    {/* Adjust width constraint */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center w-full max-w-xs mx-auto">
                      {" "}
                      {/* Added max-w-xs and mx-auto for the box itself */}
                      <div className="text-3xl font-bold text-blue-700">
                        {gameState.status === "success" ? tryCount : "-"}
                      </div>
                      <div className="text-xs uppercase text-blue-600 font-medium tracking-wide">
                        Path Tries This Game
                      </div>
                    </div>
                  </div>
                </div>

    {/* "Path Tries This Game" was removed as per your UI reference - it's now in the success/fail message */}

    {/* Solve Distribution by Tries 
    <h3 className="text-center font-semibold mb-3 text-gray-700 text-sm">
      Solve Distribution <span className="font-normal text-gray-500">(by path tries taken)</span>
    </h3> */}
    <div className="mt-6 border-t border-gray-200 pt-4"> {/* Added a separator and spacing */}
      <button
        onClick={() => setIsStatsDistributionOpen(!isStatsDistributionOpen)}
        className="flex justify-between items-center w-full text-left py-2 focus:outline-none"
        aria-expanded={isStatsDistributionOpen}
        aria-controls="solve-distribution-content"
      >
        <h3 className="text-center font-semibold text-gray-700 text-sm">
          Solve Distribution <span className="font-normal text-gray-500">(by path tries taken)</span>
        </h3>
        {/* Chevron icon for collapse/expand indication */}
        {isStatsDistributionOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500 transform transition-transform" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500 transform transition-transform" />
        )}
      </button>

      {/* Conditionally rendered content */}
      {isStatsDistributionOpen && (
        <div id="solve-distribution-content" className="space-y-1.5 text-sm mt-3">
          {Array.from({ length: MAX_TRIES }, (_, i) => String(i + 1)).map((triesAttempted) => (
            <div
              key={triesAttempted}
              className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-md border border-slate-200"
            >
              <span className="text-gray-600">
                {triesAttempted} {parseInt(triesAttempted) === 1 ? "Try" : "Tries"}:
              </span>
              <span className="font-semibold text-emerald-700">
                {userStats.solvesByTries?.[triesAttempted] || 0}
              </span>
            </div>
          ))}
          
        </div>
      )}
    </div>
  </div>
  <DialogFooter className="px-6 pb-6 pt-2 border-t border-gray-200">
    {/* Logic for Share/Close button based on game state */}
    {(showSuccessPopup || gameState.status === "failed") && gameState.status !== "playing" ? (
        gameState.status === "success" ? (
            <Button onClick={handleShare} disabled={isCopying} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm py-2.5">
                <Share2 className="h-4 w-4 mr-2" />
                {shareFeedback ? shareFeedback : isCopying && !navigator.share ? "Copying..." : "Share Journey"}
            </Button>
        ) : ( // For failed state
            <DialogClose asChild>
                <Button type="button" className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm py-2.5">Close</Button>
            </DialogClose>
        )
    ) : ( // Default close button if not showing success/fail popup content
      <DialogClose asChild>
          <Button type="button" className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm py-2.5">Close</Button>
      </DialogClose>
    )}
  </DialogFooter>
</DialogContent>
      </Dialog>
          {/* Help Dialog */}
          <Dialog
            open={isHelpOpen}
            onOpenChange={(open) => {
              setIsHelpOpen(open);
              if (open) setCurrentHelpSlide(0); // Reset to first slide when dialog opens
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Help">
                <HelpCircle className="h-6 w-6 text-gray-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-xl p-0 sm:max-w-lg md:max-w-xl">
              {" "}
              {/* Adjusted max-width */}
              <DialogHeader className="flex flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-gray-200">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  How to Play Pathword
                </DialogTitle>
                {/* <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <CloseIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                <span className="sr-only">Close</span>
            </DialogClose> */}
              </DialogHeader>
              {/* Carousel Content */}
              <div className="px-2 sm:px-6 py-6 text-gray-700 max-h-[75vh] md:max-h-[70vh] overflow-y-auto">
                <div className="carousel-viewport relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[300px] md:max-h-[350px] mx-auto overflow-hidden rounded-lg bg-gray-100 shadow-inner mb-4">
                  {" "}
                  {/* Added aspect ratio and max-h for image area */}
                  <div
                    className="carousel-track flex h-full transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${currentHelpSlide * 100}%)`,
                    }}
                  >
                    {helpSlidesData.map((slide) => (
                      <div
                        key={slide.id}
                        className="carousel-slide min-w-full h-full flex-shrink-0 flex flex-col items-center justify-center p-1"
                      >
                        <img
                          src={slide.imageUrl}
                          alt={slide.altText}
                          className="max-w-full max-h-full object-contain" // Ensure image fits
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instruction Text below image */}
                <div className="instruction-text text-center min-h-[4em] mb-4 px-4">
                  {" "}
                  {/* min-h to reduce layout shift */}
                  <p
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        helpSlidesData[currentHelpSlide]?.instruction || "",
                    }}
                  />
                </div>

                {/* Navigation: Arrows and Dots */}
                {helpSlidesData.length > 1 && (
                  <div className="flex items-center justify-between px-1">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="p-2 rounded-full text-teal-600 border-teal-300 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() =>
                        setCurrentHelpSlide((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentHelpSlide === 0}
                      aria-label="Previous help slide"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Dot Indicators */}
                    <div className="flex justify-center space-x-2">
                      {helpSlidesData.map((_, index) => (
                        <button
                          key={`dot-${index}`}
                          onClick={() => setCurrentHelpSlide(index)}
                          aria-label={`Go to help slide ${index + 1}`}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2
                                    ${
                                      currentHelpSlide === index
                                        ? "bg-teal-500 scale-125"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                        />
                      ))}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="p-2 rounded-full text-teal-600 border-teal-300 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() =>
                        setCurrentHelpSlide((prev) =>
                          Math.min(helpSlidesData.length - 1, prev + 1)
                        )
                      }
                      disabled={currentHelpSlide === helpSlidesData.length - 1}
                      aria-label="Next help slide"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
              <DialogFooter className="px-6 pb-6 pt-4 border-t border-gray-200">
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm py-2.5" // Themed button
                  >
                    Got It!
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <DateSelector
        availableDates={availablePuzzleDates}
        selectedDate={selectedDate}
        onDateChange={(newDate) => {
          // Before changing date, consider if you want to save any "in-progress" state for the current date
          // For now, we assume changing date resets progress for the *previous* date if not submitted.
          setSelectedDate(newDate);
        }}
      />
      
      <main className="flex-grow flex flex-col items-center w-full mt-4">
        {columnMapping ? renderGrid() : <div className="h-96 ...">Shuffling Path...</div>}

        <div className="text-center h-12 my-2 px-4 w-full flex flex-col items-center justify-center">
            {gameState.status === "playing" && (
                <p className="text-blue-600 font-semibold text-md">
                    Tries Left: {MAX_TRIES - tryCount} / {MAX_TRIES}
                </p>
            )}
            {isAlreadySolvedToday && isDisplayingTodaysPuzzle && gameState.status !== "playing" && ( // Changed playing to not playing
                <div className="flex flex-col items-center gap-2">
                    <p className="text-green-600 font-semibold text-lg">You've already found today's Pathword: {currentPuzzle.answer}!</p>
                    <Button onClick={() => { setShowSuccessPopup(true); setIsStatsOpen(true);}} className="bg-emerald-600 ..."><Share2/>View Stats & Share</Button>
                </div>
            )}
            {isAlreadySolvedToday && !isDisplayingTodaysPuzzle && gameState.status !== "playing" && (
                 <p className="text-green-600 font-semibold text-lg">You previously solved: {currentPuzzle.answer} (from {currentPuzzle.date})</p>
            )}
            {gameState.status === "success" && !isAlreadySolvedToday && !isStatsOpen && ( // If just solved
                <p className="text-green-600 font-semibold text-lg animate-pulse">Success! Word found: {currentPuzzle.answer}</p>
            )}
            {gameState.status === "failed" && (
                <p className="text-red-600 font-semibold text-md">{feedbackMessage}</p> // feedbackMessage will contain the "Max tries..."
            )}
            {gameState.status === "playing" && feedbackMessage && ( // Only show incorrect path if playing
                 <p className="text-red-600 font-semibold text-md">{feedbackMessage}</p>
            )}
        </div>

        {renderSelectedPathPreview()}
        {/* TODO: bottom messagge and stats open */}
        {/* CLUES SECTION REMOVED */}
      </main>

      {/* <footer className="pb-6 px-4 text-center w-full mt-auto">
        {(gameState.status === "playing" && selectedPath.length > 0) && (
          <Button onClick={resetGame} variant="outline" className="border-gray-400 ...">Reset Path</Button>
        )}
      </footer> */}

      
      {/* ... (rest of header structure) ... */}
      
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        button {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
        .relative.flex.items-center.justify-center {
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
