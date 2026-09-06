# Route comparison acceptance corpus

This versioned corpus contains 30 planned/exported GPX pairs. Twenty-seven
pairs contain a known geometric change: an exported detour, shortcut, or loop.
Three pairs are clear controls with denser points, reversed direction, or GPX
route points.

The geometry is purpose-built and anonymous. It contains no rider, account,
device, or third-party map data. The manifest records each expected result and
the 50 metre comparison threshold.

Run the outcome check with:

```sh
npm run test:claims -- --grep @claim:corpus-recall
```

