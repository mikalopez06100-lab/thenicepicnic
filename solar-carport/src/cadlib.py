"""
cadlib.py — Shared technical-drawing primitives for the solar carport drawing set.

All geometry is authored in PAPER millimetres (the sheet is an A2: 594 x 420 mm).
A `View` maps real-world model millimetres to paper millimetres through a scale
factor (e.g. 1:20 -> scale = 1/20) plus a paper-space origin offset, so several
views at different scales can coexist on one sheet.

Dimensions are drawn as explicit primitives (extension lines + dimension line +
solid arrowheads + text) and always carry the TRUE model measurement, computed
from the real coordinates regardless of the drawing scale.
"""
from __future__ import annotations
import math
import ezdxf
from ezdxf.enums import TextEntityAlignment

# ----------------------------------------------------------------------------
# Sheet / style constants
# ----------------------------------------------------------------------------
A2 = (594.0, 420.0)          # DIN A2 landscape, mm
A1 = (841.0, 594.0)          # DIN A1 landscape, mm
MARGIN = 10.0                # outer border margin, mm

TXT = 2.5                    # default dimension text height, mm (paper)
TXT_S = 1.8                  # small text
TXT_L = 3.5                  # large / labels
ARROW = 2.2                  # arrowhead length, mm (paper)

# Layer table: name -> (aci_color, linetype)
LAYERS = {
    "BORDER":     (7,   "CONTINUOUS"),
    "TITLE":      (7,   "CONTINUOUS"),
    "STRUCT":     (5,   "CONTINUOUS"),   # blue   - primary structure (posts/beams)
    "PURLIN":     (3,   "CONTINUOUS"),   # green  - purlins / secondary
    "PANEL":      (4,   "CONTINUOUS"),   # cyan   - PV panels
    "ROOF":       (6,   "CONTINUOUS"),   # magenta- roof outline
    "ANCHOR":     (1,   "CONTINUOUS"),   # red    - anchors / steel
    "CTRLBOX":    (30,  "CONTINUOUS"),   # orange - control box
    "DIM":        (8,   "CONTINUOUS"),   # grey   - dimensions
    "TEXT":       (7,   "CONTINUOUS"),
    "HIDDEN":     (252, "DASHED"),       # hidden lines, dashed
    "CENTER":     (251, "CENTER"),       # centre lines
    "HATCH":      (9,   "CONTINUOUS"),
    "GROUND":     (8,   "CONTINUOUS"),
    "LEADER":     (7,   "CONTINUOUS"),
}


def new_doc():
    """Create a fresh DXF document with layers, linetypes and a text style."""
    doc = ezdxf.new("R2010", setup=True)
    doc.header["$INSUNITS"] = 4          # millimetres
    doc.header["$MEASUREMENT"] = 1       # metric
    for name, (color, ltype) in LAYERS.items():
        if ltype not in doc.linetypes:
            ltype = "CONTINUOUS"
        lay = doc.layers.add(name) if name not in doc.layers else doc.layers.get(name)
        lay.color = color
        lay.dxf.linetype = ltype
    if "ARIAL" not in doc.styles:
        doc.styles.add("ARIAL", font="arial.ttf")
    return doc


class Drawing:
    """Thin wrapper around a DXF modelspace with convenience helpers."""

    def __init__(self, sheet=A2):
        self.doc = new_doc()
        self.msp = self.doc.modelspace()
        self.W, self.H = sheet

    # -- low level paper-space primitives -----------------------------------
    def line(self, p1, p2, layer="STRUCT", lw=None):
        attr = {"layer": layer}
        if lw is not None:
            attr["lineweight"] = lw
        self.msp.add_line(p1, p2, dxfattribs=attr)

    def pline(self, pts, layer="STRUCT", close=False, lw=None):
        attr = {"layer": layer}
        if lw is not None:
            attr["lineweight"] = lw
        self.msp.add_lwpolyline(pts, close=close, dxfattribs=attr)

    def rect(self, x, y, w, h, layer="STRUCT", close=True, lw=None):
        self.pline([(x, y), (x + w, y), (x + w, y + h), (x, y + h)],
                   layer=layer, close=close, lw=lw)

    def circle(self, c, r, layer="STRUCT"):
        self.msp.add_circle(c, r, dxfattribs={"layer": layer})

    def text(self, s, p, h=TXT, layer="TEXT", align="LEFT", rot=0.0):
        al = {
            "LEFT": TextEntityAlignment.LEFT,
            "CENTER": TextEntityAlignment.MIDDLE_CENTER,
            "MC": TextEntityAlignment.MIDDLE_CENTER,
            "ML": TextEntityAlignment.MIDDLE_LEFT,
            "BC": TextEntityAlignment.BOTTOM_CENTER,
            "TC": TextEntityAlignment.TOP_CENTER,
            "BL": TextEntityAlignment.BOTTOM_LEFT,
            "BR": TextEntityAlignment.BOTTOM_RIGHT,
            "MR": TextEntityAlignment.MIDDLE_RIGHT,
        }[align]
        t = self.msp.add_text(s, dxfattribs={
            "height": h, "layer": layer, "style": "ARIAL", "rotation": rot})
        t.set_placement(p, align=al)
        return t

    def solid_tri(self, p1, p2, p3, layer="DIM"):
        self.msp.add_solid([p1, p2, p3, p3], dxfattribs={"layer": layer})

    def hatch(self, pts, layer="HATCH", pattern="ANSI31", scale=2.0, color=8):
        h = self.msp.add_hatch(color=color, dxfattribs={"layer": layer})
        h.set_pattern_fill(pattern, scale=scale)
        h.paths.add_polyline_path(pts, is_closed=True)
        return h

    def fill(self, pts, color=8, layer="HATCH"):
        h = self.msp.add_hatch(color=color, dxfattribs={"layer": layer})
        h.paths.add_polyline_path(pts, is_closed=True)
        return h

    # -- dimensions ----------------------------------------------------------
    def _arrow(self, tip, along, layer="DIM"):
        """Solid arrowhead with point at `tip`, pointing in unit dir `along`."""
        ax, ay = along
        # perpendicular
        px, py = -ay, ax
        base = (tip[0] - ax * ARROW, tip[1] - ay * ARROW)
        w = ARROW * 0.32
        p1 = (base[0] + px * w, base[1] + py * w)
        p2 = (base[0] - px * w, base[1] - py * w)
        self.solid_tri(tip, p1, p2, layer=layer)

    def dim(self, a, b, off, text=None, layer="DIM", txt=TXT, ext=True,
            side=1, gap=1.2, flip_text=False):
        """Generic linear dimension between paper points a,b.

        `off` is the perpendicular offset distance (paper mm); `side` (+/-1)
        chooses which side. `text` overrides the auto label (use for true
        model values). Returns nothing.
        """
        ax, ay = a
        bx, by = b
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        if L < 1e-9:
            return
        ux, uy = dx / L, dy / L          # along dimension
        nx, ny = -uy * side, ux * side   # normal (offset dir)
        o = off
        a2 = (ax + nx * o, ay + ny * o)
        b2 = (bx + nx * o, by + ny * o)
        # extension lines
        if ext:
            self.line((ax + nx * gap, ay + ny * gap),
                      (a2[0] + nx * gap, a2[1] + ny * gap), layer=layer)
            self.line((bx + nx * gap, by + ny * gap),
                      (b2[0] + nx * gap, b2[1] + ny * gap), layer=layer)
        # dimension line
        self.line(a2, b2, layer=layer)
        # arrowheads (pointing outward to the tips)
        self._arrow(a2, (-ux, -uy), layer=layer)
        self._arrow(b2, (ux, uy), layer=layer)
        # text
        if text is None:
            text = f"{L:.0f}"
        mid = ((a2[0] + b2[0]) / 2, (a2[1] + b2[1]) / 2)
        rot = math.degrees(math.atan2(dy, dx))
        if rot > 90 or rot <= -90:
            rot += 180
        toff = txt * 0.6
        tp = (mid[0] + nx * toff, mid[1] + ny * toff)
        self.text(text, tp, h=txt, layer="TEXT", align="MC", rot=rot)

    # -- save ----------------------------------------------------------------
    def save_dxf(self, path):
        self.doc.audit()
        self.doc.saveas(path)


class View:
    """Maps model mm -> paper mm. p(x,y) returns a paper-space tuple."""

    def __init__(self, dwg: Drawing, scale, origin=(0, 0)):
        self.d = dwg
        self.s = scale
        self.ox, self.oy = origin

    def p(self, x, y):
        return (self.ox + x * self.s, self.oy + y * self.s)

    # model-space convenience wrappers --------------------------------------
    def line(self, p1, p2, **kw):
        self.d.line(self.p(*p1), self.p(*p2), **kw)

    def rect(self, x, y, w, h, **kw):
        self.d.pline([self.p(x, y), self.p(x + w, y),
                      self.p(x + w, y + h), self.p(x, y + h)],
                     close=True, **kw)

    def poly(self, pts, close=True, **kw):
        self.d.pline([self.p(*q) for q in pts], close=close, **kw)

    def circle(self, c, r, **kw):
        self.d.circle(self.p(*c), r * self.s, **kw)

    def hatch(self, pts, **kw):
        self.d.hatch([self.p(*q) for q in pts], **kw)

    def fill(self, pts, **kw):
        self.d.fill([self.p(*q) for q in pts], **kw)

    def text(self, s, p, h=TXT, model_h=None, **kw):
        if model_h is not None:
            h = model_h * self.s
        self.d.text(s, self.p(*p), h=h, **kw)

    def dim_h(self, x1, x2, y, yoff, text=None, **kw):
        """Horizontal dimension at model y, offset yoff (paper mm)."""
        a, b = self.p(x1, y), self.p(x2, y)
        val = abs(x2 - x1)
        side = 1 if yoff >= 0 else -1
        self.d.dim(a, b, abs(yoff), text=text or f"{val:.0f}", side=side, **kw)

    def dim_v(self, y1, y2, x, xoff, text=None, **kw):
        """Vertical dimension at model x, offset xoff (paper mm)."""
        a, b = self.p(x, y1), self.p(x, y2)
        val = abs(y2 - y1)
        # for vertical, normal points in -x when side=1; pick side from sign
        side = -1 if xoff >= 0 else 1
        self.d.dim(a, b, abs(xoff), text=text or f"{val:.0f}", side=side, **kw)

    def dim_aligned(self, p1, p2, off, text=None, side=1, **kw):
        a, b = self.p(*p1), self.p(*p2)
        val = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        self.d.dim(a, b, abs(off), text=text or f"{val:.0f}", side=side, **kw)

    def leader(self, frm, to, label, h=TXT_S, layer="LEADER", align="ML"):
        """Simple leader: line from model point `frm` to paper-offset text."""
        pa = self.p(*frm)
        self.d.line(pa, to, layer=layer)
        self.d._arrow(pa, ((pa[0] - to[0]) / (math.hypot(pa[0]-to[0], pa[1]-to[1]) or 1),
                           (pa[1] - to[1]) / (math.hypot(pa[0]-to[0], pa[1]-to[1]) or 1)),
                      layer=layer)
        tp = (to[0] + (2 if align == "ML" else -2), to[1])
        self.d.text(label, tp, h=h, layer="TEXT", align=align)


# ----------------------------------------------------------------------------
# Sheet furniture: border + title block + tables
# ----------------------------------------------------------------------------
def border(d: Drawing):
    W, H, m = d.W, d.H, MARGIN
    # outer
    d.rect(2, 2, W - 4, H - 4, layer="BORDER")
    # inner frame
    d.rect(m, m, W - 2 * m, H - 2 * m, layer="BORDER")


def title_block(d: Drawing, project, title, scale, sheet_no, total, rev="01",
                date="2026-06-25", drawn_by="HÉLIOTOIT", units="mm",
                size="A2"):
    """Bottom-right title block."""
    W, H, m = d.W, d.H, MARGIN
    bw, bh = 180.0, 56.0
    x0 = W - m - bw
    y0 = m
    d.rect(x0, y0, bw, bh, layer="TITLE")
    # row lines
    rows = [10, 20, 30, 40, 48]
    for r in rows:
        d.line((x0, y0 + r), (x0 + bw, y0 + r), layer="TITLE")
    # vertical splits
    d.line((x0 + 110, y0), (x0 + 110, y0 + 40), layer="TITLE")
    d.line((x0 + 135, y0 + 40), (x0 + 135, y0 + 48), layer="TITLE")
    d.line((x0 + 60, y0 + 40), (x0 + 60, y0), layer="TITLE")
    d.line((x0 + 120, y0 + 20), (x0 + 120, y0), layer="TITLE")

    def cell(tx, ty, s, h=TXT_S, align="BL", layer="TEXT"):
        d.text(s, (x0 + tx, y0 + ty), h=h, align=align, layer=layer)

    # company band (top strip)
    cell(4, 50.5, "HELIOTOIT  -  OFF-GRID SOLAR CARPORT", h=2.4)
    cell(138, 50.5, "FLAT-PACK KIT", h=2.4)
    # project title row
    cell(4, 42.5, project, h=4.4)
    # drawing title row
    cell(4, 32.5, "DRAWING:", h=1.6)
    cell(4, 22.5, title, h=3.0)
    cell(114, 32.5, "SCALE", h=1.6)
    cell(114, 22.5, scale, h=3.2)
    # bottom data cells
    cell(4, 12.5, "DATE", h=1.6);     cell(4, 3.5, date, h=2.4)
    cell(64, 12.5, "REV", h=1.6);     cell(64, 3.5, rev, h=2.4)
    cell(124, 12.5, "SHEET", h=1.6);  cell(124, 3.5, f"{sheet_no} / {total}", h=2.4)
    # units / size strip just above block
    d.text(f"UNITS: {units}   |   SHEET SIZE: DIN {size}   |   PROJECTION: 1st ANGLE (E)   |   DRAWN: {drawn_by}",
           (x0, y0 + bh + 2.5), h=1.7, align="BL", layer="TEXT")


def sheet_label(d: Drawing, text, h=TXT_L):
    """Top-left sheet caption inside the frame."""
    d.text(text, (MARGIN + 4, d.H - MARGIN - 6), h=h, align="ML", layer="TEXT")


def north_arrow(d: Drawing, cx, cy, r=9):
    """North arrow symbol centred at (cx,cy) paper mm."""
    d.solid_tri((cx, cy + r), (cx - r * 0.45, cy - r * 0.5),
                (cx, cy - r * 0.18), layer="STRUCT")
    d.line((cx, cy + r), (cx + r * 0.45, cy - r * 0.5), layer="STRUCT")
    d.line((cx + r * 0.45, cy - r * 0.5), (cx, cy - r * 0.18), layer="STRUCT")
    d.circle((cx, cy), r * 1.25, layer="STRUCT")
    d.text("N", (cx, cy + r * 1.25 + 3.2), h=3.0, align="BC", layer="TEXT")


def notes_block(d: Drawing, x, y, lines, title="NOTES", w=120, lh=4.2, h=TXT_S):
    d.text(title, (x, y), h=2.4, align="ML", layer="TEXT")
    cy = y - lh - 1
    for ln in lines:
        d.text(ln, (x, cy), h=h, align="ML", layer="TEXT")
        cy -= lh
    return cy


def table(d: Drawing, x, y, headers, rows, col_w, row_h=5.0, h=TXT_S,
          title=None, header_h=5.0):
    """Generic table. (x,y) is the TOP-LEFT corner. col_w: list of widths."""
    tw = sum(col_w)
    nrows = len(rows)
    total_h = header_h + nrows * row_h
    if title:
        d.text(title, (x, y + 2.5), h=2.6, align="BL", layer="TEXT")
    top = y
    # outer
    d.rect(x, top - total_h, tw, total_h, layer="TITLE")
    # header separator
    d.line((x, top - header_h), (x + tw, top - header_h), layer="TITLE")
    # row lines
    for i in range(1, nrows):
        yy = top - header_h - i * row_h
        d.line((x, yy), (x + tw, yy), layer="DIM")
    # column lines
    cx = x
    for w in col_w[:-1]:
        cx += w
        d.line((cx, top - total_h), (cx, top), layer="TITLE")
    # header text
    cx = x
    for hdr, w in zip(headers, col_w):
        d.text(hdr, (cx + 2, top - header_h / 2), h=h, align="ML", layer="TEXT")
        cx += w
    # rows
    for ri, row in enumerate(rows):
        ry = top - header_h - ri * row_h - row_h / 2
        cx = x
        for ci, (val, w) in enumerate(zip(row, col_w)):
            al = "ML" if ci in (1,) else ("MC" if ci != 0 else "ML")
            d.text(str(val), (cx + 2, ry), h=h, align="ML", layer="TEXT")
            cx += w
    return total_h
