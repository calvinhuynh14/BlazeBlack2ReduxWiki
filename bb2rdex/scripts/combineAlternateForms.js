const fs = require("fs");
const path = require("path");

// Path to the alternate forms directory
const alternateFormsDir = path.join(
  __dirname,
  "../../BlazeBlack2Redux/info_from_api/pokemon"
);
const outputPath = path.join(__dirname, "../public/data/alternateForms.json");

function combineAlternateForms() {
  try {
    console.log("Combining alternate forms files...\n");

    const allAlternateForms = [];
    const startFile = 10001;
    const endFile = 10024;

    // Read each alternate form file from 10001.json to 10024.json
    for (let i = startFile; i <= endFile; i++) {
      const filePath = path.join(alternateFormsDir, `${i}.json`);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        try {
          const fileData = JSON.parse(fs.readFileSync(filePath, "utf8"));

          // Add the alternate form data to our array
          allAlternateForms.push(fileData);

          console.log(`✓ Loaded ${i}.json`);
        } catch (fileError) {
          console.log(`⚠ Error reading ${i}.json: ${fileError.message}`);
        }
      } else {
        console.log(`⚠ File ${i}.json not found`);
      }
    }

    // Sort by Pokémon number for consistency
    allAlternateForms.sort((a, b) => a.Number - b.Number);

    // Write the combined data to a single JSON file
    fs.writeFileSync(outputPath, JSON.stringify(allAlternateForms, null, 2));

    console.log(
      `\n✅ Successfully combined ${allAlternateForms.length} alternate forms files`
    );
    console.log(`📁 Output saved to: ${outputPath}`);

    // Display summary
    console.log("\nSummary:");
    console.log(`- Total alternate forms: ${allAlternateForms.length}`);
    console.log(`- Files processed: ${startFile} to ${endFile}`);

    // Show some examples of the data structure
    if (allAlternateForms.length > 0) {
      console.log("\nExample alternate form structure:");
      const example = allAlternateForms[0];
      console.log(`- Name: ${example.Name}`);
      console.log(`- Number: ${example.Number}`);
      console.log(`- Types: ${example.TYPE?.join("/") || "N/A"}`);
      console.log(`- Has stats: ${example.STATS ? "Yes" : "No"}`);
      console.log(`- Has abilities: ${example.Ability ? "Yes" : "No"}`);
    }
  } catch (error) {
    console.error("❌ Error combining alternate forms:", error.message);
    process.exit(1);
  }
}

// Run the script
combineAlternateForms();
