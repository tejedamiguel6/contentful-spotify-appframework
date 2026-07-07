import { useEffect, useState } from "react";
import { Note, Paragraph } from "@contentful/f36-components";
import { JsonEditor } from "@contentful/field-editor-json";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";
import { apiFetch, errorMessage } from "../api";

export default function ProfileDataSpotify() {
  const sdk = useSDK<FieldAppSDK>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/contentful/profile")
      .then((profile) => {
        if (!cancelled) {
          sdk.field.setValue(profile);
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
      <Paragraph>Profile data from Spotify</Paragraph>
      {error && <Note variant="negative">Error: {error}</Note>}
      <JsonEditor field={sdk.field} isInitiallyDisabled={false} />
    </div>
  );
}
