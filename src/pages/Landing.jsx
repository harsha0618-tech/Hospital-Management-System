import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import doctorsList from "../data/doctorsList";
import nursesList from "../data/nursesList";
import { usePatients } from "../context/PatientContext";
const roles = [
  {
    name: "Receptionist",
    path: "/receptionist",
    color: "reception",
    icon: "📋",
    desc: "Appointments & billing",
  },
  {
    name: "Doctor",
    path: "/doctor",
    color: "doctor",
    icon: "🩺",
    desc: "Diagnosis & prescriptions",
  },

  {
    name: "Nurse",
    path: "/nurse",
    color: "nurse",
    icon: "🩹",
    desc: "Vitals & patient care",
  },

  {
    name: "Lab Technician",
    path: "/lab",
    color: "lab",
    icon: "🧪",
    desc: "Test reports & results",
  },
  {
    name: "Pharmacy",
    path: "/pharmacy",
    color: "pharmacy",
    icon: "💊",
    desc: "Medicines & dispensing",
  },
  {
    name: "Admin",
    path: "/admin",
    color: "admin",
    icon: "🗂️",
    desc: "Full hospital overview",
  },
];

const highlights = [
  {
    icon: "🔗",
    title: "Unified Patient Records",
    desc: "Every department — reception, doctor, lab, pharmacy — works off a single Patient ID.",
  },
  {
    icon: "⚡",
    title: "Real-time Workflow",
    desc: "Diagnosis, tests and prescriptions flow instantly from one department to the next.",
  },
  {
    icon: "🔒",
    title: "Role-based Access",
    desc: "Each department sees only what it needs — clean, focused dashboards.",
  },
  {
    icon: "📊",
    title: "Centralized Admin View",
    desc: "Administrators get a full, drillable overview of every patient and department.",
  },
];

function Landing() {
  const { login } = useAuth();
const [loginRole, setLoginRole] = useState(null); // { path, color, staffList }
const [selectedStaff, setSelectedStaff] = useState("");
const { patients } = usePatients();
const [quickSearch, setQuickSearch] = useState("");
const quickResults = quickSearch.trim().length >= 2
  ? patients.filter(p =>
      p.patientId.toLowerCase().includes(quickSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(quickSearch.toLowerCase())
    ).slice(0, 5)
  : [];
const roleStaffMap = {
  "/doctor": doctorsList.map((d) => d.name),
  "/nurse": nursesList,
};

const handleRoleClick = (role) => {
  const staffList = roleStaffMap[role.path];
  if (!staffList) {
    login(role.path.slice(1), role.name);
    navigate(role.path);
    return;
  }
  setLoginRole(role);
  setSelectedStaff("");
};

const confirmLogin = () => {
  if (!selectedStaff) return;
  login(loginRole.path.slice(1), selectedStaff);
  navigate(loginRole.path);
  setLoginRole(null);
};
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-light rounded-full blur-3xl opacity-60 -z-10"></div>
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-reception-light rounded-full blur-3xl opacity-50 -z-10"></div>

      {/* Big Hospital Header Banner */}
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

          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center gap-1.5 bg-brand-light text-brand-dark text-sm font-medium px-5 py-2.5 rounded-full shadow-soft hover:shadow-card-hover hover:bg-brand-DEFAULT hover:text-white transition-all"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center max-w-2xl mx-auto px-6 pt-10 pb-12">
        <span className="inline-block bg-brand-light text-brand-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide">
          MCR • DIGITAL HOSPITAL PLATFORM
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark leading-tight">
          One system, every department
        </h2>
        <p className="text-gray-500 mt-3 text-sm sm:text-base">
          Connecting reception, doctors, lab, pharmacy and administration —
          all from one place.
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
        <div key={p.patientId} className="px-4 py-2 text-xs border-b border-gray-50 last:border-0">
          <span className="font-medium text-brand-dark">{p.patientId}</span> — {p.name}
          <span className="text-gray-400"> ({p.status})</span>
        </div>
      ))}
    </div>
  )}
</div>
      </section>

      {/* Role cards — smaller, compact */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-center text-xs font-medium text-gray-400 mb-5 tracking-wide">
          SELECT YOUR ROLE TO CONTINUE
        </p>
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
  {roles.map((role) => (
    <button
      key={role.name}
     onClick={() => handleRoleClick(role)}
      className="group bg-white border border-gray-100 rounded-card shadow-soft p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover cursor-pointer"
    >
      <span
        className={`w-16 h-16 rounded-2xl bg-${role.color}-light flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform`}
      >
        {role.icon}
      </span>
      <h3 className={`text-sm font-semibold text-${role.color}-dark`}>
        {role.name}
      </h3>
      <p className="text-gray-400 text-xs mt-1 leading-tight">
        {role.desc}
      </p>
    </button>
  ))}
</div> 
      </section>

      {/* Highlights / features section */}
      <section className="bg-white border-t border-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-gray-400 mb-2 tracking-wide">
            WHY MCR HMS
          </p>
          <h2 className="text-2xl font-bold text-brand-dark text-center mb-10">
            Built for real hospital workflows
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="bg-brand-light/40 rounded-card p-6 text-center hover:shadow-soft transition-shadow"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-white flex items-center justify-center text-2xl shadow-soft mb-4">
                  {h.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5">
                  {h.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-6">
        <p className="text-xs text-gray-400">
          MCR Multispeciality Hospital — Internal HMS Prototype
        </p>
        <p className="text-xs text-gray-300 mt-1">
          UI prototype — data not yet connected to a live database
        </p>
      </footer>
      {loginRole && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-card shadow-card-hover max-w-sm w-full p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Login as {loginRole.name}</h3>
      <select
        value={selectedStaff}
        onChange={(e) => setSelectedStaff(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
      >
        <option value="">Select your name</option>
        {roleStaffMap[loginRole.path].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={() => setLoginRole(null)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
        <button onClick={confirmLogin} className="bg-brand-DEFAULT text-white text-sm px-4 py-2 rounded-md">Login</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Landing;