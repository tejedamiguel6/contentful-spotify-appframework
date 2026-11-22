import Sidebar from "./Sidebar";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { ArtistStats } from "../types/spotify";

// The artist field on the entry; tests swap its value per case.
let artistValue: unknown = null;
let sdk: unknown;

function makeSdk(withArtistField = true) {
  return {
    window: { startAutoResizer: vi.fn(), stopAutoResizer: vi.fn() },
    entry: {
      fields: withArtistField
        ? {
            itemJsonData: {
              getValue: () => artistValue,
              onValueChanged: vi.fn(() => () => {}),
            },
          }
        : {},
    },
  };
}

vi.mock("@contentful/react-apps-toolkit", () => ({
  useSDK: () => sdk,
}));

const apiFetch = vi.fn();
vi.mock("../api", () => ({
  apiFetch: (path: string) => apiFetch(path),
  errorMessage: (err: unknown) => (err instanceof Error ? err.message : String(err)),
}));

const boyHarsher: ArtistStats = {
  artist: "Boy Harsher",
  totalPlays: 282,
  uniqueTracks: 45,
  uniqueAlbums: 15,
  firstPlay: "2025-08-22 18:47:06.356",
  lastPlay: "2026-11-22 03:10:00",
  topTracks: [
    { track: "Ronny", album: "GET MEAN", coverUrl: null, plays: 21 },
    { track: "Pray 4 Me", album: "GET MEAN", coverUrl: null, plays: 18 },
  ],
};

beforeEach(() => {
  apiFetch.mockReset();
  artistValue = null;
  sdk = makeSdk();
});

describe("Sidebar (artist listening stats)", () => {
  it("asks for an artist when none is picked", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Pick an artist/)).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("explains itself on entries without the artist field", () => {
    sdk = makeSdk(false);
    render(<Sidebar />);
    expect(screen.getByText(/show on artist pages/)).toBeInTheDocument();
  });

  it("shows stats and top tracks for the picked artist", async () => {
    artistValue = { id: "x", name: "Boy Harsher" };
    apiFetch.mockResolvedValue(boyHarsher);

    render(<Sidebar />);

    expect(await screen.findByText("Your history with Boy Harsher")).toBeInTheDocument();
    expect(apiFetch).toHaveBeenCalledWith("/api/contentful/artist-stats?name=Boy%20Harsher");
    expect(screen.getByText("282")).toBeInTheDocument();
    expect(screen.getByText("Aug 22, 2025")).toBeInTheDocument();
    // 03:10 UTC on the 22nd is still the 21st in Denver
    expect(screen.getByText("Nov 21, 2026")).toBeInTheDocument();
    expect(screen.getByText("Ronny")).toBeInTheDocument();
    expect(screen.getByText("21 plays · GET MEAN")).toBeInTheDocument();
  });

  it("says so when there are no plays", async () => {
    artistValue = { name: "Nobody" };
    apiFetch.mockResolvedValue({ ...boyHarsher, artist: "Nobody", totalPlays: 0, topTracks: [] });
    render(<Sidebar />);
    expect(await screen.findByText(/recorded yet/)).toBeInTheDocument();
  });

  it("shows an error when the request fails", async () => {
    artistValue = { name: "Boy Harsher" };
    apiFetch.mockRejectedValue(new Error("No Spotify token"));
    render(<Sidebar />);
    await waitFor(() => expect(screen.getByText(/Couldn't load stats: No Spotify token/)).toBeInTheDocument());
  });
});
