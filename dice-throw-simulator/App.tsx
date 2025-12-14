import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Dices, MousePointerClick, Settings, RotateCcw } from "lucide-react";
import GameScene from "./components/GameScene";

const App: React.FC = () => {
  const [diceCount, setDiceCount] = useState<number>(2);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [throwTrigger, setThrowTrigger] = useState<number>(0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Store results for each die. null means rolling/waiting.
  const [results, setResults] = useState<(number | null)[]>([]);

  // Ref for settings panel
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize results array
  useEffect(() => {
    setResults(new Array(diceCount).fill(null));
  }, [diceCount]);

  // Reset results when throw starts
  useEffect(() => {
    if (throwTrigger > 0) {
      setResults(new Array(diceCount).fill(null));
    }
  }, [throwTrigger, diceCount]);

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSettings &&
        settingsPanelRef.current &&
        settingsButtonRef.current &&
        !settingsPanelRef.current.contains(event.target as Node) &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const handleDieResult = (index: number, value: number) => {
    setResults((prev) => {
      const newRes = [...prev];
      newRes[index] = value;
      return newRes;
    });
  };

  // Calculate total if all are ready (or partial sum if you prefer seeing it update live)
  // Let's show partial sum but maybe indicate if it's final?
  // For simplicity, just show sum of settled dice.
  const totalScore = results.reduce((acc, curr) => (acc || 0) + (curr || 0), 0);
  const settledCount = results.filter((r) => r !== null).length;
  const allSettled = settledCount === diceCount && throwTrigger > 0;

  // Timer for detecting long press
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    // Start shaking immediately on press
    setIsShaking(true);
    setResults(new Array(diceCount).fill(null)); // Clear results on shake

    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
      // Long press logic handled by state simply remaining true
    }, 200);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Stop shaking
    setIsShaking(false);

    // Trigger the throw
    setThrowTrigger((prev) => prev + 1);
  };

  const handlePointerLeave = () => {
    if (isShaking) {
      setIsShaking(false);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className="w-full h-full relative bg-zinc-900 select-none overflow-hidden touch-none">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 20, 15], fov: 50 }}>
          <color attach="background" args={["#27272a"]} />
          <GameScene
            diceCount={diceCount}
            isShaking={isShaking}
            throwTrigger={throwTrigger}
            resetTrigger={resetTrigger}
            onDieResult={handleDieResult}
          />
        </Canvas>
      </div>

      {/* Header / Title */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center gap-2">
            <Dices className="w-8 h-8 text-amber-500" />
            Dice Roller
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Long press to shake, release to throw
          </p>
        </div>

        <div className="pointer-events-auto">
          <button
            ref={settingsButtonRef}
            onClick={() => setShowSettings(!showSettings)}
            className="bg-zinc-800/80 backdrop-blur-md p-3 rounded-full text-white hover:bg-zinc-700 transition-colors shadow-lg border border-zinc-700"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Score Display - Only show if we have results */}
      <div
        className={`
        absolute top-24 left-1/2 -translate-x-1/2 z-10 
        transition-all duration-500 transform
        ${
          settledCount > 0
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }
      `}
      >
        <div className="bg-zinc-900/80 backdrop-blur-md border border-amber-500/30 px-8 py-3 rounded-2xl shadow-2xl flex flex-col items-center">
          <span className="text-zinc-400 text-xs uppercase tracking-widest mb-1">
            Total Score
          </span>
          <div className="text-5xl font-black text-white flex items-center gap-2">
            <span
              className={
                allSettled ? "text-amber-400 animate-pulse-once" : "text-white"
              }
            >
              {totalScore}
            </span>
          </div>
          {allSettled && (
            <div className="flex gap-1 mt-2">
              {results.map((r, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-300"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div
          ref={settingsPanelRef}
          className="absolute top-20 right-6 w-64 bg-zinc-800/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-zinc-700 z-20 text-white animate-fade-in-down"
        >
          <h2 className="text-lg font-semibold mb-4 border-b border-zinc-700 pb-2">
            Settings
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2 flex justify-between">
              <span>Dice Count</span>
              <span className="font-mono bg-zinc-700 px-2 rounded">
                {diceCount}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>1</span>
              <span>6</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-700">
            <button
              onClick={() => setResetTrigger((prev) => prev + 1)}
              className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Camera View
            </button>
          </div>
        </div>
      )}

      {/* Interaction Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs px-4">
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onContextMenu={handleContextMenu}
          className={`
            w-full h-20 rounded-2xl font-bold text-xl tracking-wider uppercase transition-all duration-150 transform
            flex items-center justify-center gap-3 shadow-2xl border-b-4
            ${
              isShaking
                ? "bg-amber-600 text-white scale-95 border-amber-800"
                : "bg-amber-500 text-white hover:bg-amber-400 border-amber-700 hover:-translate-y-1 active:translate-y-0 active:border-b-0"
            }
          `}
        >
          <MousePointerClick
            className={`w-6 h-6 ${isShaking ? "animate-bounce" : ""}`}
          />
          {isShaking ? "Shaking..." : "Throw Dice"}
        </button>
      </div>

      {/* Instructions Overlay for Desktop */}
      <div className="absolute bottom-4 right-4 text-xs text-zinc-600 hidden md:block z-0 pointer-events-none">
        Powered by React Three Fiber & Cannon.js
      </div>
    </div>
  );
};

export default App;
