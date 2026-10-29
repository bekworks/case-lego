# Brick Builder

The product of a coding case with four challenges: which sets a user can build from the pieces they own, and three stretch goals about building with other people, planning a build others can follow, and swapping colours. A signed-in user explores their collection, sees which sets they can build, who could help with the rest, and what a new build should be limited to.

Built on TanStack Start (server rendering), React 19, TanStack Query and Table, Tailwind v4, against a read-only mock API.

## Get it running

Create `.env.local` in the project root with the address of the mock API from the case:

```
API_URL=<address of the mock API>
```

Install the dependencies:

```bash
npm install
```

Start the app and open http://localhost:3300:

```bash
npm run dev
```

Nothing is cached on the server and the browser's queries are always stale, so an edit to the API shows on the next page load or navigation. Sign in by picking a user on the first page. There is no password, the sign-in is a cookie with the user's id.

## The challenges

### Which sets can brickfan35 build?

The case itself: given a user's inventory of pieces, which sets can they build as they are.

**In code.** A set can be built when every piece it needs is owned in the right colour and at least the right amount. `api-reads.server.ts` reads the user's collection and every set from the API and maps them to domain types. `toInventory` in `domain/matching.ts` turns the collection into an inventory, a lookup from piece and colour to quantity. `shortfallOf` compares a set's pieces with the inventory and returns what is missing per piece and colour, and `buildStatus` turns that into can build or can't build. `scoreSet` in `sets.server.ts` does this for one set and the server functions `getSetMatches` and `getSetDetail` in `sets.ts` do it for the list and for one set with its pieces. The pages read the result through `setMatchesQuery` and `setDetailQuery`.

**See it.** Sign in as `brickfan35`. The Overview shows the count under "Sets you can build" and lists them under "Ready to build". The Sets page scores every set, and the status filter "Can build" narrows the table to the buildable ones. Open a set to see the pieces you have and the pieces you are missing.

### 1 Collaborate: landscape-artist and tropical-island

The user cannot build the set alone and wants to know which other users they could combine their collection with to have every piece.

**In code.** The shortfall from the step above is the gap to fill. `usersAndInventoriesOtherThan` in `sets.server.ts` loads every other user with their inventory. `collabGroups` in `domain/collaboration.ts` first keeps the users who own at least one missing piece, then searches for the smallest groups whose inventories together cover the whole shortfall. It looks at groups of one before groups of two and so on, up to three people, and drops any group that contains a smaller group that already covers the gap, so the answer is the minimal teams rather than every team. `sharesOfShortfall` then works out what each member of a group contributes, largest contributor first, so the shares add up to the gap even where members overlap. The server function `getCollabGroups` runs it for one set and the page reads it through `collabGroupsQuery`.

**See it.** Sign in as `landscape-artist`, open Sets and then `tropical-island`. The set shows "Can't build" and a "Find collaborators" button, which opens "Build it together". A user who covers the gap alone is listed as "Alone", and otherwise the page lists the smallest groups with each member's contribution. Other users' collections are only read when this page asks for them.

### 2 Plan a build: megabuilder99 and the 50 % rule

The user wants to design a new build from their own pieces, limited so that at least half of the other users could complete it from their current inventories.

**In code.** `largestCommonPieceList` in `domain/plan.ts` takes the other users with their inventories, the share, and the planner's own inventory. The number of users who must be able to build it is the share of the others, rounded up. The function tries every group of that many users and keeps the one with the most pieces in common, where a piece's quantity is the least anyone owns. The planner counts as a member of every group tried, since they have to build it too, so the result is limited to what they own. The server function `getLargestCommonPieceList` in `server/plan.ts` runs it, the share comes from the URL and is validated against the list `BUILD_SHARES` in `domain/model.ts`, and the page reads the result through `largestCommonPieceListQuery`.

**See it.** Sign in as `megabuilder99` and open "Plan a build". The share is 50 % by default, with 25, 50, 75 and 100 selectable above the table. The cards show how many pieces the build can use and how many of the other users could build it. The table lists each piece with "Most you can use", the quantity the build can include without leaving those users behind.

### 3 Substitute colours: dr_crocodile, in progress

The user is willing to swap a colour in a set for a colour they own, as long as every piece of that colour is swapped and the new colour is not already used elsewhere in the set. Which new sets does that open up.

**The idea.** Think in colours, not pieces. A swap replaces a whole colour in the set with one colour the user owns, so the question is per colour. Regroup the set by colour, so for every colour it is clear which pieces it needs and how many. Then, for each colour in the set, walk through the user's own pieces once and give every owned colour a point for each needed piece the user has enough of in that colour. An owned colour that scores a point for every needed piece covers the set colour completely, and is a candidate replacement for it. The last step is to pick one candidate per set colour without using the same owned colour twice. Regrouping by colour shrinks the problem from every piece against every colour to colour against colour.

**What is done.** `substitutionSets` in `domain/substitution.ts` regroups a set by colour and builds the candidate replacements per set colour.

**What is not done.** Picking one candidate per set colour without reusing a colour, which is needed because a set was found where two set colours had the same single candidate. Also running it over every set the user cannot build, a server function and a page. Nothing in the app shows this challenge yet.

## Layout

```
src/
  api/          the external API as it is: client.server.ts, endpoints, raw types
  domain/       what the app means, pure: model, matching, one file per challenge
  server/       server functions; the .server.ts files never reach the browser: api-reads.server.ts reads the API and maps raw to domain, sets.server.ts scores sets, session.server.ts holds the cookie
  queries.ts    the query options the routes use
  routes/       file-based routes; _authed wraps everything behind sign-in
  components/   ui/ (no domain knowledge), collection/, sets/
```

Dependencies run one way: `api` imports nothing, `domain` imports only `api/types`, `server` imports both, routes import `queries`, `domain` types and `components`. The logic for every challenge is a pure function over the same inputs, a user's inventory and a set's pieces. The server functions load those from the API and hand them over, and the pages read the result through a query.

## Decisions worth knowing

- **Sign-in is a user id in an httpOnly cookie.** Owner-only server functions read it from the request and never take a user id as an argument, so a caller cannot ask for someone else's collection. It is forgeable, which is fine for a demo and said so in `session.server.ts`.
- **Other users' collections are read only when a page needs them**: the collaboration page and the plan page. The lists score every set against your own collection only.
- **The raw API types and the domain types are separate.** The API names one concept three ways (`code`, `color`, `material`) and sends numbers as strings; the mapping functions in `server/api-reads.server.ts` translate once.
- **Every read of the API lives in a `.server.ts` file.** TanStack Start refuses to build a client bundle that imports one, so the rule is checked by the build, not by convention. The plain files in `server/` hold only server functions, whose handler bodies are stripped from the client bundle.
- **Functions are arrow functions**, except the page components, which a route's config references before they are declared and so rely on hoisting.
- **Search, sort and filter run in the browser** over the whole dataset, which fits a few thousand rows. The tables use TanStack Table v9; paging is a "show more" over a dataset that is already loaded.

## In the perfect world

What I would have done with more time:

- **Unit tests for the functionality that matters.** The domain functions are pure and take an inventory and a set's pieces, so they are easy to test without the API or the browser: the shortfall, the collaboration groups, the common piece list and the colour candidates.
- **TDD to prove red and green on each challenge.** Write the failing test from the case text first, then the function that makes it pass, so every challenge has a test that states its rule.
- **Split the JSX into smaller components**, self-contained where possible. The pages and the tables carry more markup than they should, and the header, the share control and the piece rows could each stand on their own.
- **A limit on the plan search.** Trying every group of users is exact and fast for the eleven users in the case data, but the number of groups grows exponentially with the user count. A larger user base would need a cap on the search, or an estimate in its place.
- **Server-side filtering instead of client-side.** Searching, sorting and paging in the browser fits this dataset, but a real collection could be far larger, and then the server should filter and page and the browser should only show what it is sent.
