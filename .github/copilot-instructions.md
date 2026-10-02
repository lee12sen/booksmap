# Copilot instructions

## Project context

- `PRD.md` is the current source of truth for product scope, user flows, requirements, and unresolved technical decisions.
- The repository is currently at the documentation/planning stage. No application source, package manifest, build configuration, test configuration, or lint configuration is defined yet.
- `README.md` does not currently provide additional setup or development commands.

## Build, test, and lint

- No build, test, or lint commands are currently defined in this repository.
- Do not invent a framework, package manager, or command set. When implementation begins, first inspect the added project configuration and update this file with the actual commands.
- Once a test runner exists, document both the full suite and the repository's supported single-test invocation here.

## Architecture

The planned product is a responsive web application for searching books across Busan public libraries and comparing where they can be borrowed.

- The main flow is book-title search -> normalized library results -> loan-status display -> map and route information.
- External public-data or library APIs may use different field names and status values. Integrate them through a canonical internal model containing library identity/name/address, book title, holdings, loan status, coordinates or geocodable address, and data refresh time.
- The search/results experience must coordinate the result list with map markers. Selecting a result or marker should identify the same library in both views.
- Kakao Maps is the preferred integration candidate for maps, geocoding, walking routes, and public-transit routes, but the exact products, permissions, limits, and deployment design remain undecided.
- Origin setup has two paths: browser geolocation when permitted, or address search and explicit selection when permission is denied or unavailable.
- Route calculations are per result and should not turn a single route failure into total search failure. Map and route work should be deferred until needed to avoid unnecessary initial loading.
- The MVP does not persist origin locations on a server or require accounts.

## Repository-specific conventions

- Preserve partial success: show successful library results when only some upstream sources fail, and expose the partial failure to the user.
- Never infer an optimistic loan status. Map missing or ambiguous upstream values to an explicit `status unknown`/`상태 확인 필요` state.
- Do not show fabricated defaults when coordinates, distance, or travel time cannot be calculated. Keep the library result visible and mark the unavailable information.
- Keep duplicate libraries from appearing across data sources by applying a documented normalization and deduplication rule.
- Treat upstream freshness, API limits, CORS/proxy requirements, licensing, and attribution as part of integration design; do not assume an API is usable until these are verified.
- Do not commit API keys or server credentials, and do not expose secrets in client source. Apply provider domain restrictions where supported.
- User-facing errors must include an understandable recovery path (retry, revise the search, choose an address, or continue without route data); logging only to the browser console is insufficient.
- Keep loan status distinguishable with text as well as color. Preserve keyboard access, accessible names, and assistive-technology announcements for loading and error states.
- Maintain responsive behavior: list and map can stack on small screens and sit side by side on larger screens.
- Keep the MVP boundary from `PRD.md`: prioritize title search, library-level holdings/loan status, map integration, origin selection, walking/transit estimates, and failure states before authentication, favorites, history, reservations, or expanded search fields.

## Product decisions still requiring verification

Before implementing external integrations, verify the official Busan library/book data sources, status semantics and freshness, authentication and quota rules, CORS behavior, Kakao Maps API availability and costs, transit-time coverage, and whether caching is permitted. Do not silently choose values for these unresolved items.
