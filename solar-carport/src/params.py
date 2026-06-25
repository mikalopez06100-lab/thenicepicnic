"""
params.py — Engineering parameters for the two carport references.

All values in millimetres unless noted. Geometry is derived from the brief; a
few brief figures are mutually inconsistent (e.g. transverse beam 3000 vs.
100 mm symmetric overhang on a 3000 mm footprint). Where that happens we pick
the self-consistent value and record the deviation in DEVIATIONS so it can be
printed on the drawings as an honest engineering note.
"""
import math

SLOPE_DEG = 5.0
SLOPE = math.tan(math.radians(SLOPE_DEG))

# Cross sections (profile, mm) ------------------------------------------------
POST = dict(a=120, b=120, t=3)          # square hollow section
BEAM = dict(a=160, b=80, t=4)           # rectangular hollow section (h x w)
PURLIN = dict(a=60, b=40, t=3)
SLEEVE_OVERLAP = 50                      # mm engagement each side at sleeve
SLEEVE_LEN = 300                         # internal sleeve length
ANCHOR_PLATE = dict(w=200, d=200, t=8)   # steel, hot-dip galvanised
PANEL = dict(L=1700, W=1100, t=40)       # working assumption (confirm in RFQ)
PANEL_GAP = 20
EDGE_CLEAR = 50
OVERHANG = 100
CLEARANCE = 2200                         # underside of roof (min, at low edge)

RAL = "RAL 9005 matte black (powder-coat)"

DEVIATIONS = [
    "Panel size 1700x1100 mm is a WORKING ASSUMPTION - confirm with supplier (RFQ).",
    "Brief transverse beam = 3000 mm single section. Drawn at width to give a",
    "  symmetric 100 mm roof overhang; if >2400 mm shipping limit, supply 2x1500 + sleeve.",
    "5 deg single slope created by sloped purlin saddles above level beams;",
    "  clearance 2200 mm guaranteed at the LOW (rear) edge.",
]


def _common():
    return dict(
        POST=POST, BEAM=BEAM, PURLIN=PURLIN, PANEL=dict(PANEL),
        SLOPE_DEG=SLOPE_DEG, SLOPE=SLOPE, CLEARANCE=CLEARANCE,
        OVERHANG=OVERHANG, PANEL_GAP=PANEL_GAP, RAL=RAL,
        ANCHOR_PLATE=ANCHOR_PLATE, SLEEVE_OVERLAP=SLEEVE_OVERLAP,
        SLEEVE_LEN=SLEEVE_LEN,
    )


def solo():
    L, W = 5000, 3000
    p = _common()
    p.update(name="CARPORT SOLO", ref="SOLO", L=L, W=W)
    # post centre lines (x along length, y along depth)
    inset = 200
    p["post_x"] = [inset, L - inset]            # 200, 4800
    p["post_y"] = [inset, W - inset]            # 200, 2800
    p["n_posts"] = 4
    # beams: front/back run along X over post rows; left/right run along Y
    p["long_beam_len"] = 4800                   # 2 x 2400 + sleeve
    p["tran_beam_len"] = 2800                   # see DEVIATIONS
    p["long_beam_y"] = list(p["post_y"])        # front=200, back=2800
    p["tran_beam_x"] = list(p["post_x"])
    p["long_beam_x"] = [(L - 4800) / 2, (L + 4800) / 2]   # 100..4900
    p["tran_beam_y"] = [(W - 2800) / 2, (W + 2800) / 2]   # 100..2900
    # PV field: 2 columns (X) x 2 rows (Y); panel long side 1700 along X
    pl, pw, g = PANEL["L"], PANEL["W"], PANEL_GAP
    fx = 2 * pl + g
    fy = 2 * pw + g
    x0 = (L - fx) / 2
    y0 = (W - fy) / 2
    p["panel_cols_x"] = [x0, x0 + pl + g]       # left edges of the 2 columns
    p["panel_rows_y"] = [y0, y0 + pw + g]       # bottom edges of the 2 rows
    p["panel_field"] = (x0, y0, fx, fy)
    # purlins run along X, two per panel row (near each long edge), inset 120
    pin = 120
    p["purlin_y"] = []
    for ry in p["panel_rows_y"]:
        p["purlin_y"] += [ry + pin, ry + pw - pin]
    p["n_purlins"] = 4
    p["purlin_x"] = [(L - 4800) / 2, (L + 4800) / 2]
    p["purlin_len"] = 4800
    # control box on rear-right post
    p["ctrlbox"] = dict(w=700, h=400, d=300, sill=800, kwh="5 / 10 kWh",
                        outlets=1)
    p["ctrlbox_post"] = (p["post_x"][1], p["post_y"][1])   # rear-right
    p["sheet"] = (841.0, 594.0)
    p["size"] = "A1"
    return p


def duo():
    L, W = 6000, 6000
    p = _common()
    p.update(name="CARPORT DUO", ref="DUO", L=L, W=W)
    inset = 250
    p["post_x"] = [inset, L / 2, L - inset]     # 3 columns (shared centre)
    p["post_y"] = [inset, W - inset]
    p["n_posts"] = 6
    p["long_beam_len"] = 5800                   # 100 overhang each end
    p["tran_beam_len"] = 5800
    p["long_beam_y"] = list(p["post_y"])
    p["tran_beam_x"] = list(p["post_x"])
    p["long_beam_x"] = [(L - 5800) / 2, (L + 5800) / 2]
    p["tran_beam_y"] = [(W - 5800) / 2, (W + 5800) / 2]
    # PV field: 8 panels. Optimise: 4 columns (X) x 2 rows (Y),
    # panel long side 1700 along Y so rows fit 6000 depth.
    pl, pw, g = PANEL["L"], PANEL["W"], PANEL_GAP
    # columns use panel WIDTH(1100) along X; rows use panel LENGTH(1700) along Y
    ncol, nrow = 4, 2
    fx = ncol * pw + (ncol - 1) * g
    fy = nrow * pl + (nrow - 1) * g
    x0 = (L - fx) / 2
    y0 = (W - fy) / 2
    p["panel_cols_x"] = [x0 + i * (pw + g) for i in range(ncol)]
    p["panel_rows_y"] = [y0 + j * (pl + g) for j in range(nrow)]
    p["panel_dims_xy"] = (pw, pl)               # X-extent, Y-extent per panel
    p["panel_field"] = (x0, y0, fx, fy)
    p["n_panels"] = 8
    # purlins run along X; 2 per row (each row 1700 deep) -> 4 purlins
    pin = 150
    p["purlin_y"] = []
    for ry in p["panel_rows_y"]:
        p["purlin_y"] += [ry + pin, ry + pl - pin]
    p["n_purlins"] = 4
    p["purlin_x"] = [(L - 5800) / 2, (L + 5800) / 2]
    p["purlin_len"] = 5800
    p["ctrlbox"] = dict(w=900, h=400, d=300, sill=800, kwh="15 kWh",
                        outlets=2)
    p["ctrlbox_post"] = (p["post_x"][2], p["post_y"][1])
    p["sheet"] = (841.0, 594.0)
    p["size"] = "A1"
    return p


# panel X-extent / Y-extent helper (SOLO: 1700 x 1100; DUO: 1100 x 1700)
def panel_xy(p):
    if "panel_dims_xy" in p:
        return p["panel_dims_xy"]
    return (PANEL["L"], PANEL["W"])
