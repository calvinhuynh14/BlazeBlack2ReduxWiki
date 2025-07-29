import React from "react";

export default function EvolutionDisplay({ evolution }: { evolution: string }) {
  return (
    <div>
      <img src={evolution.image} alt={evolution.name} />
      <p>{evolution.name}</p>
    </div>
  );
}
