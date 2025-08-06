import { useState, useEffect } from "react";

interface Evolution {
  name: string;
  number: number;
  methods: string[]; // Array of evolution methods
  isCurrent: boolean;
  stage: number; // 0 = base, 1 = middle, 2 = final
}

interface EvolutionStage {
  pokemon: Evolution[];
  isBranch: boolean;
}

interface EvolutionChain {
  stages: EvolutionStage[];
}

export function useEvolutionChain(
  pokemon: any,
  allPokemon: any[]
): EvolutionChain | null {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(
    null
  );

  useEffect(() => {
    if (!pokemon || !allPokemon.length) return;

    const findEvolutionChain = () => {
      const currentName = pokemon.Name;
      const currentNumber = pokemon.Number;

      console.log("=== EVOLUTION CHAIN DEBUG ===");
      console.log("Current Pokemon:", currentName, "#", currentNumber);
      console.log("Total Pokemon in dataset:", allPokemon.length);

      // Find the complete evolution chain
      const buildChain = () => {
        const stages: EvolutionStage[] = [];

        // Find all Pokemon that mention the current Pokemon in their evolution chain
        const findRelatedPokemon = () => {
          const related: string[] = [currentName];

          console.log("\n--- Finding Related Pokemon ---");

          // Recursively find all Pokemon in the evolution chain
          const findAllInChain = (
            pokemonName: string,
            visited: Set<string> = new Set()
          ): string[] => {
            if (visited.has(pokemonName)) return [];
            visited.add(pokemonName);

            const chain: string[] = [pokemonName];
            const pokemon = allPokemon.find((p) => p.Name === pokemonName);

            if (pokemon?.Evolutions) {
              pokemon.Evolutions.forEach((e: any) => {
                const nextChain = findAllInChain(e.To, visited);
                chain.push(...nextChain);
              });
            }

            return chain;
          };

          // Recursively find all Pokemon that can evolve into a given Pokemon
          const findAllPredecessors = (
            pokemonName: string,
            visited: Set<string> = new Set()
          ): string[] => {
            if (visited.has(pokemonName)) return [];
            visited.add(pokemonName);

            const predecessors: string[] = [pokemonName];

            // Find all Pokemon that evolve into this Pokemon
            allPokemon.forEach((p) => {
              if (p.Evolutions?.some((e: any) => e.To === pokemonName)) {
                console.log(
                  `Found Pokemon that evolves INTO ${pokemonName}:`,
                  p.Name
                );
                const previousChain = findAllPredecessors(p.Name, visited);
                predecessors.push(...previousChain);
              }
            });

            return predecessors;
          };

          // Find all Pokemon in the same evolution family (including splits)
          const findAllInFamily = (
            pokemonName: string,
            visited: Set<string> = new Set()
          ): string[] => {
            if (visited.has(pokemonName)) return [];
            visited.add(pokemonName);

            const family: string[] = [pokemonName];
            const pokemon = allPokemon.find((p) => p.Name === pokemonName);

            // Find all Pokemon that evolve into this one
            allPokemon.forEach((p) => {
              if (p.Evolutions?.some((e: any) => e.To === pokemonName)) {
                const parentFamily = findAllInFamily(p.Name, visited);
                family.push(...parentFamily);
              }
            });

            // Find all Pokemon this one evolves into
            if (pokemon?.Evolutions) {
              pokemon.Evolutions.forEach((e: any) => {
                const childFamily = findAllInFamily(e.To, visited);
                family.push(...childFamily);
              });
            }

            return family;
          };

          // Find all Pokemon in the same evolution family
          const allFamilyMembers = findAllInFamily(currentName);
          allFamilyMembers.forEach((pokemonName) => {
            if (!related.includes(pokemonName)) {
              related.push(pokemonName);
            }
          });

          console.log("All related Pokemon:", related);
          return related;
        };

        // Find the first stage (base form)
        const findFirstStage = (relatedPokemon: string[]): string => {
          console.log("\n--- Finding First Stage ---");
          console.log("Checking these Pokemon for base form:", relatedPokemon);

          // Find the Pokemon with no previous evolutions
          for (const pokemonName of relatedPokemon) {
            const hasPrevious = allPokemon.some((p) =>
              p.Evolutions?.some((e: any) => e.To === pokemonName)
            );

            console.log(`${pokemonName} has previous evolution:`, hasPrevious);

            if (!hasPrevious) {
              console.log(`Found base form: ${pokemonName}`);
              return pokemonName;
            }
          }

          console.log(`No base form found, using current: ${currentName}`);
          return currentName;
        };

        // Find the final stage (fully evolved)
        const findFinalStage = (relatedPokemon: string[]): string => {
          console.log("\n--- Finding Final Stage ---");
          console.log("Checking these Pokemon for final form:", relatedPokemon);

          // Find the Pokemon with no next evolutions
          for (const pokemonName of relatedPokemon) {
            const pokemon = allPokemon.find((p) => p.Name === pokemonName);
            const hasNext =
              pokemon?.Evolutions && pokemon.Evolutions.length > 0;

            console.log(`${pokemonName} has next evolution:`, hasNext);

            if (!hasNext) {
              console.log(`Found final form: ${pokemonName}`);
              return pokemonName;
            }
          }

          console.log(`No final form found, using current: ${currentName}`);
          return currentName;
        };

        // Find the middle stage
        const findMiddleStage = (
          relatedPokemon: string[],
          firstStage: string,
          finalStage: string
        ): string => {
          console.log("\n--- Finding Middle Stage ---");
          console.log("First stage:", firstStage);
          console.log("Final stage:", finalStage);
          console.log(
            "Checking these Pokemon for middle form:",
            relatedPokemon
          );

          // Find the Pokemon that is neither first nor final
          for (const pokemonName of relatedPokemon) {
            if (pokemonName !== firstStage && pokemonName !== finalStage) {
              console.log(`Found middle stage: ${pokemonName}`);
              return pokemonName;
            }
          }

          console.log(`No middle stage found, using current: ${currentName}`);
          return currentName;
        };

        const relatedPokemon = findRelatedPokemon();
        const firstStageName = findFirstStage(relatedPokemon);
        const finalStageName = findFinalStage(relatedPokemon);
        const middleStageName = findMiddleStage(
          relatedPokemon,
          firstStageName,
          finalStageName
        );

        console.log("\n--- Stage Analysis ---");
        console.log("First stage:", firstStageName);
        console.log("Current stage:", currentName);
        console.log("Final stage:", finalStageName);
        console.log("Middle stage:", middleStageName);

        // Build stages array
        const stageNames: string[] = [];

        // Group Pokemon by their evolution stage
        const groupByStage = () => {
          const stages: { [key: string]: string[] } = {};

          relatedPokemon.forEach((pokemonName) => {
            const pokemon = allPokemon.find((p) => p.Name === pokemonName);
            if (!pokemon) return;

            // Find the stage number (0 = base, 1 = middle, 2 = final)
            let stageNumber = 0;
            let current = pokemonName;

            // Count how many evolutions back to base
            while (true) {
              const predecessor = allPokemon.find((p) =>
                p.Evolutions?.some((e: any) => e.To === current)
              );
              if (!predecessor) break;
              stageNumber++;
              current = predecessor.Name;
            }

            const stageKey = `stage${stageNumber}`;
            if (!stages[stageKey]) {
              stages[stageKey] = [];
            }
            stages[stageKey].push(pokemonName);
          });

          console.log("Pokemon grouped by stage:", stages);
          return stages;
        };

        const stageGroups = groupByStage();

        // Build stages in order
        Object.keys(stageGroups)
          .sort()
          .forEach((stageKey) => {
            const pokemonInStage = stageGroups[stageKey];
            if (pokemonInStage.length > 0) {
              stageNames.push(...pokemonInStage);
              console.log(`Added ${stageKey}:`, pokemonInStage);
            }
          });

        // If we only have one stage, add it
        if (stageNames.length === 0) {
          stageNames.push(currentName);
          console.log(`Added single stage: ${currentName}`);
        }

        console.log("\n--- Final Stage Names ---");
        console.log("Stage names array:", stageNames);

        // Convert to EvolutionStage objects
        stageNames.forEach((stageName, index) => {
          const stagePokemon = allPokemon.find((p) => p.Name === stageName);
          if (stagePokemon) {
            // Find evolution method - only check actual evolution relationships
            let methods: string[] = [];
            if (stagePokemon.Evolutions && stagePokemon.Evolutions.length > 0) {
              // This Pokemon actually has evolutions
              methods = stagePokemon.Evolutions.map((e: any) => e.Method);
              console.log(
                `${stageName} evolves into:`,
                stagePokemon.Evolutions.map((e: any) => e.To)
              );
            } else {
              console.log(`${stageName} has no evolutions`);
            }

            // Determine stage number based on evolution chain position
            let stageNumber = 0;
            let current = stageName;

            // Count how many evolutions back to base
            while (true) {
              const predecessor = allPokemon.find((p) =>
                p.Evolutions?.some((e: any) => e.To === current)
              );
              if (!predecessor) break;
              stageNumber++;
              current = predecessor.Name;
            }

            // Check if this stage already exists
            const existingStage = stages.find((s) =>
              s.pokemon.some((p) => p.name === stageName)
            );
            if (existingStage) {
              // Add to existing stage if it's a branched evolution
              existingStage.pokemon.push({
                name: stageName,
                number: stagePokemon.Number,
                methods: methods,
                isCurrent: stageName === currentName,
                stage: stageNumber,
              });
              existingStage.isBranch = existingStage.pokemon.length > 1;
              console.log(
                `Added ${stageName} to existing stage (branch: ${existingStage.isBranch})`
              );
            } else {
              // Create new stage
              stages.push({
                pokemon: [
                  {
                    name: stageName,
                    number: stagePokemon.Number,
                    methods: methods,
                    isCurrent: stageName === currentName,
                    stage: stageNumber,
                  },
                ],
                isBranch: false,
              });
              console.log(
                `Created new stage for ${stageName} (stage ${stageNumber})`
              );
            }
          }
        });

        console.log("\n--- Final Evolution Chain ---");
        console.log("Stages:", stages);
        console.log("=== END DEBUG ===\n");

        return stages;
      };

      const stages = buildChain();
      setEvolutionChain({ stages });
    };

    findEvolutionChain();
  }, [pokemon, allPokemon]);

  return evolutionChain;
}
