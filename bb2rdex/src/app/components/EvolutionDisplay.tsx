import React from "react";
import { useEvolutionChain } from "../hooks/useEvolutionChain";
import EvolutionStage from "./EvolutionStage";
import EvolutionMethod from "./EvolutionMethod";

interface EvolutionDisplayProps {
  pokemon: any;
  allPokemon: any[];
  onPokemonChange?: (pokemonName: string) => void;
}

export default function EvolutionDisplay({
  pokemon,
  allPokemon,
  onPokemonChange,
}: EvolutionDisplayProps) {
  const evolutionChain = useEvolutionChain(pokemon, allPokemon);

  if (!evolutionChain) {
    return (
      <div className="text-sm text-[var(--text-color-light)] opacity-60">
        No evolution data available
      </div>
    );
  }

  const { stages } = evolutionChain;

  if (!stages || stages.length <= 1) {
    return (
      <div className="text-sm text-[var(--text-color-light)] opacity-60">
        This Pokémon does not evolve
      </div>
    );
  }

  // Organize Pokemon by stage for column display
  const organizeByColumns = () => {
    const columns: { [key: number]: any[] } = {};

    stages.forEach((stage) => {
      stage.pokemon.forEach((evolution) => {
        const stageNumber = evolution.stage;
        if (!columns[stageNumber]) {
          columns[stageNumber] = [];
        }
        columns[stageNumber].push(evolution);
      });
    });

    return columns;
  };

  const columns = organizeByColumns();
  const maxStage = Math.max(...Object.keys(columns).map(Number));

  // Helper function to get evolution methods for a Pokemon
  const getEvolutionMethods = (
    pokemonName: string,
    nextStagePokemon: any[]
  ) => {
    const pokemon = allPokemon.find((p) => p.Name === pokemonName);
    if (!pokemon?.Evolutions) return [];

    const methods: string[] = [];
    nextStagePokemon.forEach((nextPokemon) => {
      const evolution = pokemon.Evolutions.find(
        (e: any) => e.To === nextPokemon.name
      );
      if (evolution) {
        methods.push(evolution.Method || "Level Up");
      }
    });

    return methods;
  };

  return (
    <div className="text-sm text-[var(--text-color-light)]">
      <div className="flex gap-6 justify-center items-center">
        {Object.keys(columns)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((stageKey, index) => {
            const stageNumber = parseInt(stageKey);
            const pokemonInStage = columns[stageNumber];
            const nextStageKey = Object.keys(columns).sort(
              (a, b) => parseInt(a) - parseInt(b)
            )[index + 1];
            const nextStagePokemon = nextStageKey
              ? columns[parseInt(nextStageKey)]
              : [];

            return (
              <React.Fragment key={stageNumber}>
                {/* Pokemon Stage Column */}
                <div className="flex flex-col items-center gap-3">
                  {pokemonInStage.map((evolution) => (
                    <EvolutionStage
                      key={evolution.name}
                      evolution={evolution}
                      onClick={onPokemonChange || (() => {})}
                    />
                  ))}
                </div>

                {/* Evolution Method Column (if not the last stage) */}
                {stageNumber < maxStage && (
                  <div className="flex flex-col items-center gap-3">
                    {pokemonInStage.map((evolution, evoIndex) => {
                      const methods = getEvolutionMethods(
                        evolution.name,
                        nextStagePokemon
                      );
                      return (
                        <div
                          key={`method-${evolution.name}`}
                          className="flex flex-col items-center"
                        >
                          {methods.map((method, methodIndex) => (
                            <div
                              key={`${evolution.name}-${methodIndex}`}
                              className="flex flex-col items-center py-4"
                            >
                              <span className="text-xs opacity-60 text-center max-w-20">
                                {method}
                              </span>
                              <span className="text-xs opacity-60 mt-1">→</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
      </div>
    </div>
  );
}
