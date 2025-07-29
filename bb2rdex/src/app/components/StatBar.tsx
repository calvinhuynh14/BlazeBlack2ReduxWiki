import React from "react";

interface StatBarProps {
  statName: string;
  statValue: number;
  statValueVanilla?: number;
  maxValue?: number;
}

export default function StatBar({
  statName,
  statValue,
  statValueVanilla,
  maxValue = 255,
}: StatBarProps) {
  // Calculate percentage for bar width (1-255 range)
  const percentage = (statValue / maxValue) * 100;

  // Calculate stat change if vanilla stats are provided
  const statChange = statValueVanilla ? statValue - statValueVanilla : 0;
  const hasChange = statChange !== 0;

  // Determine color based on stat value - red to cyanish green
  const getStatColor = (value: number) => {
    if (value <= 1) return "bg-red-800";
    if (value <= 49) return "bg-red-500";
    if (value <= 69) return "bg-orange-500";
    if (value <= 89) return "bg-yellow-500";
    if (value <= 109) return "bg-lime-500";
    if (value <= 129) return "bg-green-500";
    if (value <= 149) return "bg-emerald-500";
    return "bg-cyan-500";
  };

  const barColor = getStatColor(statValue);

  // Determine stat name color based on change
  const getStatNameColor = () => {
    if (!hasChange) return "text-[var(--text-color-light)]";
    return statChange > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-[80px] text-sm">
        <span className={getStatNameColor()}>
          {statName}
          {hasChange && (
            <sup className="ml-1 text-xs">
              {statChange > 0 ? "+" : ""}
              {statChange}
            </sup>
          )}
        </span>
      </div>
      <span className="text-[var(--text-color-light)] font-semibold min-w-[30px] text-right text-sm">
        {statValue}
      </span>
      <div className="flex-1 bg-[var(--background)] rounded-sm h-4 overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-sm transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
