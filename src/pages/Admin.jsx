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