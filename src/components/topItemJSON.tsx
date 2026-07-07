import { useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { Note, Spinner } from "@contentful/f36-components";
import { JsonEditor } from "@contentful/field-editor-json";
import { useItemType } from "../hooks/useItemType";
import { useSpotifyItems } from "../hooks/useSpotifyItems";
import TopItemsList from "./TopItemsList";

// Lets the editor pick one top track/artist and saves the item's full
// JSON object to the field (not just its id).

export default function TopItemJSON() {
  const sdk = useSDK<FieldAppSDK>();
  const itemType = useItemType(sdk);
  const { data, loading, error } = useSpotifyItems(itemType);
  const [selectedId, setSelectedId] = useState<string | null>(
    () => sdk.field.getValue()?.id ?? null
  );

  const handleSelect = (id: string) => {
    const item = data?.items.find((candidate) => candidate.id === id);
    if (!item) {
      return;
    }
    setSelectedId(id);
    sdk.field.setValue(item);
  };

  return (
    <div>
      {loading && <Spinner />}
      {error && <Note variant="negative">Error: {error}</Note>}
      {!loading && data?.items && (
        <>
          <TopItemsList
            items={data.items}
            itemType={itemType}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
          <JsonEditor field={sdk.field} isInitiallyDisabled={true} />
        </>
      )}
    </div>
  );
}
