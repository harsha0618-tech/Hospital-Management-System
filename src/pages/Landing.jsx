import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePatients } from "../context/PatientContext";

const roles = [
 { name: "Receptionist", role: "receptionist", path: "/receptionist", color: "reception", icon: "📋", desc: "Appointments & billing" },
{ name: "Doctor", role: "doctor", path: "/doctor", color: "doctor", icon: "🩺", desc: "Diagnosis & prescriptions" },
{ name: "Nurse", role: "nurse", path: "/nurse", color: "nurse", icon: "🩹", desc: "Vitals & patient care" },
{ name: "Lab Technician", role: "labtech", path: "/lab", color: "lab", icon: "🧪", desc: "Test reports & results" },
{ name: "Pharmacy", role: "pharmacist", path: "/pharmacy", color: "pharmacy", icon: "💊", desc: "Medicines & dispensing" },
{ name: "Admin", role: "admin", path: "/admin", color: "admin", icon: "🗂️", desc: "Full hospital overview" },
];

const roleToPath = {
  admin: "/admin",
  doctor: "/doctor",
  nurse: "/nurse",
  receptionist: "/receptionist",
  pharmacist: "/pharmacy",
  labtech: "/lab",
};

const highlights = [
  { icon: "🔗", title: "Unified Patient Records", desc: "Every department — reception, doctor, lab, pharmacy — works off a single Patient ID." },
  { icon: "⚡", title: "Real-time Workflow", desc: "Diagnosis, tests and prescriptions flow instantly from one department to the next." },
  { icon: "🔒", title: "Role-based Access", desc: "Each department sees only what it needs — clean, focused dashboards." },
  { icon: "📊", title: "Centralized Admin View", desc: "Administrators get a full, drillable overview of every patient and department." },
];

function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { patients } = usePatients();

 const [loggingIn, setLoggingIn] = useState(null);
  const [error, setError] = useState("");

  const [quickSearch, setQuickSearch] = useState("");
  const quickResults =
    quickSearch.trim().length >= 2
      ? patients
          .filter(
            (p) =>
              p.patient_id.toLowerCase().includes(quickSearch.toLowerCase()) ||
              p.full_name.toLowerCase().includes(quickSearch.toLowerCase())
          )
          .slice(0, 5)
      : [];

 const handleRoleLogin = async (role) => {
  setError("");
  setLoggingIn(role);

  try {
    const data = await login(role);
    navigate(roleToPath[data.role] || "/");
  } catch {
    setError(
      "Could not log in as this role. Make sure the backend and seeded users are set up."
    );
  } finally {
    setLoggingIn(null);
  }
};

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-light rounded-full blur-3xl opacity-60 -z-10"></div>
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-reception-light rounded-full blur-3xl opacity-50 -z-10"></div>

      <header className="bg-white border-b border-gray-100 shadow-soft">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand-DEFAULT flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-card-hover shrink-0">
              ✚
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-4xl font-bold text-brand-dark leading-tight">
                MCR Multispeciality Hospital
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 tracking-wide mt-1">
                DIGITAL HOSPITAL MANAGEMENT SYSTEM
              </p>
            </div>
          </div>

         
        </div>
      </header>

      <section className="text-center max-w-2xl mx-auto px-6 pt-10 pb-12">
        <span className="inline-block bg-brand-light text-brand-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
          MCR • DIGITAL HOSPITAL PLATFORM
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark leading-tight">
          One system, every department
        </h2>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Connecting reception, doctors, lab, pharmacy and administration — all from one place.
        </p>
        <div className="relative max-w-sm mx-auto mt-5">
          <input
            type="text"
            value={quickSearch}
            onChange={(e) => setQuickSearch(e.target.value)}
            placeholder="Quick lookup: Patient ID or Name"
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT"
          />
          {quickResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-card-hover z-10 overflow-hidden text-left">
              {quickResults.map((p) => (
                <div key={p.patient_id} className="px-4 py-2 text-xs border-b border-gray-50 last:border-0">
                  <span className="font-medium text-brand-dark">{p.patient_id}</span> — {p.full_name}
                  <span className="text-gray-400"> ({p.status})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {error && <p className="text-center text-xs text-red-500 mt-4">{error}</p>}

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-center text-xs font-medium text-gray-400 mb-5 tracking-wide">
          SELECT YOUR ROLE TO CONTINUE
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {roles.map((role) => (
            <button
              key={role.name}
            onClick={() => handleRoleLogin(role.role)}
disabled={loggingIn !== null}
className="group bg-white border border-gray-100 rounded-card shadow-soft p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover cursor-pointer disabled:opacity-50 disabled:cursor-wait"
            >
              <span className={`w-16 h-16 rounded-2xl bg-${role.color}-light flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform`}>
                {role.icon}
              </span>
              <h3 className={`text-sm font-semibold text-${role.color}-dark`}>{role.name}</h3>
             <p className="text-gray-400 text-xs mt-1 leading-tight">
  {loggingIn === role.role ? "Logging in..." : role.desc}
</p>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-gray-400 mb-2 tracking-wide">WHY MCR HMS</p>
          <h2 className="text-2xl font-bold text-brand-dark text-center mb-10">Built for real hospital workflows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="bg-brand-light/40 rounded-card p-6 text-center hover:shadow-soft transition-shadow">
                <div className="w-12 h-12 mx-auto rounded-xl bg-white flex items-center justify-center text-2xl shadow-soft mb-4">
                  {h.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{h.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-8 px-6">
        <p className="text-xs text-gray-400">MCR Multispeciality Hospital — Internal HMS Prototype</p>
        <p className="text-xs text-gray-300 mt-1">Now backed by a live PostgreSQL database</p>
      </footer>

     
    </div>
  );
}

export default Landing;