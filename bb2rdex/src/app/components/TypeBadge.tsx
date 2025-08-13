import React from "react";

const TYPE_COLORS: Record<string, string> = {
  Normal: "bg-[#A8A77A]",
  Fire: "bg-[#EE8130]",
  Water: "bg-[#6390F0]",
  Electric: "bg-[#F7D02C]",
  Grass: "bg-[#7AC74C]",
  Ice: "bg-[#96D9D6]",
  Fighting: "bg-[#C22E28]",
  Poison: "bg-[#A33EA1]",
  Ground: "bg-[#E2BF65]",
  Flying: "bg-[#A98FF3]",
  Psychic: "bg-[#F95587]",
  Bug: "bg-[#A6B91A]",
  Rock: "bg-[#B6A136]",
  Ghost: "bg-[#735797]",
  Dragon: "bg-[#6F35FC]",
  Dark: "bg-[#705746]",
  Steel: "bg-[#B7B7CE]",
  Fairy: "bg-[#D685AD]",
};

export default function TypeBadge({
  type,
  className = "",
}: {
  type: string;
  className?: string;
}) {
  const color = TYPE_COLORS[type] || "bg-gray-400 border-gray-400";
  return (
    <span
      className={`rounded-xl border text-xs font-semibold text-white ${color} drop-shadow-sm ${className} flex items-center justify-center`}
      style={{
        width: 64,
        height: 24,
        textAlign: "center",
        textShadow: "0 2px 6px rgba(0,0,0,0.9), 0 0px 2px rgba(0,0,0,0.7)",
      }}
    >
      {type}
    </span>
  );
}
