# Off-Grid Solar Carport — Technical Drawing Set

Flat-pack, off-grid aluminium solar carport. Two references, **CARPORT SOLO**
(1-car) and **CARPORT DUO** (2-car), each delivered as a **7-sheet drawing set**
in both **DXF** (native vector / CAD-editable) and **PDF** (DIN A1, true scale).

All drawings are generated parametrically from a single source of truth
(`src/params.py`) so geometry, dimensions, title blocks and the Bill of
Materials stay consistent. Re-run `python3 src/generate.py` to rebuild every
file after any parameter change.

## Deliverables (14 drawings = 28 files)

| # | Sheet | Scale | SOLO | DUO |
|---|-------|-------|------|-----|
| 1 | Plan view (top) + Bill of Materials | 1:20 | `SOLO_01-plan` | `DUO_01-plan` |
| 2 | Front elevation | 1:20 | `SOLO_02-front-elevation` | `DUO_02-front-elevation` |
| 3 | Side elevation (left) | 1:20 | `SOLO_03-side-elevation` | `DUO_03-side-elevation` |
| 4 | Exploded isometric + part list | NTS | `SOLO_04-exploded-iso` | `DUO_04-exploded-iso` |
| 5 | Sleeve joint detail (section) | 1:5 | `SOLO_05-joint-detail` | `DUO_05-joint-detail` |
| 6 | Anchor plate detail (plan + section A-A) | 1:5 | `SOLO_06-anchor-detail` | `DUO_06-anchor-detail` |
| 7 | Control box elevation | 1:10 | `SOLO_07-control-box` | `DUO_07-control-box` |

Each sheet exists as `dxf/<name>.dxf` and `pdf/<name>.pdf`. A combined
multi-page PDF per reference is also provided: `pdf/SOLO_ALL_7-sheets.pdf` and
`pdf/DUO_ALL_7-sheets.pdf`.

## Key specifications

| | SOLO | DUO |
|---|------|-----|
| Footprint (L × W) | 5000 × 3000 mm | 6000 × 6000 mm |
| Clearance (underside of roof) | 2200 mm | 2200 mm |
| Roof pitch | 5° single slope, front high → rear drain | same |
| Posts | 4 × 120×120×3 SHS | 6 × 120×120×3 SHS (shared centre column) |
| Beams | 160×80×4 RHS | 160×80×4 RHS |
| Purlins | 4 × 60×40×3 RHS | 4 × 60×40×3 RHS |
| PV modules | 4 (2 col × 2 row) | 8 (4 col × 2 row) |
| Anchors | 4 plates 200×200×8 HDG, 4× M12 each | 6 plates, 4× M12 each |
| Control box | 700×400×300 IP54, 5/10 kWh, 1× 16 A | 900×400×300 IP54, 15 kWh, 2× 16 A |
| Finish | Powder-coat RAL 9005 matte black | same |

Flat-pack logistics: every member > ~2400 mm ships in segments joined by a
300 mm internal sleeve (50 mm engagement each side, 4× M8 A2 per joint) — see
sheet 5. Posts always ship as 2 × 1100 + sleeve.

## Engineering assumptions & deviations (RFQ stage)

These are printed on sheet 1 of each set and must be confirmed before
manufacture:

1. **PV module size 1700 × 1100 mm is a working assumption** — confirm with the
   panel supplier; the panel field and purlin spacing are driven by it.
2. The brief's transverse beam of 3000 mm exceeds the stated 2400 mm shipping
   limit; it is drawn to give a symmetric 100 mm roof overhang and, if it
   exceeds the shipping envelope, should be supplied as 2 × 1500 + sleeve.
3. The 5° slope is created by sloped purlin saddles above level beams so that
   all four (SOLO) / six (DUO) posts are identical 2200 mm assemblies; the
   2200 mm clearance is guaranteed at the low (rear) edge.

## Rebuilding

```bash
pip install ezdxf matplotlib
python3 src/generate.py          # writes dxf/ and pdf/
```

## Source layout

```
solar-carport/
├── src/
│   ├── params.py     # all dimensions / config for SOLO and DUO
│   ├── cadlib.py     # DXF primitives, dimensions, title block, tables
│   ├── bom.py        # Bill of Materials derivation
│   ├── sheets.py     # the 7 sheet builders
│   ├── render.py     # DXF → vector PDF (true A1 scale)
│   └── generate.py   # builds all 14 sheets
├── dxf/              # 14 native DXF files (R2010, mm)
└── pdf/              # 14 + 2 combined PDF files (DIN A1)
```

> Drawings are fabrication-intent at RFQ stage: fully dimensioned and
> material-called-out, but member connections, gutter/flashing details and
> structural calculations (wind/snow per local code) are to be confirmed in
> detailed design.
