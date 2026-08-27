import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

function Pharmacy() {
  const [pending, setPending] = useState([]);
  const [stock, setStock] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
  const [restockQty, setRestockQty] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedPrice, setNewMedPrice] = useState("");
  const [newMedStock, setNewMedStock] = useState("");
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
    const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedPrice) {
      showToast("Enter medicine name and price", "error");
      return;
    }
    try {
      await api.post("/pharmacy/medicine", {
        medicine_name: newMedName.trim(),
        unit_price: Number(newMedPrice),
        stock_qty: Number(newMedStock) || 0,
      });
      showToast("Medicine added successfully!");
      setNewMedName("");
      setNewMedPrice("");
      setNewMedStock("");
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add medicine", "error");
    }
  };

    const handleRestock = async (medicineId) => {
    const qty = Number(restockQty[medicineId]);
    if (!qty || qty <= 0) {
      showToast("Enter a valid quantity to restock", "error");
      return;
    }
    try {
      await api.put(`/pharmacy/${medicineId}/restock`, { quantity: qty });
      showToast("Stock updated successfully!");
      setRestockQty((prev) => ({ ...prev, [medicineId]: "" }));
      await loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to restock", "error");
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
                <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowAddForm((prev) => !prev)}
            className="bg-pharmacy-DEFAULT text-white px-4 py-2 rounded-full text-xs font-medium hover:opacity-90"
          >
            {showAddForm ? "✕ Cancel" : "+ Add New Medicine"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddMedicine} className="bg-pharmacy-light/40 border border-pharmacy-DEFAULT/30 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Medicine Name</label>
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Azithromycin 500mg"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-56"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Unit Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newMedPrice}
                onChange={(e) => setNewMedPrice(e.target.value)}
                placeholder="e.g. 55"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={newMedStock}
                onChange={(e) => setNewMedStock(e.target.value)}
                placeholder="e.g. 100"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-28"
              />
            </div>
            <button type="submit" className="bg-pharmacy-DEFAULT text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              Add Medicine
            </button>
          </form>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Medicine</th>
              <th className="px-4 py-3 text-left">Unit Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Restock</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((m) => (
              <tr key={m.medicine_id} className="border-t border-gray-100">
                <td className="px-4 py-3">{m.medicine_name}</td>
                <td className="px-4 py-3">₹{m.unit_price}</td>
                <td className={`px-4 py-3 ${m.stock_qty < 20 ? "text-red-500 font-semibold" : ""}`}>{m.stock_qty}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={restockQty[m.medicine_id] || ""}
                      onChange={(e) => setRestockQty((prev) => ({ ...prev, [m.medicine_id]: e.target.value }))}
                      className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleRestock(m.medicine_id)}
                      className="bg-pharmacy-DEFAULT text-white px-2 py-1 rounded-md text-xs hover:opacity-90"
                    >
                      Restock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Pharmacy;