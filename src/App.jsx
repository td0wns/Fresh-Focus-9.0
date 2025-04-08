import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  // Core state variables
  const [grid, setGrid] = useState(Array(25).fill(null));
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [gamePhase, setGamePhase] = useState("showingPattern");
  const [timer, setTimer] = useState(30);
  const [inputWord, setInputWord] = useState("");
  const [submittedWords, setSubmittedWords] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);

  // Utility: Generate a valid letter
  const generateLetter = () => {
    const vowels = ["A", "E", "I", "O", "U"];
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ".split("");
    return Math.random() < 0.3
      ? vowels[Math.floor(Math.random() * vowels.length)]
      : consonants[Math.floor(Math.random() * consonants.length)];
  };

  useEffect(() => {
    const newGrid = Array.from({ length: 25 }, () => generateLetter());
    const patternIndices = [];
    while (patternIndices.length < 5) {
      const r = Math.floor(Math.random() * 25);
      if (!patternIndices.includes(r)) patternIndices.push(r);
    }
    setGrid(newGrid);
    setPattern(patternIndices);

    // Show pattern for a few seconds
    setTimeout(() => setGamePhase("selectingTiles"), 3000);
  }, []);

  const handleTileClick = (index) => {
    if (gamePhase !== "selectingTiles" || userPattern.includes(index)) return;
    const letter = grid[index];
    setRevealedLetters((prev) => [...prev, letter]);
    setUserPattern((prev) => [...prev, index]);
    if (userPattern.length + 1 === 5) {
      setGamePhase("typingWords");
      setTimeout(() => setGamePhase("finished"), 30000);
    }
  };

  const handleWordSubmit = () => {
    if (!inputWord || submittedWords.includes(inputWord.toUpperCase())) {
      setMessage("Duplicate or invalid word");
      return;
    }
    const word = inputWord.toUpperCase();
    let wordScore = 0;
    let matched = 0;
    for (const l of revealedLetters) {
      if (word.includes(l)) {
        wordScore += 5;
        matched++;
      }
    }
    if (matched >= 2) wordScore += 5 * (matched - 1);
    setSubmittedWords((prev) => [...prev, word]);
    setScore((prev) => prev + wordScore);
    setInputWord("");
    setMessage(`${word} accepted! +${wordScore} points`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#786daa" }}>
        Fresh <span style={{ color: "#84dade" }}>Focus</span>
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 60px)", gap: 8 }}>
        {grid.map((letter, idx) => (
          <button
            key={idx}
            style={{
              height: 60,
              width: 60,
              backgroundColor: userPattern.includes(idx)
                ? pattern.includes(idx)
                  ? "#84dade"
                  : "black"
                : "#786daa",
              color: userPattern.includes(idx) ? "#dedede" : "transparent",
              border: "none",
              fontSize: 24,
            }}
            onClick={() => handleTileClick(idx)}
          >
            {userPattern.includes(idx) ? letter : "A"}
          </button>
        ))}
      </div>

      {gamePhase === "typingWords" && (
        <div style={{ marginTop: 20 }}>
          <Input
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="Enter word"
            onKeyDown={(e) => e.key === "Enter" && handleWordSubmit()}
          />
          <Button onClick={handleWordSubmit}>Submit</Button>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <strong>Score:</strong> {score}
      </div>

      <div style={{ marginTop: 10 }}>
        {submittedWords.map((word, idx) => (
          <div key={idx}>{word}</div>
        ))}
      </div>

      {message && <div style={{ marginTop: 10, color: "green" }}>{message}</div>}
    </div>
  );
}

