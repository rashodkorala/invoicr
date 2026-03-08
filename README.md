# Invoicr

Personal invoicing tool for Rashod Korala. FastAPI backend + Next.js frontend + Supabase + ReportLab PDF generation.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| PDF | ReportLab |
| Hosting (frontend) | Vercel |
| Hosting (backend) | Railway |

---

## Project Structure

```
invoicr/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── models/models.py     # Pydantic models
│   │   ├── routers/
│   │   │   ├── invoices.py
│   │   │   ├── clients.py
│   │   │   ├── pdf.py
│   │   │   └── settings.py
│   │   ├── services/
│   │   │   └── pdf_service.py   # ReportLab PDF generation
│   │   └── utils/
│   │       └── supabase.py      # Supabase client
│   ├── requirements.txt
│   ├── railway.toml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # UI components
│   │   ├── lib/api.ts           # API client
│   │   └── types/index.ts       # Shared TypeScript types
│   └── .env.example
└── supabase/
    └── schema.sql               # Full database schema
```

---

## Getting Started

### 1. Supabase

- Create a new Supabase project
- Run `supabase/schema.sql` in the SQL editor
- Copy your project URL and service role key

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your Supabase credentials
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Deployment

### Backend → Railway

1. Push `backend/` to a GitHub repo
2. Create a new Railway project, connect the repo
3. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
4. Railway picks up `railway.toml` automatically

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import to Vercel
3. Set env var: `NEXT_PUBLIC_API_URL` = your Railway backend URL

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /invoices/ | List all invoices |
| POST | /invoices/ | Create invoice |
| PATCH | /invoices/{id}/status | Update status |
| DELETE | /invoices/{id} | Delete invoice |
| GET | /clients/ | List all clients |
| POST | /clients/ | Create client |
| PUT | /clients/{id} | Update client |
| GET | /pdf/{invoice_id} | Download PDF |
| GET | /settings/ | Get your details |
| PUT | /settings/ | Update your details |

---

## Invoice Status Flow

`Draft` → `Sent` → `Deposit Paid` → `Paid in Full`
