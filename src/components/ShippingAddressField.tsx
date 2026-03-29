"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Phone } from "lucide-react";

export interface ShippingAddress {
  id: string;
  country: string;
  storeNumber: string;
  companyName: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  province: string;
  county: string;
  postalCode: string;
}

// ─── localStorage helpers ───────────────────────────────────────────────────
const getKey = (email: string) => `bgs_addresses_v2_${email}`; // Versioned key for new columns
const load = (email: string): ShippingAddress[] => {
  if (typeof window === "undefined" || !email) return [];
  try { return JSON.parse(localStorage.getItem(getKey(email)) || "[]"); } catch { return []; }
};
const save = (email: string, addresses: ShippingAddress[]) => {
  if (typeof window !== "undefined" && email) localStorage.setItem(getKey(email), JSON.stringify(addresses));
};

// ─── Add Address Modal ───────────────────────────────────────────────────────
function AddAddressModal({ onSave, onCancel }: { onSave: (d: Omit<ShippingAddress, "id">) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    country: "Saudi Arabia",
    storeNumber: "",
    companyName: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    province: "",
    county: "",
    postalCode: "",
  });
  const [err, setErr] = useState<Record<string, boolean>>({});

  const handle = () => {
    const e: Record<string, boolean> = {};
    if (!f.country.trim()) e.country = true;
    if (!f.companyName.trim()) e.companyName = true;
    if (!f.address.trim()) e.address = true;
    if (!f.city.trim()) e.city = true;
    if (!f.postalCode.trim()) e.postalCode = true;
    setErr(e);
    if (!Object.keys(e).length) onSave(f);
  };

  const row = (label: string, key: keyof typeof f, mandatory = false, isSelect = false) => (
    <div key={key} className="flex items-center mb-4 relative">
      <label className="w-40 text-sm font-bold text-gray-700 text-right pr-6 shrink-0">{label}</label>
      <div className="flex-1 flex items-center relative">
        {mandatory && <div className="absolute left-0 w-[4px] h-[80%] top-[10%] bg-red-600 z-10"></div>}
        {isSelect ? (
          <select
            value={f[key]}
            onChange={e => { setF(p => ({ ...p, [key]: e.target.value })); setErr(p => ({ ...p, [key]: false })); }}
            className={`w-full px-3 py-2 text-sm border focus:outline-none rounded-none transition-colors ${
              err[key] || mandatory ? "border-red-600" : "border-gray-300 focus:border-[#007ABC]"
            } ${mandatory ? "pl-4" : ""}`}
          >
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Oman">Oman</option>
            <option value="Qatar">Qatar</option>
            <option value="Bahrain">Bahrain</option>
          </select>
        ) : (
          <input
            type="text"
            value={f[key]}
            onChange={e => { setF(p => ({ ...p, [key]: e.target.value })); setErr(p => ({ ...p, [key]: false })); }}
            className={`w-full px-3 py-2 text-sm border focus:outline-none rounded-none transition-colors ${
              err[key] || mandatory ? "border-red-600" : "border-gray-300 focus:border-[#007ABC]"
            } ${mandatory ? "pl-4" : ""}`}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4 text-left">
      <div className="bg-white rounded-none shadow-2xl w-full max-w-[640px] overflow-hidden border border-gray-400">
        <div className="bg-[#1B365D] text-white px-5 py-2 flex items-center justify-between">
          <span className="text-sm font-bold">Address</span>
          <button type="button" onClick={onCancel} className="hover:opacity-70 transition-opacity"><X size={16} /></button>
        </div>
        <div className="px-5 py-3 bg-[#f8fafc] border-b">
           <h3 className="text-sm font-bold text-gray-700">Please enter all required fields.</h3>
        </div>
        <div className="px-10 py-10 max-h-[60vh] overflow-y-auto">
          {row("Country", "country", true, true)}
          {row("Store Number", "storeNumber")}
          {row("Company Name", "companyName", true)}
          {row("Address", "address", true)}
          {row("Address 2", "address2")}
          {row("City", "city", true)}
          {row("State", "state")}
          {row("Province", "province")}
          {row("County", "county")}
          {row("Postal Code", "postalCode", true)}
        </div>
        <div className="px-8 py-5 border-t bg-gray-50 flex gap-4">
          <button type="button" onClick={handle} className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white text-sm font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-colors shadow-sm">SAVE</button>
          <button type="button" onClick={onCancel} className="bg-[#d2d9e0] hover:bg-gray-300 text-[#4a5568] text-sm font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-colors shadow-sm">CLOSE</button>
          <button type="button" onClick={() => setF({ country: "Saudi Arabia", storeNumber: "", companyName: "", address: "", address2: "", city: "", state: "", province: "", county: "", postalCode: "" })} className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white text-sm font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-colors shadow-sm">RESET</button>
        </div>
      </div>
    </div>
  );
}

// ─── Address Picker Modal ────────────────────────────────────────────────────
const PAGE_SIZE = 10;
function AddressPickerModal({
  addresses, current, onSelect, onAdd, onCancel
}: { addresses: ShippingAddress[]; current: ShippingAddress | null; onSelect: (a: ShippingAddress) => void; onAdd: () => void; onCancel: () => void }) {
  const [sel, setSel] = useState<ShippingAddress | null>(current);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [showQ, setShowQ] = useState(false);

  const filtered = addresses.filter(a => !q || [a.companyName, a.address, a.city, a.postalCode, a.province, a.county].some(v => v.toLowerCase().includes(q.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4 text-left font-sans">
      <style>{`
        .address-picker-table-container::-webkit-scrollbar {
          height: 6px;
        }
        .address-picker-table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .address-picker-table-container::-webkit-scrollbar-thumb {
          background: #5b7fa6;
          border-radius: 3px;
        }
        .address-picker-table-container::-webkit-scrollbar-thumb:hover {
          background: #4a6d93;
        }
      `}</style>
      <div className="bg-white rounded-none shadow-2xl w-full max-w-[1100px] overflow-hidden border border-gray-400">
        <div className="px-4 py-2 border-b border-gray-200">
          <span className="text-base font-bold text-gray-700 font-bold uppercase tracking-tight">Address</span>
        </div>

        {/* Toolbar */}
        <div className="px-2 py-2 border-b bg-white flex items-center justify-between">
          <div className="flex gap-2">
            <button type="button" onClick={onAdd} title="Add new" className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white p-1.5 rounded-sm shadow-sm transition-colors"><Plus size={18} /></button>
            <button type="button" onClick={() => { setShowQ(s => !s); setPage(0); }} title="Search" className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white p-1.5 rounded-sm shadow-sm transition-colors text-white"><Search size={16} /></button>
            <button type="button" className="bg-[#5b7fa6] text-white p-1.5 rounded-sm shadow-sm"><Phone size={16} /></button>
          </div>
          <span className="text-xs font-medium text-gray-400">
             {filtered.length ? `${page * PAGE_SIZE + 1} - ${Math.min((page + 1) * PAGE_SIZE, filtered.length)} of ${filtered.length}+` : "0 addresses"}
          </span>
        </div>

        {showQ && (
          <div className="px-4 py-2 bg-gray-100 border-b">
            <input autoFocus type="text" value={q} onChange={e => { setQ(e.target.value); setPage(0); }}
              placeholder="Search by company, address, city..." className="w-full px-4 py-2 text-sm border border-gray-300 rounded-none focus:outline-none transition-all" />
          </div>
        )}

        {/* Table with all columns from image: Company Name, Address, State, Address 2, Province, County, Country */}
        <div className="overflow-x-auto max-h-[440px] border-b address-picker-table-container">
          <table className="w-full text-[13px] border-collapse min-w-[1200px]">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <tr>
                {["Company Name", "Address", "State", "Address 2", "Province", "County", "Country"].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-bold text-gray-700 border-r border-gray-200 last:border-r-0 tracking-tight">
                    <span className="text-[12px]">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!paged.length ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No addresses found. Click + to add one.
                </td></tr>
              ) : paged.map(a => (
                <tr key={a.id} onClick={() => setSel(a)}
                  className={`cursor-pointer transition-colors ${sel?.id === a.id ? "bg-[#90CAF9] text-gray-900 border-b-[#90CAF9]" : "hover:bg-[#f1f5f9] border-b border-gray-100"}`}>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0 font-medium">{a.companyName || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.address || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.state || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.address2 || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.province || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.county || "-"}</td>
                  <td className="px-4 py-2.5 border-r border-gray-200 last:border-r-0">{a.country || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination icons from image centering */}
        <div className="px-4 py-2 flex items-center justify-center gap-4 bg-white">
           <div className="flex gap-2 items-center text-gray-300 scale-90">
             <button type="button" onClick={() => setPage(0)} disabled={!page} className="p-1 hover:text-gray-500 disabled:opacity-20 transition-colors"><ChevronsLeft size={16} /></button>
             <button type="button" onClick={() => setPage(p => p - 1)} disabled={!page} className="p-1 hover:text-gray-600 disabled:opacity-20 transition-colors"><ChevronLeft size={16} /></button>
             <button type="button" onClick={() => setPage(p => p + 1)} disabled={page >= pages - 1} className="p-1 hover:text-gray-500 disabled:opacity-20 transition-colors"><ChevronRight size={16} /></button>
             <button type="button" onClick={() => setPage(pages - 1)} disabled={page >= pages - 1} className="p-1 hover:text-gray-300 disabled:opacity-20 transition-colors"><ChevronsRight size={16} /></button>
           </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t bg-white flex justify-end gap-2">
          <button type="button" onClick={() => sel && onSelect(sel)} disabled={!sel}
            className="bg-[#5b7fa6] hover:bg-[#4a6d93] disabled:opacity-40 text-white text-[11px] font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-all shadow-sm">SELECT</button>
          <button type="button" onClick={onCancel} className="bg-[#5b7fa6] hover:bg-[#4a6d93] text-white text-[11px] font-bold px-8 py-2 rounded-sm uppercase tracking-wider transition-all shadow-sm">CANCEL</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ShippingAddressField ───────────────────────────────────────────────
export default function ShippingAddressField({
  value, onChange, userEmail,
}: { value: ShippingAddress | null; onChange: (a: ShippingAddress | null) => void; userEmail: string }) {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [ready, setReady] = useState(false);

  // Load addresses; seed default from profile API on first visit
  useEffect(() => {
    if (!userEmail) return;

    // Always trigger if not ready yet
    if (ready) {
      // If we are ready but value is still null and we have data, select the first one
      if (!value && addresses.length > 0) {
        onChange(addresses[0]);
      }
      return;
    }

    const stored = load(userEmail);
    if (stored.length > 0) {
      setAddresses(stored);
      if (!value) onChange(stored[0]);
      setReady(true);
    } else {
      fetch("/api/user/profile").then(r => r.json()).then(profile => {
        if (profile?.address) {
          const def: ShippingAddress = {
            id: `default_addr_${Date.now()}`,
            country: "Saudi Arabia",
            storeNumber: "",
            companyName: profile.companyName || "",
            address: profile.address || "",
            address2: "",
            city: "Riyadh",
            state: "",
            province: "",
            county: "",
            postalCode: "12474",
          };
          const list = [def];
          save(userEmail, list);
          setAddresses(list);
          if (!value) onChange(def);
        }
        setReady(true);
      }).catch(() => setReady(true));
    }
  }, [userEmail, ready, value, onChange, addresses]);

  const handleAdd = useCallback((data: Omit<ShippingAddress, "id">) => {
    const a: ShippingAddress = { ...data, id: `a_${Date.now()}` };
    const updated = [...addresses, a];
    setAddresses(updated);
    save(userEmail, updated);
    setShowAdd(false);
    setShowPicker(true);
  }, [addresses, userEmail]);

  return (
    <>
      <div className="border border-gray-300 rounded-sm overflow-hidden shadow-sm h-full flex flex-col bg-[#F4F4F4]">
        {/* Header */}
        <div className="bg-[#E1E1E1] px-4 py-2 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-gray-500" />
            <span className="text-xs font-bold uppercase tracking-tight text-black font-bold">Return Shipping Address</span>
            <span className="text-red-500 font-bold text-lg leading-none ml-0.5">*</span>
          </div>
          <button type="button" onClick={() => setShowPicker(true)} title="Search / change address"
            className="text-[#007ABC] hover:opacity-75 transition-opacity p-0.5">
            <Search size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Info display */}
        <div className="px-8 py-10 flex-1 flex flex-col justify-center">
          {value && (
            <div className="text-[14px] text-black leading-[1.8] font-bold italic">
              <p>{value.companyName}</p>
              <p>{value.address},</p>
              {value.address2 && <p>{value.address2},</p>}
              <p>{value.city},</p>
              <p>{value.country}, {value.postalCode}</p>
            </div>
          )}
        </div>
      </div>

      {showPicker && (
        <AddressPickerModal addresses={addresses} current={value}
          onSelect={a => { onChange(a); setShowPicker(false); }}
          onAdd={() => { setShowPicker(false); setShowAdd(true); }}
          onCancel={() => setShowPicker(false)} />
      )}
      {showAdd && (
        <AddAddressModal onSave={handleAdd} onCancel={() => { setShowAdd(false); setShowPicker(true); }} />
      )}
    </>
  );
}
