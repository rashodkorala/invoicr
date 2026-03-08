"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getClients, deleteClient } from "@/lib/api";
import { Client } from "@/types";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getClients()
      .then((d) => setClients(d as Client[]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await deleteClient(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/clients/new"
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
        >
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-400 text-sm">No clients yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Company</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Phone</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">
                  <Link href={`/clients/${c.id}`} className="hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="py-3 text-gray-500">{c.company || "—"}</td>
                <td className="py-3 text-gray-500">{c.email || "—"}</td>
                <td className="py-3 text-gray-500">{c.phone || "—"}</td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
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
