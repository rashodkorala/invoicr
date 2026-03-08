from fastapi import APIRouter, HTTPException
from app.models.models import Invoice, InvoiceCreate, InvoiceStatus
from app.utils.supabase import supabase
from typing import List

router = APIRouter()


@router.get("/", response_model=List[Invoice])
def list_invoices():
    res = supabase.table("invoices").select("*, client:clients(*), line_items(*)").order("created_at", desc=True).execute()
    return res.data


@router.get("/{invoice_id}", response_model=Invoice)
def get_invoice(invoice_id: str):
    res = supabase.table("invoices").select("*, client:clients(*), line_items(*)").eq("id", invoice_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return res.data


@router.post("/", response_model=Invoice)
def create_invoice(payload: InvoiceCreate):
    line_items = payload.line_items
    subtotal = sum(item.amount for item in line_items)
    tax_amount = subtotal * (payload.tax_rate / 100)
    total = subtotal + tax_amount

    invoice_data = payload.dict(exclude={"line_items"})
    invoice_data.update({
        "subtotal": subtotal,
        "total": total,
        "client_id": str(payload.client_id),
        "date": str(payload.date),
        "status": payload.status.value if hasattr(payload.status, "value") else str(payload.status),
    })

    inv_res = supabase.table("invoices").insert(invoice_data).execute()
    invoice_id = inv_res.data[0]["id"]

    items_data = [{"invoice_id": invoice_id, **item.dict()} for item in line_items]
    supabase.table("line_items").insert(items_data).execute()

    # Bump next invoice number in settings
    try:
        settings_res = supabase.table("settings").select("id, next_invoice_number").limit(1).execute()
        if settings_res.data:
            next_num = settings_res.data[0]["next_invoice_number"] + 1
            supabase.table("settings").update({"next_invoice_number": next_num}).eq("id", settings_res.data[0]["id"]).execute()
    except Exception:
        pass  # Don't fail invoice creation if settings bump fails

    return get_invoice(invoice_id)


@router.patch("/{invoice_id}/status", response_model=Invoice)
def update_status(invoice_id: str, status: InvoiceStatus):
    supabase.table("invoices").update({"status": status.value}).eq("id", invoice_id).execute()
    return get_invoice(invoice_id)


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str):
    supabase.table("line_items").delete().eq("invoice_id", invoice_id).execute()
    supabase.table("invoices").delete().eq("id", invoice_id).execute()
    return {"ok": True}
