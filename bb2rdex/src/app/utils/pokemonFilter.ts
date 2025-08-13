import { SearchFilter } from "../components/AdvancedSearch";

export function filterPokemon(
  pokemon: any[],
  filters: SearchFilter[],
  allMoves: { [key: string]: any }
): any[] {
  if (filters.length === 0) {
    return pokemon;
  }

  return pokemon.filter((p) => {
    // Check if Pokemon meets ALL filter criteria (AND logic)
    return filters.every((filter) => {
      switch (filter.type) {
        case "type":
          // Check if Pokemon has the specified type
          return p.TYPE.includes(filter.value);

        case "ability":
          // Check if Pokemon has the specified ability
          return p.Ability.includes(filter.value);

        case "move":
          // Check if Pokemon can learn the specified move
          const moveName = filter.value;

          // Find the move in the moves data by name
          const moveData = Object.values(allMoves).find(
            (move: any) => move.name.toLowerCase() === moveName.toLowerCase()
          );
          if (!moveData) return false;

          // Check if this Pokemon is in the learned_by_pokemon list
          const canLearnMove = moveData.learned_by_pokemon?.some(
            (pokemon: any) =>
              pokemon.name.toLowerCase() === p.Name.toLowerCase()
          );

          return canLearnMove || false;

        default:
          return false;
      }
    });
  });
}
