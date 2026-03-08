"use client";

import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import { Settings } from "@/types";

export default function SettingsPage() {
  const [form, setForm] = useState({
    owner_name: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    email: "",
    phone: "",
    website: "",
    etransfer_email: "",
    next_invoice_number: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then((d) => {
      const s = d as Settings;
      setForm({
        owner_name: s.owner_name || "",
        address: s.address || "",
        city: s.city || "",
        province: s.province || "",
        postal_code: s.postal_code || "",
        email: s.email || "",
        phone: s.phone || "",
        website: s.website || "",
        etransfer_email: s.etransfer_email || "",
        next_invoice_number: s.next_invoice_number,
      });
      setLoading(false);
    });
  }, []);

  const set = (field: string, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(form);
      setSaved(true);
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Your Name *</label>
          <input
            type="text"
            value={form.owner_name}
            onChange={(e) => set("owner_name", e.target.value)}
            required
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">Website</label>
          <input
            type="text"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">E-Transfer Email</label>
          <input
            type="email"
            value={form.etransfer_email}
            onChange={(e) => set("etransfer_email", e.target.value)}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="block text-xs text-gray-500 mb-1">Next Invoice Number</label>
          <input
            type="number"
            value={form.next_invoice_number}
            onChange={(e) => set("next_invoice_number", parseInt(e.target.value) || 1)}
            className="w-24 border border-gray-200 rounded px-3 py-2 text-sm"
            min="1"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-xs text-green-600">Saved</span>}
        </div>
      </form>
    </div>
  );
}
