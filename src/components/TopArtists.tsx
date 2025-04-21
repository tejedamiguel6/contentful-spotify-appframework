import { useState, useEffect } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { JsonEditor } from "@contentful/field-editor-json";

export default function TopArtistsObject() {
  const sdk = useSDK();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [itemDataField, setItemDataField] = useState("");

  useEffect(() => {
    if (data) {
      sdk.field.setValue(data);
    }
  }, [data, sdk.field]);

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
        console.log("NEED OBJECT--->", result);

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [itemDataField]);
  return (
    <>
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      <JsonEditor field={sdk.field} isInitiallyDisabled={true}></JsonEditor>
    </>
  );
}
