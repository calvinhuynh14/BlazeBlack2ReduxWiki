const fs = require("fs");
const path = require("path");

// Path to the Pokemon.json file
const pokemonFilePath = path.join(__dirname, "../public/data/pokemon.json");

function findAlternateForms() {
  try {
    // Read the Pokemon.json file
    const pokemonData = JSON.parse(fs.readFileSync(pokemonFilePath, "utf8"));

    console.log("Analyzing Pokemon.json for alternate forms...\n");

    const alternateForms = [];

    // Iterate through all Pokémon
    pokemonData.forEach((pokemon) => {
      // Check if the Pokémon has an "Other Form Index" property
      if (
        pokemon["Other Form Index"] !== undefined &&
        pokemon["Other Form Index"] !== null
      ) {
        alternateForms.push({
          name: pokemon.Name,
          number: pokemon.Number,
          otherFormIndex: pokemon["Other Form Index"],
          type: pokemon.TYPE,
          // Include other relevant info for context
          stats: pokemon.STATS,
          abilities: pokemon.Ability,
        });
      }
    });

    // Sort by Pokémon number for easier reading
    alternateForms.sort((a, b) => a.number - b.number);

    console.log(
      `Found ${alternateForms.length} Pokémon with alternate forms:\n`
    );

    // Display results in a formatted table
    console.log(
      "┌─────────┬─────────────┬─────────────────┬─────────────────┐"
    );
    console.log(
      "│ Number  │ Name        │ Other Form Index│ Types           │"
    );
    console.log(
      "├─────────┼─────────────┼─────────────────┼─────────────────┤"
    );

    alternateForms.forEach((pokemon) => {
      const number = pokemon.number.toString().padStart(3);
      const name = pokemon.name.padEnd(11);
      const formIndex = pokemon.otherFormIndex.toString().padEnd(15);
      const types = pokemon.type.join("/").padEnd(15);

      console.log(`│ ${number}    │ ${name} │ ${formIndex} │ ${types} │`);
    });

    console.log(
      "└─────────┴─────────────┴─────────────────┴─────────────────┘\n"
    );

    // Summary statistics
    console.log("Summary:");
    console.log(
      `- Total Pokémon with alternate forms: ${alternateForms.length}`
    );
    console.log(`- Total Pokémon in database: ${pokemonData.length}`);
    console.log(
      `- Percentage with alternate forms: ${(
        (alternateForms.length / pokemonData.length) *
        100
      ).toFixed(2)}%`
    );

    // Optional: Save results to a JSON file
    const outputPath = path.join(__dirname, "alternateForms.json");
    fs.writeFileSync(outputPath, JSON.stringify(alternateForms, null, 2));
    console.log(`\nDetailed results saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error reading or processing Pokemon.json:", error.message);
    process.exit(1);
  }
}

// Run the script
findAlternateForms();
