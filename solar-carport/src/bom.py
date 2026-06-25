"""bom.py — derive Bill of Materials / part list rows from a params dict."""
import math

ALU = "Alu 6063-T5, RAL 9005"
STEEL = "Steel S235 HDG"
SS = "Stainless A2-70"


def sections_of(length, seg_max=2400, forced=None):
    """Return list of segment lengths for a member shipped in <=seg_max parts."""
    if forced:
        return forced
    n = max(1, math.ceil(length / seg_max))
    seg = round(length / n)
    return [seg] * n


def compute(p):
    """Return (rows, joints, m8_bolts). rows: ref,desc,qty,material,length."""
    rows = []
    joints = 0          # internal sleeve joints
    m8 = 0              # M8 sleeve bolts (4 per joint)

    POST, BEAM, PUR = p["POST"], p["BEAM"], p["PURLIN"]

    # 1. Posts: each post = 2 x 1100 + sleeve
    nposts = p["n_posts"]
    rows.append(("01", f"Vertical post {POST['a']}x{POST['b']}x{POST['t']} SHS",
                 nposts * 2, ALU, "1100"))
    joints += nposts
    # 2. Longitudinal beams
    lb = sections_of(p["long_beam_len"])
    rows.append(("02", f"Longitudinal beam {BEAM['a']}x{BEAM['b']}x{BEAM['t']} RHS",
                 2 * len(lb), ALU, "x".join(str(s) for s in dict.fromkeys(lb))))
    joints += 2 * (len(lb) - 1)
    # 3. Transverse beams
    tb = sections_of(p["tran_beam_len"])
    rows.append(("03", f"Transverse beam {BEAM['a']}x{BEAM['b']}x{BEAM['t']} RHS",
                 2 * len(tb), ALU, "x".join(str(s) for s in dict.fromkeys(tb))))
    joints += 2 * (len(tb) - 1)
    # 4. Purlins
    pb = sections_of(p["purlin_len"]) if "purlin_len" in p else \
        sections_of(p["long_beam_len"])
    npur = p["n_purlins"]
    rows.append(("04", f"Roof purlin {PUR['a']}x{PUR['b']}x{PUR['t']} RHS",
                 npur * len(pb), ALU, "x".join(str(s) for s in dict.fromkeys(pb))))
    joints += npur * (len(pb) - 1)
    # 5. Internal sleeves (one profile-matched sleeve per joint)
    rows.append(("05", f"Internal sleeve {p['SLEEVE_LEN']} mm (profile-matched)",
                 joints, ALU, str(p["SLEEVE_LEN"])))
    m8 = joints * 4
    # 6. Anchor plates
    ap = p["ANCHOR_PLATE"]
    rows.append(("06", f"Ground anchor plate {ap['w']}x{ap['d']}x{ap['t']}",
                 nposts, STEEL, "-"))
    # 7. Anchor bolts
    rows.append(("07", "Anchor bolt M12 + chemical resin", nposts * 4, SS, "-"))
    # 8. Sleeve bolts
    rows.append(("08", "Sleeve bolt M8 + nyloc nut", m8, SS, "-"))
    # 9. PV panels
    npan = p.get("n_panels", 4)
    pa = p["PANEL"]
    rows.append(("09", f"PV module {pa['L']}x{pa['W']} (assumption-RFQ)",
                 npan, "Glass / Alu frame", "-"))
    # 10. Z-clamps
    # end clamps: 2 per panel long edge pair; mid clamps shared. Estimate:
    end_cl = npan * 2
    mid_cl = max(0, (npan - p["n_purlins"]) * 2) + p["n_purlins"] * 1
    rows.append(("10", "Panel end clamp (alu, RAL 9005)", end_cl, ALU, "-"))
    rows.append(("11", "Panel mid clamp (alu, RAL 9005)", mid_cl + 4, ALU, "-"))
    # 12. Sloped purlin saddle (creates 5deg)
    rows.append(("12", f"Sloped purlin saddle {p['SLOPE_DEG']:.0f} deg",
                 p["n_purlins"] * 2, ALU, "-"))
    # 13. Control box
    cb = p["ctrlbox"]
    rows.append(("13", f"Control box {cb['w']}x{cb['h']}x{cb['d']} IP54 "
                 f"(inverter+{cb['kwh']} batt+{cb['outlets']}x16A AC)",
                 1, "Steel IP54", "-"))
    # 14. Fixings kit
    rows.append(("14", "Corner gusset + M10 beam/post bolt kit",
                 nposts, SS, "-"))
    return rows, joints, m8
