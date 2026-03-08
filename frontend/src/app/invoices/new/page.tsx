"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClients, getSettings, createInvoice } from "@/lib/api";
import { Client, Settings } from "@/types";
import InvoicePreview from "@/components/invoice-preview";

interface ItemRow {
  key: string;
  description: string;
  rate: string;
  quantity: string;
  amount: string;
  is_subitem: boolean;
}

function newItem(): ItemRow {
  return { key: crypto.randomUUID(), description: "", rate: "", quantity: "", amount: "", is_subitem: false };
}

function newSubItem(): ItemRow {
  return { key: crypto.randomUUID(), description: "", rate: "", quantity: "", amount: "", is_subitem: true };
}

export default function NewInvoice() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [clientId, setClientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [taxRate, setTaxRate] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([newItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    getClients().then((d) => setClients(d as Client[]));
    getSettings().then((d) => setSettings(d as Settings));
  }, []);

  const invoiceNumber = settings
    ? String(settings.next_invoice_number).padStart(3, "0")
    : "...";

  const updateItem = (key: string, field: keyof ItemRow, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };
        if (field === "rate" || field === "quantity") {
          const r = parseFloat(updated.rate);
          const q = parseFloat(updated.quantity);
          if (r && q) updated.amount = (r * q).toFixed(2);
        }
        return updated;
      })
    );
  };

  const removeItem = (key: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const tax = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createInvoice({
        invoice_number: invoiceNumber,
        date,
        client_id: clientId,
        tax_rate: parseFloat(taxRate) || 0,
        payment_terms: paymentTerms || null,
        notes: notes || null,
        line_items: items.map((item, i) => ({
          description: item.description,
          rate: item.is_subitem ? null : parseFloat(item.rate) || null,
          quantity: item.is_subitem ? null : parseFloat(item.quantity) || null,
          amount: item.is_subitem ? 0 : parseFloat(item.amount) || 0,
          is_subitem: item.is_subitem,
          sort_order: i,
        })),
      });
      router.push("/");
    } catch (err) {
      alert("Failed to create invoice: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">New Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Header row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Invoice #</label>
            <input
              type="text"
              value={invoiceNumber}
              disabled
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {/* Client */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          >
            <option value="">Select a client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `— ${c.company}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Line Items */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Line Items</label>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.key} className={`flex gap-2 items-start ${item.is_subitem ? "pl-6" : ""}`}>
                <input
                  type="text"
                  placeholder={item.is_subitem ? "Sub-item description" : "Description"}
                  value={item.description}
                  onChange={(e) => updateItem(item.key, "description", e.target.value)}
                  required
                  className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
                />
                {!item.is_subitem && (
                  <>
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(item.key, "rate", e.target.value)}
                      className="w-20 border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, "quantity", e.target.value)}
                      className="w-20 border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => updateItem(item.key, "amount", e.target.value)}
                      required
                      className="w-28 border border-gray-200 rounded px-3 py-2 text-sm text-right"
                    />
                  </>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-gray-300 hover:text-red-500 px-2 py-2 text-sm"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => setItems([...items, newItem()])}
              className="text-xs text-gray-500 hover:text-black"
            >
              + Add item
            </button>
            <button
              type="button"
              onClick={() => setItems([...items, newSubItem()])}
              className="text-xs text-gray-500 hover:text-black"
            >
              + Add sub-item
            </button>
          </div>
        </div>

        {/* Totals preview */}
        <div className="text-sm text-right space-y-1 border-t border-gray-100 pt-4">
          {parseFloat(taxRate) > 0 && (
            <>
              <p className="text-gray-500">Subtotal: ${subtotal.toLocaleString()}</p>
              <p className="text-gray-500">Tax ({taxRate}%): ${tax.toLocaleString()}</p>
            </>
          )}
          <p className="font-bold text-base">Total: ${total.toLocaleString()}</p>
        </div>

        {/* Payment Terms */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Payment Terms</label>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder="e.g. 50% deposit required to begin..."
            rows={3}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Invoice"}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="border border-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-50"
          >
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Invoice Preview</h2>
          <InvoicePreview
            invoiceNumber={invoiceNumber}
            date={date}
            client={clients.find((c) => c.id === clientId) || null}
            items={items.map((item) => ({
              description: item.description,
              rate: item.is_subitem ? null : parseFloat(item.rate) || null,
              quantity: item.is_subitem ? null : parseFloat(item.quantity) || null,
              amount: item.is_subitem ? 0 : parseFloat(item.amount) || 0,
              is_subitem: item.is_subitem,
            }))}
            taxRate={parseFloat(taxRate) || 0}
            subtotal={subtotal}
            total={total}
            paymentTerms={paymentTerms || null}
            settings={settings}
          />
        </div>
      )}
    </div>
  );
}
