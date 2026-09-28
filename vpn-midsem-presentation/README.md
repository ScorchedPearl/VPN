# VPN detection midsem presentation

An interactive, 20-slide website presentation for the VPN detection research project. It uses highlighted excerpts from the three project papers and two related VPN studies. Clicking an excerpt or its source label opens the exact PDF page.

## Run

From this folder, run `npm install` and then `npm run dev`. Open the local URL shown by Next.js. Use the arrow keys to move through slides, `G` for the grid, and `P` for presenter notes.

## Research boundary

The Beauty and the Beast and NDSS papers study browser and device fingerprinting. The 2025 technical report studies detection of fingerprinting scripts. SNITCH is a direct example of server-side VPN detection. Mazel et al. compare learning methods for tunnel traffic using packet-flow data; our website will test its own visit-level data. The current detector's numeric weights and probabilities remain provisional until labelled evaluation.

## Sources

- `public/papers/beauty-sp16.pdf`
- `public/papers/ndss2017_02B-3_Cao_paper.pdf`
- `public/papers/techreport-2025-3.pdf`
- `public/papers/snitch-madweb25.pdf`
- `public/papers/tunnel-ml-2022.pdf`
- Highlighted excerpts: `public/evidence/`
