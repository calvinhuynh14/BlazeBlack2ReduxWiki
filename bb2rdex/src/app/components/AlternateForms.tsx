import React from "react";

interface AlternateForm {
  Name: string;
  Number: number;
  TYPE: string[];
  STATS: {
    HP: number;
    ATK: number;
    DEF: number;
    SPA: number;
    SPD: number;
    SPE: number;
  };
  Ability: string[];
  formIndex: number;
}

interface AlternateFormsProps {
  pokemon: any;
  allPokemon: any[];
  alternateForms: any[];
  onPokemonChange?: (pokemonName: string) => void;
}

export default function AlternateForms({
  pokemon,
  allPokemon,
  alternateForms,
  onPokemonChange,
}: AlternateFormsProps) {
  if (!pokemon || !alternateForms || alternateForms.length === 0) {
    return null;
  }

  // Get all unique forms of this Pokemon
  const allForms = [];
  const seenNames = new Set();

  // Add the current Pokemon
  allForms.push(pokemon);
  seenNames.add(pokemon.Name);

  // Add alternate forms, but avoid duplicates
  alternateForms.forEach((form) => {
    if (!seenNames.has(form.Name)) {
      allForms.push(form);
      seenNames.add(form.Name);
    }
  });

  // Sort by formIndex to maintain consistent order
  allForms.sort((a, b) => (a.formIndex || 0) - (b.formIndex || 0));

  const handleFormClick = (form: any) => {
    if (onPokemonChange) {
      // If it's an alternate form, we need to pass the form data directly
      // For now, we'll pass the form name and let the parent handle it
      onPokemonChange(form.Name);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h4 className="text-xl font-bold text-[var(--text-color-light)] text-center uppercase tracking-wider mb-4">
        Alternate Forms
      </h4>

      <div className="flex gap-2 md:gap-6 justify-center items-center">
        {allForms.map((form, index) => (
          <div
            key={`${form.Name}-${form.Number}`}
            className={`w-12 h-12 md:w-18 md:h-18 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
              form.Name === pokemon.Name
                ? "border-1 border-blue-400 bg-blue-50/10"
                : "border-[var(--border)] bg-[var(--table-dark)] hover:border-blue-400 hover:bg-blue-50/5"
            }`}
            onClick={() => handleFormClick(form)}
            title={form.Name}
          >
            <img
              src={`${
                process.env.NODE_ENV === "production"
                  ? "/BlazeBlack2ReduxWiki"
                  : ""
              }/pokemon-sprites/pokemon/${form.Number}.png`}
              alt={form.Name}
              className="w-12 md:w-18"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
