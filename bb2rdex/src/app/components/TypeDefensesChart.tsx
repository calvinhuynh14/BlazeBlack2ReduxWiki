import React from "react";
import TypeBadge from "./TypeBadge";

interface TypeDefensesChartProps {
  defenses: {
    Immune?: string[];
    "0.25x Resist"?: string[];
    "0.5x Resist"?: string[];
    Neutral?: string[];
    "2x Weak "?: string[];
    "4x Weak"?: string[];
  };
}

const ALL_TYPES = [
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

const getEffectivenessData = (type: string, defenses: any) => {
  if (defenses.Immune?.includes(type)) {
    return { multiplier: "×0", color: "bg-black", textColor: "text-white" };
  }
  if (defenses["0.25x Resist"]?.includes(type)) {
    return { multiplier: "¼×", color: "bg-red-800", textColor: "text-white" };
  }
  if (defenses["0.5x Resist"]?.includes(type)) {
    return { multiplier: "½×", color: "bg-red-500", textColor: "text-white" };
  }
  if (defenses["2x Weak "]?.includes(type)) {
    return { multiplier: "2×", color: "bg-green-700", textColor: "text-white" };
  }
  if (defenses["4x Weak"]?.includes(type)) {
    return { multiplier: "4×", color: "bg-green-400", textColor: "text-black" };
  }
  // Default to neutral
  return { multiplier: "1×", color: "bg-gray-500", textColor: "text-white" };
};

export default function TypeDefensesChart({
  defenses,
}: TypeDefensesChartProps) {
  return (
    <div className="grid grid-cols-6 gap-4 max-w-3xl mx-auto">
      {ALL_TYPES.map((type) => {
        const effectiveness = getEffectivenessData(type, defenses);

        return (
          <div key={type} className="flex flex-col items-center gap-1">
            <TypeBadge type={type} />
            <div
              className={`rounded-xl border text-xs font-bold ${effectiveness.color} ${effectiveness.textColor} drop-shadow-sm flex items-center justify-center`}
              style={{
                width: 64,
                height: 24,
                textAlign: "center",
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.9), 0 0px 2px rgba(0,0,0,0.7)",
              }}
            >
              {effectiveness.multiplier}
            </div>
          </div>
        );
      })}
    </div>
  );
}
