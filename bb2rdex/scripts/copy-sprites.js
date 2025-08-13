const fs = require("fs");
const path = require("path");

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy sprites from node_modules to public
const sourceDir = path.join(
  __dirname,
  "../node_modules/pokemon-sprites/sprites"
);
const destDir = path.join(__dirname, "../public/pokemon-sprites");

console.log("Copying Pokemon sprites...");
copyDir(sourceDir, destDir);
console.log("Pokemon sprites copied successfully!");
