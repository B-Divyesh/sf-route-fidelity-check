# Demo sandbox

Demo URL: <https://route-fidelity-check.sociobot.in/demo>

The home-page “Try it with sample data” link opens this URL in one click. The
demo loads a planned Saturday river loop and a realistic device export with a
material detour. It runs the comparison immediately, showing one review zone,
four metrics, the aligned trace, and the ride-leader checklist.

The persistent banner reads “Demo — sample data, nothing is saved.” “Reset
demo” restores the 50 metre threshold, both sample routes, the completed
comparison, the full trace, and unchecked checklist items. “Start for real”
discards the in-memory sample session and opens an empty comparison.

Demo data uses an isolated in-memory `demo:` session. The product does not use
localStorage, sessionStorage, IndexedDB, OPFS, cookies, or a backend for route
data. Demo actions therefore cannot read, overwrite, or persist real route
data. Reloading `/demo` creates a new sample session; reloading `/` clears an
active real comparison.

Every declared claim starts from this demo entry or enters it through the
single home-page action. See `.factory/claims.json` for exact commands and
sandbox outcomes.
