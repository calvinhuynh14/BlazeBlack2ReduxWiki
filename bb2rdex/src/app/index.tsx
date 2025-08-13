import React, { useState } from "react";
import SearchBar from "./components/SearchBar";

const FILTERS = ["Pokemon", "Ability", "Move", "Type", "Location"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Pokemon");

  // Placeholder for Pokémon data
  const pokemonList = [
    {
      name: "Bulbasaur",
      number: 1,
      sprite: "/pokemon-sprites/pokemon/1.png",
    },
    {
      name: "Ivysaur",
      number: 2,
      sprite: "/pokemon-sprites/pokemon/2.png",
    },
    // ...add more or load from your JSON
  ];

  // Filtered Pokémon
  const filteredPokemon = pokemonList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-background-light shadow">
        <h1 className="text-2xl font-bold text-primary">Pokédex</h1>
        <SearchBar value={search} onChange={setSearch} />
      </nav>

      {/* Filters */}
      <div className="flex gap-4 px-8 py-4">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-md font-medium transition ${
              selectedFilter === filter
                ? "bg-primary text-background"
                : "bg-card text-text-muted hover:bg-accent"
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="px-8 py-4">
        {selectedFilter === "Pokemon" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredPokemon.map((p) => (
              <div
                key={p.number}
                className="bg-card rounded-lg p-4 flex flex-col items-center shadow hover:bg-accent transition"
              >
                <img src={p.sprite} alt={p.name} className="w-16 h-16 mb-2" />
                <span className="text-lg font-semibold">{p.name}</span>
                <span className="text-text-muted">#{p.number}</span>
              </div>
            ))}
          </div>
        )}
        {/* Add more content for other filters later */}
      </main>
    </div>
  );
}
