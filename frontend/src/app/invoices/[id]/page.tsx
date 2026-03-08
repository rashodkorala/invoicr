"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getInvoice, getSettings, updateInvoiceStatus, deleteInvoice, downloadPdf } from "@/lib/api";
import { Invoice, Settings, InvoiceStatus, STATUS_LABELS } from "@/types";
import InvoicePreview from "@/components/invoice-preview";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "deposit_paid", "paid"];

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getInvoice(id).then((d) => setInvoice(d as Invoice)),
      getSettings().then((d) => setSettings(d as Settings)),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: InvoiceStatus) => {
    const updated = (await updateInvoiceStatus(id, status)) as Invoice;
    setInvoice(updated);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this invoice?")) return;
    await deleteInvoice(id);
    router.push("/");
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (!invoice) return <p className="text-gray-400 text-sm">Invoice not found.</p>;

  return (
    <div>
      <Link href="/" className="text-xs text-gray-400 hover:text-black">
        &larr; Back
      </Link>

      {/* Actions bar */}
      <div className="flex items-center justify-between mt-4 mb-8">
        <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>
        <div className="flex items-center gap-3">
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
            className="border border-gray-200 rounded px-3 py-1.5 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => downloadPdf(invoice.id, invoice.invoice_number)}
            className="bg-black text-white text-sm px-4 py-1.5 rounded hover:bg-gray-800"
          >
            Download PDF
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <InvoicePreview
        invoiceNumber={invoice.invoice_number}
        date={invoice.date}
        client={invoice.client || null}
        items={[...invoice.line_items].sort((a, b) => a.sort_order - b.sort_order)}
        taxRate={invoice.tax_rate}
        subtotal={invoice.subtotal}
        total={invoice.total}
        paymentTerms={invoice.payment_terms || null}
        settings={settings}
      />
    </div>
  );
}
