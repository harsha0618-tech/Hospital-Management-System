import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import api from "../api/axios";

function Admin() {
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [revenue, setRevenue] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topMeds, setTopMeds] = useState([]);
  const [doctorLoad, setDoctorLoad] = useState([]);

const [staff, setStaff] = useState([]);
const [departments, setDepartments] = useState([]);
const [showAddStaff, setShowAddStaff] = useState(false);
const [staffForm, setStaffForm] = useState({
  role: "doctor",
  full_name: "",
  department_id: "",
  consultation_fee: "",
  joining_date: "",
  salary: "",
});
const [staffError, setStaffError] = useState("");

const loadStaff = () => {
  api.get("/admin/staff").then((r) => setStaff(r.data));
};

useEffect(() => {
  loadStaff();
  api.get("/admin/departments").then((r) => setDepartments(r.data));
}, []);

const handleAddStaff = async (e) => {
  e.preventDefault();
  setStaffError("");
  try {
    await api.post("/admin/staff", staffForm);
    setStaffForm({
      role: "doctor",
      full_name: "",
      department_id: "",
      consultation_fee: "",
      joining_date: "",
      salary: "",
    });
    setShowAddStaff(false);
    loadStaff();
  } catch (err) {
    setStaffError(err.response?.data?.error || "Could not add staff member");
  }
};

const handleToggleStatus = async (member) => {
  await api.put(`/admin/staff/${member.role}/${member.staff_id}/status`, {
    is_active: !member.is_active,
  });
  loadStaff();
};

const handleSalaryChange = (staff_id, value) => {
  setStaff((prev) =>
    prev.map((m) => (m.staff_id === staff_id ? { ...m, salary: value } : m))
  );
};

const handleSalarySave = async (member) => {
  await api.put(`/admin/staff/${member.role}/${member.staff_id}`, {
    salary: member.salary,
  });
  loadStaff();
};
  useEffect(() => {
    api.get("/reports/revenue-by-department").then((r) => setRevenue(r.data));
    api.get("/reports/low-stock").then((r) => setLowStock(r.data));
    api.get("/reports/top-medicines").then((r) => setTopMeds(r.data));
    api.get("/reports/doctor-load").then((r) => setDoctorLoad(r.data));
  }, []);

  const totalPatients = patients.length;
  const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.total_revenue || 0), 0);

  const statCards = [
    { label: "Total Patients", value: totalPatients, icon: "🧑‍🤝‍🧑", color: "admin" },
    { label: "Total Revenue", value: `₹${totalRevenue}`, icon: "💰", color: "reception" },
    { label: "Low Stock Medicines", value: lowStock.length, icon: "💊", color: "pharmacy" },
    { label: "Active Doctors", value: doctorLoad.length, icon: "🩺", color: "doctor" },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Full hospital overview, all departments" icon="🗂️" colorClass="admin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-card shadow-soft p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-${s.color}-light flex items-center justify-center text-xl`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold text-${s.color}-dark`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Department</h3>
          {revenue.map((r) => (
            <div key={r.department_name} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span>{r.department_name}</span>
              <span className="font-medium">₹{r.total_revenue} ({r.visit_count} visits)</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Prescribed Medicines</h3>
          {topMeds.map((m) => (
            <div key={m.medicine_name} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span>{m.medicine_name}</span>
              <span className="font-medium">{m.total_prescribed} units</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Doctor Patient Load</h3>
          {doctorLoad.map((d) => (
            <div key={d.full_name} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span>{d.full_name}</span>
              <span className="font-medium">{d.total_patients}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-card shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Low Stock Alerts</h3>
          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-400">All medicines well stocked.</p>
          ) : (
            lowStock.map((m) => (
              <div key={m.medicine_id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 text-red-500">
                <span>{m.medicine_name}</span>
                <span className="font-medium">{m.stock_qty} left</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
  <h2 className="text-lg font-semibold text-gray-700">Staff Management</h2>
  <button
    onClick={() => setShowAddStaff((v) => !v)}
    className="bg-admin-dark text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
  >
    {showAddStaff ? "Cancel" : "+ Recruit Staff"}
  </button>
</div>

{showAddStaff && (
  <form
    onSubmit={handleAddStaff}
    className="bg-white border border-gray-100 rounded-card shadow-soft p-5 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4"
  >
    <div>
      <label className="text-xs text-gray-500">Role</label>
      <select
        value={staffForm.role}
        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
      >
        <option value="doctor">Doctor</option>
        <option value="nurse">Nurse</option>
      </select>
    </div>

    <div>
      <label className="text-xs text-gray-500">Full Name</label>
      <input
        required
        value={staffForm.full_name}
        onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
      />
    </div>

    {staffForm.role === "doctor" && (
      <div>
        <label className="text-xs text-gray-500">Department</label>
        <select
          required
          value={staffForm.department_id}
          onChange={(e) => setStaffForm({ ...staffForm, department_id: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
        >
          <option value="">Select department</option>
          {departments.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>
    )}

    {staffForm.role === "doctor" && (
      <div>
        <label className="text-xs text-gray-500">Consultation Fee (₹)</label>
        <input
          type="number"
          value={staffForm.consultation_fee}
          onChange={(e) => setStaffForm({ ...staffForm, consultation_fee: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
        />
      </div>
    )}

    <div>
      <label className="text-xs text-gray-500">Joining Date</label>
      <input
        type="date"
        required
        value={staffForm.joining_date}
        onChange={(e) => setStaffForm({ ...staffForm, joining_date: e.target.value })}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
      />
    </div>

    <div>
      <label className="text-xs text-gray-500">Salary (₹/month)</label>
      <input
        type="number"
        required
        value={staffForm.salary}
        onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1"
      />
    </div>

    {staffError && <p className="text-xs text-red-500 col-span-full">{staffError}</p>}

    <div className="col-span-full flex justify-end">
      <button type="submit" className="bg-brand-DEFAULT text-white text-sm px-5 py-2 rounded-md">
        Save Staff Member
      </button>
    </div>
  </form>
)}

<div className="bg-white border border-gray-100 rounded-card shadow-soft overflow-x-auto mb-8">
  <table className="w-full text-sm">
    <thead className="bg-admin-light text-admin-dark text-xs uppercase">
      <tr>
        <th className="px-4 py-3 text-left">Name</th>
        <th className="px-4 py-3 text-left">Role</th>
        <th className="px-4 py-3 text-left">Department</th>
        <th className="px-4 py-3 text-left">Joining Date</th>
        <th className="px-4 py-3 text-left">Salary</th>
        <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">Action</th>
      </tr>
    </thead>
    <tbody>
      {staff.map((m) => (
        <tr key={`${m.role}-${m.staff_id}`} className="border-t border-gray-100">
          <td className="px-4 py-3">{m.full_name}</td>
          <td className="px-4 py-3 capitalize">{m.role}</td>
          <td className="px-4 py-3">{m.department_name || "—"}</td>
          <td className="px-4 py-3">
            {m.joining_date ? new Date(m.joining_date).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={m.salary ?? ""}
                onChange={(e) => handleSalaryChange(m.staff_id, e.target.value)}
                className="w-24 border border-gray-300 rounded-md px-2 py-1 text-xs"
              />
              <button onClick={() => handleSalarySave(m)} className="text-xs text-brand-dark underline">
                Save
              </button>
            </div>
          </td>
          <td className="px-4 py-3">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                m.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}
            >
              {m.is_active ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-4 py-3">
            <button onClick={() => handleToggleStatus(m)} className="text-xs font-medium underline text-gray-600">
              {m.is_active ? "Mark Inactive" : "Reactivate"}
            </button>
          </td>
        </tr>
      ))}
      {staff.length === 0 && (
        <tr>
          <td colSpan="7" className="px-4 py-6 text-center text-gray-400 text-xs">
            No staff records yet.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

<h2 className="text-lg font-semibold text-gray-700 mb-3">All Patients</h2>
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="admin" />

      <div className="bg-white border border-gray-100 rounded-card shadow-soft overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead className="bg-admin-light text-admin-dark text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Patient ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Doctor</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Total Bill</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((p) => (
              <tr key={p.patient_id} className="border-t border-gray-100">
                <td className="px-4 py-3">{p.patient_id}</td>
                <td className="px-4 py-3">{p.full_name}</td>
                <td className="px-4 py-3">{p.doctor_name}</td>
                <td className="px-4 py-3">{p.status}</td>
                <td className="px-4 py-3">₹{p.total_amount || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Admin;