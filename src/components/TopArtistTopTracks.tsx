import React from "react";
import { useState, useEffect } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { EntryCard, Badge } from "@contentful/f36-components";

export default function TopTracksTopArtists() {
  const sdk = useSDK();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [itemDataField, setItemDataField] = useState("");

  useEffect(() => {
    const entry = sdk.entry;
    const itemType = entry?.fields?.itemType?.getValue();
    setItemDataField(itemType);

    console.log("itemType--> ", itemType);

    // initlize the current value
    const currentValue = sdk.field.getValue();
    if (currentValue) {
      setSelectedTrack(currentValue);
      console.log("Loaded saved selction:", currentValue);
    }

    const detachItemTypeChangeHandler = entry.fields.itemType?.onValueChanged(
      (newValue) => {
        console.log("Item Type changed to:", newValue);
        setItemDataField(newValue);
      }
    );

    return () => {
      detachItemTypeChangeHandler();
    };
  }, [sdk.entry]);

  useEffect(() => {
    async function fetchData() {
      // Skip if no item type selected
      if (!itemDataField) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/contentful/spotify-data?type=${itemDataField}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [itemDataField]);

  const handleSelectedTrack = (trackId) => {
    setSelectedTrack(trackId);

    // Update the Contentful field value when a track is selected
    sdk.field.setValue(trackId);
  };

  return (
    // todo: add these to components
    <div>
      {loading && <div>Loadi!!!ng...</div>}
      {error && <div style={{ color: "red" }}>Error: {error}</div>}
      {!loading && data?.items && (
        <>
          {itemDataField === "top-tracks" ? (
            <div>
              {data.items.map((item, index) => (
                <div key={item.id}>
                  <EntryCard
                    title={item.name || "Unknown Track"}
                    contentType="Track"
                    description={(item.artists && item.artists[0]?.name) || ""}
                    badge={<Badge variant="positive">{itemDataField}</Badge>}
                    style={
                      selectedTrack === item.id
                        ? { borderLeft: "5px solid rgb(60, 179, 113)" }
                        : undefined
                    }
                    thumbnailElement={
                      item.album &&
                      item.album.images &&
                      item.album.images.length > 0 ? (
                        <img alt="track cover" src={item.album.images[0].url} />
                      ) : (
                        <div>No Image</div>
                      )
                    }
                    onClick={() => handleSelectedTrack(item.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {data.items.map((item, index) => (
                <div key={item.id}>
                  <EntryCard
                    contentType="Artist"
                    title={item.name || "Unknown Artist"}
                    badge={<Badge variant="positive">{itemDataField}</Badge>}
                    style={
                      selectedTrack === item.id
                        ? { borderLeft: "5px solid rgb(60, 179, 113)" }
                        : undefined
                    }
                    thumbnailElement={
                      item.images && item.images.length > 0 ? (
                        <img alt="artist image" src={item.images[0].url} />
                      ) : (
                        <div>No Image</div>
                      )
                    }
                    onClick={() => handleSelectedTrack(item.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
