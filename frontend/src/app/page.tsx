"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices, downloadPdf } from "@/lib/api";
import { Invoice, STATUS_LABELS, STATUS_COLOURS } from "@/types";

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then((data) => setInvoices(data as Invoice[]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link
          href="/invoices/new"
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
        >
          New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="text-gray-400 text-sm">No invoices yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-3 font-medium">#</th>
              <th className="pb-3 font-medium">Client</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">
                  <Link href={`/invoices/${inv.id}`} className="hover:underline">
                    {inv.invoice_number}
                  </Link>
                </td>
                <td className="py-3">{inv.client?.company || inv.client?.name || "—"}</td>
                <td className="py-3 text-gray-500">
                  {new Date(inv.date).toLocaleDateString("en-CA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 text-right font-medium">${inv.total.toLocaleString()}</td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOURS[inv.status]}`}
                  >
                    {STATUS_LABELS[inv.status]}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => downloadPdf(inv.id, inv.invoice_number)}
                    className="text-gray-400 hover:text-black text-xs"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
