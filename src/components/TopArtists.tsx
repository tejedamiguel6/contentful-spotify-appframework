import { useEffect } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { Note, Spinner } from "@contentful/f36-components";
import { JsonEditor } from "@contentful/field-editor-json";
import { useItemType } from "../hooks/useItemType";
import { useSpotifyItems } from "../hooks/useSpotifyItems";

// Saves the entire "top items" payload for the entry's itemType into
// this JSON field.

export default function TopArtistsObject() {
  const sdk = useSDK<FieldAppSDK>();
  const itemType = useItemType(sdk);
  const { data, loading, error } = useSpotifyItems(itemType);

  useEffect(() => {
    if (data) {
      sdk.field.setValue(data);
    }
  }, [data, sdk.field]);

  return (
    <div>
      {loading && <Spinner />}
      {error && <Note variant="negative">Error: {error}</Note>}
      <JsonEditor field={sdk.field} isInitiallyDisabled={true} />
    </div>
  );
}
