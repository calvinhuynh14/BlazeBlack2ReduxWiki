import React from "react";
import SearchBar from "./SearchBar";

interface NavbarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
}

export default function NavBar({
  categories,
  selectedCategory,
  onCategoryChange,
  searchValue,
  onSearchChange,
}: NavbarProps) {
  return (
    <nav className="relative flex items-center justify-between px-8 py-4 bg-[var(--background)] text-[var(--foreground)] shadow w-full">
      {/* Title on the left */}
      <div className="flex-1 min-w-0">
        <span className="font-bold text-lg md:text-xl whitespace-nowrap">
          Pokemon Blaze Black / Volt White 2 Redux
        </span>
      </div>
      {/* Categories centered absolutely */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-md font-medium transition text-sm md:text-base ${
              selectedCategory === cat
                ? "bg-[var(--header-bg)] text-[var(--background)]"
                : "bg-[var(--table-dark)] text-[var(--foreground)] hover:bg-[var(--table-light)]"
            }`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      {/* Search bar on the right */}
      <div className="flex-1 min-w-0 flex justify-end">
        <SearchBar value={searchValue} onChange={onSearchChange} />
      </div>
    </nav>
  );
}
