from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.routers.invoices import get_invoice
from app.routers.settings import get_settings
from app.services.pdf_service import generate_invoice_pdf
from app.models.models import Invoice, Settings

router = APIRouter()


@router.get("/{invoice_id}")
def download_pdf(invoice_id: str):
    invoice_data = get_invoice(invoice_id)
    settings_data = get_settings()

    invoice = Invoice(**invoice_data) if isinstance(invoice_data, dict) else invoice_data
    settings = Settings(**settings_data) if isinstance(settings_data, dict) else settings_data

    pdf_bytes = generate_invoice_pdf(invoice, settings)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Invoice_{invoice.invoice_number}.pdf"}
    )
