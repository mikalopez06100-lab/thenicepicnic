"""render.py — render an ezdxf Drawing to a true-scale vector PDF (A2/A1)."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
from ezdxf.addons.drawing.properties import LayoutProperties


def _draw_axes(doc, ax):
    ctx = RenderContext(doc)
    backend = MatplotlibBackend(ax)
    lp = LayoutProperties.from_layout(doc.modelspace())
    lp.set_colors("#FFFFFF")               # white paper
    Frontend(ctx, backend).draw_layout(
        doc.modelspace(), finalize=True, layout_properties=lp)


def render_pdf(dwg, path, sheet=(594.0, 420.0)):
    W, H = sheet
    fig = plt.figure(figsize=(W / 25.4, H / 25.4), dpi=300)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W)
    ax.set_ylim(0, H)
    ax.set_aspect("equal")
    ax.axis("off")
    _draw_axes(dwg.doc, ax)
    fig.savefig(path, format="pdf")
    plt.close(fig)


def render_combined(dwgs, path, sheet=(594.0, 420.0)):
    """Multi-page PDF from a list of Drawing objects."""
    W, H = sheet
    with PdfPages(path) as pdf:
        for dwg in dwgs:
            fig = plt.figure(figsize=(W / 25.4, H / 25.4), dpi=300)
            ax = fig.add_axes([0, 0, 1, 1])
            ax.set_xlim(0, W); ax.set_ylim(0, H)
            ax.set_aspect("equal"); ax.axis("off")
            _draw_axes(dwg.doc, ax)
            pdf.savefig(fig)
            plt.close(fig)
