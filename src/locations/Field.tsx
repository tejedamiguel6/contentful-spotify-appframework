import { Note } from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import { FieldAppSDK } from "@contentful/app-sdk";

import SearchItems from "../components/SearchItems";
import TopArtistsObject from "../components/TopArtists";
import TopTracksTopArtists from "../components/TopArtistTopTracks";
import ProfileDataSpotify from "../components/ProfileData";
import TopItemJSON from "../components/topItemJSON";
import GenresObject from "../components/Genres";
import Tracks from "../components/tracks";

const fieldComponents: Record<string, () => JSX.Element> = {
  topArtists: TopArtistsObject,
  similarArtists: SearchItems,
  profileData: ProfileDataSpotify,
  recentlyLiked: TopTracksTopArtists,
  topItem: TopTracksTopArtists,
  recentlyLikedId: TopTracksTopArtists,
  itemJsonData: TopItemJSON,
  genres: GenresObject,
  genre: GenresObject,
  tracks: Tracks,
};

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const FieldComponent = fieldComponents[sdk.field.id];

  if (!FieldComponent) {
    return (
      <Note variant="warning">
        No editor is configured for the field "{sdk.field.id}".
      </Note>
    );
  }

  return <FieldComponent />;
};

export default Field;
