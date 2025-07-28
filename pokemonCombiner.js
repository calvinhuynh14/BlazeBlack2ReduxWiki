const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "bb2rdex/public/data/pokemon"); // adjust path as needed
const output = path.join(__dirname, "bb2rdex/public/data/pokemon.json"); // adjust as needed

const files = fs.readdirSync(folder).filter((f) => f.endsWith(".json"));

const allPokemon = files.map((file) => {
  const filePath = path.join(folder, file);
  const data = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(data);
  // If each file is an array with one object, extract the object
  return Array.isArray(parsed) ? parsed[0] : parsed;
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(allPokemon, null, 2));

console.log(`Combined ${files.length} files into ${output}`);
