import textwrap
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from io import BytesIO
from app.models.models import Invoice, Settings


def generate_invoice_pdf(invoice: Invoice, settings: Settings) -> bytes:
    buffer = BytesIO()
    width, height = A4
    c = canvas.Canvas(buffer, pagesize=A4)
    margin = 25 * mm

    # Background
    c.setFillColor(colors.HexColor("#F5F5E8"))
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Title
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 52)
    c.drawString(margin, height - 38 * mm, "Invoice")

    # Date & invoice number
    c.setFont("Helvetica", 9)
    date_x = width - margin
    c.drawRightString(date_x, height - 28 * mm, invoice.date.strftime("%-d %B %Y"))
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(date_x, height - 34 * mm, f"Invoice No. {invoice.invoice_number}")

    # Top divider
    c.setStrokeColor(colors.HexColor("#CCCCBB"))
    c.setLineWidth(0.5)
    c.line(margin, height - 45 * mm, width - margin, height - 45 * mm)

    # Billed to
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(colors.black)
    c.drawString(margin, height - 54 * mm, "Billed to:")
    c.setFont("Helvetica", 9)
    client = invoice.client
    billing_lines = [
        client.name,
        client.company or "",
        client.address or "",
        f"{client.city}, {client.province}, {client.postal_code}" if client.city else "",
    ]
    y = height - 61 * mm
    for line in [l for l in billing_lines if l]:
        c.drawString(margin, y, line)
        y -= 5.5 * mm

    # Divider before table
    c.line(margin, height - 82 * mm, width - margin, height - 82 * mm)

    # Table header
    table_top = height - 95 * mm
    c.setFont("Helvetica-Bold", 9)
    c.drawString(margin, table_top, "Description")
    c.drawRightString(width - margin - 60 * mm, table_top, "Rate")
    c.drawRightString(width - margin - 25 * mm, table_top, "Qty")
    c.drawRightString(width - margin, table_top, "Amount")
    c.setLineWidth(0.5)
    c.line(margin, table_top - 4 * mm, width - margin, table_top - 4 * mm)

    # Line items
    c.setFont("Helvetica", 9)
    y = table_top - 12 * mm
    for item in sorted(invoice.line_items, key=lambda x: x.sort_order):
        c.setFillColor(colors.black)

        if item.is_subitem:
            # Sub-items: indented description only
            c.drawString(margin + 5 * mm, y, item.description)
        else:
            # Main items: full row
            c.drawString(margin, y, item.description)
            if item.rate:
                c.drawRightString(width - margin - 60 * mm, y, f"${item.rate:,.0f}")
            if item.quantity:
                c.drawRightString(width - margin - 25 * mm, y, str(int(item.quantity) if item.quantity == int(item.quantity) else item.quantity))
            c.drawRightString(width - margin, y, f"${item.amount:,.0f}")

        # Subtle row divider
        c.setLineWidth(0.3)
        c.setStrokeColor(colors.HexColor("#DDDDCC"))
        c.line(margin, y - 4 * mm, width - margin, y - 4 * mm)
        y -= 9 * mm

    # Totals
    totals_y = y - 4 * mm

    def total_row(label, value, bold=False):
        nonlocal totals_y
        font = "Helvetica-Bold" if bold else "Helvetica"
        c.setFont(font, 9)
        c.setFillColor(colors.black)
        c.drawRightString(width - margin - 25 * mm, totals_y, label)
        c.drawRightString(width - margin, totals_y, value)
        totals_y -= 7 * mm

    if invoice.tax_rate > 0:
        total_row("Subtotal", f"${invoice.subtotal:,.0f}")
        tax_amount = invoice.subtotal * (invoice.tax_rate / 100)
        total_row(f"Tax ({invoice.tax_rate:.0f}%)", f"${tax_amount:,.0f}")

    deposit = invoice.total / 2
    total_row("Deposit Due (50%)", f"${deposit:,.0f}")
    total_row("Balance on Delivery (50%)", f"${deposit:,.0f}")

    totals_y -= 2 * mm
    c.setStrokeColor(colors.HexColor("#CCCCBB"))
    c.setLineWidth(0.5)
    c.line(width - margin - 70 * mm, totals_y, width - margin, totals_y)
    totals_y -= 7 * mm
    total_row("Total", f"${invoice.total:,.0f}", bold=True)

    # Payment terms (multi-line)
    if invoice.payment_terms:
        terms_y = totals_y - 8 * mm
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.black)
        c.drawString(margin, terms_y, "Payment Terms")
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.HexColor("#444444"))
        terms_y -= 5.5 * mm
        for paragraph in invoice.payment_terms.split("\n"):
            for line in textwrap.wrap(paragraph, 90) or [""]:
                c.drawString(margin, terms_y, line)
                terms_y -= 4.5 * mm

    # Bottom section
    bottom_y = 60 * mm
    c.setStrokeColor(colors.HexColor("#CCCCBB"))
    c.setLineWidth(0.5)
    c.line(margin, bottom_y, width - margin, bottom_y)

    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(colors.black)
    c.drawString(margin, bottom_y - 8 * mm, "Payment Information")
    c.setFont("Helvetica", 9)
    c.drawString(margin, bottom_y - 15 * mm, f"E-Transfer: {settings.etransfer_email or settings.email}")

    right_col = width / 2 + 5 * mm
    c.setFont("Helvetica-Bold", 9)
    c.drawString(right_col, bottom_y - 8 * mm, settings.owner_name)
    c.setFont("Helvetica", 9)
    sender_lines = [
        f"{settings.address}, {settings.city}" if settings.address and settings.city else (settings.address or ""),
        f"{settings.province}, {settings.postal_code}, Canada" if settings.province else "",
        settings.phone or "",
        settings.website or "",
    ]
    sy = bottom_y - 15 * mm
    for line in [l for l in sender_lines if l]:
        c.drawString(right_col, sy, line)
        sy -= 5.5 * mm

    c.line(margin, 28 * mm, width - margin, 28 * mm)
    c.save()

    buffer.seek(0)
    return buffer.read()
