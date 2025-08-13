const fs = require("fs");
const path = require("path");

class MoveChangeApplier {
  constructor() {
    this.movesData = {};
    this.changes = {};
  }

  loadMovesData() {
    const movesPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "moves.json"
    );
    if (fs.existsSync(movesPath)) {
      this.movesData = JSON.parse(fs.readFileSync(movesPath, "utf8"));
      console.log(
        `Loaded ${Object.keys(this.movesData).length} moves from moves.json`
      );
    } else {
      throw new Error("moves.json not found. Please run fetchMoves.js first.");
    }
  }

  loadChangeFile() {
    const changePath = path.join(
      __dirname,
      "..",
      "..",
      "BlazeBlack2Redux",
      "data",
      "moveChangeList.txt"
    );
    if (fs.existsSync(changePath)) {
      const content = fs.readFileSync(changePath, "utf8");
      this.parseChangeFile(content);
    } else {
      throw new Error("moveChangeList.txt not found.");
    }
  }

  parseChangeFile(content) {
    console.log("Parsing move change file...");

    // Split by move sections (lines that don't start with - or =)
    const lines = content.split("\n");
    let currentMove = null;
    let currentChanges = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and section headers
      if (!trimmedLine || trimmedLine.startsWith("===")) {
        continue;
      }

      // Check if this is a move name (not starting with -)
      if (!trimmedLine.startsWith("-")) {
        // Save previous move if exists
        if (currentMove && currentChanges.length > 0) {
          this.changes[currentMove] = currentChanges;
        }

        // Start new move
        currentMove = trimmedLine;
        currentChanges = [];
      } else if (currentMove && trimmedLine.startsWith("-")) {
        // Parse change line
        const change = this.parseChangeLine(trimmedLine);
        if (change) {
          currentChanges.push(change);
        }
      }
    }

    // Save last move
    if (currentMove && currentChanges.length > 0) {
      this.changes[currentMove] = currentChanges;
    }

    console.log(`Parsed changes for ${Object.keys(this.changes).length} moves`);
  }

  parseChangeLine(line) {
    // Remove the leading "- " and version tags
    const cleanLine = line.replace(/^- /, "").replace(/\s*\[[^\]]*\]$/, "");

    // Split by " -> " to separate old and new values
    const parts = cleanLine.split(" -> ");
    if (parts.length !== 2) {
      console.warn(`Could not parse change line (no -> found): ${line}`);
      return null;
    }

    const beforeArrow = parts[0].trim();
    const afterArrow = parts[1].trim();

    // Split the first part to get the stat type and old value
    const firstPartWords = beforeArrow.split(/\s+/);
    if (firstPartWords.length < 1) {
      console.warn(`Could not parse change line (insufficient parts): ${line}`);
      return null;
    }

    const statType = firstPartWords[0];
    let oldValue, newValue;

    // Handle different stat types
    switch (statType.toLowerCase()) {
      case "power":
        oldValue =
          firstPartWords.length > 1 ? parseInt(firstPartWords[1]) : null;
        newValue = parseInt(afterArrow);
        return {
          type: "power",
          field: "power",
          oldValue: oldValue,
          newValue: newValue,
        };

      case "pp":
        oldValue =
          firstPartWords.length > 1 ? parseInt(firstPartWords[1]) : null;
        newValue = parseInt(afterArrow);
        return {
          type: "pp",
          field: "pp",
          oldValue: oldValue,
          newValue: newValue,
        };

      case "priority":
        oldValue =
          firstPartWords.length > 1 ? parseInt(firstPartWords[1]) : null;
        newValue = parseInt(afterArrow);
        return {
          type: "priority",
          field: "priority",
          oldValue: oldValue,
          newValue: newValue,
        };

      case "accuracy":
        oldValue =
          firstPartWords.length > 1 ? parseInt(firstPartWords[1]) : null;
        newValue = parseInt(afterArrow);
        return {
          type: "accuracy",
          field: "accuracy",
          oldValue: oldValue,
          newValue: newValue,
        };

      case "type":
        oldValue = firstPartWords.length > 1 ? firstPartWords[1] : null;
        newValue = afterArrow;
        return {
          type: "type",
          field: "type",
          oldValue: oldValue,
          newValue: newValue,
        };

      case "effect":
      case "effect long":
        // For Effect, check if there's an old value or just "Effect -> New Effect"
        const effectPart = beforeArrow.substring(statType.length).trim();
        if (effectPart === "") {
          // No old effect listed, just "Effect -> New Effect"
          oldValue = null;
        } else {
          // Old effect is provided
          oldValue = effectPart;
        }
        newValue = afterArrow;
        return {
          type: "effect",
          field: "effect",
          oldValue: oldValue,
          newValue: newValue,
        };

      default:
        console.warn(`Unknown stat type: ${statType} in line: ${line}`);
        return null;
    }
  }

  applyChanges() {
    console.log("Applying changes to moves data...");
    let appliedChanges = 0;

    for (const [moveName, changes] of Object.entries(this.changes)) {
      // Find the move in our data by name
      const moveEntry = this.findMoveByName(moveName);

      if (moveEntry) {
        const moveId = moveEntry.id.toString();
        const move = this.movesData[moveId];

        if (move) {
          // Track changes for this move
          move.changes = move.changes || {};

          for (const change of changes) {
            this.applyChange(move, change);
            appliedChanges++;
          }

          console.log(`Applied ${changes.length} changes to ${moveName}`);
        } else {
          console.warn(`Move ${moveName} not found in moves data`);
        }
      } else {
        console.warn(`Move ${moveName} not found in moves data`);
      }
    }

    console.log(`Applied ${appliedChanges} total changes`);
  }

  findMoveByName(moveName) {
    // Try exact match first
    for (const [id, move] of Object.entries(this.movesData)) {
      if (move.name.toLowerCase() === moveName.toLowerCase()) {
        return { id, ...move };
      }
    }

    // Try partial match (handle special characters, spaces, etc.)
    for (const [id, move] of Object.entries(this.movesData)) {
      const normalizedMoveName = move.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const normalizedSearchName = moveName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      if (normalizedMoveName === normalizedSearchName) {
        return { id, ...move };
      }
    }

    return null;
  }

  applyChange(move, change) {
    switch (change.type) {
      case "power":
      case "pp":
      case "priority":
      case "accuracy":
        // Numeric changes
        const newValue =
          change.type === "priority"
            ? parseInt(change.newValue)
            : parseInt(change.newValue);

        move.changes[change.field] = {
          old: move[change.field],
          new: newValue,
        };
        move[change.field] = newValue;
        break;

      case "type":
        // Type changes
        move.changes[change.field] = {
          old: move[change.field],
          new: change.newValue,
        };
        move[change.field] = change.newValue;
        break;

      case "effect":
        // Effect changes
        move.changes[change.field] = {
          old: move[change.field],
          new: change.newValue,
        };
        move[change.field] = change.newValue;
        break;

      default:
        console.warn(`Unknown change type: ${change.type}`);
    }
  }

  saveUpdatedMoves() {
    const outputPath = path.join(
      __dirname,
      "..",
      "public",
      "data",
      "moves.json"
    );

    fs.writeFileSync(
      outputPath,
      JSON.stringify(this.movesData, null, 2),
      "utf8"
    );

    console.log(`Updated moves data saved to ${outputPath}`);

    // Count moves with changes
    const movesWithChanges = Object.values(this.movesData).filter(
      (move) => move.changes && Object.keys(move.changes).length > 0
    );
    console.log(`Moves with changes: ${movesWithChanges.length}`);
  }

  async run() {
    try {
      console.log("Starting move change application...");

      // Load existing moves data
      this.loadMovesData();

      // Load and parse change file
      this.loadChangeFile();

      // Apply changes
      this.applyChanges();

      // Save updated data
      this.saveUpdatedMoves();

      console.log("Move change application completed successfully!");
    } catch (error) {
      console.error("Error during move change application:", error);
    }
  }
}

// Run the script
const applier = new MoveChangeApplier();
applier.run();
