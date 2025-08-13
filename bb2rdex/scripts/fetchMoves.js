const fs = require("fs");
const path = require("path");

class MoveFetcher {
  constructor() {
    this.baseUrl = "https://pokeapi.co/api/v2";
    this.movesData = {};
  }

  async getMovesList() {
    console.log("Fetching list of all moves...");
    const moves = [];
    let url = `${this.baseUrl}/move`;

    while (url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        moves.push(...data.results);
        url = data.next;
      } catch (error) {
        console.error("Error fetching moves list:", error);
        break;
      }
    }

    console.log(`Found ${moves.length} total moves`);
    return moves;
  }

  async getMoveDetails(moveUrl) {
    try {
      const response = await fetch(moveUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching move details:", error);
      return null;
    }
  }

  extractMachines(machines) {
    const bw2Machines = [];
    for (const machineData of machines) {
      const versionGroup = machineData?.version_group?.name || "";
      if (versionGroup === "black-2-white-2") {
        const machineUrl = machineData?.machine?.url || "";
        if (machineUrl) {
          const machineId = machineUrl.split("/").slice(-2, -1)[0];
          if (!isNaN(machineId)) {
            const machineNum = parseInt(machineId);
            if (machineNum <= 95) {
              // TMs
              bw2Machines.push(`TM${machineNum.toString().padStart(2, "0")}`);
            } else {
              // HMs
              const hmNum = machineNum - 95;
              bw2Machines.push(`HM${hmNum.toString().padStart(2, "0")}`);
            }
          }
        }
      }
    }
    return bw2Machines;
  }

  extractLearnedByPokemon(learnedBy) {
    const pokemonList = [];
    for (const pokemon of learnedBy) {
      const pokemonUrl = pokemon?.url || "";
      if (pokemonUrl) {
        const pokemonId = pokemonUrl.split("/").slice(-2, -1)[0];
        const pokemonName = pokemon?.name || "";
        pokemonList.push({
          id: parseInt(pokemonId),
          name: pokemonName,
        });
      }
    }
    return pokemonList;
  }

  extractStatChanges(statChanges) {
    const changes = [];
    for (const change of statChanges) {
      const statName = change?.stat?.name || "";
      const changeAmount = change?.change || 0;
      changes.push({
        stat: statName,
        change: changeAmount,
      });
    }
    return changes;
  }

  extractMetaData(meta) {
    return {
      healing: meta?.healing || 0,
      drain: meta?.drain || 0,
      flinch_chance: meta?.flinch_chance || 0,
      crit_rate: meta?.crit_rate || 0,
      ailment: meta?.ailment?.name || "none",
      ailment_chance: meta?.ailment_chance || 0,
    };
  }

  extractEffect(effectEntries) {
    for (const entry of effectEntries) {
      const language = entry?.language?.name || "";
      if (language === "en") {
        return entry?.effect || "";
      }
    }
    return "";
  }

  processMove(moveData) {
    const moveId = moveData?.id;

    const processedMove = {
      id: moveId,
      name: moveData?.name || "",
      type: moveData?.type?.name || "",
      category: moveData?.damage_class?.name || "",
      power: moveData?.power,
      accuracy: moveData?.accuracy,
      pp: moveData?.pp || 0,
      priority: moveData?.priority || 0,
      target: moveData?.target?.name || "",
      effect: this.extractEffect(moveData?.effect_entries || []),
      effect_chance: moveData?.effect_chance,
      stat_changes: this.extractStatChanges(moveData?.stat_changes || []),
      meta: this.extractMetaData(moveData?.meta || {}),
      machines: this.extractMachines(moveData?.machines || []),
      learned_by_pokemon: this.extractLearnedByPokemon(
        moveData?.learned_by_pokemon || []
      ),
      generation: moveData?.generation?.name || "",
      changes: {},
    };

    return processedMove;
  }

  async fetchAllMoves() {
    console.log("Starting move data extraction...");

    const movesList = await this.getMovesList();

    for (let i = 0; i < movesList.length; i++) {
      const move = movesList[i];
      console.log(`Processing move ${i + 1}/${movesList.length}: ${move.name}`);

      const moveDetails = await this.getMoveDetails(move.url);
      if (moveDetails) {
        const processedMove = this.processMove(moveDetails);
        this.movesData[processedMove.id.toString()] = processedMove;
      }

      // Rate limiting - be respectful to PokeAPI
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Successfully processed ${Object.keys(this.movesData).length} moves`
    );
  }

  saveMovesData(filename = "moves.json") {
    const outputPath = path.join(__dirname, "..", "public", "data", filename);

    // Create data directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      outputPath,
      JSON.stringify(this.movesData, null, 2),
      "utf8"
    );

    console.log(`Moves data saved to ${outputPath}`);
    console.log(`Total moves: ${Object.keys(this.movesData).length}`);
  }

  async run() {
    try {
      await this.fetchAllMoves();
      this.saveMovesData();
      console.log("Move data extraction completed successfully!");
    } catch (error) {
      console.error("Error during move extraction:", error);
    }
  }
}

// Run the script
const fetcher = new MoveFetcher();
fetcher.run();
