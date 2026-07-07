import { useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { Stack, Button, Note } from "@contentful/f36-components";
import { Multiselect } from "@contentful/f36-multiselect";
import { apiFetch, errorMessage } from "../api";

export default function GenresObject() {
  const sdk = useSDK<FieldAppSDK>();
  const [genres, setGenres] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
    const storedValue = sdk.field.getValue();
    return Array.isArray(storedValue) ? storedValue : [];
  });

  useEffect(() => {
    let cancelled = false;

    apiFetch<string[]>("/api/contentful/db/all-genres")
      .then((response) => {
        if (!cancelled) {
          setGenres(response);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      });

    // Fixed height so the multiselect dropdown has room inside the iframe.
    sdk.window.updateHeight(500);

    return () => {
      cancelled = true;
    };
  }, [sdk.window]);

  const updateSelection = (updated: string[]) => {
    setSelectedGenres(updated);
    sdk.field.setValue(updated);
  };

  const toggleGenre = (genre: string) => {
    updateSelection(
      selectedGenres.includes(genre)
        ? selectedGenres.filter((g) => g !== genre)
        : [...selectedGenres, genre]
    );
  };

  const isAllSelected =
    genres.length > 0 && selectedGenres.length === genres.length;

  const handleSelectAll = () => {
    updateSelection(isAllSelected ? [] : genres);
  };

  const visibleGenres = searchValue
    ? genres.filter((genre) =>
        genre.toLowerCase().includes(searchValue.toLowerCase())
      )
    : genres;

  return (
    <Stack flexDirection="column" alignItems="start">
      <Button variant="secondary" onClick={handleSelectAll} size="small">
        {isAllSelected ? "Deselect all" : "Select all"}
      </Button>
      {error && <Note variant="negative">Error: {error}</Note>}
      <Multiselect
        currentSelection={selectedGenres}
        searchProps={{
          searchPlaceholder: "Search Genres",
          onSearchValueChange: (event) => setSearchValue(event.target.value),
        }}
      >
        {visibleGenres.map((genre) => (
          <Multiselect.Option
            key={genre}
            itemId={genre}
            value={genre}
            label={genre}
            onSelectItem={() => toggleGenre(genre)}
            isChecked={selectedGenres.includes(genre)}
          />
        ))}
      </Multiselect>
    </Stack>
  );
}
