import { useEffect, useState } from "react";
import { apiFetch, errorMessage } from "../api";
import { TopItemsResponse } from "../types/spotify";

/**
 * Fetches the top tracks/artists list for the given item type.
 * Returns nothing until an item type is selected on the entry.
 */
export function useSpotifyItems(itemType: string) {
  const [data, setData] = useState<TopItemsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemType) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<TopItemsResponse>(
      `/api/contentful/spotify-data?type=${encodeURIComponent(itemType)}`
    )
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [itemType]);

  return { data, loading, error };
}
