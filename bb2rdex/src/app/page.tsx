"use client";
import React, { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import Table, { TableColumn } from "./components/Table";
import InfiniteScroll from "react-infinite-scroll-component";
import TypeBadge from "./components/TypeBadge";
import Modal from "./components/Modal";
import PokemonDetail from "./components/PokemonDetail";
import AdvancedSearch, { SearchFilter } from "./components/AdvancedSearch";
import { filterPokemon } from "./utils/pokemonFilter";

const PAGE_SIZE = 30;
const CATEGORIES = ["Pokemon", "Ability", "Move", "Type", "Location"];

/**
 *  Takes the value of the Pokemon's stat and gives a colour rating
 * @param stat - stat value
 * @returns color of stat
 */
function getStatColor(stat: number) {
  /* if (stat <= 40) return "text-red-500";
  if (stat <= 60) return "text-orange-500";
  if (stat <= 80) return "text-yellow-500";
  if (stat <= 100) return "text-lime-500";
  if (stat <= 120) return "text-green-500";
  if (stat >= 121) return "text-emerald-600"; */
  return "text-white";
}
/**
 *  Takes the BST of the Pokemon and gives a colour rating
 * @param stat - stat value
 * @returns color of stat
 */
function getBSTColor(stat: number) {
  /*   if (stat <= 300) return "text-red-500";
  if (stat <= 400) return "text-orange-500";
  if (stat <= 500) return "text-yellow-500";
  if (stat <= 550) return "text-lime-500";
  if (stat <= 599) return "text-green-500";
  if (stat >= 600) return "text-emerald-600"; */
  return "text-white";
}

/**
 *
 * @param obj - pokemon
 * @param accessor - value or function
 * @returns
 */
function getValue(obj: any, accessor: string | ((row: any) => any)) {
  if (typeof accessor === "function") {
    return accessor(obj);
  }
  return accessor.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export default function Home() {
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [allMoves, setAllMoves] = useState<{ [key: string]: any }>({});
  const [displayedPokemon, setDisplayedPokemon] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Pokemon");
  const [sortState, setSortState] = useState({
    column: "Number",
    direction: "asc" as "asc" | "desc",
  });
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);

  // Load all Pokémon and moves on mount
  useEffect(() => {
    Promise.all([
      fetch("/data/pokemon.json").then((res) => res.json()),
      fetch("/data/moves.json").then((res) => res.json()),
      fetch("/data/transformedAlternateForms.json")
        .then((res) => res.json())
        .catch(() => []),
    ]).then(([pokemonData, movesData, alternateFormsData]) => {
      // Combine Pokemon data with alternate forms for searching
      const allPokemonCombined = [...pokemonData, ...alternateFormsData];
      setAllPokemon(allPokemonCombined);
      setAllMoves(movesData);
      // Only display base Pokemon in the main list
      setDisplayedPokemon(pokemonData.slice(0, PAGE_SIZE));
      setHasMore(pokemonData.length > PAGE_SIZE);
    });
  }, []);

  // Filter and sort logic
  const nameFiltered = allPokemon.filter((p) =>
    p.Name.toLowerCase().includes(search.toLowerCase())
  );
  const advancedFiltered = filterPokemon(nameFiltered, searchFilters, allMoves);
  const filtered = advancedFiltered;
  const sorted = [...filtered].sort((a, b) => {
    const col = sortState.column;
    let aValue, bValue;

    if (col === "BST_CALC") {
      aValue =
        a.STATS.HP +
        a.STATS.ATK +
        a.STATS.DEF +
        a.STATS.SPA +
        a.STATS.SPD +
        a.STATS.SPE;
      bValue =
        b.STATS.HP +
        b.STATS.ATK +
        b.STATS.DEF +
        b.STATS.SPA +
        b.STATS.SPD +
        b.STATS.SPE;
    } else {
      aValue = getValue(a, col);
      bValue = getValue(b, col);
    }

    if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Reset displayed data when search/filter changes
  useEffect(() => {
    setDisplayedPokemon(sorted.slice(0, PAGE_SIZE));
    setHasMore(sorted.length > PAGE_SIZE);
  }, [search, selectedCategory, allPokemon, sortState, searchFilters]);

  // Load more data for infinite scroll
  const fetchMoreData = () => {
    const next = displayedPokemon.length + PAGE_SIZE;
    setDisplayedPokemon(sorted.slice(0, next));
    setHasMore(next < sorted.length);
  };

  // Handle row click to open modal
  const handleRowClick = (pokemon: any) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  // Handle changing Pokémon in modal
  const handlePokemonChange = (pokemonName: string) => {
    const newPokemon = allPokemon.find((p) => p.Name === pokemonName);
    if (newPokemon) {
      setSelectedPokemon(newPokemon);
    }
  };

  // Table columns for Pokémon
  const columns: TableColumn<any>[] = [
    { label: "ID#", accessor: "Number", sortable: true },
    {
      label: "Sprite",
      accessor: "Number",
      render: (row) => (
        <img
          src={`/pokemon-sprites/pokemon/${row.Number}.png`}
          alt={row.Name}
          className="w-24 h-24"
        />
      ),
    },
    { label: "Name", accessor: "Name", sortable: true },
    {
      label: "Type",
      accessor: "TYPE",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.TYPE.map((t: string) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      ),
    },
    {
      label: "Abilities",
      accessor: "Ability",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.Ability.map((t: string, i: number) => (
            <span
              key={t}
              className={
                "px-2 py-1 rounded bg-accent text-md italic w-fit" +
                (i === 2
                  ? "bg-[var(--hidden-ability)] text-[var(--hidden-ability)]"
                  : "bg-accent")
              }
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: "HP",
      accessor: "STATS.HP",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.HP)}>{row.STATS.HP}</span>
      ),
    },
    {
      label: "Atk",
      accessor: "STATS.ATK",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.ATK)}>{row.STATS.DEF}</span>
      ),
    },
    {
      label: "Def",
      accessor: "STATS.DEF",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.ATK)}>{row.STATS.DEF}</span>
      ),
    },
    {
      label: "SpA",
      accessor: "STATS.SPA",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.SPA)}>{row.STATS.SPA}</span>
      ),
    },
    {
      label: "SpD",
      accessor: "STATS.SPD",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.SPD)}>{row.STATS.SPD}</span>
      ),
    },
    {
      label: "Spe",
      accessor: "STATS.SPE",
      sortable: true,
      render: (row) => (
        <span className={getStatColor(row.STATS.SPE)}>{row.STATS.SPE}</span>
      ),
    },
    {
      label: "BST",
      accessor: "BST_CALC",
      sortable: true,
      render: (row) => {
        const bst =
          row.STATS.HP +
          row.STATS.ATK +
          row.STATS.DEF +
          row.STATS.SPA +
          row.STATS.SPD +
          row.STATS.SPE;
        return <span className={getBSTColor(bst)}>{bst}</span>;
      },
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-color-light)]">
      <NavBar
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <div
        className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-4"
        style={{ paddingTop: "80px" }}
      >
        {/* Advanced Search Component */}
        <div className="mb-6">
          <AdvancedSearch
            allPokemon={allPokemon}
            allMoves={allMoves}
            onFiltersChange={setSearchFilters}
          />
        </div>

        <InfiniteScroll
          dataLength={displayedPokemon.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4 className="text-center py-4">Loading...</h4>}
          endMessage={<p className="text-center py-4">All Pokémon loaded!</p>}
        >
          <Table
            columns={columns}
            data={displayedPokemon}
            sortState={sortState}
            onSort={(col) =>
              setSortState((prev) => ({
                column: col,
                direction:
                  prev.column === col && prev.direction === "asc"
                    ? "desc"
                    : "asc",
              }))
            }
            onRowClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>

      {/* Modal for Pokémon details */}
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <PokemonDetail
          pokemon={selectedPokemon}
          allPokemon={allPokemon}
          allMoves={allMoves}
          onPokemonChange={handlePokemonChange}
        />
      </Modal>
    </main>
  );
}
