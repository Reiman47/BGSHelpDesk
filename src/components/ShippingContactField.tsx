"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Phone } from "lucide-react";

export interface ShippingContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhone: string;
  jobTitle: string;
}

// ─── localStorage helpers ───────────────────────────────────────────────────
const getKey = (email: string) => `bgs_contacts_v2_${email}`;
const load = (email: string): ShippingContact[] => {
  if (typeof window === "undefined" || !email) return [];
  try { return JSON.parse(localStorage.getItem(getKey(email)) || "[]"); } catch { return []; }
};
const save = (email: string, contacts: ShippingContact[]) => {
  if (typeof window !== "undefined" && email) localStorage.setItem(getKey(email), JSON.stringify(contacts));
};

// ─── Add Contact Modal ───────────────────────────────────────────────────────
function AddModal({ onSave, onCancel }: { onSave: (d: Omit<ShippingContact, "id">) => void; onCancel: () => void }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", workPhone: "", jobTitle: "" });
  const [err, setErr] = useState<Record<string, boolean>>({});

  const handle = () => {
    const e: Record<string, boolean> = {};
    if (!f.firstName.trim()) e.firstName = true;
    if (!f.lastName.trim()) e.lastName = true;
    if (!f.email.trim()) e.email = true;
    if (!f.workPhone.trim()) e.workPhone = true;
    setErr(e);
    if (!Object.keys(e).length) onSave(f);
  };

  const row = (label: string, key: keyof typeof f, mandatory = false) => (
    <div key={key} className="flex items-center mb-4">
      <label className="w-40 text-sm font-bold text-gray-700 text-right pr-6 shrink-0">{label}</label>
      <div className="flex-1 flex items-center relative">
        {mandatory && <div className="absolute left-0 w-[3px] h-full bg-red-600 z-10"></div>}
        <input
          type={key === "email" ? "email" : "text"}
          value={f[key]}
          onChange={e => { setF(p => ({ ...p, [key]: e.target.value })); setErr(p => ({ ...p, [key]: false })); }}
          className={`w-full px-3 py-2 text-sm border focus:outline-none rounded-none transition-colors ${
            err[key] || mandatory ? "border-red-600" : "border-gray-300 focus:border-[#007ABC]"
          } ${mandatory ? "pl-4" : ""}`}
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4 text-left">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-[540px] overflow-hidden border border-gray-400">
        <div className="bg-[#1B365D] text-white px-5 py-2 flex items-center justify-between">
          <span className="text-sm font-bold">Contact</span>
          <button type="button" onClick={onCancel} className="hover:opacity-70 transition-opacity"><X size={16} /></button>
        </div>
        <div className="px-10 py-10">
          {row("First Name", "firstName", true)}
          {row("Last Name", "lastName", true)}
          {row("Email", "email", true)}
          {row("Work Phone Number", "workPhone", true)}
          {row("Job Title", "jobTitle")}
        </div>
        <div className="px-8 py-5 border-t bg-gray-50 flex gap-4">
          <button type="button" onClick={handle} className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white text-xs font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-colors">SAVE</button>
          <button type="button" onClick={onCancel} className="bg-[#d2d9e0] hover:bg-gray-300 text-[#4a5568] text-xs font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-colors">CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Picker Modal ────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function PickerModal({
  contacts, current, onSelect, onAdd, onCancel
}: { contacts: ShippingContact[]; current: ShippingContact | null; onSelect: (c: ShippingContact) => void; onAdd: () => void; onCancel: () => void }) {
  const [sel, setSel] = useState<ShippingContact | null>(current);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [showQ, setShowQ] = useState(false);

  const filtered = contacts.filter(c => !q || [c.firstName, c.lastName, c.email, c.workPhone, c.jobTitle].some(v => v.toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4 text-left">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-[960px] overflow-hidden border border-gray-400">
        {/* Simple Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <span className="text-base font-bold text-gray-700">Contact</span>
        </div>

        {/* Toolbar */}
        <div className="px-2 py-2 border-b bg-white flex items-center justify-between">
          <div className="flex gap-2">
            <button type="button" onClick={onAdd} title="Add new" className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white p-1.5 rounded-sm shadow-sm transition-colors text-white"><Plus size={18} /></button>
            <button type="button" onClick={() => { setShowQ(s => !s); setPage(0); }} title="Search" className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white p-1.5 rounded-sm shadow-sm transition-colors text-white"><Search size={16} /></button>
            <button type="button" className="bg-[#5b7fa6] text-white p-1.5 rounded-sm shadow-sm"><Phone size={16} /></button>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filtered.length ? `${page * PAGE_SIZE + 1} - ${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}+` : "0 contacts"}
          </span>
        </div>

        {showQ && (
          <div className="px-4 py-2 bg-gray-50 border-b">
            <input autoFocus type="text" value={q} onChange={e => { setQ(e.target.value); setPage(0); }}
              placeholder="Search by name, email, phone..." className="w-full px-4 py-1.5 text-sm border border-gray-300 rounded-none focus:outline-none transition-all" />
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto max-h-[440px] border-b">
          <table className="w-full text-[13px] border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <tr className="bg-white">
                {["Last Name", "First Name", "Work Phone Number", "Email", "Job Title"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!paged.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400 italic text-sm">
                  {!contacts.length ? "No contacts yet. Click + to add one." : "No contacts match search."}
                </td></tr>
              ) : paged.map(c => (
                <tr key={c.id} onClick={() => setSel(c)}
                  className={`cursor-pointer border-b border-gray-100 transition-colors ${sel?.id === c.id ? "bg-[#90CAF9] text-gray-900" : "hover:bg-blue-50"}`}>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{c.lastName || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{c.firstName || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{c.workPhone || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{c.email || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{c.jobTitle || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar formatted like the image */}
        <div className="px-4 py-2 flex items-center justify-center gap-4 bg-white">
           <div className="flex gap-2 items-center text-gray-300 scale-90">
             <button type="button" onClick={() => setPage(0)} disabled={!page} className="p-1 hover:text-gray-600 disabled:opacity-20"><ChevronsLeft size={16} /></button>
             <button type="button" onClick={() => setPage(p => p - 1)} disabled={!page} className="p-1 hover:text-gray-600 disabled:opacity-20"><ChevronLeft size={16} /></button>
             <button type="button" onClick={() => setPage(p => p + 1)} disabled={page >= pages - 1} className="p-1 hover:text-gray-600 disabled:opacity-20"><ChevronRight size={16} /></button>
             <button type="button" onClick={() => setPage(pages - 1)} disabled={page >= pages - 1} className="p-1 hover:text-gray-600 disabled:opacity-20"><ChevronsRight size={16} /></button>
           </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 flex justify-end gap-2 bg-white border-t">
          <button type="button" onClick={() => sel && onSelect(sel)} disabled={!sel}
            className="bg-[#5b7fa6] hover:bg-[#4a6d93] disabled:opacity-40 text-white text-[11px] font-bold px-6 py-2 rounded-sm uppercase tracking-wider transition-all shadow-sm">SELECT</button>
          <button type="button" onClick={onCancel} className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white text-[11px] font-bold px-6 py-2 rounded-sm uppercase tracking-wider transition-all shadow-sm">CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ShippingContactField ───────────────────────────────────────────────
export default function ShippingContactField({
  value, onChange, userEmail,
}: { value: ShippingContact | null; onChange: (c: ShippingContact | null) => void; userEmail: string }) {
  const [contacts, setContacts] = useState<ShippingContact[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [ready, setReady] = useState(false);

  // Load contacts; seed default from profile API on first visit
  useEffect(() => {
    if (!userEmail) return;
    
    // Always trigger if not ready yet
    if (ready) {
      // If we are ready but value is still null and we have data, select the first one
      if (!value && contacts.length > 0) {
        onChange(contacts[0]);
      }
      return;
    }

    const stored = load(userEmail);
    if (stored.length > 0) {
      setContacts(stored);
      if (!value) onChange(stored[0]);
      setReady(true);
    } else {
      fetch("/api/user/profile").then(r => r.json()).then(profile => {
        if (profile?.name || profile?.email) {
          const parts = (profile.name || "").trim().split(/\s+/);
          const def: ShippingContact = {
            id: `default_${Date.now()}`,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            email: profile.email || "",
            workPhone: profile.contactNumber || "",
            jobTitle: "",
          };
          const list = [def];
          save(userEmail, list);
          setContacts(list);
          if (!value) onChange(def);
        }
        setReady(true);
      }).catch(() => setReady(true));
    }
  }, [userEmail, ready, value, onChange, contacts]);

  const handleAdd = useCallback((data: Omit<ShippingContact, "id">) => {
    const c: ShippingContact = { ...data, id: `c_${Date.now()}` };
    const updated = [...contacts, c];
    setContacts(updated);
    save(userEmail, updated);
    setShowAdd(false);
    setShowPicker(true);
  }, [contacts, userEmail]);

  const fullName = value ? `${value.firstName} ${value.lastName}`.trim() : "";

  return (
    <>
      <div className="border border-gray-300 rounded-sm overflow-hidden shadow-sm h-full flex flex-col bg-[#F4F4F4]">
        {/* Header */}
        <div className="bg-[#E1E1E1] px-4 py-2 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-tight text-black font-bold">Shipping Contact</span>
            <span className="text-red-500 font-bold text-lg leading-none ml-0.5">*</span>
          </div>
          <button type="button" onClick={() => setShowPicker(true)} title="Search / change contact"
            className="text-[#007ABC] hover:opacity-75 transition-opacity p-0.5">
            <Search size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Info display container */}
        <div className="px-8 py-10 flex-1 flex flex-col justify-center">
          {value ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Contact Name</p>
                <p className="text-[15px] font-bold text-black">{fullName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Contact Email Address</p>
                <p className="text-[14px] font-bold text-[#007ABC]">{value.email || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Contact Work Phone</p>
                <p className="text-[14px] font-bold text-black">{value.workPhone || "—"}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showPicker && (
        <PickerModal contacts={contacts} current={value}
          onSelect={c => { onChange(c); setShowPicker(false); }}
          onAdd={() => { setShowPicker(false); setShowAdd(true); }}
          onCancel={() => setShowPicker(false)} />
      )}
      {showAdd && (
        <AddModal onSave={handleAdd} onCancel={() => { setShowAdd(false); setShowPicker(true); }} />
      )}
    </>
  );
}
