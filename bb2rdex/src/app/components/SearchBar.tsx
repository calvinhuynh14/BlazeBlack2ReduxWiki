import React from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Search..."
      className="px-4 py-2 rounded-md bg-[var(--header-bg)] text-[var(--foreground)] w-64 focus:outline-none focus:ring-2 focus:ring-[var(--header-bg)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
