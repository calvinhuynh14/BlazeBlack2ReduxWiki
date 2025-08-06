import React from "react";

interface EvolutionStageProps {
  evolution: {
    name: string;
    number: number;
    isCurrent: boolean;
  };
  onClick: (pokemonName: string) => void;
}

export default function EvolutionStage({
  evolution,
  onClick,
}: EvolutionStageProps) {
  const handleClick = () => {
    onClick(evolution.name);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-18 h-18 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
          evolution.isCurrent
            ? "border-1 border-blue-400 bg-blue-50/10"
            : "border-[var(--border)] bg-[var(--table-dark)] hover:border-blue-400 hover:bg-blue-50/5"
        }`}
        onClick={handleClick}
      >
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.number}.png`}
          alt={evolution.name}
          className="w-18"
        />
      </div>
      <span
        className={`text-xs mt-1 ${
          evolution.isCurrent
            ? "text-blue-400 font-semibold"
            : "text-[var(--text-color-light)]"
        }`}
      >
        {evolution.name}
      </span>
    </div>
  );
}
