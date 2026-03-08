from fastapi import APIRouter
from app.models.models import Settings, SettingsUpdate
from app.utils.supabase import supabase

router = APIRouter()


@router.get("/", response_model=Settings)
def get_settings():
    res = supabase.table("settings").select("*").single().execute()
    return res.data


@router.put("/", response_model=Settings)
def update_settings(payload: SettingsUpdate):
    res = supabase.table("settings").update(payload.dict()).neq("id", "00000000-0000-0000-0000-000000000000").execute()
    return res.data[0]
