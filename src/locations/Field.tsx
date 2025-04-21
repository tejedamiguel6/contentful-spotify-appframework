import { Paragraph, TextInput } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useState, useEffect } from "react";

import { EntryCard, Badge } from "@contentful/f36-components";

import SearchItems from "../components/SearchItems";
import TopArtistsObject from "../components/TopArtists";
import TopTracksTopArtists from "../components/TopArtistTopTracks";

const Field = () => {
  const sdk = useSDK();

  console.log("which field id?", sdk.field.id);

  return (
    <>
      {sdk.field.id === "topArtists" ? (
        <TopArtistsObject />
      ) : (
        <TopTracksTopArtists />
      )}
    </>
  );
};

export default Field;
