"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { PlusCircle, ArrowLeft, Loader2, Send, Tag, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { useSession } from "next-auth/react";
import ShippingContactField, { ShippingContact } from "@/components/ShippingContactField";
import ShippingAddressField, { ShippingAddress } from "@/components/ShippingAddressField";

const CATEGORIES = ["Technical Support", "Hardware Support", "Software Support", "General Inquiry", "RMA"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const DEFAULT_ROWS = 10;

interface RmaRow { serialNumber: string; productName: string; problemDescription: string; }
const emptyRow = (): RmaRow => ({ serialNumber: "", productName: "", problemDescription: "" });

export default function CreateTicketPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    subject: "", category: CATEGORIES[0], priority: PRIORITIES[1],
    description: "", partNumber: "", serialNumber: "",
  });
  const [shippingContact, setShippingContact] = useState<ShippingContact | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [rmaRows, setRmaRows] = useState<RmaRow[]>(Array.from({ length: DEFAULT_ROWS }, emptyRow));
  const [addRows, setAddRows] = useState("1");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isRMA = formData.category === "RMA";
  const userEmail = (session?.user as any)?.email || "";

  const updateRow = useCallback((i: number, f: keyof RmaRow, v: string) => {
    setRmaRows(prev => { const n = [...prev]; n[i] = { ...n[i], [f]: v }; return n; });
  }, []);

  const handleAddRows = () => {
    const n = Math.max(1, Math.min(20, parseInt(addRows) || 1));
    setRmaRows(prev => [...prev, ...Array.from({ length: n }, emptyRow)]);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent, startRow: number, startColIndex: number) => {
    const pasteData = e.clipboardData.getData("text");
    // Check if it looks like Excel data (contains tabs or newlines)
    if (!pasteData.includes("\t") && !pasteData.includes("\n")) return;

    e.preventDefault();
    const rows = pasteData.split(/\r?\n/).filter(r => r.trim() !== "");
    const fields: (keyof RmaRow)[] = ["serialNumber", "productName", "problemDescription"];
    
    setRmaRows(prev => {
      const newRows = [...prev];
      rows.forEach((rowText, rowIndex) => {
        const targetRowIndex = startRow + rowIndex;
        // Auto-expand if needed
        while (targetRowIndex >= newRows.length) {
          newRows.push(emptyRow());
        }
        
        const cols = rowText.split("\t");
        cols.forEach((colText, colIndex) => {
          const targetColIndex = startColIndex + colIndex;
          if (targetColIndex < fields.length) {
            const field = fields[targetColIndex];
            newRows[targetRowIndex] = { ...newRows[targetRowIndex], [field]: colText.trim() };
          }
        });
      });
      return newRows;
    });
  }, []);

  const buildRmaDesc = () => {
    const filled = rmaRows.filter(r => r.serialNumber || r.productName || r.problemDescription);
    const header = "RMA RETURN REQUEST\n" + "=".repeat(60) + "\n";
    const rows = filled.map((r, i) =>
      `Item ${i + 1}:\n  Serial: ${r.serialNumber || "N/A"}\n  Product: ${r.productName || "N/A"}\n  Problem: ${r.problemDescription || "N/A"}`
    ).join("\n\n");
    
    return header + rows;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        description: isRMA ? buildRmaDesc() : formData.description,
        partNumber: isRMA ? (shippingContact ? JSON.stringify({ contact: shippingContact, address: shippingAddress }) : "") : formData.partNumber,
        serialNumber: isRMA 
          ? JSON.stringify(rmaRows.filter(r => r.serialNumber.trim() || r.productName.trim() || r.problemDescription.trim())) 
          : formData.serialNumber,
      };
      await axios.post("/api/tickets", payload);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(lang === "ar" ? "فشل إنشاء التذكرة" : "Failed to create ticket");
    } finally { setLoading(false); }
  };

  const lbl = (text: string) => (
    <label className={`block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2 ${lang === "ar" ? "text-right" : "text-left"}`}>{text}</label>
  );

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === "ar" ? "font-arabic" : ""}`}>
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href="/dashboard" className={`flex items-center text-gray-500 hover:text-bgs-teal mb-6 transition-colors ${lang === "ar" ? "flex-row-reverse" : ""}`}>
          <ArrowLeft size={20} className={lang === "ar" ? "rotate-180 ml-2" : "mr-2"} />
          <span className="font-bold uppercase tracking-widest text-xs">{lang === "ar" ? "العودة إلى لوحة القيادة" : "Back to Dashboard"}</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`bg-bgs-navy p-6 text-white flex items-center justify-between ${lang === "ar" ? "flex-row-reverse" : ""}`}>
            <div className={lang === "ar" ? "text-right" : "text-left"}>
              <h1 className="text-2xl font-bold uppercase tracking-tight">{lang === "ar" ? "فتح تذكرة دعم" : "Open Support Ticket"}</h1>
              <p className="text-gray-300 text-sm mt-1">{lang === "ar" ? "املأ التفاصيل أدناه لتصعيد مشكلتك." : "Fill in the details below to escalate your issue."}</p>
            </div>
            <PlusCircle size={40} className="text-bgs-teal opacity-50" />
          </div>

          <form onSubmit={handleSubmit} className={`p-8 space-y-6 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Subject — always full width */}
              <div className="md:col-span-2">
                {lbl(lang === "ar" ? "الموضوع / عنوان المشكلة" : "Subject / Issue Title")}
                <input type="text" required className={`input-field ${lang === "ar" ? "text-right" : ""}`}
                  placeholder={lang === "ar" ? "مثال: الطابعة لا تتصل بالشبكة" : "e.g. Printer not connecting to network"}
                  value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>

              {/* Shipping Information — only RMA, Split row */}
              {isRMA && (
                <>
                  <div className="md:col-span-1">
                    <ShippingContactField
                      value={shippingContact}
                      onChange={setShippingContact}
                      userEmail={userEmail}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <ShippingAddressField
                      value={shippingAddress}
                      onChange={setShippingAddress}
                      userEmail={userEmail}
                    />
                  </div>
                </>
              )}

              {/* Part Number — non-RMA only */}
              {!isRMA && (
                <div>
                  {lbl(lang === "ar" ? "رقم القطعة (P/N)" : "Part Number (P/N)")}
                  <input type="text" className={`input-field ${lang === "ar" ? "text-right" : ""}`}
                    placeholder={lang === "ar" ? "مثال: BGS-400-TR" : "e.g. BGS-400-TR"}
                    value={formData.partNumber} onChange={e => setFormData({ ...formData, partNumber: e.target.value })} />
                </div>
              )}

              {/* Serial Number — non-RMA only */}
              {!isRMA && (
                <div>
                  {lbl(lang === "ar" ? "الرقم التسلسلي (S/N)" : "Serial Number (S/N)")}
                  <input type="text" className={`input-field ${lang === "ar" ? "text-right" : ""}`}
                    placeholder={lang === "ar" ? "مثال: SN123456789" : "e.g. SN123456789"}
                    value={formData.serialNumber} onChange={e => setFormData({ ...formData, serialNumber: e.target.value })} />
                </div>
              )}

              {/* Category */}
              <div>
                {lbl(lang === "ar" ? "الفئة" : "Category")}
                <div className="relative">
                  <Tag className={`absolute ${lang === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                  <select className={`input-field appearance-none ${lang === "ar" ? "pr-10 text-right" : "pl-10"}`}
                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Priority */}
              <div>
                {lbl(t("priority"))}
                <div className="relative">
                  <AlertTriangle className={`absolute ${lang === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                  <select className={`input-field appearance-none ${lang === "ar" ? "pr-10 text-right" : "pl-10"}`}
                    value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── RMA Table ─────────────────────────────────────────────────────── */}
            {isRMA ? (
              <div>
                {lbl(lang === "ar" ? "تفاصيل طلب الإرجاع (RMA)" : "RMA Items *")}
                <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-bgs-navy text-white">
                        <th className="border border-gray-600 px-3 py-3 text-left text-xs font-bold w-8">#</th>
                        <th className="border border-gray-600 px-4 py-3 text-left text-xs font-bold">
                          Serial Number <span className="text-red-400">(Mandatory)</span>
                        </th>
                        <th className="border border-gray-600 px-4 py-3 text-left text-xs font-bold">
                          Product Name <span className="text-blue-300">(Optional)</span>
                        </th>
                        <th className="border border-gray-600 px-4 py-3 text-left text-xs font-bold">
                          Problem Description <span className="text-red-400">(Mandatory)</span>
                        </th>
                        <th className="border border-gray-600 px-2 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rmaRows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="border border-gray-200 px-3 py-1 text-center text-gray-400 text-xs font-mono">{i + 1}</td>
                          {(["serialNumber", "productName", "problemDescription"] as (keyof RmaRow)[]).map((f, colIdx) => (
                            <td key={f} className="border border-gray-200 p-1">
                              <input type="text" className="w-full px-2 py-1.5 text-sm bg-transparent border-0 focus:outline-none focus:bg-blue-50 rounded transition-colors font-sans"
                                placeholder={f === "serialNumber" ? "S/N..." : f === "productName" ? "Product name..." : "Describe the issue..."}
                                value={row[f]} 
                                onPaste={e => handlePaste(e, i, colIdx)}
                                onChange={e => updateRow(i, f, e.target.value)} />
                            </td>
                          ))}
                          <td className="border border-gray-200 px-1 text-center">
                            {rmaRows.length > 1 && (
                              <button type="button" onClick={() => setRmaRows(p => p.filter((_, j) => j !== i))}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={14} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Add rows control */}
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-gray-500">Add</span>
                  <input type="number" min={1} max={20} value={addRows} onChange={e => setAddRows(e.target.value)}
                    className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bgs-teal text-center" />
                  <span className="text-xs text-gray-500">more row(s)</span>
                  <button type="button" onClick={handleAddRows}
                    className="flex items-center gap-1.5 text-xs font-bold text-bgs-teal border border-bgs-teal hover:bg-bgs-teal hover:text-white px-3 py-1.5 rounded-md transition-all uppercase tracking-wider">
                    <Plus size={14} /> Add Rows
                  </button>
                  <span className="text-xs text-gray-400 ml-2">Total: {rmaRows.length}</span>
                </div>
              </div>
            ) : (
              /* Regular description */
              <div>
                {lbl(lang === "ar" ? "وصف مفصل" : "Detailed Description")}
                <textarea required rows={6} className={`input-field resize-none ${lang === "ar" ? "text-right" : ""}`}
                  placeholder={lang === "ar" ? "يرجى تقديم أكبر قدر ممكن من التفاصيل..." : "Please provide as much detail as possible, including error codes and steps taken..."}
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            )}

            <div className={`pt-4 flex items-center ${lang === "ar" ? "justify-start space-x-reverse space-x-4" : "justify-end space-x-4"}`}>
              <Link href="/dashboard" className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-600">
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </Link>
              <button type="submit" disabled={loading}
                className={`btn-primary flex items-center px-10 ${lang === "ar" ? "space-x-reverse space-x-2" : "space-x-2"}`}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <><Send size={18} /><span>{lang === "ar" ? "إرسال التذكرة" : "SUBMIT TICKET"}</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
