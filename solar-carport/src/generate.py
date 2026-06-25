"""generate.py — build all 14 sheets (7 SOLO + 7 DUO) as DXF + PDF."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import params
import sheets
from render import render_pdf, render_combined

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DXF = os.path.join(ROOT, "dxf")
PDF = os.path.join(ROOT, "pdf")
os.makedirs(DXF, exist_ok=True)
os.makedirs(PDF, exist_ok=True)

SHEET_NAMES = ["01-plan", "02-front-elevation", "03-side-elevation",
               "04-exploded-iso", "05-joint-detail", "06-anchor-detail",
               "07-control-box"]


def build(p):
    ref = p["ref"]
    dwgs = []
    for i, builder in enumerate(sheets.BUILDERS):
        d = builder(p)
        base = f"{ref}_{SHEET_NAMES[i]}"
        dxf_path = os.path.join(DXF, base + ".dxf")
        pdf_path = os.path.join(PDF, base + ".pdf")
        d.save_dxf(dxf_path)
        render_pdf(d, pdf_path, sheet=p["sheet"])
        dwgs.append(d)
        print(f"  [{ref}] sheet {i+1}/7 -> {base}.dxf / .pdf")
    # combined multipage PDF per reference
    render_combined(dwgs, os.path.join(PDF, f"{ref}_ALL_7-sheets.pdf"),
                    sheet=p["sheet"])
    print(f"  [{ref}] combined PDF -> {ref}_ALL_7-sheets.pdf")


def main():
    for cfg in (params.solo(), params.duo()):
        print(f"== {cfg['name']} ==")
        build(cfg)
    print("DONE. Files in dxf/ and pdf/.")


if __name__ == "__main__":
    main()
