const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "bb2rdex/public/data/pokemon.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const cleaned = data.map((pokemon) => ({
  ...pokemon,
  Ability: Array.from(new Set(pokemon.Ability)),
}));

fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
console.log("Removed duplicate abilities from all Pokémon.");
