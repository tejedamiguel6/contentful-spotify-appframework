import { useEffect, useState } from "react";
import { FieldAppSDK } from "@contentful/app-sdk";

/**
 * Tracks the entry's `itemType` field value, staying in sync when the
 * editor changes it in another field on the same entry.
 */
export function useItemType(sdk: FieldAppSDK): string {
  const [itemType, setItemType] = useState<string>(
    () => sdk.entry.fields.itemType?.getValue() ?? ""
  );

  useEffect(() => {
    const detach = sdk.entry.fields.itemType?.onValueChanged(
      (newValue: string | undefined) => {
        setItemType(newValue ?? "");
      }
    );
    return detach;
  }, [sdk.entry]);

  return itemType;
}
