import React, { useState, useEffect, useRef } from "react";
import TypeBadge from "./TypeBadge";

export interface SearchFilter {
  id: string;
  type: "type" | "ability" | "move" | "pokemon";
  value: string;
  label: string;
}

interface AdvancedSearchProps {
  allPokemon: any[];
  allMoves: { [key: string]: any };
  onFiltersChange: (filters: SearchFilter[]) => void;
}

export default function AdvancedSearch({
  allPokemon,
  allMoves,
  onFiltersChange,
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ type: string; value: string; label: string }>
  >([]);
  const [selectedFilters, setSelectedFilters] = useState<SearchFilter[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Generate all available types, abilities, moves, and pokemon names
  const allTypes = Array.from(
    new Set(allPokemon.flatMap((p) => p.TYPE))
  ).sort();
  const allAbilities = Array.from(
    new Set(allPokemon.flatMap((p) => p.Ability))
  ).sort();

  // Extract all unique moves from moves data
  const allMoveNames = Object.values(allMoves)
    .map((move: any) => move.name)
    .filter(Boolean)
    .sort();

  // Get all pokemon names
  const allPokemonNames = allPokemon.map((p) => p.Name).sort();

  // Filter suggestions based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const newSuggestions: Array<{
      type: string;
      value: string;
      label: string;
    }> = [];

    // Search pokemon names (prioritize exact matches)
    const exactPokemonMatches = allPokemonNames.filter(
      (name) => name.toLowerCase() === term
    );
    const partialPokemonMatches = allPokemonNames.filter(
      (name) => name.toLowerCase().includes(term) && name.toLowerCase() !== term
    );
    const pokemonMatches = [...exactPokemonMatches, ...partialPokemonMatches];

    pokemonMatches.forEach((name) => {
      newSuggestions.push({
        type: "pokemon",
        value: name,
        label: `Pokemon: ${name}`,
      });
    });

    // Search types
    allTypes
      .filter((type) => type.toLowerCase().includes(term))
      .forEach((type) => {
        newSuggestions.push({
          type: "type",
          value: type,
          label: `Type: ${type}`,
        });
      });

    // Search abilities
    allAbilities
      .filter((ability) => ability.toLowerCase().includes(term))
      .forEach((ability) => {
        newSuggestions.push({
          type: "ability",
          value: ability,
          label: `Ability: ${ability}`,
        });
      });

    // Search moves
    const matchingMoves = allMoveNames.filter((move) =>
      move.toLowerCase().includes(term)
    );
    matchingMoves.forEach((move) => {
      // Format move name: convert kebab-case to Title Case
      const formattedMoveName = move
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      newSuggestions.push({
        type: "move",
        value: move,
        label: `Move: ${formattedMoveName}`,
      });
    });

    setSuggestions(newSuggestions.slice(0, 15)); // Limit to 15 suggestions to accommodate pokemon
  }, [searchTerm, allTypes, allAbilities, allMoveNames, allPokemonNames]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: {
    type: string;
    value: string;
    label: string;
  }) => {
    if (suggestion.type === "pokemon") {
      // For Pokemon, update the search term to filter the table directly
      setSearchTerm(suggestion.value);
      setShowSuggestions(false);
      return;
    }

    const newFilter: SearchFilter = {
      id: `${suggestion.type}-${suggestion.value}-${Date.now()}`,
      type: suggestion.type as "type" | "ability" | "move",
      value: suggestion.value,
      label: suggestion.label,
    };

    const updatedFilters = [...selectedFilters, newFilter];
    setSelectedFilters(updatedFilters);
    onFiltersChange(updatedFilters);

    setSearchTerm("");
    setShowSuggestions(false);
  };

  // Remove a filter
  const removeFilter = (filterId: string) => {
    const updatedFilters = selectedFilters.filter((f) => f.id !== filterId);
    setSelectedFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFilterColor = (type: string) => {
    switch (type) {
      case "ability":
        return "bg-yellow-500 text-white";
      case "move":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for types, abilities, or moves..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-4 py-2 cursor-pointer border-b border-gray-600 last:border-b-0 ${
                  suggestion.type === "type"
                    ? "hover:bg-gray-700"
                    : suggestion.type === "pokemon"
                    ? "hover:bg-red-500/20"
                    : suggestion.type === "ability"
                    ? "hover:bg-yellow-500/20"
                    : "hover:bg-purple-500/20"
                }`}
              >
                <span className="font-medium text-white">
                  {suggestion.type === "type" && (
                    <div className="flex items-center">
                      <span className="font-bold text-white mr-2">Type:</span>
                      <TypeBadge type={suggestion.value} />
                    </div>
                  )}
                  {suggestion.type === "ability" && (
                    <>
                      <span className="font-bold text-yellow-400">
                        Ability:
                      </span>
                      <span className="ml-1 text-white">
                        {suggestion.value}
                      </span>
                    </>
                  )}
                  {suggestion.type === "pokemon" && (
                    <>
                      <span className="font-bold text-red-400">Pokemon:</span>
                      <span className="ml-1 text-white">
                        {suggestion.value}
                      </span>
                    </>
                  )}
                  {suggestion.type === "move" && (
                    <>
                      <span className="font-bold text-blue-400">Move:</span>
                      <span className="ml-1 text-white">
                        {suggestion.value
                          .split("-")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map((filter) => (
            <div
              key={filter.id}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                filter.type === "type"
                  ? "bg-gray-700"
                  : getFilterColor(filter.type)
              }`}
            >
              {filter.type === "type" ? (
                <div className="flex items-center">
                  <span className="font-bold text-white mr-1">Type:</span>
                  <TypeBadge type={filter.value} />
                </div>
              ) : (
                <span>{filter.label}</span>
              )}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:bg-black/20 rounded-full w-5 h-5 flex items-center justify-center text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Filters */}
      {selectedFilters.length > 0 && (
        <button
          onClick={() => {
            setSelectedFilters([]);
            onFiltersChange([]);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
