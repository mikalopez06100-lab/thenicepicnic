"""
sheets.py — builders for the 7 drawing sheets, parametric over a params dict.

Each builder returns a cadlib.Drawing ready to be written to DXF and rendered
to PDF. Geometry is schematic-but-dimensioned fabrication intent: every brief
requirement (views, scales, dimension chains, callouts, BOM, details) is drawn
and labelled with true model values.
"""
import math
from cadlib import (Drawing, View, border, title_block, sheet_label,
                    north_arrow, table, notes_block, TXT, TXT_S, TXT_L)
from params import panel_xy
import bom as bommod

BEAM_H = 160
BEAM_W = 80
SADDLE = 60
PANEL_T = 40


def roof_model(p):
    """Heights for the sloped roof plane (z linear in y, front y=0 highest)."""
    bt = p["CLEARANCE"] + BEAM_H           # beam top
    W = p["W"]
    rise = W * p["SLOPE"]
    under = lambda y: bt + SADDLE + (W - y) * p["SLOPE"]
    return dict(beam_top=bt, rise=rise, under=under,
                top=lambda y: under(y) + PANEL_T,
                front_top=under(0) + PANEL_T, back_top=under(W) + PANEL_T)


def _frame(p, title, no, scale, size=None):
    d = Drawing(p["sheet"])
    border(d)
    title_block(d, p["name"], title, scale, no, 7, size=size or p["size"])
    sheet_label(d, f"{p['ref']}  -  {title}")
    return d


# ===========================================================================
# SHEET 1 — PLAN VIEW (1:20) + BOM
# ===========================================================================
def sheet_plan(p):
    d = _frame(p, "PLAN VIEW (TOP)", 1, "1:20")
    s = 0.05
    L, W = p["L"], p["W"]
    ox = 70
    oy = d.H - 55 - W * s            # top-align below the header strip
    v = View(d, s, (ox, oy))

    # roof outline (overhang)
    v.rect(0, 0, L, W, layer="ROOF")
    d.text("ROOF OUTLINE (PV + 100 OVERHANG)", v.p(L/2, W), h=TXT_S,
           align="BC", layer="TEXT")

    # beams ----------------------------------------------------------------
    for y in p["long_beam_y"]:
        v.rect(p["long_beam_x"][0], y - BEAM_W/2,
               p["long_beam_x"][1]-p["long_beam_x"][0], BEAM_W, layer="STRUCT")
    for x in p["tran_beam_x"]:
        v.rect(x - BEAM_W/2, p["tran_beam_y"][0], BEAM_W,
               p["tran_beam_y"][1]-p["tran_beam_y"][0], layer="STRUCT")

    # purlins --------------------------------------------------------------
    for y in p["purlin_y"]:
        v.rect(p["purlin_x"][0], y - 20, p["purlin_x"][1]-p["purlin_x"][0],
               40, layer="PURLIN")

    # posts (below beams -> hidden dashed) ---------------------------------
    for x in p["post_x"]:
        for y in p["post_y"]:
            v.rect(x-60, y-60, 120, 120, layer="HIDDEN")
            v.line((x-60, y-60), (x+60, y+60), layer="HIDDEN")
            v.line((x-60, y+60), (x+60, y-60), layer="HIDDEN")

    # panels ---------------------------------------------------------------
    pxx, pyy = panel_xy(p)
    n = 1
    for j, ry in enumerate(p["panel_rows_y"]):
        for i, cx in enumerate(p["panel_cols_x"]):
            v.rect(cx, ry, pxx, pyy, layer="PANEL")
            v.line((cx, ry), (cx+pxx, ry+pyy), layer="PANEL")
            v.text(f"PV{n}", (cx+pxx/2, ry+pyy/2), model_h=260, align="MC",
                   layer="TEXT")
            n += 1

    # control box footprint -------------------------------------------------
    cb = p["ctrlbox"]; cpx, cpy = p["ctrlbox_post"]
    bx = cpx - cb["w"]/2
    by = cpy + 70
    v.rect(bx, by, cb["w"], cb["d"], layer="CTRLBOX")
    d.text("CTRL BOX [13]", v.p(cpx, by+cb["d"]+30), h=TXT_S, align="BC",
           layer="TEXT")

    # north arrow ----------------------------------------------------------
    north_arrow(d, ox + L*s + 26, oy + W*s - 24)

    # dimension chains -----------------------------------------------------
    # bottom: overall L + post spacing
    v.dim_h(0, L, 0, -34, text=f"{L}")
    v.dim_h(p["post_x"][0], p["post_x"][-1], 0, -22,
            text=f"{p['post_x'][-1]-p['post_x'][0]} (POST C/C)")
    v.dim_h(0, p["post_x"][0], 0, -10)
    # left: overall W + post spacing
    v.dim_v(0, W, 0, -30, text=f"{W}")
    v.dim_v(p["post_y"][0], p["post_y"][-1], 0, -18,
            text=f"{p['post_y'][-1]-p['post_y'][0]}")
    # top: panel field + gap
    pf = p["panel_field"]
    v.dim_h(pf[0], pf[0]+pxx, W, 14, text=f"{pxx:.0f}")
    if len(p["panel_cols_x"]) > 1:
        g = p["panel_cols_x"][1]-(p["panel_cols_x"][0]+pxx)
        v.dim_h(p["panel_cols_x"][0]+pxx, p["panel_cols_x"][1], W, 14,
                text=f"{g:.0f}")
    # right: panel row + gap
    v.dim_v(pf[1], pf[1]+pyy, L, 14, text=f"{pyy:.0f}")

    # BOM table ------------------------------------------------------------
    rows, joints, m8 = bommod.compute(p)
    headers = ["REF", "DESCRIPTION", "QTY", "MATERIAL", "LEN"]
    col_w = [11, 100, 13, 50, 18]
    bom_top = oy - 52
    table(d, 30, bom_top, headers, rows, col_w, row_h=5.2, h=1.8,
          title="BILL OF MATERIALS (BOM)", header_h=6.0)

    notes_block(d, 245, bom_top, [
        f"- All profiles: extruded aluminium, {p['RAL']}.",
        f"- Sleeve joints: {joints} total, 4x M8 A2 per joint, mid-span.",
        f"- Anchor: 4x M12 per {p['ANCHOR_PLATE']['w']}x{p['ANCHOR_PLATE']['d']}"
        f"x{p['ANCHOR_PLATE']['t']} HDG steel plate.",
        "- Dimensions in mm. Hidden items (posts) shown dashed.",
        "- Roof slope 5 deg, drains front -> rear.",
        "- ASSUMPTIONS / DEVIATIONS:",
    ], title="NOTES")
    from params import DEVIATIONS
    yy = bom_top - 30
    for ln in DEVIATIONS:
        d.text("   " + ln, (245, yy), h=1.6, align="ML", layer="TEXT")
        yy -= 4.4
    return d


# ===========================================================================
# SHEET 2 — FRONT ELEVATION (1:20)
# ===========================================================================
def sheet_front(p):
    d = _frame(p, "FRONT ELEVATION", 2, "1:20")
    s = 0.05
    L = p["L"]
    rm = roof_model(p)
    ox = (d.W - L * s) / 2
    oy = 230
    v = View(d, s, (ox, oy))

    # ground line
    d.line(v.p(-300, 0), v.p(L+300, 0), layer="GROUND")
    for gx in range(-200, int(L)+300, 240):
        d.line(v.p(gx, 0), v.p(gx-120, -120), layer="GROUND")

    bt = rm["beam_top"]
    front_top = rm["front_top"]
    # posts (front row; rear row directly behind -> dashed offset hint)
    for x in p["post_x"]:
        v.rect(x-60, 0, 120, p["CLEARANCE"], layer="STRUCT")
        # rear post hidden behind
        v.rect(x-60, 0, 120, p["CLEARANCE"], layer="HIDDEN")
    # front longitudinal beam
    v.rect(p["long_beam_x"][0], p["CLEARANCE"],
           p["long_beam_x"][1]-p["long_beam_x"][0], BEAM_H, layer="STRUCT")
    # roof / panel front edge (high side), shown as thin band
    fx0, fx1 = p["long_beam_x"]
    v.poly([(fx0-100, front_top-PANEL_T), (fx1+100, front_top-PANEL_T),
            (fx1+100, front_top), (fx0-100, front_top)], layer="PANEL")
    d.text("PV PANEL FRONT EDGE (HIGH)", v.p(L/2, front_top+120), h=TXT_S,
           align="BC", layer="TEXT")

    # anchor plates + bolts
    ap = p["ANCHOR_PLATE"]
    for x in p["post_x"]:
        v.rect(x-ap["w"]/2, -ap["t"], ap["w"], ap["t"], layer="ANCHOR")
        for bx in (x-70, x+70):
            v.line((bx, -ap["t"]), (bx, -140), layer="ANCHOR")

    # control box on rear-right post (dashed, behind)
    cb = p["ctrlbox"]; cpx = p["ctrlbox_post"][0]
    v.rect(cpx-cb["w"]/2, cb["sill"], cb["w"], cb["h"], layer="HIDDEN")
    d.text("CTRL BOX [13] (REAR, DASHED)", v.p(cpx, cb["sill"]-90), h=TXT_S,
           align="TC", layer="TEXT")

    # dimensions
    v.dim_v(0, p["CLEARANCE"], -300, -16, text=f"{p['CLEARANCE']} CLEAR")
    v.dim_v(0, front_top, L+300, 18, text=f"{front_top:.0f} (HIGH PT)")
    v.dim_v(p["CLEARANCE"], p["CLEARANCE"]+BEAM_H, L+300, 6, text=f"{BEAM_H}")
    v.dim_h(0, L, 0, -34, text=f"{L}")
    v.dim_h(p["post_x"][0], p["post_x"][-1], 0, -22,
            text=f"{p['post_x'][-1]-p['post_x'][0]}")
    v.dim_h(p["long_beam_x"][0], 0, 0, -10, text=f"{p['long_beam_x'][0]:.0f}")

    d.text("NOTE: 4 posts @ 2x1100 + sleeve = 2200. Slope shown in SIDE ELEV. "
           "Control box & rear posts dashed (hidden behind front plane).",
           (30, 90), h=TXT_S, align="ML", layer="TEXT")
    return d


# ===========================================================================
# SHEET 3 — SIDE ELEVATION (1:20)
# ===========================================================================
def sheet_side(p):
    d = _frame(p, "SIDE ELEVATION (LEFT)", 3, "1:20")
    s = 0.05
    W = p["W"]
    rm = roof_model(p)
    ox = (d.W - W * s) / 2
    oy = 200
    v = View(d, s, (ox, oy))

    # ground
    d.line(v.p(-300, 0), v.p(W+300, 0), layer="GROUND")
    for gy in range(-200, int(W)+300, 240):
        d.line(v.p(gy, 0), v.p(gy-120, -120), layer="GROUND")

    # posts (front y small, back y large)
    for y in p["post_y"]:
        v.rect(y-60, 0, 120, p["CLEARANCE"], layer="STRUCT")
    # transverse beam edge -> spans, level
    v.rect(p["tran_beam_y"][0], p["CLEARANCE"],
           p["tran_beam_y"][1]-p["tran_beam_y"][0], BEAM_H, layer="STRUCT")

    bt = rm["beam_top"]
    # sloped saddles + panel plane
    def topz(y): return rm["top"](y)
    def undz(y): return rm["under"](y)
    # saddle wedges at front/back
    v.poly([(p["tran_beam_y"][0], bt), (p["tran_beam_y"][0], undz(p["tran_beam_y"][0])),
            (p["tran_beam_y"][0]+200, bt)], layer="STRUCT")
    v.poly([(p["tran_beam_y"][1], bt), (p["tran_beam_y"][1], undz(p["tran_beam_y"][1])),
            (p["tran_beam_y"][1]-200, bt)], layer="STRUCT")

    # panels as sloped segments (rows) with gaps
    pxx, pyy = panel_xy(p)
    for ry in p["panel_rows_y"]:
        y0, y1 = ry, ry+pyy
        v.poly([(y0, undz(y0)), (y1, undz(y1)), (y1, topz(y1)), (y0, topz(y0))],
               layer="PANEL")
    # purlins edge-on
    for y in p["purlin_y"]:
        v.rect(y-30, undz(y)-40, 60, 40, layer="PURLIN")

    # slope angle annotation
    yA = p["tran_beam_y"][0]
    d.line(v.p(yA-50, undz(yA)), v.p(yA+700, undz(yA)), layer="DIM")
    d.text(f"{p['SLOPE_DEG']:.0f} deg", v.p(yA+360, undz(yA)+90), h=TXT,
           align="MC", layer="TEXT")
    d.text("FRONT (HIGH)", v.p(p["tran_beam_y"][0], topz(p["tran_beam_y"][0])),
           h=TXT_S, align="BC", layer="TEXT")
    d.text("REAR (LOW) -> DRAIN", v.p(p["tran_beam_y"][1], topz(p["tran_beam_y"][1])),
           h=TXT_S, align="BC", layer="TEXT")

    # dimensions
    v.dim_v(0, p["CLEARANCE"], -300, -16, text=f"{p['CLEARANCE']} CLEAR")
    v.dim_h(0, W, 0, -30, text=f"{W} (ROOF DEPTH)")
    v.dim_h(p["post_y"][0], p["post_y"][-1], 0, -18,
            text=f"{p['post_y'][-1]-p['post_y'][0]}")
    # panel rows
    for ry in p["panel_rows_y"]:
        v.dim_h(ry, ry+pyy, W, 14, text=f"{pyy:.0f}")
    v.dim_v(rm["back_top"], rm["front_top"], W+300, 16,
            text=f"RISE {rm['front_top']-rm['back_top']:.0f}")

    d.text("Single 5 deg slope, front higher than rear; rainwater drains to "
           "rear gutter line. Purlins on sloped saddles above level beams.",
           (30, 90), h=TXT_S, align="ML", layer="TEXT")
    return d


# ===========================================================================
# SHEET 4 — EXPLODED ISOMETRIC (no scale) + PART LIST
# ===========================================================================
class Iso:
    def __init__(self, d, scale, origin):
        self.d = d; self.s = scale; self.ox, self.oy = origin
        self.ca = math.cos(math.radians(30)); self.sa = math.sin(math.radians(30))

    def pr(self, x, y, z):
        sx = (x - y) * self.ca
        sy = (x + y) * self.sa + z
        return (self.ox + sx*self.s, self.oy + sy*self.s)

    def box(self, x, y, z, dx, dy, dz, layer="STRUCT"):
        P = self.pr
        # top
        self.d.pline([P(x,y,z+dz), P(x+dx,y,z+dz), P(x+dx,y+dy,z+dz),
                      P(x,y+dy,z+dz)], close=True, layer=layer)
        # front (y)
        self.d.pline([P(x,y,z), P(x+dx,y,z), P(x+dx,y,z+dz), P(x,y,z+dz)],
                     close=True, layer=layer)
        # right (x)
        self.d.pline([P(x+dx,y,z), P(x+dx,y+dy,z), P(x+dx,y+dy,z+dz),
                      P(x+dx,y,z+dz)], close=True, layer=layer)

    def lbl(self, x, y, z, ref, txt_to):
        pa = self.pr(x, y, z)
        self.d.line(pa, txt_to, layer="LEADER")
        self.d.circle(txt_to, 3.2, layer="LEADER")
        self.d.text(ref, txt_to, h=2.0, align="MC", layer="TEXT")


def sheet_iso(p):
    d = _frame(p, "EXPLODED ISOMETRIC", 4, "NTS")
    iso = Iso(d, 0.030, (470, 250))
    L, W = p["L"], p["W"]
    rm = roof_model(p)

    EXP = 1.0   # explosion gap multiplier (mm)
    base = 0
    # ground / anchor level
    for x in p["post_x"]:
        for y in p["post_y"]:
            iso.box(x-100, y-100, base-180, 200, 200, 60, layer="ANCHOR")
    # posts (exploded slightly up)
    pz = 350
    for x in p["post_x"]:
        for y in p["post_y"]:
            iso.box(x-60, y-60, pz, 120, 120, p["CLEARANCE"], layer="STRUCT")
    # beams exploded above posts
    bz = pz + p["CLEARANCE"] + 500
    for y in p["long_beam_y"]:
        iso.box(p["long_beam_x"][0], y-40, bz,
                p["long_beam_x"][1]-p["long_beam_x"][0], 80, 160, layer="STRUCT")
    for x in p["tran_beam_x"]:
        iso.box(x-40, p["tran_beam_y"][0], bz+200, 80,
                p["tran_beam_y"][1]-p["tran_beam_y"][0], 160, layer="STRUCT")
    # purlins exploded higher
    uz = bz + 900
    for y in p["purlin_y"]:
        iso.box(p["purlin_x"][0], y-20, uz, p["purlin_x"][1]-p["purlin_x"][0],
                40, 60, layer="PURLIN")
    # panels top
    tz = uz + 700
    pxx, pyy = panel_xy(p)
    for ry in p["panel_rows_y"]:
        for cx in p["panel_cols_x"]:
            iso.box(cx, ry, tz, pxx, pyy, 40, layer="PANEL")
    # control box
    cb = p["ctrlbox"]; cpx, cpy = p["ctrlbox_post"]
    iso.box(cpx+200, cpy-cb["w"]/2, 800, cb["d"], cb["w"], cb["h"], layer="CTRLBOX")

    # assembly arrows (vertical dashed up the centre)
    cxm, cym = L/2, W/2
    for z0, z1 in [(base, pz), (pz+p["CLEARANCE"], bz), (bz+160, uz),
                   (uz+60, tz)]:
        a = iso.pr(cxm, cym, z0+50); b = iso.pr(cxm, cym, z1-50)
        d.line(a, b, layer="HIDDEN")
        d._arrow(b, ((b[0]-a[0])/(math.hypot(b[0]-a[0], b[1]-a[1]) or 1),
                     (b[1]-a[1])/(math.hypot(b[0]-a[0], b[1]-a[1]) or 1)),
                 layer="HIDDEN")

    # reference balloons
    iso.lbl(p["post_x"][0]-60, p["post_y"][0]-60, pz+1000, "01", (120, 360))
    iso.lbl(p["long_beam_x"][0], p["long_beam_y"][0], bz+80, "02", (120, 400))
    iso.lbl(p["tran_beam_x"][0], p["tran_beam_y"][0], bz+240, "03", (120, 430))
    iso.lbl(p["purlin_x"][0], p["purlin_y"][0], uz+30, "04", (120, 460))
    iso.lbl(p["panel_cols_x"][0], p["panel_rows_y"][0], tz+40, "09", (120, 500))
    iso.lbl(p["post_x"][0]-100, p["post_y"][0]-100, base-150, "06", (120, 320))
    iso.lbl(cpx+200, cpy, 1000, "13", (760, 300))

    d.text("EXPLODED ASSEMBLY - sequence: 06 anchors -> 01 posts (+05 sleeves) "
           "-> 02/03 beams -> 04 purlins (+12 saddles) -> 09 panels (+10/11 "
           "clamps) -> 13 control box.", (30, 560), h=TXT_S, align="ML",
           layer="TEXT")

    # part list (compact)
    rows, joints, m8 = bommod.compute(p)
    plist = [(r[0], r[1][:42], r[2], r[3][:18]) for r in rows]
    table(d, 30, 210, ["REF", "DESCRIPTION", "QTY", "MATERIAL"],
          plist, [11, 90, 13, 44], row_h=5.0, h=1.7,
          title="PART LIST", header_h=6.0)
    return d


# ===========================================================================
# SHEET 5 — JOINT DETAIL (1:5)
# ===========================================================================
def sheet_joint(p):
    d = _frame(p, "SLEEVE JOINT DETAIL", 5, "1:5")
    s = 0.2
    ox, oy = 130, 320
    v = View(d, s, (ox, oy))
    a, b = p["BEAM"]["a"], p["BEAM"]["b"]   # use beam profile as example
    ov = p["SLEEVE_OVERLAP"]; sl = p["SLEEVE_LEN"]
    # two profile sections meeting at mid (gap exaggerated 0 -> butt)
    seg = 360
    # left section
    v.rect(-seg, 0, seg, a, layer="STRUCT")
    # right section
    v.rect(0, 0, seg, a, layer="STRUCT")
    # internal sleeve (hidden) spanning the joint
    v.rect(-sl/2, 12, sl, a-24, layer="HIDDEN")
    v.hatch([(-sl/2, 12), (sl/2, 12), (sl/2, a-12), (-sl/2, a-12)],
            pattern="ANSI31", scale=6)
    # joint centreline
    d.line(v.p(0, -30), v.p(0, a+30), layer="CENTER")
    # bolts: 2 each side
    bolt_x = [-ov-40, -ov-110, ov+40, ov+110]
    for bxv in bolt_x:
        v.circle((bxv, a/2), 8, layer="ANCHOR")
        v.line((bxv, -8), (bxv, a+8), layer="ANCHOR")
    # alignment mark
    v.line((-18, a+6), (-18, a+34), layer="DIM")
    v.line((18, a+6), (18, a+34), layer="DIM")
    d.text("ALIGNMENT MARK", v.p(0, a+44), h=TXT_S, align="BC", layer="TEXT")

    # dims
    v.dim_h(-ov, ov, 0, -16, text=f"2x{ov} OVERLAP")
    v.dim_h(-sl/2, sl/2, a, 16, text=f"SLEEVE {sl}")
    v.dim_v(0, a, -seg, -14, text=f"{a}")
    v.dim_h(bolt_x[1], bolt_x[0], 0, -30)
    d.text("PROFILE WALL t = " + str(p["BEAM"]["t"]), v.p(-seg/2, a/2),
           h=TXT_S, align="MC", layer="TEXT")

    notes_block(d, 470, 380, [
        "- Internal sleeve = same/profile-matched section x 300 mm.",
        "- 4x M8 A2-70 stainless per joint (2 each side).",
        "- 50 mm engagement (overlap) each side of joint centre.",
        "- Joint located at member mid-span.",
        "- Align factory index marks before torquing (22 Nm).",
        "- Same principle for posts (120x120) & purlins (60x40).",
    ], title="SLEEVE JOINT - NOTES")
    d.text("SECTION THROUGH SLEEVED JOINT (beam 160x80 shown; typ.)",
           (130, 230), h=TXT_S, align="ML", layer="TEXT")
    return d


# ===========================================================================
# SHEET 6 — ANCHOR PLATE DETAIL (1:5)
# ===========================================================================
def sheet_anchor(p):
    d = _frame(p, "ANCHOR PLATE DETAIL", 6, "1:5")
    s = 0.2
    ap = p["ANCHOR_PLATE"]; ps = p["POST"]["a"]
    # ---- plan of plate ----
    vx, vy = 150, 330
    v = View(d, s, (vx, vy))
    v.rect(0, 0, ap["w"], ap["d"], layer="ANCHOR")
    # post footprint
    pc = (ap["w"]/2, ap["d"]/2)
    v.rect(pc[0]-ps/2, pc[1]-ps/2, ps, ps, layer="STRUCT")
    # 4 bolt holes
    e = 35
    holes = [(e, e), (ap["w"]-e, e), (e, ap["d"]-e), (ap["w"]-e, ap["d"]-e)]
    for h in holes:
        v.circle(h, 13, layer="HIDDEN")
        d.line(v.p(h[0]-22, h[1]), v.p(h[0]+22, h[1]), layer="CENTER")
        d.line(v.p(h[0], h[1]-22), v.p(h[0], h[1]+22), layer="CENTER")
    v.dim_h(0, ap["w"], 0, -16, text=f"{ap['w']}")
    v.dim_v(0, ap["d"], 0, -16, text=f"{ap['d']}")
    v.dim_h(e, ap["w"]-e, ap["d"], 14, text=f"{ap['w']-2*e}")
    v.dim_v(e, ap["d"]-e, ap["w"], 14, text=f"{ap['d']-2*e}")
    d.text("PLAN", v.p(ap["w"]/2, ap["d"]+60), h=TXT, align="BC", layer="TEXT")
    d.text("M12 (x4)", v.p(holes[0][0]-10, holes[0][1]-10), h=TXT_S,
           align="MR", layer="TEXT")

    # ---- section ----
    vx2 = 520
    v2 = View(d, s, (vx2, 330))
    # concrete footing
    v2.fill([(-120, -350), (ap["w"]+120, -350), (ap["w"]+120, 0), (-120, 0)],
            color=9)
    v2.hatch([(-120, -350), (ap["w"]+120, -350), (ap["w"]+120, 0), (-120, 0)],
             pattern="ANSI32", scale=10)
    d.text("CONCRETE FOOTING 400x400x500 C25/30",
           v2.p(ap["w"]/2, -360), h=TXT_S, align="TC", layer="TEXT")
    # plate
    v2.rect(0, 0, ap["w"], ap["t"], layer="ANCHOR")
    # post on plate (stub, broken)
    stub = 430
    v2.rect(ap["w"]/2-ps/2, ap["t"], ps, stub, layer="STRUCT")
    d.text("POST 120x120", v2.p(ap["w"]/2+ps, ap["t"]+stub*0.6), h=TXT_S,
           align="ML", layer="TEXT")
    # anchor bolts into concrete
    for hx in (35, ap["w"]-35):
        v2.line((hx, ap["t"]), (hx, -260), layer="ANCHOR")
        v2.rect(hx-9, ap["t"], 18, 14, layer="ANCHOR")   # nut/washer
        v2.line((hx-30, -260), (hx+30, -260), layer="ANCHOR")  # resin anchor end
    v2.dim_v(0, ap["t"], 0, -14, text=f"PL {ap['t']}")
    v2.dim_v(-260, 0, ap["w"], 16, text="260 EMBED")
    d.text("SECTION A-A", v2.p(ap["w"]/2, stub+120), h=TXT, align="BC",
           layer="TEXT")

    notes_block(d, 150, 200, [
        f"- Plate {ap['w']}x{ap['d']}x{ap['t']} mm, steel S235 hot-dip galvanised.",
        "- 4x M12 anchor bolts + chemical resin into C25/30 footing.",
        "- Post welded/bolted to plate via 4x M10 + base gusset.",
        "- Footing min 400x400x500 mm; frost depth per local code.",
        "- Grout 20 mm under plate; level before final torque (60 Nm).",
        "- Isolate alu/steel contact (EPDM pad) to avoid galvanic corrosion.",
    ], title="ANCHOR - NOTES")
    return d


# ===========================================================================
# SHEET 7 — CONTROL BOX ELEVATION (1:10)
# ===========================================================================
def sheet_ctrlbox(p):
    d = _frame(p, "CONTROL BOX ELEVATION", 7, "1:10")
    s = 0.1
    cb = p["ctrlbox"]
    # mounted on post elevation
    ox, oy = 230, 150
    v = View(d, s, (ox, oy))
    # ground + post
    d.line(v.p(-200, 0), v.p(600, 0), layer="GROUND")
    v.rect(-60, 0, 120, p["CLEARANCE"], layer="STRUCT")
    d.text("REAR POST 120x120", v.p(0, p["CLEARANCE"]), h=TXT_S, align="BC",
           layer="TEXT")
    # box body
    bx = 120   # offset from post centre to box left
    v.rect(bx, cb["sill"], cb["w"], cb["h"], layer="CTRLBOX")
    # door (front-opening, hinge left) swing arc
    d.line(v.p(bx, cb["sill"]), v.p(bx-180, cb["sill"]+cb["h"]/2), layer="HIDDEN")
    d.text("DOOR SWING ->", v.p(bx-90, cb["sill"]+cb["h"]/2), h=TXT_S,
           align="MC", layer="TEXT")
    # display window
    v.rect(bx+cb["w"]-220, cb["sill"]+cb["h"]-150, 160, 90, layer="STRUCT")
    d.text("DISPLAY", v.p(bx+cb["w"]-140, cb["sill"]+cb["h"]-105), h=TXT_S,
           align="MC", layer="TEXT")
    # AC outlet(s) 16A
    for k in range(cb["outlets"]):
        oxk = bx + 120 + k*200
        v.circle((oxk, cb["sill"]+120), 35, layer="STRUCT")
        d.text("16A", v.p(oxk, cb["sill"]+120), h=1.6, align="MC",
               layer="TEXT")
    # cable entry (bottom glands)
    for cxk in (bx+120, bx+cb["w"]-120):
        v.circle((cxk, cb["sill"]), 22, layer="ANCHOR")
        v.line((cxk, cb["sill"]), (cxk, cb["sill"]-120), layer="ANCHOR")
    d.text("CABLE GLANDS (DC in / AC out / earth)", v.p(bx+cb["w"]/2, cb["sill"]-150),
           h=TXT_S, align="TC", layer="TEXT")
    # mounting brackets to post
    for my in (cb["sill"]+60, cb["sill"]+cb["h"]-60):
        v.line((60, my), (bx, my), layer="STRUCT")

    # dims
    v.dim_h(bx, bx+cb["w"], cb["sill"], 14, text=f"{cb['w']}")
    v.dim_v(cb["sill"], cb["sill"]+cb["h"], bx+cb["w"], 14, text=f"{cb['h']}")
    v.dim_v(0, cb["sill"], bx, 18, text=f"{cb['sill']} SILL")
    v.dim_v(0, p["CLEARANCE"], -200, -16, text=f"{p['CLEARANCE']}")

    notes_block(d, 560, 330, [
        f"- Enclosure {cb['w']}x{cb['h']}x{cb['d']} mm, IP54, lockable.",
        "- Front-opening door, hinge LH, lock RH.",
        f"- Houses hybrid inverter + {cb['kwh']} battery + display.",
        f"- {cb['outlets']} x 16A AC outlet (1 per bay).",
        "- Bottom cable glands: DC string in, AC out, earth.",
        f"- Mounted on rear-right post, sill {cb['sill']} mm AFG.",
        "- 2x stainless brackets to post; M8 fixings.",
    ], title="CONTROL BOX - NOTES")
    d.text(f"DEPTH (D) = {cb['d']} mm (see plan).", (230, 110), h=TXT_S,
           align="ML", layer="TEXT")
    return d


BUILDERS = [sheet_plan, sheet_front, sheet_side, sheet_iso, sheet_joint,
            sheet_anchor, sheet_ctrlbox]
