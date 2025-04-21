import React from "react";
import { useState, useEffect } from "react";
import { TextInput, Paragraph } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";

export default function SearchItems() {
  const sdk = useSDK();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const fetchMusic = async () => {
      const delayDebounce = setTimeout(async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/api/contentful/search-artists?query=${encodeURIComponent(
              searchQuery
            )}`,
            { credentials: "include" }
          );

          const data = await response.json();
          console.log(data, ")(&ohu");

          setSearchQuery;
        } catch (err) {
          console.error("Search error:", err);
        }
      }, 400); // debounce 400ms

      return () => clearTimeout(delayDebounce);
    };

    fetchMusic();
  }, []);
  return (
    <div>
      <Paragraph>Search Artist</Paragraph>
      <TextInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Artist"
      />
    </div>
  );
}
