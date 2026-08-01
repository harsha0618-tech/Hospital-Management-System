import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

function Pharmacy() {
  const [pending, setPending] = useState([]);
  const [stock, setStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();

  const loadData = async () => {
    const [p, s] = await Promise.all([api.get("/pharmacy/pending"), api.get("/pharmacy/stock")]);
    setPending(p.data);
    setStock(s.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleDispense = async (prescriptionId) => {
    try {
      await api.put(`/pharmacy/${prescriptionId}/dispense`);
      showToast("Medicine dispensed successfully!");
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to dispense", "error");
    }
  };

  const filteredPending = pending.filter(
    (p) =>
      p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Pharmacy Dashboard" subtitle="Dispense prescribed medicines" icon="💊" colorClass="pharmacy">
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="pharmacy" />

      <h2 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Pending Prescriptions</h2>
      <div className="bg-white border border-gray-100 rounded-card shadow-soft overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-pharmacy-light text-pharmacy-dark text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Medicine</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPending.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-4 text-gray-400 text-xs">Nothing pending.</td></tr>
            ) : (
              filteredPending.map((p) => (
                <tr key={p.prescription_id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{p.patient_name}</td>
                  <td className="px-4 py-3">{p.medicine_name}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDispense(p.prescription_id)}
                      className="bg-pharmacy-DEFAULT text-white px-3 py-1.5 rounded-md text-xs hover:opacity-90">
                      Dispense
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Medicine Stock</h2>
      <div className="bg-white border border-gray-100 rounded-card shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pharmacy-light text-pharmacy-dark text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Medicine</th>
              <th className="px-4 py-3 text-left">Unit Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((m) => (
              <tr key={m.medicine_id} className="border-t border-gray-100">
                <td className="px-4 py-3">{m.medicine_name}</td>
                <td className="px-4 py-3">₹{m.unit_price}</td>
                <td className={`px-4 py-3 ${m.stock_qty < 20 ? "text-red-500 font-semibold" : ""}`}>{m.stock_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Pharmacy;