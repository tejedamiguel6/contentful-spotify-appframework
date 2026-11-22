import { useEffect, useState } from "react";
import {
  Box,
  Caption,
  Flex,
  Grid,
  Note,
  Paragraph,
  SkeletonBodyText,
  SkeletonContainer,
  SkeletonDisplayText,
  Subheading,
  Text,
} from "@contentful/f36-components";
import { SidebarAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { apiFetch, errorMessage } from "../api";
import { formatDate, formatNumber } from "../format";
import { ArtistStats } from "../types/spotify";

// Entry sidebar for artist pages (pageMusic): your listening history for the
// artist picked in `itemJsonData`, so the numbers are right there while you
// write the review. Read-only: it never changes the entry.

const ARTIST_FIELD = "itemJsonData";

/** The artist name from the saved Spotify JSON, if there is one. */
function artistNameFrom(value: unknown): string | null {
  const name = (value as { name?: unknown } | null | undefined)?.name;
  return typeof name === "string" && name.trim() ? name.trim() : null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Flex flexDirection="column">
      <Text fontSize="fontSizeL" fontWeight="fontWeightDemiBold">
        {value}
      </Text>
      <Caption fontColor="gray600">{label}</Caption>
    </Flex>
  );
}

const coverStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  flex: "none",
  objectFit: "cover",
  borderRadius: 4,
  background: "#e5ebed",
};

/** One track row: cover, name, and "N plays · Album". */
function TrackRow({ track }: { track: ArtistStats["topTracks"][number] }) {
  return (
    <Flex as="li" alignItems="center" gap="spacingS">
      {track.coverUrl ? (
        <img src={track.coverUrl} alt="" style={coverStyle} />
      ) : (
        <Box style={coverStyle} />
      )}
      <Flex flexDirection="column" style={{ minWidth: 0 }}>
        <Text fontWeight="fontWeightDemiBold" isTruncated>
          {track.track}
        </Text>
        <Caption fontColor="gray600" isTruncated>
          {formatNumber(track.plays)} plays · {track.album}
        </Caption>
      </Flex>
    </Flex>
  );
}

function LoadingState() {
  return (
    <SkeletonContainer svgHeight={160}>
      <SkeletonDisplayText numberOfLines={1} />
      <SkeletonBodyText numberOfLines={4} offsetTop={40} />
    </SkeletonContainer>
  );
}

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();
  const field = sdk.entry.fields[ARTIST_FIELD];

  const [artist, setArtist] = useState<string | null>(() =>
    artistNameFrom(field?.getValue())
  );
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Grow and shrink the sidebar iframe with its content
  useEffect(() => {
    sdk.window.startAutoResizer();
    return () => sdk.window.stopAutoResizer();
  }, [sdk.window]);

  // Follow the artist field as the editor picks a different artist
  useEffect(() => {
    if (!field) return;
    return field.onValueChanged((value: unknown) => setArtist(artistNameFrom(value)));
  }, [field]);

  useEffect(() => {
    if (!artist) {
      setStats(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch<ArtistStats>(
      `/api/contentful/artist-stats?name=${encodeURIComponent(artist)}`
    )
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [artist]);

  if (!field) {
    return (
      <Note variant="neutral">
        Listening stats show on artist pages (entries with an "{ARTIST_FIELD}"
        field).
      </Note>
    );
  }

  if (!artist) {
    return (
      <Paragraph marginBottom="none">
        Pick an artist to see your listening history for them.
      </Paragraph>
    );
  }

  if (loading && !stats) return <LoadingState />;

  if (error) {
    return <Note variant="negative">Couldn't load stats: {error}</Note>;
  }

  if (!stats) return null;

  if (stats.totalPlays === 0) {
    return (
      <Paragraph marginBottom="none">
        No plays of <strong>{stats.artist}</strong> recorded yet.
      </Paragraph>
    );
  }

  return (
    <Flex flexDirection="column" gap="spacingM">
      <Subheading marginBottom="none">Your history with {stats.artist}</Subheading>

      <Grid columns="1fr 1fr" rowGap="spacingS" columnGap="spacingS">
        <Stat label="Plays" value={formatNumber(stats.totalPlays)} />
        <Stat label="Tracks" value={formatNumber(stats.uniqueTracks)} />
        <Stat label="First heard" value={formatDate(stats.firstPlay)} />
        <Stat label="Last played" value={formatDate(stats.lastPlay)} />
      </Grid>

      {stats.topTracks.length > 0 && (
        <Flex flexDirection="column" gap="spacingXs">
          <Caption fontWeight="fontWeightMedium">Most played tracks</Caption>
          <Flex as="ul" flexDirection="column" gap="spacingXs" style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {stats.topTracks.map((t) => (
              <TrackRow key={`${t.track}-${t.album}`} track={t} />
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

export default Sidebar;
