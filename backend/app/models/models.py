from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class InvoiceStatus(str, Enum):
    draft = "draft"
    sent = "sent"
    deposit_paid = "deposit_paid"
    paid = "paid"


# ── Line Items ──────────────────────────────────────────────
class LineItemBase(BaseModel):
    description: str
    rate: Optional[float] = None
    quantity: Optional[float] = None
    amount: float
    sort_order: int = 0
    is_subitem: bool = False

class LineItemCreate(LineItemBase):
    pass

class LineItem(LineItemBase):
    id: UUID4
    invoice_id: UUID4

    class Config:
        from_attributes = True


# ── Clients ─────────────────────────────────────────────────
class ClientBase(BaseModel):
    name: str
    company: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True


# ── Invoices ─────────────────────────────────────────────────
class InvoiceBase(BaseModel):
    invoice_number: str
    date: date
    client_id: UUID4
    status: InvoiceStatus = InvoiceStatus.draft
    payment_terms: Optional[str] = None
    tax_rate: float = 0.0
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    line_items: List[LineItemCreate]

class Invoice(InvoiceBase):
    id: UUID4
    created_at: datetime
    subtotal: float
    total: float
    line_items: List[LineItem] = []
    client: Optional[Client] = None

    class Config:
        from_attributes = True


# ── Settings ─────────────────────────────────────────────────
class SettingsBase(BaseModel):
    owner_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    etransfer_email: Optional[str] = None
    next_invoice_number: int = 4

class SettingsUpdate(SettingsBase):
    pass

class Settings(SettingsBase):
    id: UUID4

    class Config:
        from_attributes = True
