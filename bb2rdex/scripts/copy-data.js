const fs = require("fs");
const path = require("path");

// Copy data files to public directory
const dataFiles = [
  "pokemon.json",
  "moves.json",
  "transformedAlternateForms.json",
];

console.log("Copying data files...");

dataFiles.forEach((file) => {
  const sourcePath = path.join(__dirname, "../public/data", file);
  const destPath = path.join(__dirname, "../public", file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied ${file}`);
  } else {
    console.log(`⚠ File not found: ${file}`);
  }
});

console.log("Data files copied successfully!");
