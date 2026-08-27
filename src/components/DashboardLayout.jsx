import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
const navItems = [
  { name: "Receptionist", path: "/receptionist", icon: "📋", color: "reception" },
  { name: "Doctor", path: "/doctor", icon: "🩺", color: "doctor" },
  { name: "Nurse", path: "/nurse", icon: "🩹", color: "nurse" },
  { name: "Lab Technician", path: "/lab", icon: "🧪", color: "lab" },
  { name: "Pharmacy", path: "/pharmacy", icon: "💊", color: "pharmacy" },
  
  { name: "Admin", path: "/admin", icon: "🗂️", color: "admin" },
  
];


function DashboardLayout({ title, subtitle, icon, colorClass = "brand", children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      setPwSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(err.response?.data?.error || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col shrink-0 hidden md:flex">
        <Link to="/" className="flex items-center gap-2.5 px-6 py-6 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-brand-DEFAULT flex items-center justify-center text-white text-base font-bold shrink-0">
            ✚
          </div>
          <div>
            <p className="text-sm font-bold text-brand-dark leading-none">MCR HMS</p>
            <p className="text-[10px] text-gray-400 tracking-wide">MULTISPECIALITY HOSPITAL</p>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-semibold text-gray-300 px-3 mb-1 tracking-wide">
            DEPARTMENTS
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? `bg-${item.color}-light text-${item.color}-dark`
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-300">MCR HMS Prototype v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl bg-${colorClass}-light flex items-center justify-center text-xl shrink-0`}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h1 className={`text-lg font-bold text-${colorClass}-dark leading-tight truncate`}>
                {title}
              </h1>
              {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
           <span className={`hidden sm:inline-flex items-center gap-1.5 bg-${colorClass}-light text-${colorClass}-dark text-xs font-medium px-3 py-1.5 rounded-full`}>
  ● {user?.name || title.replace(" Dashboard", "")}
</span>
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition"
            >
              ← Home
            </Link>
                       <button
              onClick={() => setShowPasswordModal(true)}
              className="text-sm text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition"
            >
              🔑 Change Password
            </button>
            <button
  onClick={() => { logout(); navigate("/"); }}
  className="text-sm text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full transition"
>
  Logout
</button>
          </div>
        </header>

              {/* Page content */}
        <main className="flex-1 px-6 sm:px-8 py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              />
              {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
              {pwSuccess && <p className="text-green-600 text-xs">{pwSuccess}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPwError(""); setPwSuccess(""); }}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 bg-${colorClass}-DEFAULT text-white rounded-lg py-2 text-sm hover:opacity-90`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;