"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { 
  Users, 
  UserPlus, 
  ArrowLeft, 
  Shield, 
  Mail, 
  Trash2, 
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";

export default function UserManagementPage() {
  const { t, lang } = useLanguage();
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "USER",
    companyName: "" 
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? "فشل جلب المستخدمين" : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "USER", companyName: "" });
    setEditingUser(null);
    setError("");
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: user.plainPassword || "", 
      role: user.role || "USER",
      companyName: user.companyName || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingUser) {
        await axios.patch(`/api/admin/users/${editingUser.id}`, formData);
      } else {
        await axios.post("/api/admin/users", formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || (lang === 'ar' ? `فشل ${editingUser ? 'تحديث' : 'إنشاء'} المستخدم` : `Failed to ${editingUser ? 'update' : 'create'} user`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: any) => {
    if (!user.id) {
      alert("Error: User ID is missing!");
      return;
    }

    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف المستخدم "${user.name}"؟` : `Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      alert(lang === 'ar' ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      console.error("Delete user error:", err);
      alert(`Delete error: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-bgs-teal" size={40} />
    </div>
  );

  return (
    <div className={`bg-gray-50 min-h-screen pt-24 pb-12 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/admin" className={`flex items-center text-gray-500 hover:text-bgs-teal mb-6 transition-colors ${lang === 'ar' ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <ArrowLeft size={20} className={lang === 'ar' ? 'rotate-180 ml-2' : 'mr-2'} />
          <span className="font-bold uppercase tracking-widest text-[10px]">{t("admin")} {t("dashboard")}</span>
        </Link>

        <div className={`flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
          <div className={`${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <h1 className={`text-2xl md:text-3xl font-bold text-bgs-navy uppercase flex items-center ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Users className={`text-bgs-teal shrink-0 ${lang === 'ar' ? 'ml-3' : 'mr-3'}`} size={28} />
              {t("userManagement")}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{lang === 'ar' ? "إدارة الوصول إلى النظام والأدوار" : "Manage system access and roles"}</p>
          </div>
          {session?.user?.role === "SUPERADMIN" && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className={`bg-bgs-teal hover:bg-bgs-teal/90 text-white px-6 py-2.5 rounded-lg flex items-center justify-center font-bold uppercase text-xs tracking-widest transition-all shadow-md active:scale-95 whitespace-nowrap ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-2' : 'space-x-2'}`}
            >
              <UserPlus size={18} />
              <span>{lang === 'ar' ? "أضف مستخدم جديد" : "Add New User"}</span>
            </button>
          )}
        </div>

        {error && (
          <div className={`bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-3 border-l-0 border-r-4' : 'space-x-3'}`}>
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className={`w-full min-w-[700px] ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-[0.15em] border-b">
                  <th className="px-6 py-4">{lang === 'ar' ? "تفاصيل المستخدم" : "User Details"}</th>
                  <th className="px-6 py-4">{lang === 'ar' ? "الدور" : "Role"}</th>
                  <th className="px-6 py-4">{lang === 'ar' ? "الشركة" : "Company"}</th>
                  <th className="px-6 py-4">{lang === 'ar' ? "انضم" : "Joined"}</th>
                  {session?.user?.role === "SUPERADMIN" && <th className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t("actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className={`flex items-center ${lang === 'ar' ? 'flex-row-reverse space-x-reverse space-x-3' : 'space-x-3'}`}>
                        <div className="w-10 h-10 bg-bgs-navy text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                          {user.name?.[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-bgs-navy truncate max-w-[150px] md:max-w-xs">{user.name}</div>
                          <div className={`text-xs text-gray-400 flex items-center truncate max-w-[150px] md:max-w-xs ${lang === 'ar' ? 'flex-row-reverse mt-1' : ''}`}>
                            <Mail size={12} className={lang === 'ar' ? 'ml-1 shrink-0' : 'mr-1 shrink-0'} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter shadow-sm border ${
                        user.role === 'SUPERADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        user.role === 'ADMIN' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="truncate max-w-[120px]">{user.companyName || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    {session?.user?.role === "SUPERADMIN" && (
                      <td className={`px-6 py-4 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                        <div className={`flex items-center ${lang === 'ar' ? 'justify-start space-x-reverse space-x-1 md:space-x-2' : 'justify-end space-x-1 md:space-x-2'}`}>
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-gray-400 hover:text-bgs-teal hover:bg-teal-50 rounded-lg transition-all" 
                            title={lang === 'ar' ? "تعديل المستخدم" : "Edit User"}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                            title={lang === 'ar' ? "حذف المستخدم" : "Delete User"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bgs-navy/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
              <h3 className={`font-bold text-bgs-navy uppercase tracking-widest flex items-center text-sm md:text-base ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
                <Shield size={20} className={`text-bgs-teal shrink-0 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {editingUser 
                  ? (lang === 'ar' ? "تحديث المعلومات" : "Update Information") 
                  : (lang === 'ar' ? "إضافة مستخدم للنظام" : "Add System User")}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={`p-6 md:p-8 space-y-6 ${lang === 'ar' ? 'text-right dir-rtl' : 'text-left'}`}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input 
                    type="text" 
                    required 
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input 
                    type="email" 
                    required 
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? "اسم الشركة (اختياري)" : "Company Name (Optional)"}
                  </label>
                  <input 
                    type="text" 
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? `كلمة المرور ${editingUser ? "(اتركها فارغة للاحتفاظ بها)" : ""}` : `Password ${editingUser ? "(Leave blank to keep)" : ""}`}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required={!editingUser}
                      className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all text-sm ${lang === 'ar' ? 'pl-12 text-right' : 'pr-12 text-left'}`}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-bgs-teal transition-colors`}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    {lang === 'ar' ? "دور المستخدم" : "User Role"}
                  </label>
                  <select 
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgs-teal transition-all text-sm ${lang === 'ar' ? 'text-right' : 'text-left'}`}
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="USER">{lang === 'ar' ? "مستخدم عادي" : "Standard User"}</option>
                    <option value="ADMIN">{lang === 'ar' ? "مسؤول" : "Administrator"}</option>
                    <option value="SUPERADMIN">{lang === 'ar' ? "مسؤول متميز" : "Super Admin"}</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className={`w-full bg-bgs-navy hover:bg-bgs-navy/90 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center disabled:opacity-50 shadow-lg active:translate-y-px ${lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                <span>
                  {editingUser 
                    ? (lang === 'ar' ? "تحديث الحساب" : "Update Account") 
                    : (lang === 'ar' ? "إنشاء حساب دخول" : "Create Access Account")}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
