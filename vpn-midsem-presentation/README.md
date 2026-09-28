# VPN detection midsem presentation

An interactive, 22-slide website presentation for the VPN detection research project. It uses the highlighted paper excerpts supplied for the project, and the three full papers are available through the source links in the slides.

## Run

From this folder, run `npm install` and then `npm run dev`. Open the local URL shown by Next.js. Use the arrow keys to move through slides, `G` for the grid, and `P` for presenter notes.

## Research boundary

The Beauty and the Beast and NDSS papers study browser and device fingerprinting. The 2025 technical report studies detection of fingerprinting scripts. Their reported results are not VPN detection accuracy. The presentation keeps the current detector's factor weights and risk percentages labelled as provisional; the next research step is a labelled VPN evaluation.

## Sources

- `public/papers/beauty-sp16.pdf`
- `public/papers/ndss2017_02B-3_Cao_paper.pdf`
- `public/papers/techreport-2025-3.pdf`
- Highlighted excerpts: `public/evidence/`
