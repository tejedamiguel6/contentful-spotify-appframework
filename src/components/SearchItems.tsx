import { useState, useEffect } from "react";
import {
  TextInput,
  Paragraph,
  EntryCard,
  Badge,
  Note,
} from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { JsonEditor } from "@contentful/field-editor-json";
import { apiFetch, errorMessage } from "../api";
import { ArtistSearchResponse, SpotifyArtist } from "../types/spotify";

const SEARCH_DEBOUNCE_MS = 400;
const selectedStyle = { borderLeft: "5px solid rgb(60, 179, 113)" };

// Searches Spotify for artists and saves the selected ones (full
// objects) as an array in the field.

export default function SearchItems() {
  const sdk = useSDK<FieldAppSDK>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtists, setSelectedArtists] = useState<SpotifyArtist[]>(
    () => {
      const savedValue = sdk.field.getValue();
      return Array.isArray(savedValue) ? savedValue : [];
    }
  );

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const data = await apiFetch<ArtistSearchResponse>(
          `/api/contentful/search-artists?query=${encodeURIComponent(
            searchQuery
          )}`
        );
        if (!cancelled) {
          setSearchResults(data.artists?.items ?? []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const toggleArtist = (artist: SpotifyArtist) => {
    const isAlreadySelected = selectedArtists.some((a) => a.id === artist.id);
    const updated = isAlreadySelected
      ? selectedArtists.filter((a) => a.id !== artist.id)
      : [...selectedArtists, artist];

    setSelectedArtists(updated);
    sdk.field.setValue(updated);
  };

  return (
    <div>
      <Paragraph>Search Artist</Paragraph>
      <TextInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Artist"
      />
      {loading && <Paragraph>Loading…</Paragraph>}
      {error && <Note variant="negative">Error: {error}</Note>}

      {searchResults.map((artist) => {
        const isSelected = selectedArtists.some((a) => a.id === artist.id);

        return (
          <EntryCard
            key={artist.id}
            title={artist.name || "Unknown Artist"}
            contentType="Artist"
            badge={<Badge variant="positive">ARTIST</Badge>}
            style={isSelected ? selectedStyle : undefined}
            thumbnailElement={
              artist.images?.[0]?.url ? (
                <img alt="artist image" src={artist.images[0].url} />
              ) : (
                <div>No Image</div>
              )
            }
            onClick={() => toggleArtist(artist)}
          />
        );
      })}

      <JsonEditor field={sdk.field} isInitiallyDisabled={true} />
    </div>
  );
}
