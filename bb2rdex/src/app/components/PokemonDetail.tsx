import React from "react";
import TypeBadge from "./TypeBadge";
import StatBar from "./StatBar";
import AbilityDisplay from "./AbilityDisplay";
import BSTDisplay from "./BSTDisplay";

interface PokemonDetailProps {
  pokemon: any;
}

export default function PokemonDetail({ pokemon }: PokemonDetailProps) {
  if (!pokemon) return null;

  const bst =
    pokemon.STATS.HP +
    pokemon.STATS.ATK +
    pokemon.STATS.DEF +
    pokemon.STATS.SPA +
    pokemon.STATS.SPD +
    pokemon.STATS.SPE;

  // Calculate vanilla BST if vanilla stats exist
  const vanillaBST = pokemon["VANILLA STATS"]
    ? pokemon["VANILLA STATS"].HP +
      pokemon["VANILLA STATS"].ATK +
      pokemon["VANILLA STATS"].DEF +
      pokemon["VANILLA STATS"].SPA +
      pokemon["VANILLA STATS"].SPD +
      pokemon["VANILLA STATS"].SPE
    : undefined;

  // Find the highest stat to determine container width
  const stats = [
    pokemon.STATS.HP,
    pokemon.STATS.ATK,
    pokemon.STATS.DEF,
    pokemon.STATS.SPA,
    pokemon.STATS.SPD,
    pokemon.STATS.SPE,
  ];
  const maxStat = Math.max(...stats);
  const maxPercentage = (maxStat / 255) * 100;

  // Calculate container width based on max stat (minimum 60%, maximum 90%)
  const containerWidth = Math.max(60, Math.min(90, maxPercentage + 30));

  return (
    <div className="space-y-6">
      {/* Header with sprite and basic info */}
      <div className="flex flex-col items-center gap-6">
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.Number}.gif`}
          alt={pokemon.Name}
          className="max-w-24"
        />
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-color-light)] mb-2">
            #{pokemon.Number} {pokemon.Name}
          </h3>
          <div className="flex justify-center gap-2 mb-2">
            {pokemon.TYPE.map((type: string) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      </div>

      {/* Abilities */}
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-semibold text-[var(--text-color-light)] mb-2">
          Abilities
        </h4>
        <div className="flex flex-col gap-2">
          {pokemon.Ability.map((ability: string, index: number) => (
            <AbilityDisplay key={ability} ability={ability} index={index} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-semibold text-[var(--text-color-light)] mb-3">
          Base Stats
        </h4>
        <div
          className="space-y-3 mb-2"
          style={{ width: `${containerWidth}%`, maxWidth: "400px" }}
        >
          <StatBar
            statName="HP"
            statValue={pokemon.STATS.HP}
            statValueVanilla={pokemon["VANILLA STATS"]?.HP}
          />
          <StatBar
            statName="Attack"
            statValue={pokemon.STATS.ATK}
            statValueVanilla={pokemon["VANILLA STATS"]?.ATK}
          />
          <StatBar
            statName="Defense"
            statValue={pokemon.STATS.DEF}
            statValueVanilla={pokemon["VANILLA STATS"]?.DEF}
          />
          <StatBar
            statName="Sp. Atk"
            statValue={pokemon.STATS.SPA}
            statValueVanilla={pokemon["VANILLA STATS"]?.SPA}
          />
          <StatBar
            statName="Sp. Def"
            statValue={pokemon.STATS.SPD}
            statValueVanilla={pokemon["VANILLA STATS"]?.SPD}
          />
          <StatBar
            statName="Speed"
            statValue={pokemon.STATS.SPE}
            statValueVanilla={pokemon["VANILLA STATS"]?.SPE}
          />
        </div>
        <div
          className="space-y-3"
          style={{ width: `${containerWidth}%`, maxWidth: "400px" }}
        >
          <BSTDisplay currentBST={bst} vanillaBST={vanillaBST} />
        </div>
      </div>

      {/* Evolutions */}
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-semibold text-[var(--text-color-light)] mb-3">
          Evolution
        </h4>
      </div>
    </div>
  );
}
