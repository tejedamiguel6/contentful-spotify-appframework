import { useEffect, useState } from "react";
import { Heading, Note } from "@contentful/f36-components";
import { JsonEditor } from "@contentful/field-editor-json";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { apiFetch, errorMessage } from "../api";
import { SpotifyArtist } from "../types/spotify";

const GENRE = "synthwave";

// Saves the artists for a genre from the backend database into this
// JSON field.

export default function Tracks() {
  const sdk = useSDK<FieldAppSDK>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ artists: SpotifyArtist[] }>(
      `/api/contentful/db/genre?name=${encodeURIComponent(GENRE)}`
    )
      .then((data) => {
        if (!cancelled) {
          sdk.field.setValue(data.artists);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sdk.field]);

  return (
    <div>
      <Heading>Tracks by genre: {GENRE}</Heading>
      {error && <Note variant="negative">Error: {error}</Note>}
      <JsonEditor field={sdk.field} isInitiallyDisabled={true} />
    </div>
  );
}
