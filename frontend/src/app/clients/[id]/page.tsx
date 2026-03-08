"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getClient, updateClient } from "@/lib/api";
import { Client } from "@/types";

export default function EditClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    company: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getClient(id).then((d) => {
      const c = d as Client;
      setForm({
        name: c.name,
        company: c.company || "",
        address: c.address || "",
        city: c.city || "",
        province: c.province || "",
        postal_code: c.postal_code || "",
        email: c.email || "",
        phone: c.phone || "",
      });
      setLoading(false);
    });
  }, [id]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateClient(id, form);
      router.push("/clients");
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="max-w-lg">
      <Link href="/clients" className="text-xs text-gray-400 hover:text-black">
        &larr; Back
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-8">Edit Client</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Province</label>
            <input
              type="text"
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
            <input
              type="text"
              value={form.postal_code}
              onChange={(e) => set("postal_code", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Update Client"}
        </button>
      </form>
    </div>
  );
}
