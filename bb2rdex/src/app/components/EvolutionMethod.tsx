import React from "react";

interface EvolutionMethodProps {
  method: string;
}

export default function EvolutionMethod({ method }: EvolutionMethodProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-12 md:h-18 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs opacity-60 text-center max-w-16 md:max-w-20">
            {method}
          </span>
          <span className="text-xs opacity-60">→</span>
        </div>
      </div>
      <span className="text-xs mt-1 text-[var(--text-color-light)] opacity-60">
        Evolve
      </span>
    </div>
  );
}
