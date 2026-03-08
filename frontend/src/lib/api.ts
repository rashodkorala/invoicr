const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(`${API_URL}${path}`, { headers, ...options });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Clients ──────────────────────────────────────────────────
export const getClients = () => request("/clients/");
export const getClient = (id: string) => request(`/clients/${id}`);
export const createClient = (data: unknown) => request("/clients/", { method: "POST", body: JSON.stringify(data) });
export const updateClient = (id: string, data: unknown) => request(`/clients/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteClient = (id: string) => request(`/clients/${id}`, { method: "DELETE" });

// ── Invoices ─────────────────────────────────────────────────
export const getInvoices = () => request("/invoices/");
export const getInvoice = (id: string) => request(`/invoices/${id}`);
export const createInvoice = (data: unknown) => request("/invoices/", { method: "POST", body: JSON.stringify(data) });
export const updateInvoiceStatus = (id: string, status: string) => request(`/invoices/${id}/status?status=${status}`, { method: "PATCH" });
export const deleteInvoice = (id: string) => request(`/invoices/${id}`, { method: "DELETE" });

// ── PDF ───────────────────────────────────────────────────────
export const downloadPdf = async (id: string, invoiceNumber: string) => {
  const headers: Record<string, string> = {};
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  const res = await fetch(`${API_URL}/pdf/${id}`, { headers });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_${invoiceNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Settings ─────────────────────────────────────────────────
export const getSettings = () => request("/settings/");
export const updateSettings = (data: unknown) => request("/settings/", { method: "PUT", body: JSON.stringify(data) });
