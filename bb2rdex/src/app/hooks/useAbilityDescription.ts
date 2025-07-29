import { useState, useEffect } from "react";

interface AbilityDescription {
  name: string;
  description: string;
  loading: boolean;
  error: string | null;
}

export function useAbilityDescription(abilityName: string): AbilityDescription {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abilityName) return;

    const fetchAbilityDescription = async () => {
      setLoading(true);
      setError(null);

      try {
        // Convert ability name to API format (lowercase, spaces to hyphens)
        const formattedAbility = abilityName.toLowerCase().replace(/\s+/g, "-");
        const response = await fetch(
          `https://pokeapi.co/api/v2/ability/${formattedAbility}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch ability: ${response.status}`);
        }

        const data = await response.json();

        // Find English description from flavor_text_entries
        const englishEntry = data.flavor_text_entries?.find(
          (entry: any) => entry.language.name === "en"
        );

        if (englishEntry) {
          setDescription(englishEntry.flavor_text);
        } else {
          setDescription("No description available");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch ability description"
        );
        setDescription("Description unavailable");
      } finally {
        setLoading(false);
      }
    };

    fetchAbilityDescription();
  }, [abilityName]);

  return {
    name: abilityName,
    description,
    loading,
    error,
  };
}
