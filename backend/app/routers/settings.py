from fastapi import APIRouter, HTTPException
from app.models.models import Settings, SettingsUpdate
from app.utils.supabase import supabase

router = APIRouter()


@router.get("/", response_model=Settings)
def get_settings():
    res = supabase.table("settings").select("*").limit(1).execute()
    if not res.data:
        # Auto-create a default settings row
        default = {
            "owner_name": "Your Name",
            "next_invoice_number": 4,
        }
        create_res = supabase.table("settings").insert(default).execute()
        return create_res.data[0]
    return res.data[0]


@router.put("/", response_model=Settings)
def update_settings(payload: SettingsUpdate):
    # Ensure a settings row exists first
    get_settings()
    res = supabase.table("settings").update(payload.dict()).neq("id", "00000000-0000-0000-0000-000000000000").execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Settings not found")
    return res.data[0]
