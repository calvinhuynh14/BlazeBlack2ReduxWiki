import React from "react";
import { useAbilityDescription } from "../hooks/useAbilityDescription";

interface AbilityDisplayProps {
  ability: string;
  index: number;
}

export default function AbilityDisplay({
  ability,
  index,
}: AbilityDisplayProps) {
  const { description, loading, error } = useAbilityDescription(ability);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-3 py-1 rounded text-sm italic ${
          index === 2
            ? "text-[var(--hidden-ability)]"
            : "text-[var(--text-color-light)]"
        }`}
      >
        {ability}
      </span>
      {loading && (
        <span className="text-xs text-[var(--text-color-light)] opacity-60">
          Loading description...
        </span>
      )}
      {!loading && description && (
        <span className="text-xs text-[var(--text-color-light)] opacity-60">
          {description}
        </span>
      )}
      {error && (
        <span className="text-xs text-red-400 opacity-60">
          Failed to load description
        </span>
      )}
    </div>
  );
}
