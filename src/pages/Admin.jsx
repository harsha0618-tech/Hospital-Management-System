import { useState, useEffect, Fragment } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import api from "../api/axios";

function Admin() {
 const { patients, refresh } = usePatients();
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
const [newCredentials, setNewCredentials] = useState(null); // { username, temp_password, full_name }
const [openHistoryId, setOpenHistoryId] = useState(null);
const [historyVisits, setHistoryVisits] = useState([]);

const toggleHistory = async (patient) => {
  if (openHistoryId === patient.patient_id) {
    setOpenHistoryId(null);
    return;
  }
  const { data } = await api.get(`/patients/${patient.patient_id}`);
  const previousVisits = (data.visits || []).filter((v) => v.visit_id !== patient.visit_id);
  const withReports = await Promise.all(
    previousVisits.map(async (v) => {
      try {
        const { data: reports } = await api.get(`/lab/reports/${v.visit_id}`);
        return { ...v, lab_reports: reports };
      } catch {
        return { ...v, lab_reports: [] };
      }
    })
  );
  setHistoryVisits(withReports);
  setOpenHistoryId(patient.patient_id);
};
const loadStaff = () => {
  api.get("/admin/staff").then((r) => setStaff(r.data));
};

const [auditLog, setAuditLog] = useState([]);
const loadAuditLog = () => {
  api.get("/admin/audit-log").then((r) => setAuditLog(r.data));
};

const handleMarkPaid = async (patient) => {
  await api.put(`/admin/billing/${patient.visit_id}/payment`, { payment_status: "Paid" });
  await Promise.all([refresh(), loadAuditLog()]);
};

useEffect(() => {
  loadStaff();
  loadAuditLog();
  api.get("/admin/departments").then((r) => setDepartments(r.data));
}, []);
// `patients` here comes from usePatients() at the top of the component,
// which already has a refresh() method — call it after a payment update
// so the table reflects the new status immediately.
async function refreshPatientsIfAny() {
  // usePatients() already exposes this; if you destructured it as `refresh`
  // above, just call refresh() directly here instead of this wrapper.
}

useEffect(() => {
  loadStaff();
  loadAuditLog();
  api.get("/admin/departments").then((r) => setDepartments(r.data));
}, []);

const handleAddStaff = async (e) => {
  e.preventDefault();
  setStaffError("");
  try {
    const { data } = await api.post("/admin/staff", staffForm);
    setNewCredentials({
      full_name: staffForm.full_name,
      username: data.username,
      temp_password: data.temp_password,
    });
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
        <th className="px-4 py-3 text-left">Age</th>
        <th className="px-4 py-3 text-left">Gender</th>
        <th className="px-4 py-3 text-left">Department</th>
        <th className="px-4 py-3 text-left">Doctor</th>
        <th className="px-4 py-3 text-left">Nurse</th>
        <th className="px-4 py-3 text-left">Visit Date</th>
        <th className="px-4 py-3 text-left">Diagnosis</th>
        <th className="px-4 py-3 text-left">Consultation</th>
        <th className="px-4 py-3 text-left">Lab</th>
        <th className="px-4 py-3 text-left">Pharmacy</th>
        <th className="px-4 py-3 text-left">Total Bill</th>
        <th className="px-4 py-3 text-left">Payment</th>
               <th className="px-4 py-3 text-left">Status</th>
        <th className="px-4 py-3 text-left">History</th>
      </tr>
    </thead>
    <tbody>
          {filteredPatients.map((p) => (
        <Fragment key={p.patient_id}>
        <tr className="border-t border-gray-100">
          <td className="px-4 py-3">{p.patient_id}</td>
          <td className="px-4 py-3">{p.full_name}</td>
          <td className="px-4 py-3">{p.age ?? "—"}</td>
          <td className="px-4 py-3">{p.gender ?? "—"}</td>
          <td className="px-4 py-3">{p.department_name ?? "—"}</td>
          <td className="px-4 py-3">{p.doctor_name ?? "—"}</td>
          <td className="px-4 py-3">{p.nurse_name ?? "—"}</td>
          <td className="px-4 py-3">
            {p.visit_date ? new Date(p.visit_date).toLocaleDateString() : "—"}
          </td>
          <td className="px-4 py-3">{p.diagnosis ?? "—"}</td>
          <td className="px-4 py-3">₹{p.consultation_fee ?? 0}</td>
          <td className="px-4 py-3">₹{p.lab_total ?? 0}</td>
          <td className="px-4 py-3">₹{p.pharmacy_total ?? 0}</td>
          <td className="px-4 py-3 font-medium">₹{p.total_amount ?? 0}</td>
        <td className="px-4 py-3">
            <div className="flex flex-col items-start gap-1">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  p.payment_status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {p.payment_status ?? "Pending"}
              </span>
              {p.payment_status !== "Paid" && p.total_amount ? (
                <button
                  onClick={() => handleMarkPaid(p)}
                  className="text-[11px] text-brand-dark underline"
                >
                  Mark Payment Done
                </button>
              ) : null}
            </div>
          </td>
          <td className="px-4 py-3">{p.status}</td>
          <td className="px-4 py-3">
            <button onClick={() => toggleHistory(p)} className="text-[11px] text-admin-dark underline">
              {openHistoryId === p.patient_id ? "▲ Hide" : "▼ View"}
            </button>
          </td>
        </tr>
        {openHistoryId === p.patient_id && (
          <tr>
            <td colSpan={15} className="px-4 py-3 bg-gray-50">
              {historyVisits.length === 0 ? (
                <p className="text-xs text-gray-400">No previous visits for this patient.</p>
              ) : (
                <div className="flex flex-col gap-2">
                                   {historyVisits.map((v) => (
                    <div key={v.visit_id} className="bg-white border border-gray-200 rounded-md px-3 py-2 text-xs">
                      <p className="font-medium text-gray-700 mb-1">{v.visit_date} — {v.doctor_name} ({v.department_name}) — {v.status}</p>
                      <p className="text-gray-600">Diagnosis: {v.diagnosis || "—"}</p>
                      <p className="text-gray-600">Total Bill: ₹{v.total_amount ?? 0} ({v.payment_status ?? "Pending"})</p>
                      {v.lab_reports && v.lab_reports.length > 0 && (
                        <div className="mt-2 pl-2 border-l-2 border-admin-DEFAULT/40 flex flex-col gap-1">
                          <p className="text-gray-500 font-medium">Lab Reports:</p>
                          {v.lab_reports.map((r) => (
                            <p key={r.report_id} className="text-gray-600">
                              {r.test_name}: {r.report_text} (₹{r.cost})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </td>
          </tr>
        )}
        </Fragment>
      ))}
      {filteredPatients.length === 0 && (
        <tr>
          <td colSpan="15" className="px-4 py-6 text-center text-gray-400 text-xs">
            No patients found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
{newCredentials && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-card shadow-card-hover max-w-sm w-full p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Staff account created</h3>
      <p className="text-xs text-gray-500 mb-4">
        Share these login details with {newCredentials.full_name}. This password is shown only once.
      </p>
      <div className="bg-gray-50 rounded-md p-3 text-sm mb-4 space-y-1">
        <p><span className="text-gray-400">Username:</span> <strong>{newCredentials.username}</strong></p>
        <p><span className="text-gray-400">Password:</span> <strong>{newCredentials.temp_password}</strong></p>
      </div>
      <button
        onClick={() => setNewCredentials(null)}
        className="w-full bg-admin-dark text-white text-sm rounded-md py-2"
      >
        Done
      </button>
    </div>
  </div>
)}
<h2 className="text-lg font-semibold text-gray-700 mb-3 mt-8">Activity Log</h2>
<div className="bg-white border border-gray-100 rounded-card shadow-soft overflow-x-auto mb-8">
  <table className="w-full text-sm">
    <thead className="bg-admin-light text-admin-dark text-xs uppercase">
      <tr>
        <th className="px-4 py-3 text-left">Time</th>
        <th className="px-4 py-3 text-left">Action</th>
        <th className="px-4 py-3 text-left">Details</th>
        <th className="px-4 py-3 text-left">By</th>
      </tr>
    </thead>
    <tbody>
      {auditLog.map((log) => (
        <tr key={log.log_id} className="border-t border-gray-100">
          <td className="px-4 py-3 text-xs whitespace-nowrap">
            {new Date(log.created_at).toLocaleString()}
          </td>
          <td className="px-4 py-3 text-xs capitalize">{log.action.replaceAll("_", " ")}</td>
          <td className="px-4 py-3 text-xs">{log.details}</td>
          <td className="px-4 py-3 text-xs">{log.performed_by}</td>
        </tr>
      ))}
      {auditLog.length === 0 && (
        <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400 text-xs">No activity yet.</td></tr>
      )}
    </tbody>
  </table>
</div>
    </DashboardLayout>
  );
}

export default Admin;