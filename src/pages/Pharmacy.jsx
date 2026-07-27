import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import mockPatients from "../data/mockPatients";
import medicinesList from "../data/medicinesList";

const columns = ["Patient ID", "Name", "Date", "Gender", "Age", "Medicines"];

function Pharmacy() {
  const [patients, setPatients] = useState(mockPatients);
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formPatientId, setFormPatientId] = useState("");
  const [formMedicine, setFormMedicine] = useState("");
  const [formCost, setFormCost] = useState("");
  const [medSuggestions, setMedSuggestions] = useState([]);

  const handleMedicineChange = (value) => {
    setFormMedicine(value);
    if (value.trim().length >= 2) {
      const matches = medicinesList.filter((m) =>
        m.toLowerCase().includes(value.toLowerCase())
      );
      setMedSuggestions(matches);
    } else {
      setMedSuggestions([]);
    }
  };

  const handleSelectSuggestion = (name) => {
    setFormMedicine(name);
    setMedSuggestions([]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formPatientId || !formMedicine || !formCost) return;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.patientId !== formPatientId) return p;
        const newMed = { name: formMedicine, cost: Number(formCost) || 0 };
        const updatedMedicines = [...(p.medicines || []), newMed];
        const newTotal = updatedMedicines.reduce((sum, m) => sum + m.cost, 0);
        return { ...p, medicines: updatedMedicines, pharmacyTotalCost: newTotal };
      })
    );

    setFormPatientId("");
    setFormMedicine("");
    setFormCost("");
    setMedSuggestions([]);
  };

  const openPatient = (id) => setOpenId(openId === id ? null : id);

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Pharmacy Dashboard"
      subtitle="Dispense prescribed medicines"
      icon="💊"
      colorClass="pharmacy"
    >
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Dispense Medicine</h2>
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border border-gray-100 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Patient ID</label>
            <select
              value={formPatientId}
              onChange={(e) => setFormPatientId(e.target.value)}
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pharmacy-DEFAULT"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.patientId} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col relative">
            <label className="text-sm font-medium text-gray-600 mb-1">Medicine Name</label>
            <input
              type="text"
              value={formMedicine}
              onChange={(e) => handleMedicineChange(e.target.value)}
              placeholder="Type medicine name (e.g. Amox...)"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pharmacy-DEFAULT"
            />
            {medSuggestions.length > 0 && (
              <div className="absolute top-[68px] left-0 w-full bg-white border border-gray-200 rounded-md shadow-card-hover z-10 overflow-hidden">
                {medSuggestions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectSuggestion(m)}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-pharmacy-light text-gray-700"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Cost (₹)</label>
            <input
              type="number"
              value={formCost}
              onChange={(e) => setFormCost(e.target.value)}
              placeholder="e.g. 40"
              required
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pharmacy-DEFAULT"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-pharmacy-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-pharmacy-dark transition"
            >
              Dispense
            </button>
          </div>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Patient Records</h2>

      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="pharmacy" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        renderRow={(patient) => (
          <>
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => openPatient(patient.patientId)}
            >
              <td className="px-4 py-3 font-medium text-pharmacy-dark whitespace-nowrap">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.date}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 text-xs text-pharmacy-dark underline">
                {openId === patient.patientId
                  ? "▲ Hide"
                  : `▼ ${(patient.medicines || []).length} item(s)`}
              </td>
            </tr>

            {openId === patient.patientId && (
              <tr>
                <td colSpan={columns.length} className="bg-pharmacy-light px-6 py-5">
                  {(patient.medicines || []).length === 0 ? (
                    <p className="text-sm text-gray-500">No medicines dispensed yet.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {patient.medicines.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-pharmacy-DEFAULT rounded-md px-3 py-2 text-xs flex justify-between"
                        >
                          <span>{m.name}</span>
                          <span className="text-pharmacy-dark font-medium">₹{m.cost}</span>
                        </div>
                      ))}
                      <div className="text-right text-sm font-semibold text-pharmacy-dark mt-1">
                        Total: ₹{patient.pharmacyTotalCost || 0}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </>
        )}
      />
    </DashboardLayout>
  );
}

export default Pharmacy;