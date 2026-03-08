import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import invoices, clients, pdf, settings

app = FastAPI(title="Invoicr API", version="1.0.0")

cors_origins = [
    "https://invoicr-mu.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions so CORS headers are still added to the response."""
    tb = traceback.format_exc()
    print(f"Unhandled error on {request.method} {request.url.path}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


@app.middleware("http")
async def check_api_key(request: Request, call_next):
    if not API_KEY or request.url.path == "/health":
        return await call_next(request)

    # Skip preflight CORS requests
    if request.method == "OPTIONS":
        return await call_next(request)

    key = request.headers.get("X-API-Key", "")
    if key != API_KEY:
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    return await call_next(request)

app.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])

@app.get("/health")
def health():
    """Basic health check + optional DB connectivity test."""
    result = {"status": "ok"}
    try:
        from app.utils.supabase import supabase
        res = supabase.table("clients").select("id").limit(1).execute()
        result["db"] = "connected"
        result["clients_table"] = "ok"
    except Exception as e:
        result["db"] = f"error: {str(e)}"
    try:
        from app.utils.supabase import supabase
        res = supabase.table("settings").select("id").limit(1).execute()
        result["settings_table"] = "ok"
    except Exception as e:
        result["settings_table"] = f"error: {str(e)}"
    return result
