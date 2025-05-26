"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button"; // Make sure this path is correct for your setup
import {
  Lock,
  BarChart3,
  HelpCircle,
  Share2,
  X as CloseIcon,
  ChevronLeft, // <-- Add this
  ChevronRight, // <-- Add this
  CalendarDays
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Make sure this path is correct for your setup
import * as gtag from '../lib/gtag'; // Adjust path as necessary

const helpSlidesData = [
  {
    id: 'welcome',
    imageUrl: '/pathword/images/help/pathword-grid-welcome.png', // Replace with your actual image path
    instruction: "Welcome to Pathword! Find the hidden word by charting a course through the letters from row 1 to 6.",
    altText: 'Pathword game grid with a welcoming message.'
  },
  {
    id: 'start-top',
    imageUrl: '/pathword/images/help/pathword-start-top.png',
    instruction: "1. Begin your expedition by selecting a letter from the <span class='font-semibold'>very first row</span>.",
    altText: 'Illustration showing selecting a letter from the first row of the Pathword grid.'
  },
  {
    id: 'row-below',
    imageUrl: '/pathword/images/help/pathword-row-below.png',
    instruction: "2. Your next step must be to a letter in the row right below your current position.",
    altText: 'Illustration showing moving to a letter in the row directly below.'
  },
  {
    id: 'new-column',
    imageUrl: '/pathword/images/help/pathword-new-column.png',
    instruction: "3. Forge a unique path! You <span class='font-semibold'>cannot revisit a column</span> once a letter from it has been chosen.",
    altText: 'Illustration demonstrating that each letter must be from a new column.'
  },
  {
    id: 'complete-path',
    imageUrl: '/pathword/images/help/pathword-complete-path.png',
    instruction: "4. Continue until your path spans all rows to form the 6 letter Pathword!",
    altText: 'Illustration of a completed path forming the Pathword.'
  },
   {
    id: 'revealed-letter',
    imageUrl: '/pathword/images/help/pathword-revealed-letter.png',
    instruction: "A <span class='text-green-700 font-semibold'>green highlighted letter</span> is a pre-revealed letter in the pathword! (In this example, it's in the first row)",
    altText: 'Illustration highlighting the pre-revealed green letter on the grid.'
  },
  {
    id: 'clue-cards',
    imageUrl: '/pathword/images/help/pathword-clue-cards.png',
    instruction: "Stuck? Tap a Clue Card for a hint about a specific letter in the Pathword.",
    altText: 'Illustration of using a Clue Card for a hint.'
  },
  {
    id: 'backtrack',
    imageUrl: '/pathword/images/help/pathword-backtrack.png',
    instruction: "Misstep? Tap your last selected letter (it'll be <span class='text-blue-700 font-semibold'>blue</span>) to backtrack.",
    altText: 'Illustration showing how to backtrack by clicking the last selected letter.'
  },
  // Add more slides as needed
];
// Daily puzzles data
const dailyPuzzles = [
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

// Pathword.jsx

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

// --- ClueCard Component ---
function ClueCard({ clue, isUnlocked, isFlipped, onToggleFlip, onUnlock }) {
  const handleCardClick = () => {
    if (!isUnlocked) onUnlock();
    onToggleFlip();
  };
  return (
    <div
      className="perspective w-48 h-28 cursor-pointer group flex-shrink-0"
      onClick={handleCardClick}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div
          className={`absolute w-full h-full backface-hidden bg-white border ${
            isUnlocked ? "border-teal-300" : "border-gray-300"
          } rounded-lg flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-shadow p-2`}
        >
          {!isUnlocked && (
            <Lock className="w-6 h-6 text-gray-400 mb-1" strokeWidth={1.5} />
          )}
          <span
            className={`text-lg font-semibold ${
              isUnlocked ? "text-teal-700" : "text-gray-500"
            }`}
          >
            Clue for letter {clue.position}
          </span>
          <span className="text-xs text-gray-500 mt-1 text-center">
            {isUnlocked
              ? isFlipped
                ? "Showing Clue"
                : "Click to Reveal"
              : "Click to Unlock"}
          </span>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-teal-50 border border-teal-300 rounded-lg flex flex-col items-center justify-center p-3 text-center shadow-sm">
          <p className="text-sm text-teal-800 font-medium leading-snug">
            {clue.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main Pathword Component ---
export default function Pathword() {
  // Utility Functions (Defined BEFORE state)

    const getTodayString = () => {
      const today = new Date();

      const year = today.getFullYear();
      const month = today.getMonth() + 1; // getMonth() is 0-indexed (0 for January, 11 for December)
      const day = today.getDate();

      // Pad month and day with a leading zero if they are single digits
      const monthFormatted = month < 10 ? `0${month}` : month;
      const dayFormatted = day < 10 ? `0${day}` : day;

      const localDateString = `${year}-${monthFormatted}-${dayFormatted}`;
      // console.log("Local Date String for Puzzle Matching:", localDateString); // For debugging this function
      return localDateString;
      //return "2025-05-26";
    };

  const findTodaysPuzzle = useCallback(() => {
    const todayString = getTodayString();
    return dailyPuzzles.find((p) => p.date === todayString) || dailyPuzzles[0];
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
  // const [currentPuzzle, setCurrentPuzzle] = useState(
  //   () => dailyPuzzles.find((p) => p.date === selectedDate) || dailyPuzzles[0]
  // );

  // State Declarations
  const [currentPuzzle, setCurrentPuzzle] = useState(() => findTodaysPuzzle());

  const [selectedPath, setSelectedPath] = useState([]); // Stores { row, col (original), letter }
  const [unlockedClues, setUnlockedClues] = useState([]);
  const [flippedClues, setFlippedClues] = useState([]);
  const [currentClueIndex, setCurrentClueIndex] = useState(0); // Start with the first clue
  //const [isCopying, setIsCopying] = useState(false); // This state is for the "Copying..." button text
  const [shareFeedback, setShareFeedback] = useState(""); // New state for general share feedback

  const [gameState, setGameState] = useState({
    status: "playing",
    points: 100,
  });

  const [tryCount, setTryCount] = useState(0); // Current try number.
  const [incrementTryOnNextSelection, setIncrementTryOnNextSelection] =
    useState(false);
  const [isAlreadySolvedToday, setIsAlreadySolvedToday] = useState(false); // New state
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [pathCoords, setPathCoords] = useState([]);
  const [currentHelpSlide, setCurrentHelpSlide] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    streak: 0,
    solves: { 0: 0, 1: 0, 2: 0, 3: 0, failed: 0 },
    lastSolveDate: null,
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [columnMapping, setColumnMapping] = useState(null); // Stores mapping: originalColIndex -> displayColIndex

  // Constants
  const GAME_URL = "https://akashramsankar.github.io/pathword/"; // <<< --- REPLACE WITH YOUR ACTUAL GAME URL
  const STATS_KEY = "pathwordUserStats";
  const HELP_VIEWED_KEY = "pathwordHelpViewed";
  const COLUMN_MAP_KEY_PREFIX = "pathwordColMap-"; // For localStorage
  const TRY_COUNT_KEY_PREFIX = "pathwordTryCount-";
  const CELL_SIZE_APPROX = 56;
  const SOLVED_TODAY_KEY_PREFIX = "pathwordSolved-"; // New localStorage key prefix

  const UNLOCKED_CLUES_KEY_PREFIX = "pathwordUnlockedClues-";
  const FLIPPED_CLUES_KEY_PREFIX = "pathwordFlippedClues-";




  // Refs
  const gridRef = useRef(null);
  const cellRefs = useRef({}); // Keyed by `row-originalCol`
  const feedbackTimeoutRef = useRef(null);

  // At the top of your component
const isInitialMount = useRef(true);


  // Memoize availablePuzzleDates and filter them
  const availablePuzzleDates = useMemo(() => {
    if (!Array.isArray(dailyPuzzles)) {
      console.error("dailyPuzzles is not an array or is undefined");
      return [];
    }
    const todayStr = getTodayString(); // Get today's date in YYYY-MM-DD format
    return dailyPuzzles
      .map(p => p.date)
      .filter(dateStr => dateStr <= todayStr) // Only include dates up to and including today
      .sort((a, b) => new Date(b) - new Date(a)); // Sort them newest first after filtering
  }, []); // Recalculate if dailyPuzzles or getTodayString were to change (they are stable here)


  // Effects

  // Effect to save unlockedClues to localStorage
useEffect(() => {
  if (currentPuzzle && currentPuzzle.date) {
    const puzzleDate = currentPuzzle.date;
    const unlockedCluesStorageKey = `${UNLOCKED_CLUES_KEY_PREFIX}${puzzleDate}`;
    if(unlockedClues.length > 0){
      console.log("Setting unlockedClues as ",JSON.stringify(unlockedClues));
      localStorage.setItem(unlockedCluesStorageKey, JSON.stringify(unlockedClues));
    }
  }
}, [unlockedClues, currentPuzzle.date]);

// Effect to save flippedClues to localStorage
useEffect(() => {
  if (currentPuzzle && currentPuzzle.date) {
    const puzzleDate = currentPuzzle.date;
    const flippedCluesStorageKey = `${FLIPPED_CLUES_KEY_PREFIX}${puzzleDate}`;
    if(flippedClues.length > 0){
      localStorage.setItem(flippedCluesStorageKey, JSON.stringify(flippedClues));
    }
  }
}, [flippedClues, currentPuzzle.date]);


  //Effect to update currentPuzzle and reset game state when selectedDate changes
useEffect(() => {
  if (isInitialMount.current && selectedDate === getTodayString()) { // Or a more robust check if selectedDate could init to something else
    // For the very first load where selectedDate is initialized to today,
    // let the main data loading effect handle everything. Don't reset here.
    console.log(`EFFECT (selectedDate): Initial mount with selectedDate ${selectedDate}. Skipping reset.`);
    isInitialMount.current = false; // Mark initial mount as done
  } else {
    // This is for actual user-driven date changes
    console.log(`EFFECT (selectedDate): selectedDate changed to: ${selectedDate}. Resetting transient game state.`);
    const newPuzzle =
      dailyPuzzles.find((p) => p.date === selectedDate) || dailyPuzzles[0];
    setCurrentPuzzle(newPuzzle);

    setSelectedPath([]);
    setUnlockedClues([]);
    setFlippedClues([]);
    setPathCoords([]);
    setFeedbackMessage("");
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setGameState({ status: "playing", points: 100 });
    setCurrentClueIndex(0);
    setIncrementTryOnNextSelection(true); // Ready for the first try of this selected puzzle
    isInitialMount.current = false; // Also set here in case selectedDate initializes to something other than today
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

  useEffect(() => {
    const loadedStats = localStorage.getItem(STATS_KEY);
    if (loadedStats) {
      try {
        const parsedStats = JSON.parse(loadedStats);
        setUserStats({
          streak: parsedStats.streak || 0,
          solves: parsedStats.solves || { 0: 0, 1: 0, 2: 0, 3: 0, failed: 0 },
          lastSolveDate: parsedStats.lastSolveDate || null,
        });
      } catch (e) {
        console.error("Failed to parse stats:", e);
      }
    }

    const puzzleDate = currentPuzzle.date;

    // --- Column Mapping Logic ---
    const today = getTodayString(); // Get the date string once for this effect run
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
    setColumnMapping(parsedMapping); // This is the setState call

    // --- *** NEW: Load Unlocked and Flipped Clues *** ---
  const unlockedCluesStorageKey = `${UNLOCKED_CLUES_KEY_PREFIX}${puzzleDate}`;
  const storedUnlockedClues = localStorage.getItem(unlockedCluesStorageKey);
  if (storedUnlockedClues) {
    console.log("There is stored unlock");
    try {
      const parsedUnlocked = JSON.parse(storedUnlockedClues);
      if (Array.isArray(parsedUnlocked)) {
        setUnlockedClues(parsedUnlocked);
      }
    } catch (e) {
      console.error("Failed to parse unlocked clues:", e);
      localStorage.removeItem(unlockedCluesStorageKey); // Remove corrupted data
    }
  } else {
        console.log("There is no stored unlock");

    setUnlockedClues([]); // Default to no clues unlocked if nothing in storage
  }

  const flippedCluesStorageKey = `${FLIPPED_CLUES_KEY_PREFIX}${puzzleDate}`;
  const storedFlippedClues = localStorage.getItem(flippedCluesStorageKey);
  if (storedFlippedClues) {
    try {
      const parsedFlipped = JSON.parse(storedFlippedClues);
      if (Array.isArray(parsedFlipped)) {
        setFlippedClues(parsedFlipped);
      }
    } catch (e) {
      console.error("Failed to parse flipped clues:", e);
      localStorage.removeItem(flippedCluesStorageKey); // Remove corrupted data
    }
  } else {
    setFlippedClues([]); // Default to no clues flipped
  }

    // *** NEW: Check if already solved today ***
    const solvedTodayStorageKey = `${SOLVED_TODAY_KEY_PREFIX}${puzzleDate}`;
    const alreadySolved = localStorage.getItem(solvedTodayStorageKey);

    const tryCountStorageKey = `${TRY_COUNT_KEY_PREFIX}${puzzleDate}`;
    const storedTryCount = localStorage.getItem(tryCountStorageKey);

    if (alreadySolved === "true" && parsedMapping) {
      // Ensure mapping is also loaded

      setIsAlreadySolvedToday(true);
      setGameState({ status: "success", points: 0 }); // Or load stored points if desired

      // Load the stored try count if solved
      if (storedTryCount) {

        const parsedTryCount = parseInt(storedTryCount, 10);
        if (!isNaN(parsedTryCount) && parsedTryCount >= 0) {
          setTryCount(parsedTryCount);
        } else {
          // Fallback if stored value is invalid, but it's solved, so at least 1 try.
          setTryCount(1);
          localStorage.setItem(tryCountStorageKey, "1"); // Correct invalid storage
        }
      } else {

        // If solved but no try count, assume at least 1 try.
        // This might happen if they solved before try count was stored.
        setTryCount(1);
        localStorage.setItem(tryCountStorageKey, "1"); // Correct invalid storage
      }
      setIncrementTryOnNextSelection(false); // If solved, no "next selection" will increment tries.

      const answerLetters = currentPuzzle.answer.split('');
  let reconstructedSolvedPath = []; // This will store { row, col, letter, isRevealed }
  const usedOriginalColsInReconstruction = new Set();

  for (let i = 0; i < answerLetters.length; i++) {
    const letterToFind = answerLetters[i];
    const currentRow = i; // Assuming Nth letter of answer is in Nth row
    let foundOriginalCol = -1;

    if (currentPuzzle.grid[currentRow]) {
      for (let c = 0; c < currentPuzzle.grid[currentRow].length; c++) {
        if (currentPuzzle.grid[currentRow][c] === letterToFind && !usedOriginalColsInReconstruction.has(c)) {
          // Found the letter in an original column not yet used for this reconstructed path
          foundOriginalCol = c;
          usedOriginalColsInReconstruction.add(c);
          break; // Move to the next letter of the answer
        }
      }
    }

    if (foundOriginalCol !== -1) {
      reconstructedSolvedPath.push({
        row: currentRow,
        col: foundOriginalCol, // This is the original column index
        letter: letterToFind,
        isRevealed:
          currentPuzzle.revealedLetter?.row === currentRow &&
          currentPuzzle.revealedLetter?.col === foundOriginalCol,
      });
    } else {
      // Fallback: Could not uniquely determine the path for this letter.
      // This might happen if the answer has repeating letters and the grid setup is ambiguous
      // without knowing the exact path taken, or if the answer isn't actually possible from the grid.
      console.warn(`Could not reconstruct path for letter '${letterToFind}' at row ${currentRow} for answer '${currentPuzzle.answer}'. Using placeholder.`);
      reconstructedSolvedPath.push({
        row: currentRow,
        col: -1, // Indicate column couldn't be determined
        letter: letterToFind,
        isRevealed: false, // Cannot determine if revealed if col is unknown
      });
    }
  }
  setSelectedPath(reconstructedSolvedPath.filter(p => p.col !== -1)); // Use only successfully reconstructed parts
    } else {

      setIsAlreadySolvedToday(false);

      if (storedTryCount) {
        // If game is ongoing and there's a stored try count, load it.
        const parsedTryCount = parseInt(storedTryCount, 10);
        if (!isNaN(parsedTryCount) && parsedTryCount >= 0) {
          setTryCount(parsedTryCount);
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
      // Regular first visit help logic
      const helpViewed = localStorage.getItem(HELP_VIEWED_KEY);
      if (!helpViewed) {
        setIsFirstVisit(true);
        setIsHelpOpen(true);
        localStorage.setItem(HELP_VIEWED_KEY, "true");
      }
    }
  }, [currentPuzzle.date, currentPuzzle.grid]); // Keep dependencies

  // --- (Rest of stats, path calculation, core game logic functions remain largely the same,
  // but ensure they use ORIGINAL column indices for selectedPath and rules) ---

  const saveStats = (stats) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error("Failed to save stats:", e);
    }
  };

  // Path Coordinate Calculation Effect - This should work as selectedPath stores original cols,
  // and cellRefs are keyed by original cols, pointing to the displayed DOM elements.
  // Effect to save tryCount to localStorage whenever it changes
  useEffect(() => {
    if (currentPuzzle && currentPuzzle.date) {
      // Ensure puzzle data is available
      const puzzleDate = currentPuzzle.date;
      const tryCountStorageKey = `${TRY_COUNT_KEY_PREFIX}${puzzleDate}`;
      // Only save if tryCount is a valid number and greater than 0
      // (tryCount=0 might be a temporary state before first real try initialization)
      if (typeof tryCount === "number" && tryCount > 0) {
        localStorage.setItem(tryCountStorageKey, tryCount.toString());
      }
    }
  }, [tryCount]); // Re-run when tryCount or the puzzle (and its date) changes

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

  // Core Game Logic Functions - All 'col' parameters now refer to ORIGINAL column index
  // Core Game Logic Functions
  // Pathword.jsx

  const canSelectCell = (row, originalCol) => {
    if (gameState.status !== "playing") return false;

    const { revealedLetter } = currentPuzzle; // Destructure for easier access

    // Rule 1: First letter selection
    if (selectedPath.length === 0) {
      // If a revealed letter exists:
      if (revealedLetter) {
        // Player MUST select the revealed letter first if it's in row 0
        if (revealedLetter.row === 0) {
          return (
            row === revealedLetter.row && originalCol === revealedLetter.col
          );
        }
        // If revealed letter is NOT in row 0, player can select any allowed cell in row 0
        // EXCEPT those in the same column as the (future) revealed letter.
        else {
          if (row === 0) {
            // Only allow selection from row 0
            return originalCol !== revealedLetter.col; // Cannot select from the revealed letter's future column
          }
          return false; // Cannot select from other rows if path is empty and revealed is not in row 0
        }
      }
      // If NO revealed letter, player can select any cell in row 0.
      else {
        return row === 0;
      }
    }

    // Rule 2: Subsequent letter selection
    const lastSelected = selectedPath[selectedPath.length - 1];

    // Must be in the next row numerically
    if (row !== lastSelected.row + 1) return false;

    // Cannot select from a column already used in the path
    if (selectedPath.some((p) => p.col === originalCol)) return false;

    // New Rule: If a revealed letter exists and hasn't been part of the path yet,
    // and we are about to select from its row, we MUST select the revealed letter.
    // Also, cannot select from its column if it's in a future row.
    if (
      revealedLetter &&
      !selectedPath.some(
        (p) => p.row === revealedLetter.row && p.col === revealedLetter.col
      )
    ) {
      // If we are selecting IN the revealed letter's row:
      if (row === revealedLetter.row) {
        return originalCol === revealedLetter.col; // Must be the revealed letter itself
      }
      // If we are selecting in a row BEFORE the revealed letter's row:
      // (This part is mostly covered by the first-letter selection, but good for completeness)
      // And the current column is the same as the revealed letter's column.
      // This implies we cannot select from the revealed letter's column until we reach its row.
      if (originalCol === revealedLetter.col) {
        return false; // Cannot use the revealed letter's column before reaching its row
      }
    }

    // If all above pass, the cell is selectable.
    return true;
  };

  const handleCellSelect = (row, originalCol, letter) => {
    if (gameState.status !== "playing") return;

    if (feedbackMessage) setFeedbackMessage("");
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    // isRevealed is still useful for the path entry data
    const isRevealedCell =
      currentPuzzle.revealedLetter &&
      currentPuzzle.revealedLetter.row === row &&
      currentPuzzle.revealedLetter.col === originalCol;

    const cellKey = `${row}-${originalCol}`;
    const element = cellRefs.current[cellKey]; // Ref key uses originalCol
    const existingIndex = selectedPath.findIndex(
      (p) => p.row === row && p.col === originalCol
    );

    if (existingIndex !== -1) {
      // If cell is already selected, deselect it and subsequent ones
      setSelectedPath(selectedPath.slice(0, existingIndex));
      setIncrementTryOnNextSelection(true); // Mark that the next selection should increment tries
    } else {
      // Check if selection is valid according to rules (now stricter for revealed letter)
      if (canSelectCell(row, originalCol)) {
        if (incrementTryOnNextSelection) {
          setTryCount((prev) => prev + 1);
          setIncrementTryOnNextSelection(false); // Consume the flag
        }
        const newPathEntry = {
          row,
          col: originalCol,
          letter,
          element,
          isRevealed: isRevealedCell,
        };
        const newPath = [...selectedPath, newPathEntry];
        setSelectedPath(newPath);

        if (newPath.length === currentPuzzle.grid.length) {
          checkAnswer(newPath);
        }
      }
    }
  };

  const checkAnswer = (path) => {
    // path contains {row, col (original), letter}
    const pathWord = path.map((p) => p.letter).join("");
    const isSolvingTodaysPuzzle = currentPuzzle.date === getTodayString(); // Check if it's today's puzzle
    
    if (pathWord === currentPuzzle.answer) {
      setGameState((prev) => ({ ...prev, status: "success" }));
      setFeedbackMessage("");
      const cluesUsed = unlockedClues.length;
      setUserStats((prevStats) => {
        const newSolves = { ...prevStats.solves };
        const cluesKey = String(cluesUsed);
        if (newSolves.hasOwnProperty(cluesKey)) {
          newSolves[cluesKey] = (newSolves[cluesKey] || 0) + 1;
        }

        let newStreak = prevStats.streak;
        let newLastSolveDate = prevStats.lastSolveDate;

        if (isSolvingTodaysPuzzle) {
          // Only update streak & lastSolveDate for today's puzzle
          const todayStr = getTodayString(); // Or currentPuzzle.date, should be same
          newLastSolveDate = todayStr;
          const lastSolve = prevStats.lastSolveDate;
          if (lastSolve) {
            const lastDate = new Date(lastSolve);
            const todayDate = new Date(todayStr);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) newStreak += 1;
            else if (diffDays > 1) newStreak = 1;
            // If diffDays is 0 or less (solved same day again, or date issue), streak doesn't change here
          } else {
            newStreak = 1; // First time solving (today's puzzle)
          }
        }

        const newStats = {
          ...prevStats,
          streak: newStreak,
          solves: newSolves,
          lastSolveDate: newLastSolveDate, // Only updated if it was today's puzzle
        };
        saveStats(newStats); // Save all stats (global + potentially updated streak)
        return newStats;
      });
      gtag.event({
        action: "puzzle_solved",
        category: "Game",
        label: currentPuzzle.answer, // e.g., "ENIGMA"
        value: unlockedClues.length, // e.g., number of clues used
      });

      gtag.event({
        action: "puzzle_solved2",
        category: "Game",
        label: currentPuzzle.answer, // e.g., "ENIGMA"
        value: tryCount, // e.g., number of clues used
      });

      // *** NEW: Mark as solved for today ***
      const solvedTodayStorageKey = `${SOLVED_TODAY_KEY_PREFIX}${currentPuzzle.date}`;
      localStorage.setItem(solvedTodayStorageKey, "true");
      if (isSolvingTodaysPuzzle) {
        setTimeout(() => {
          setShowSuccessPopup(true);
          setIsStatsOpen(true);
        }, 2000);
      }
    } else {
      setIncrementTryOnNextSelection(true); // Failed attempt means next selection is part of a new try
      setFeedbackMessage("Incorrect path. Try adjusting!");
      feedbackTimeoutRef.current = setTimeout(
        () => setFeedbackMessage(""),
        3000
      );
    }
  };
  const handleUnlockClue = (index) => {
    if (!unlockedClues.includes(index) && gameState.status === "playing") {
      setUnlockedClues((prev) => [...prev, index]);
      setGameState((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - 25),
      }));

      gtag.event({
        action: "clue_unlocked",
        category: "Game",
        label: currentPuzzle.clues[index].position.toString(),
        value: index + 1, // e.g., 1st, 2nd, or 3rd clue card
      });
    }
  };
  const handleToggleFlip = (index) => {
    if (unlockedClues.includes(index)) {
      setFlippedClues((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    }
  };
  const resetGame = () => {
    setSelectedPath([]);
    setIncrementTryOnNextSelection(true); // So the first click *after* reset increments.
    setUnlockedClues([]);
    setFlippedClues([]);
    setPathCoords([]);
    setFeedbackMessage("");
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setGameState({ status: "playing", points: 100 });
    setShowSuccessPopup(false);
    setIsStatsOpen(false); /* Column mapping for the day persists */
  };

  // Cell Styling Function - Takes originalCol
  // Cell Styling Function - Takes originalCol
  const getCellClassName = (row, originalCol) => {
    const isSelected = selectedPath.some(
      (p) => p.row === row && p.col === originalCol
    );
    const isInCorrectPath = gameState.status === "success" && isSelected;
    const isTheRevealedCell =
      currentPuzzle.revealedLetter &&
      currentPuzzle.revealedLetter.row === row &&
      currentPuzzle.revealedLetter.col === originalCol;
    const isSelectable = canSelectCell(row, originalCol); // This now correctly evaluates revealed cells

    let baseStyle = `w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-medium rounded-full relative transition-all duration-300 ease-in-out z-10`;
    let backgroundStyle = "bg-transparent";
    let textStyle = "text-gray-700";
    let interactionStyle = "cursor-default";

    if (isInCorrectPath) {
      backgroundStyle = "bg-green-300 scale-110 shadow-md";
      textStyle = "text-green-900 font-semibold";
    } else if (isSelected) {
      backgroundStyle = "bg-blue-300 scale-110 shadow-md";
      textStyle = "text-blue-900 font-semibold";
      interactionStyle = "cursor-pointer";
    } else if (isTheRevealedCell && !isSelected) {
      // Styling for revealed but not yet selected
      backgroundStyle = "bg-green-200"; // Highlight it
      textStyle = "text-green-800 font-semibold";
      // Clickability depends on whether the path allows it
      interactionStyle =
        gameState.status === "playing" && isSelectable
          ? "cursor-pointer hover:scale-105"
          : "cursor-default opacity-80";
    } else if (gameState.status === "playing") {
      if (isSelectable) {
        textStyle = "text-black hover:text-blue-600";
        interactionStyle = "cursor-pointer hover:scale-105";
      } else {
        textStyle = "text-gray-400";
        interactionStyle = "cursor-not-allowed opacity-50";
      }
    } else {
      // Game over, not selected
      textStyle = "text-gray-400 opacity-60";
    }
    return `${baseStyle} ${backgroundStyle} ${textStyle} ${interactionStyle}`;
  };

  // Helper function for clipboard copy
  async function copyToClipboard(fullClipboardText) {
    // Simplified arguments
    setIsCopying(true); // Indicate "copying" action for button text
    setShareFeedback(""); // Clear previous feedback
    try {
      await navigator.clipboard.writeText(fullClipboardText);
      setShareFeedback("Path Copied!"); // Set feedback message
      // alert("Pathword journey copied! Ready to share your adventure?"); // Replaced by shareFeedback
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setShareFeedback("Failed to copy.");
      // alert("Failed to copy. Please try again or copy manually.");
    } finally {
      setTimeout(() => {
        setIsCopying(false);
        setShareFeedback(""); // Clear feedback after a delay
      }, 2000);
    }
  }


 // Pathword.jsx

const handleShare = async () => {
  if (isCopying || !columnMapping) return;
  setIsCopying(true);
  setShareFeedback("");

  const cluesUsedArray = unlockedClues.map(clueIndex => currentPuzzle.clues[clueIndex]);
  const cluesUsedCount = unlockedClues.length;

  // --- Achievement Text ---
  let achievementText = "";
  if (cluesUsedCount === 0) achievementText = "flawlessly with NO clues! 🏅";
  else if (cluesUsedCount === 1) achievementText = "with just 1 clue! ✨";
  else achievementText = `using ${cluesUsedCount} clues!`;

  // --- Streak Information ---
  let streakText = "";
  // userStats.streak should be up-to-date if checkAnswer ran and it was today's puzzle
  if (userStats.streak > 1 && currentPuzzle.date === getTodayString()) { // Only show streak for today's puzzle result
    streakText = `\n🔥 Current Streak: ${userStats.streak} days!`;
  }

  // --- Emoji Grid Generation (as per previous correct implementation) ---
  let pathGridEmoji = "";
  const gridRows = currentPuzzle.grid.length;
  const gridCols = currentPuzzle.grid[0]?.length || 0;
  const rowsWithUnlockedClues = new Set(
    cluesUsedArray.map(clue => clue.position - 1)
  );

  for (let r = 0; r < gridRows; r++) {
    for (let dc = 0; dc < gridCols; dc++) {
      let originalColAtThisDisplaySlot = -1;
      for (let i = 0; i < columnMapping.length; i++) {
        if (columnMapping[i] === dc) {
          originalColAtThisDisplaySlot = i;
          break;
        }
      }
      const pathCellData = selectedPath.find(
        (p) => p.row === r && p.col === originalColAtThisDisplaySlot
      );

      if (pathCellData) {
        let colorEmoji = rowsWithUnlockedClues.has(r) ? "🟨" : "🟩";
        const currentPathItemIndex = selectedPath.findIndex(
            (p) => p.row === pathCellData.row && p.col === pathCellData.col
        );

        if (currentPathItemIndex === selectedPath.length - 1) {
          pathGridEmoji += colorEmoji + "🎯";
        } else if (currentPathItemIndex !== -1) {
          const nextPathItemOriginalCol = selectedPath[currentPathItemIndex + 1].col;
          const nextPathItemDisplayCol = columnMapping[nextPathItemOriginalCol];
          let directionEmoji = "";
          if (nextPathItemDisplayCol < dc) directionEmoji = "↙️";
          else if (nextPathItemDisplayCol > dc) directionEmoji = "↘️";
          else directionEmoji = "⬇️";
          pathGridEmoji += colorEmoji + directionEmoji;
        } else {
           pathGridEmoji += colorEmoji;
        }
      } else {
        pathGridEmoji += "⬜";
      }
      // Optional: if (dc < gridCols - 1) pathGridEmoji += " ";
    }
    if (r < gridRows - 1) pathGridEmoji += "\n";
  }

  // --- Construct Share Text ---
  const shareTitle = `Pathword: ${currentPuzzle.date}`; // Or getTodayString() if always today's
  
  // Main body text
  let mainShareBody = `I navigated Pathword for ${currentPuzzle.date}! 🗺️\n\nMy Journey:\n${pathGridEmoji}\n\nSolved ${achievementText}`;
  
  if (streakText) {
    mainShareBody += streakText;
  }

  const gameUrl = GAME_URL;
  const hashtags = "\n#PathwordGame #DailyPuzzle #BrainTeaser";

  const fullShareText = `${mainShareBody}\n\nChart your own course: ${gameUrl}${hashtags}`;
  // Text for native share might be slightly shorter if preferred, omitting some hashtags or the URL if it's in the URL field
  const nativeShareText = `${mainShareBody}\n\nChart your own course!${hashtags}`;


  gtag.event({
    action: "share_attempted",
    category: "Engagement",
    label: navigator.share ? "Native Share" : "Clipboard Copy",
  });

  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: nativeShareText, // Text for the native share dialog's body
        url: gameUrl,          // URL to be shared
      });
      setShareFeedback("Shared!");
    } catch (err) {
      console.error("Error sharing:", err);
      if (err.name !== "AbortError") {
        setShareFeedback("Share failed. Copied to clipboard instead.");
        await copyToClipboard(fullShareText); // Fallback to full text for clipboard
        return;
      } else {
        setShareFeedback("");
      }
    } finally {
      // Reset isCopying state
      if (navigator.share && !(Error.name === "AbortError" && shareFeedback.includes("Copied"))) {
        setTimeout(() => { setIsCopying(false); setShareFeedback(""); }, 1500);
      }
    }
  } else {
    // Fallback to Clipboard Copy using the full text
    await copyToClipboard(fullShareText);
  }
};

  // --- UI Rendering Functions ---
  const renderGrid = () => {
    if (
      !columnMapping ||
      !currentPuzzle.grid ||
      currentPuzzle.grid.length === 0
    ) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500">
          Loading Grid...
        </div>
      );
    }
    const gridRows = currentPuzzle.grid.length;
    const gridCols = currentPuzzle.grid[0].length;
    const gap = "0.75rem";

    // Create the displayGrid using the columnMapping
    const displayGridLetters = currentPuzzle.grid.map((originalRow) => {
      const displayedRow = new Array(gridCols);
      for (let originalCol = 0; originalCol < gridCols; originalCol++) {
        const displayCol = columnMapping[originalCol]; // Get where originalCol's letter should be displayed
        displayedRow[displayCol] = originalRow[originalCol];
      }
      return displayedRow;
    });

    return (
      <div
        ref={gridRef}
        className="relative p-1 mx-auto mb-6"
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: gap,
          width: `calc(${gridCols} * 3.5rem + ${gridCols} * ${gap})`,
          maxWidth: "100%",
        }}
      >
        {/* Iterate through displayGrid for rendering order */}
        {displayGridLetters.map((rowLetters, rowIndex) =>
          rowLetters.map((letter, displayColIndex) => {
            // Find the original column index for the letter at this display position
            // The letter at displayGridLetters[rowIndex][displayColIndex]
            // came from currentPuzzle.grid[rowIndex][originalColForThisLetter]
            // where columnMapping[originalColForThisLetter] === displayColIndex
            let originalColIndex = -1;
            for (let i = 0; i < gridCols; i++) {
              if (columnMapping[i] === displayColIndex) {
                originalColIndex = i;
                break;
              }
            }
            // If originalColIndex is -1, it means something is wrong with mapping or grid.
            // This shouldn't happen if mapping is a valid permutation.
            if (originalColIndex === -1) {
              console.error(
                "Error finding original column for display column",
                displayColIndex,
                columnMapping
              );
              return null; // Or some error placeholder
            }

            return (
              <div
                key={`${rowIndex}-${displayColIndex}`}
                className="relative flex items-center justify-center"
                style={{ zIndex: 1 }}
              >
                {displayColIndex > 0 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
                    style={{
                      marginLeft: `calc(-${gap}/2)`,
                      height: "150%",
                      transform: "translate(-50%, -25%)",
                    }}
                  />
                )}
                {rowIndex > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px bg-gray-200"
                    style={{
                      marginTop: `calc(-${gap}/2)`,
                      width: "150%",
                      transform: "translate(-25%, -50%)",
                    }}
                  />
                )}
                <button
                  ref={(el) => setCellRef(rowIndex, originalColIndex, el)} // Ref by original coordinates
                  onClick={() =>
                    handleCellSelect(rowIndex, originalColIndex, letter)
                  } // Logic uses original coordinates
                  disabled={
                    gameState.status !== "playing" &&
                    !selectedPath.some(
                      (p) => p.row === rowIndex && p.col === originalColIndex
                    )
                  }
                  className={`${getCellClassName(
                    rowIndex,
                    originalColIndex
                  )} z-10`} // Styling based on original coordinates
                  aria-label={`Letter ${letter} at row ${
                    rowIndex + 1
                  }, displayed column ${displayColIndex + 1}`}
                >
                  <span>{letter}</span>
                </button>
              </div>
            );
          })
        )}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-5"
          style={{ overflow: "visible" }}
          aria-hidden="true"
        >
          {" "}
          <defs>
            {" "}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {" "}
              <stop
                offset="0%"
                style={{
                  stopColor:
                    gameState.status === "success"
                      ? "rgb(134 239 172)"
                      : "rgb(147 197 253)",
                  stopOpacity: 1,
                }}
              />{" "}
              <stop
                offset="100%"
                style={{
                  stopColor:
                    gameState.status === "success"
                      ? "rgb(74 222 128)"
                      : "rgb(96 165 250)",
                  stopOpacity: 1,
                }}
              />{" "}
            </linearGradient>{" "}
          </defs>{" "}
          {pathCoords.map((coords) => (
            <line
              key={coords.id}
              x1={coords.x1}
              y1={coords.y1}
              x2={coords.x2}
              y2={coords.y2}
              stroke={`url(#lineGradient)`}
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
          ))}{" "}
        </svg>
      </div>
    );
  };

  const renderSelectedPathPreview = () => {
    const pathLength = currentPuzzle.grid.length;
    const pathMap = selectedPath.reduce((acc, item) => {
      acc[item.row] = item.letter;
      return acc;
    }, {});
    if (
      currentPuzzle.revealedLetter &&
      !pathMap[currentPuzzle.revealedLetter.row] &&
      currentPuzzle.revealedLetter.row < pathLength
    ) {
      pathMap[currentPuzzle.revealedLetter.row] =
        currentPuzzle.revealedLetter.letter;
    }
    return (
      <div className="flex space-x-2 mt-6 mb-6 justify-center items-start h-16">
        {" "}
        {[...Array(pathLength)].map((_, index) => {
          const letter = pathMap[index];
          const isRevealedSlot =
            currentPuzzle.revealedLetter &&
            currentPuzzle.revealedLetter.row === index;
          const isSelected = selectedPath.some((p) => p.row === index);
          return (
            <div key={index} className="flex flex-col items-center">
              {" "}
              <div
                className={`w-10 h-10 md:w-12 md:h-12 border-2 rounded-lg flex items-center justify-center text-lg md:text-xl font-semibold transition-colors duration-300 shadow ${
                  gameState.status === "success"
                    ? "border-green-400 text-green-700 bg-green-50"
                    : "border-gray-300"
                } ${
                  letter
                    ? isSelected
                      ? "text-blue-700 bg-blue-50 border-blue-400"
                      : isRevealedSlot
                      ? "text-green-700 bg-green-50 border-green-400"
                      : "text-gray-800"
                    : "text-gray-400 border-gray-200 bg-gray-50"
                } `}
              >
                {" "}
                {letter || ""}{" "}
              </div>{" "}
              <span className="mt-1 text-xs text-gray-500"> {index + 1} </span>{" "}
            </div>
          );
        })}{" "}
      </div>
    );
  };
  // Pathword.jsx

  // ...

  // Pathword.jsx

  const renderCluesSection = () => {
    const numClues = currentPuzzle.clues.length;

    if (numClues === 0) {
      return (
        <div className="mt-2 mb-4 px-2 w-full max-w-full">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Clues
          </h2>
          <p className="text-gray-500 text-sm text-center px-4">
            No clues available.
          </p>
        </div>
      );
    }

    const sortedClues = [...currentPuzzle.clues].sort(
      (a, b) => a.position - b.position
    );
    const currentClueData = sortedClues[currentClueIndex];

    const originalClueIndex = currentPuzzle.clues.findIndex(
      (clue) =>
        clue.position === currentClueData.position &&
        clue.description === currentClueData.description
    );

    const goToNextClue = () => {
      setCurrentClueIndex((prevIndex) => (prevIndex + 1) % numClues);
    };

    const goToPrevClue = () => {
      setCurrentClueIndex((prevIndex) => (prevIndex - 1 + numClues) % numClues);
    };

    return (
      <div className="mt-2 mb-4 px-2 w-full max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
          Clues
        </h2>
        <div className="flex flex-col items-center gap-4">
          {/* Main Clue Card Area with Arrow Navigation */}
          <div className="flex items-center justify-center w-full space-x-2 sm:space-x-4">
            {/* Previous Clue Button */}
            {numClues > 1 ? (
              <Button
                onClick={goToPrevClue}
                variant="ghost" // Use ghost or outline for less emphasis
                size="icon"
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200"
                aria-label="Previous Clue"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ) : (
              <div className="w-10 h-10"></div> // Placeholder for alignment if only one clue
            )}

            {/* Clue Card */}
            {currentClueData && (
              <ClueCard
                key={originalClueIndex}
                clue={currentClueData}
                isUnlocked={unlockedClues.includes(originalClueIndex)}
                isFlipped={flippedClues.includes(originalClueIndex)}
                onUnlock={() => handleUnlockClue(originalClueIndex)}
                onToggleFlip={() => handleToggleFlip(originalClueIndex)}
              />
            )}

            {/* Next Clue Button */}
            {numClues > 1 ? (
              <Button
                onClick={goToNextClue}
                variant="ghost"
                size="icon"
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200"
                aria-label="Next Clue"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            ) : (
              <div className="w-10 h-10"></div> // Placeholder for alignment
            )}
          </div>

          {/* Dot Indicators (as per your screenshot) */}
          {numClues > 1 && (
            <div className="flex justify-center space-x-2 mt-3">
              {sortedClues.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={() => setCurrentClueIndex(index)}
                  aria-label={`Go to Clue ${index + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-colors
                  ${
                    currentClueIndex === index
                      ? "bg-teal-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  const isDisplayingTodaysPuzzle = currentPuzzle.date === getTodayString();
  // --- Main Component Return (Structure remains the same, dialogs use existing logic) ---
  return (
    <div className="max-w-full mx-auto p-4 md:p-6 font-sans bg-teal-50 min-h-screen flex flex-col items-center">
      {/* Header */}
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
          {/* Stats Dialog */}
          <Dialog
            open={isStatsOpen}
            onOpenChange={(open) => {
              setIsStatsOpen(open);
              if (!open) setShowSuccessPopup(false);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="View Stats">
                <BarChart3 className="h-6 w-6 text-gray-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-xl p-0">
              <DialogHeader className="flex flex-row justify-between items-center px-6 pt-5 pb-4 border-b border-gray-200">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {showSuccessPopup ? "Path Conquered!" : "Your Journey Stats "}
                </DialogTitle>
                {/* <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  
                  <CloseIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  <span className="sr-only">Close</span>
                </DialogClose> */}
              </DialogHeader>
              <div className="p-6 text-gray-700">
                {" "}
                {showSuccessPopup && (
                  <p className="text-center text-md text-green-600 font-medium mb-5">
                    {" "}
                    Congratulations! You found:{" "}
                    <span className="font-bold">
                      {currentPuzzle.answer}
                    </span>{" "}
                  </p>
                )}{" "}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {" "}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                    {" "}
                    <div className="text-3xl font-bold text-emerald-700">
                      {userStats.streak}
                    </div>{" "}
                    <div className="text-xs uppercase text-emerald-600 font-medium tracking-wide">
                      Path Streak
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                    {" "}
                    <div className="text-3xl font-bold text-emerald-700">
                      {" "}
                      {Object.values(userStats.solves).reduce(
                        (a, b) => a + b,
                        0
                      ) - (userStats.solves.failed || 0)}{" "}
                    </div>{" "}
                    <div className="text-xs uppercase text-emerald-600 font-medium tracking-wide">
                      Paths Found
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
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
                <h3 className="text-center font-semibold mb-3 text-gray-700 text-sm">
                  Explorer's Log{" "}
                  <span className="font-normal text-gray-500">
                    (by clues used)
                  </span>{" "}
                </h3>{" "}
                <div className="space-y-1.5 text-sm">
                  {" "}
                  {["0", "1", "2", "3"].map((clueCount) => (
                    <div
                      key={clueCount}
                      className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-md border border-slate-200"
                    >
                      {" "}
                      <span className="text-gray-600">
                        {clueCount} Clues:
                      </span>{" "}
                      <span className="font-semibold text-emerald-700">
                        {" "}
                        {userStats.solves[clueCount] || 0}{" "}
                      </span>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </div>
              <DialogFooter className="px-6 pb-6 pt-2 border-t border-gray-200">
                {showSuccessPopup ? (
                  <Button
                    onClick={handleShare}
                    disabled={isCopying} // isCopying disables the button during any share operation
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm py-2.5"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {shareFeedback
                      ? shareFeedback
                      : isCopying && !navigator.share
                      ? "Copying Path..."
                      : "Share Journey"}
                  </Button>
                ) : (
                  <DialogClose asChild>
                    <Button
                      type="button"
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm py-2.5"
                    >
                      Close
                    </Button>
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
        {columnMapping ? (
          renderGrid()
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            Shuffling Path...
          </div>
        )}
        {/* Display Try Count only when playing */}
        {gameState.status === "playing" && (
          <div className="text-center">
            {" "}
            {/* Added margin top/bottom and text-center */}
            <p className="text-gray-500 font-semibold text-lg">
              {" "}
              {/* Adjusted color and size slightly */}
              Path Tries: {tryCount}
            </p>
          </div>
        )}
        {renderSelectedPathPreview()}
        <div className="text-center mb-3 px-4 w-full flex flex-col items-center justify-center">
          {" "}
          <div className="flex flex-col items-center gap-6">
          {/* Increased min-h and mb */}
          {isAlreadySolvedToday && isDisplayingTodaysPuzzle ? (
            <div className="flex flex-col items-center gap-6">
              {" "}
              {/* Increased gap */}
              <p className="text-green-600 font-semibold text-lg">
                You've already found today's Pathword: {currentPuzzle.answer}!
              </p>
              <Button
                onClick={() => {
                  setShowSuccessPopup(true);
                  setIsStatsOpen(true);
                }}
                variant="default" // Use your default button style for primary action
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm py-2.5 px-6 shadow-md hover:shadow-lg transition-all duration-150 ease-in-out" // More prominent styling
              >
                <Share2 className="h-4 w-4 mr-2" />
                View Stats & Share
              </Button>
            </div>
          ) : isAlreadySolvedToday && !isDisplayingTodaysPuzzle ? ( // Solved a PAST puzzle
            <p className="text-green-600 font-semibold text-lg">
              You previously solved: {currentPuzzle.answer} (from{" "}
              {currentPuzzle.date})
            </p>
          
          ) : gameState.status === "success" &&
            !isStatsOpen &&
            isDisplayingTodaysPuzzle ? (
            // Transient success message for TODAY'S puzzle just solved
            <p className="text-green-600 font-semibold text-lg animate-pulse">
              Success! Word found: {currentPuzzle.answer}
            </p>
          ) : gameState.status === "success" && !isDisplayingTodaysPuzzle ? (
            // Transient success message for a PAST puzzle just solved
            <p className="text-green-600 font-semibold text-lg">
              Solved: {currentPuzzle.answer} (from {currentPuzzle.date})
            </p>
          ) : feedbackMessage ? (
            <p className="text-red-600 font-semibold text-md">
              {feedbackMessage}
            </p>
          ) : (
            gameState.status !== "playing" && <div className="h-full"></div> // Placeholder
          )}
        </div>
        </div>
        {/* --- CONDITIONALLY RENDER CLUES SECTION --- */}
        {gameState.status !== "success" &&
          !isAlreadySolvedToday &&
          renderCluesSection()}
        {/*
          Alternative more concise condition if isAlreadySolvedToday always implies gameState.status is 'success':
          Simply: gameState.status !== "success"
          Or: !isAlreadySolvedToday (if you ensure gameState.status is set correctly when isAlreadySolvedToday is true)

          The condition `gameState.status !== "success" && !isAlreadySolvedToday` is robust:
          - If the game is actively being played (`gameState.status === "playing"`), clues show.
          - If the game has just been solved in the current session, `gameState.status` becomes "success", hiding clues.
          - If the game is loaded and `isAlreadySolvedToday` becomes true (which also sets `gameState.status` to "success"), clues are hidden.
        */}
        {/* --- END OF CONDITIONAL CLUES SECTION --- */}
      </main>
      <footer className="pb-6 px-4 text-center w-full mt-auto">
        {gameState.status === "playing" && selectedPath.length > 0 && (
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-gray-400 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-full px-6 py-2 mb-6 shadow-sm"
          >
            {" "}
            Reset Path{" "}
          </Button>
        )}
        {/* <div className="text-xs text-gray-500 max-w-md mx-auto">
          {" "}
          <h3 className="font-semibold mb-1 text-gray-600">
            {" "}
            How to Play:{" "}
          </h3>{" "}
          <p>
            {" "}
            Select letters from top to bottom, one per row, using different
            columns. The{" "}
            <span className="text-green-700 font-semibold">
              {" "}
              green highlighted{" "}
            </span>{" "}
            letter is revealed. Click a selected letter to backtrack. Use clues
            for hints.{" "}
          </p>{" "}
        </div> */}
      </footer>
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
