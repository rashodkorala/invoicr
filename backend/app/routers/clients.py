from fastapi import APIRouter, HTTPException
from app.models.models import Client, ClientCreate
from app.utils.supabase import supabase
from typing import List

router = APIRouter()


@router.get("/", response_model=List[Client])
def list_clients():
    res = supabase.table("clients").select("*").order("name").execute()
    return res.data


@router.get("/{client_id}", response_model=Client)
def get_client(client_id: str):
    res = supabase.table("clients").select("*").eq("id", client_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return res.data


@router.post("/", response_model=Client)
def create_client(payload: ClientCreate):
    res = supabase.table("clients").insert(payload.dict()).execute()
    return res.data[0]


@router.put("/{client_id}", response_model=Client)
def update_client(client_id: str, payload: ClientCreate):
    res = supabase.table("clients").update(payload.dict()).eq("id", client_id).execute()
    return res.data[0]


@router.delete("/{client_id}")
def delete_client(client_id: str):
    supabase.table("clients").delete().eq("id", client_id).execute()
    return {"ok": True}
