# Project Progress

Contentful App (React + Vite + Forma 36) that renders custom Spotify-powered
field editors inside the Contentful entry editor. Data comes from the Next.js
site at `~/Documents/Developer/website` (`localhost:3000` in dev), which
proxies the Spotify Web API and a Go backend
(`https://api-spotify-tracks.mtejeda.co`) for listening-history/genre data.

## How it fits together

```
Contentful entry editor (app.contentful.com)
  └─ iframe: this app (Vite dev server, localhost:8000)
       └─ fetch → Next.js API routes (localhost:3000/api/contentful/*)
            ├─ Spotify Web API (OAuth tokens)
            └─ Go backend (genres / recently-liked DB)
```

- `src/locations/Field.tsx` maps each field ID on the content type to an
  editor component (see `fieldComponents`): `topArtists`, `similarArtists`,
  `profileData`, `recentlyLiked`, `topItem`, `recentlyLikedId`,
  `itemJsonData`, `genres`/`genre`, `tracks`.
- Shared plumbing: `src/api.ts` (base URL + fetch/error helpers),
  `src/hooks/useItemType.ts` (tracks the entry's `itemType` field),
  `src/hooks/useSpotifyItems.ts` (fetches top tracks/artists),
  `src/components/TopItemsList.tsx` (card list UI).
- The API base URL is `http://localhost:3000` by default; override with
  `VITE_API_BASE_URL` in a `.env` file.

## Spotify auth (important)

Tokens are obtained via OAuth on the Next.js site and kept **server-side**
(`app/lib/spotify-token-store.ts` in the website repo: in-memory access token
+ refresh token persisted to a gitignored `.spotify-tokens.json`, refreshed
automatically). This exists because the Contentful iframe's requests are
cross-site, so the browser never sends the `SameSite=Lax` auth cookies —
cookie-based auth can't work from inside Contentful.

To (re)authenticate, open: **http://127.0.0.1:3000/api/spotify/login**

Use `127.0.0.1`, not `localhost` — the Spotify redirect URI is
`http://127.0.0.1:3000/api/spotify/callback/`, and starting the login on
`localhost` puts the CSRF state cookie on the wrong host, which fails with
`auth-error?error=state_mismatch`.

## Running locally

1. Start the website/API: `npm run dev` in `~/Documents/Developer/website`
   (port 3000).
2. Start this app: `npm run dev` (port 8000).
3. Log in once at `http://127.0.0.1:3000/api/spotify/login` if fields show a
   token error.
4. Open an entry in Contentful that uses the app.

Checks: `npm run typecheck`, `npm test`, `npm run build`.

## Done — 2026-07-07

- Refactor/cleanup pass on all field components: extracted shared hooks
  (`useItemType`, `useSpotifyItems`), `TopItemsList`, `src/api.ts`, and
  Spotify types; typed `useSDK<FieldAppSDK>()` throughout. `tsc --noEmit`
  went from ~60 errors to 0; all 7 tests pass; production build succeeds.
- Fixed bugs: `TopArtists` crashed on a leftover debug line and never saved
  data; `SearchItems` debounce never cancelled (request per keystroke, stale
  responses could win); `tracks` saved an empty array instead of fetched
  data; `ProfileData`/`Genres` wiped the saved field value on mount;
  `Genres` was missing the required `itemId` prop and its search box did
  nothing (now filters).
- Removed the unused `Fields.tsx` stub, updated the stale `Field.spec.tsx`,
  added `npm run typecheck`.
- Fixed Contentful↔Spotify auth end-to-end (changes live in the website
  repo, branch `feature/now-playing-upgrade`): server-side token store, the
  OAuth callback/refresh routes save into it, and the three
  `/api/contentful/*` routes fall back to it when no cookie is present.
  Also URL-encoded the `search-artists` query. Verified working in
  Contentful.

## Related repos (2026-07-07)

- `~/Developer/GO-projects/song-analyzer` — standalone Go module
  (`github.com/migueltejeda/song-analyzer`), extracted from casambi-go: DSP
  track profiling + Claude AI enrichment (genre, moods, scores, palette).
- `~/Developer/go-spotify-track-db` — the Go backend behind
  `api-spotify-tracks.mtejeda.co`; now has `GET
  /track-analysis?track=..&artist=..` which returns cached-or-fresh AI
  enrichment (needs `ANTHROPIC_API_KEY` in its env). A future Contentful
  field/component could surface this per selected track.
- `~/Developer/GO-projects/casambi-go` — music-reactive lighting rig;
  consumes song-analyzer via a local `replace` directive.

## Known issues / next steps

- Bundle is ~2.2 MB minified (mostly Forma 36) — consider `React.lazy` per
  field component if editor load time matters.
- `ConfigScreen.tsx` still imports the deprecated `emotion@10` package —
  migrate its one `css` call to `@emotion/css` to drop the dependency.
- `tracks.tsx` has a hardcoded genre (`synthwave`) — probably wants to read
  a genre from the entry instead.
- The website's `/auth-error` page 404s (route doesn't exist) — cosmetic.
- Website-repo auth changes are uncommitted on `feature/now-playing-upgrade`
  and mixed in with unrelated now-playing work.
- Homebrew `node` on this machine is broken (missing `llhttp` dylib); use
  nvm Node (`~/.nvm/versions/node/v22.22.0`) or `brew reinstall node`.
