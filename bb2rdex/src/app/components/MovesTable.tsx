import React, { useState, useEffect } from "react";
import TypeBadge from "./TypeBadge";

interface MoveEntry {
  Level?: number;
  Move?: string;
  Name?: string;
  Machine?: string;
  Method?: string;
}

interface MoveData {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effect: string;
  changes?: any;
}

interface MovesTableProps {
  pokemon: any;
  allMoves: { [key: string]: MoveData };
  moveType: "level-up" | "tm-hm" | "tutor";
}

export default function MovesTable({
  pokemon,
  allMoves,
  moveType,
}: MovesTableProps) {
  const [moves, setMoves] = useState<Array<MoveEntry & MoveData>>([]);
  const [sortBy, setSortBy] = useState<
    | "default"
    | "level"
    | "move"
    | "type"
    | "category"
    | "power"
    | "pp"
    | "accuracy"
  >("default");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Helper function to convert move names between formats
  const convertMoveName = (name: string, toKebab: boolean = true): string => {
    if (toKebab) {
      // Convert "Ancient Power" to "ancient-power"
      return name.toLowerCase().replace(/\s+/g, "-");
    } else {
      // Convert "ancient-power" to "Ancient Power"
      return name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  useEffect(() => {
    if (pokemon && allMoves) {
      let moveEntries: MoveEntry[] = [];
      let sortKey: string = "";

      // Get moves based on moveType
      if (moveType === "level-up" && pokemon["Level Up Moves"]) {
        moveEntries = pokemon["Level Up Moves"];
        sortKey = "Level";
      } else if (moveType === "tm-hm" && pokemon["TM Moves"]) {
        moveEntries = pokemon["TM Moves"];
        sortKey = "Machine";
      } else if (moveType === "tutor" && pokemon["Tutor Moves"]) {
        // Convert tutor moves array to MoveEntry format
        moveEntries = pokemon["Tutor Moves"].map((moveName: string) => ({
          Move: moveName,
        }));
        sortKey = "Move";
      }

      if (moveEntries.length > 0) {
        const moves = moveEntries.map((moveEntry: MoveEntry) => {
          // Get the move name (could be Move or Name field)
          const moveName = moveEntry.Move || moveEntry.Name || "";

          // Convert the move name to kebab-case for matching
          const kebabMoveName = convertMoveName(moveName);

          // Find the move data by name (case-insensitive)
          const moveData = Object.values(allMoves).find(
            (move: MoveData) =>
              move.name.toLowerCase() === kebabMoveName.toLowerCase()
          );

          if (moveData) {
            return {
              ...moveEntry,
              ...moveData,
            };
          } else {
            // Debug: Log the move that wasn't found
            console.log(`Move not found: "${moveName}" -> "${kebabMoveName}"`);

            // If move not found, return basic data
            return {
              ...moveEntry,
              id: 0,
              name: moveName,
              type: "Unknown",
              category: "Unknown",
              power: null,
              accuracy: null,
              pp: null,
              effect: "Move data not found",
            };
          }
        });

        // Sort based on selected column
        if (sortBy !== "default") {
          moves.sort((a: MoveEntry & MoveData, b: MoveEntry & MoveData) => {
            let comparison = 0;

            switch (sortBy) {
              case "level":
                comparison = (a.Level || 0) - (b.Level || 0);
                break;
              case "move":
                const moveNameA = moveType === "level-up" ? a.Move : a.Name;
                const moveNameB = moveType === "level-up" ? b.Move : b.Name;
                comparison = (moveNameA || "").localeCompare(moveNameB || "");
                break;
              case "type":
                comparison = a.type.localeCompare(b.type);
                break;
              case "category":
                comparison = a.category.localeCompare(b.category);
                break;
              case "power":
                comparison = (a.power || 0) - (b.power || 0);
                break;
              case "pp":
                comparison = (a.pp || 0) - (b.pp || 0);
                break;
              case "accuracy":
                comparison = (a.accuracy || 0) - (b.accuracy || 0);
                break;
              default:
                // Default sorting based on moveType
                if (moveType === "level-up") {
                  comparison = (a.Level || 0) - (b.Level || 0);
                } else if (moveType === "tm-hm") {
                  comparison = (a.Machine || "").localeCompare(b.Machine || "");
                } else if (moveType === "tutor") {
                  const moveNameA = a.Move || "";
                  const moveNameB = b.Move || "";
                  comparison = moveNameA.localeCompare(moveNameB);
                }
            }

            return sortDirection === "asc" ? comparison : -comparison;
          });
        } else {
          // Default sorting
          if (moveType === "level-up") {
            moves.sort(
              (a: MoveEntry & MoveData, b: MoveEntry & MoveData) =>
                (a.Level || 0) - (b.Level || 0)
            );
          } else if (moveType === "tm-hm") {
            moves.sort((a: MoveEntry & MoveData, b: MoveEntry & MoveData) =>
              (a.Machine || "").localeCompare(b.Machine || "")
            );
          } else if (moveType === "tutor") {
            moves.sort((a: MoveEntry & MoveData, b: MoveEntry & MoveData) =>
              (a.Move || "").localeCompare(b.Move || "")
            );
          }
        }

        setMoves(moves);
      }
    }
  }, [pokemon, allMoves, moveType, sortBy, sortDirection]);

  const getCategoryIcon = (category: string) => {
    const basePath =
      process.env.NODE_ENV === "production" ? "/BlazeBlack2ReduxWiki" : "";
    switch (category.toLowerCase()) {
      case "physical":
        return `${basePath}/data/icons/PhysicalIC_Masters.png`;
      case "special":
        return `${basePath}/data/icons/SpecialIC_Masters.png`;
      case "status":
        return `${basePath}/data/icons/StatusIC_Masters.png`;
      default:
        return `${basePath}/data/icons/StatusIC_Masters.png`;
    }
  };

  const formatPower = (power: number | null) => {
    if (power === null) return "—";
    return power.toString();
  };

  const formatAccuracy = (accuracy: number | null) => {
    if (accuracy === null) return "—";
    if (accuracy === 0) return "Never Miss";
    return accuracy.toString();
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const hasMoves =
    moveType === "level-up"
      ? pokemon && pokemon["Level Up Moves"]
      : moveType === "tm-hm"
      ? pokemon && pokemon["TM Moves"]
      : pokemon && pokemon["Tutor Moves"];

  if (!hasMoves) {
    return (
      <div className="text-sm text-[var(--text-color-light)] opacity-60">
        No{" "}
        {moveType === "level-up"
          ? "level-up"
          : moveType === "tm-hm"
          ? "TM"
          : "tutor"}{" "}
        moves data available
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="sticky top-0 z-10 bg-[var(--background)] py-2">
        {/* Legend */}
        <div className="flex justify-center mb-4 text-xs text-[var(--text-color-light)] opacity-70">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="bg-yellow-600 text-white px-1 py-0.5 rounded text-[8px]">
                M
              </span>
              <span>Modified move</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg shadow">
          <table className="w-full bg-[var(--background)] text-[var(--text-color-light)]">
            <thead>
              <tr>
                {moveType !== "tutor" && (
                  <th
                    className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                    onClick={() => handleSort("level")}
                  >
                    {moveType === "level-up" ? "Lv." : "#"}
                    {sortBy === "level" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                )}
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("move")}
                >
                  Move
                  {sortBy === "move" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("type")}
                >
                  Type
                  {sortBy === "type" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("category")}
                >
                  Cat.
                  {sortBy === "category" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("power")}
                >
                  Pwr.
                  {sortBy === "power" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("pp")}
                >
                  PP
                  {sortBy === "pp" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
                <th
                  className="px-4 py-2 text-center font-semibold cursor-pointer select-none bg-[var(--header-bg)] text-[var(--text-color-dark)]"
                  onClick={() => handleSort("accuracy")}
                >
                  Acc.
                  {sortBy === "accuracy" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "▲" : "▼"}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move, index) => (
                <React.Fragment
                  key={`${
                    moveType === "level-up" ? move.Level : move.Machine
                  }-${move.name}-${index}`}
                >
                  <tr
                    className={`${
                      index % 2 === 0
                        ? "bg-[var(--table-dark)]"
                        : "bg-[var(--table-light)]"
                    } transition-colors`}
                  >
                    {moveType !== "tutor" && (
                      <td className="px-4 py-2 text-sm font-medium">
                        {moveType === "level-up" ? move.Level : move.Machine}
                      </td>
                    )}
                    <td className="px-4 py-2 text-sm font-medium">
                      {moveType === "level-up"
                        ? move.Move
                        : moveType === "tm-hm"
                        ? move.Name
                        : move.Move}
                      {move.changes && Object.keys(move.changes).length > 0 && (
                        <sup className="ml-1 text-[10px] bg-yellow-600 text-white px-1 py-0.5 rounded">
                          M
                        </sup>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <TypeBadge
                        type={
                          move.type.charAt(0).toUpperCase() + move.type.slice(1)
                        }
                        className={
                          move.changes?.type
                            ? "ring-2 ring-yellow-600 ring-opacity-75"
                            : ""
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center">
                        <img
                          src={getCategoryIcon(move.category)}
                          alt={move.category}
                          className="w-10"
                          title={move.category}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center text-sm">
                      {formatPower(move.power)}
                      {move.changes?.power &&
                        move.changes.power.new - move.changes.power.old !==
                          0 && (
                          <sup
                            className={`ml-1 text-[10px] ${
                              move.changes.power.new > move.changes.power.old
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {move.changes.power.new > move.changes.power.old
                              ? `+${
                                  move.changes.power.new -
                                  move.changes.power.old
                                }`
                              : `${
                                  move.changes.power.new -
                                  move.changes.power.old
                                }`}
                          </sup>
                        )}
                    </td>
                    <td className="px-4 py-2 text-center text-sm">
                      {move.pp}
                      {move.changes?.pp &&
                        move.changes.pp.new - move.changes.pp.old !== 0 && (
                          <sup
                            className={`ml-1 text-[10px] ${
                              move.changes.pp.new > move.changes.pp.old
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {move.changes.pp.new > move.changes.pp.old
                              ? `+${move.changes.pp.new - move.changes.pp.old}`
                              : `${move.changes.pp.new - move.changes.pp.old}`}
                          </sup>
                        )}
                    </td>
                    <td className="px-4 py-2 text-center text-sm">
                      {formatAccuracy(move.accuracy)}
                      {move.changes?.accuracy &&
                        move.changes.accuracy.new -
                          move.changes.accuracy.old !==
                          0 && (
                          <sup
                            className={`ml-1 text-[10px] ${
                              move.changes.accuracy.new >
                              move.changes.accuracy.old
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {move.changes.accuracy.new >
                            move.changes.accuracy.old
                              ? `+${
                                  move.changes.accuracy.new -
                                  move.changes.accuracy.old
                                }`
                              : `${
                                  move.changes.accuracy.new -
                                  move.changes.accuracy.old
                                }`}
                          </sup>
                        )}
                    </td>
                  </tr>
                  {/* Description row with matching background */}
                  <tr
                    className={`${
                      index % 2 === 0
                        ? "bg-[var(--table-dark)]"
                        : "bg-[var(--table-light)]"
                    } transition-colors`}
                  >
                    <td
                      colSpan={moveType === "tutor" ? 6 : 7}
                      className="px-4 py-2 text-sm text-center italic"
                    >
                      <div
                        className={`${
                          move.changes?.effect
                            ? "text-yellow-600 font-medium"
                            : ""
                        }`}
                      >
                        {move.effect}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
