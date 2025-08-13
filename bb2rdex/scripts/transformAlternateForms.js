const fs = require("fs");
const path = require("path");

// Paths
const alternateFormsPath = path.join(
  __dirname,
  "../public/data/alternateForms.json"
);
const outputPath = path.join(
  __dirname,
  "../public/data/transformedAlternateForms.json"
);

function transformAlternateForms() {
  try {
    console.log("Transforming alternate forms data...\n");

    // Read the alternate forms data
    const alternateFormsData = JSON.parse(
      fs.readFileSync(alternateFormsPath, "utf8")
    );
    const transformedForms = [];

    alternateFormsData.forEach((form) => {
      try {
        // Transform stats
        const stats = {};
        if (form.stats) {
          form.stats.forEach((stat) => {
            const statName = stat.stat.name.toUpperCase();
            switch (statName) {
              case "HP":
                stats.HP = stat.base_stat;
                break;
              case "ATTACK":
                stats.ATK = stat.base_stat;
                break;
              case "DEFENSE":
                stats.DEF = stat.base_stat;
                break;
              case "SPECIAL-ATTACK":
                stats.SPA = stat.base_stat;
                break;
              case "SPECIAL-DEFENSE":
                stats.SPD = stat.base_stat;
                break;
              case "SPEED":
                stats.SPE = stat.base_stat;
                break;
            }
          });
        }

        // Transform types
        const types = form.types
          ? form.types.map((t) => capitalizeTypeName(t.type.name))
          : [];

        // Transform abilities
        const abilities = form.abilities
          ? form.abilities.map((a) => capitalizeAbilityName(a.ability.name))
          : [];

        // Transform moves for black-2-white-2
        const levelUpMoves = [];
        const tmMoves = [];
        const tutorMoves = [];

        if (form.moves) {
          form.moves.forEach((move) => {
            const moveName = move.move.name;

            // Check for black-2-white-2 version group
            const black2White2Details = move.version_group_details.filter(
              (detail) => detail.version_group.name === "black-2-white-2"
            );

            black2White2Details.forEach((detail) => {
              switch (detail.move_learn_method.name) {
                case "level-up":
                  levelUpMoves.push({
                    Level: detail.level_learned_at,
                    Move: capitalizeMoveName(moveName),
                  });
                  break;
                case "machine":
                  tmMoves.push({
                    Machine: detail.level_learned_at,
                    Name: capitalizeMoveName(moveName),
                  });
                  break;
                case "tutor":
                  tutorMoves.push(capitalizeMoveName(moveName));
                  break;
              }
            });
          });
        }

        // Create transformed form object
        const transformedForm = {
          Name: capitalizePokemonName(form.name),
          Number: form.id,
          TYPE: types,
          STATS: stats,
          Ability: abilities,
          "Level Up Moves": levelUpMoves,
          "TM Moves": tmMoves,
          "Tutor Moves": tutorMoves,
          // Add other fields that might be useful
          height: form.height,
          weight: form.weight,
          base_experience: form.base_experience,
          // Add a reference to the base form
          baseFormNumber: getBaseFormNumber(form.id),
          // Add the form index for this specific form
          formIndex: getFormIndex(form.id, form.name),
          // Add "Other Form Index" to match pokemon.json structure
          "Other Form Index": getOtherFormIndices(form.id, form.name),
          // Add empty Defenses object for manual entry
          Defenses: {},
        };

        transformedForms.push(transformedForm);
        console.log(`✓ Transformed ${form.name} (ID: ${form.id})`);
      } catch (formError) {
        console.log(
          `⚠ Error transforming form ${form.name}: ${formError.message}`
        );
      }
    });

    // Sort by ID for consistency
    transformedForms.sort((a, b) => a.Number - b.Number);

    // Write transformed data
    fs.writeFileSync(outputPath, JSON.stringify(transformedForms, null, 2));

    console.log(
      `\n✅ Successfully transformed ${transformedForms.length} alternate forms`
    );
    console.log(`📁 Output saved to: ${outputPath}`);

    // Display summary
    console.log("\nSummary:");
    console.log(
      `- Total alternate forms transformed: ${transformedForms.length}`
    );

    // Show example of transformed data
    if (transformedForms.length > 0) {
      const example = transformedForms[0];
      console.log("\nExample transformed form:");
      console.log(`- Name: ${example.Name}`);
      console.log(`- Number: ${example.Number}`);
      console.log(`- Types: ${example.TYPE.join("/")}`);
      console.log(
        `- Stats: HP=${example.STATS.HP}, ATK=${example.STATS.ATK}, etc.`
      );
      console.log(`- Abilities: ${example.Ability.join(", ")}`);
      console.log(`- Level-Up Moves: ${example["Level Up Moves"].length}`);
      console.log(`- TM Moves: ${example["TM Moves"].length}`);
      console.log(`- Tutor Moves: ${example["Tutor Moves"].length}`);
    }
  } catch (error) {
    console.error("❌ Error transforming alternate forms:", error.message);
    process.exit(1);
  }
}

// Helper function to capitalize move names (e.g., "dragon-claw" -> "Dragon Claw")
function capitalizeMoveName(moveName) {
  return moveName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to capitalize ability names (e.g., "turboblaze" -> "Turboblaze")
function capitalizeAbilityName(abilityName) {
  return abilityName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Helper function to capitalize type names (e.g., "dragon" -> "Dragon")
function capitalizeTypeName(typeName) {
  return typeName.charAt(0).toUpperCase() + typeName.slice(1);
}

// Helper function to capitalize Pokemon names (e.g., "kyurem-white" -> "Kyurem - White")
function capitalizePokemonName(pokemonName) {
  return pokemonName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" - ");
}

// Helper function to determine base form number using CSV data
function getBaseFormNumber(alternateFormId) {
  // Read the CSV file to get the mapping
  const csvPath = path.join(
    __dirname,
    "../../BlazeBlack2Redux/data/pokemonIndexList.csv"
  );

  try {
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n");

    // Find the line with the alternate form ID
    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length >= 3) {
        const csvId = parseInt(parts[0]);
        const baseNumber = parseInt(parts[1]);
        const name = parts[2];

        if (csvId === alternateFormId) {
          return baseNumber;
        }
      }
    }
  } catch (error) {
    console.log(`⚠ Could not read CSV file: ${error.message}`);
  }

  // Fallback mapping if CSV reading fails
  const baseFormMapping = {
    // Deoxys forms
    10001: 386, // Deoxys - Normal
    10002: 386, // Deoxys - Attack
    10003: 386, // Deoxys - Defense
    10004: 386, // Deoxys - Speed

    // Wormadam forms
    10005: 413, // Wormadam - Plant
    10006: 413, // Wormadam - Sandy
    10007: 413, // Wormadam - Trash

    // Shaymin forms
    10008: 492, // Shaymin - Land
    10009: 492, // Shaymin - Sky

    // Giratina forms
    10010: 487, // Giratina - Altered
    10011: 487, // Giratina - Origin

    // Rotom forms
    10012: 479, // Rotom
    10013: 479, // Rotom - Heat
    10014: 479, // Rotom - Wash
    10015: 479, // Rotom - Frost
    10016: 479, // Rotom - Fan
    10017: 479, // Rotom - Mow

    // Castform forms
    10018: 351, // Castform
    10019: 351, // Castform - Sunny
    10020: 351, // Castform - Rainy
    10021: 351, // Castform - Snowy

    // Basculin forms
    10022: 550, // Basculin - Red
    10023: 550, // Basculin - Blue

    // Darmanitan forms
    10024: 555, // Darmanitan - Standard
    10025: 555, // Darmanitan - Zen

    // Meloetta forms
    10026: 648, // Meloetta - Aria
    10027: 648, // Meloetta - Pirouette

    // Kyurem forms
    10028: 646, // Kyurem
    10029: 646, // Kyurem - White
    10030: 646, // Kyurem - Black

    // Keldeo forms
    10031: 647, // Keldeo - Ordinary
    10032: 647, // Keldeo - Resolute

    // Tornadus forms
    10033: 641, // Tornadus - Incarnate
    10034: 641, // Tornadus - Therian

    // Thundurus forms
    10035: 642, // Thundurus - Incarnate
    10036: 642, // Thundurus - Therian

    // Landorus forms
    10037: 645, // Landorus - Incarnate
    10038: 645, // Landorus - Therian
  };

  return baseFormMapping[alternateFormId] || null;
}

// Helper function to get the form index for a specific alternate form
function getFormIndex(alternateFormId, pokemonName) {
  // Read the CSV file to get the mapping
  const csvPath = path.join(
    __dirname,
    "../../BlazeBlack2Redux/data/pokemonIndexList.csv"
  );

  try {
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n");

    // Search for the Pokemon name in the last column
    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length >= 3) {
        const csvName = parts[2].trim();
        const capitalizedName = capitalizePokemonName(pokemonName);

        // Check if the CSV name matches our Pokemon name
        if (csvName === capitalizedName) {
          // The first column is the form index value, subtract 1 to match pokemon.json
          return parseInt(parts[0]) - 1;
        }
      }
    }
  } catch (error) {
    console.log(`⚠ Could not read CSV file for form index: ${error.message}`);
  }

  return 0; // Default to 0 if not found
}

// Helper function to get all form indices for a Pokemon (including itself)
function getOtherFormIndices(alternateFormId, pokemonName) {
  // Read the CSV file to get the mapping
  const csvPath = path.join(
    __dirname,
    "../../BlazeBlack2Redux/data/pokemonIndexList.csv"
  );

  try {
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n");

    // Convert the Pokemon name to the format used in CSV (capitalized with " - ")
    const capitalizedName = capitalizePokemonName(pokemonName);

    // Step 1: Find the Pokemon by name in the CSV to get its base form number
    let baseFormNumber = null;
    for (const line of lines) {
      const parts = line.split(",");
      if (parts.length >= 3) {
        const csvName = parts[2].trim();
        if (csvName === capitalizedName) {
          baseFormNumber = parseInt(parts[1]); // Second column is the base form
          break;
        }
      }
    }

    if (baseFormNumber) {
      // Step 2: Find all Pokemon that share the same base form number
      const allFormIndices = [];
      for (const csvLine of lines) {
        const csvParts = csvLine.split(",");
        if (csvParts.length >= 3) {
          const csvBaseNumber = parseInt(csvParts[1]); // Second column
          if (csvBaseNumber === baseFormNumber) {
            const gameIndex = parseInt(csvParts[0]) - 1; // First column minus 1 for 0-based indexing
            allFormIndices.push(gameIndex);
          }
        }
      }

      // Return all form indices (including the current form)
      return allFormIndices.sort((a, b) => a - b); // Sort for consistency
    }
  } catch (error) {
    console.log(
      `⚠ Could not read CSV file for other form indices: ${error.message}`
    );
  }

  return []; // Default to empty array if not found
}

// Run the script
transformAlternateForms();
