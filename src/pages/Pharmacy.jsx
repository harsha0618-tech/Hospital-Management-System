import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import medicinesList from "../data/medicinesList";
import { usePatients } from "../context/PatientContext";

import { useToast } from "../context/ToastContext";
const columns = ["Patient ID", "Name", "Age", "Gender", "Doctor", "Medicines"];

function Pharmacy() {
  const { patients, updatePatient } = usePatients();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [medInput, setMedInput] = useState("");
  const [costInput, setCostInput] = useState("");
  const [medSuggestions, setMedSuggestions] = useState([]);

  const openPatient = (patient) => {
    setOpenId(patient.patientId);
    setMedInput("");
    setCostInput("");
    setMedSuggestions([]);
  };

  const closePatient = () => setOpenId(null);

  const handleMedInputChange = (value) => {
    setMedInput(value);
    if (value.trim().length >= 2) {
      const matches = medicinesList.filter((m) =>
        m.toLowerCase().includes(value.toLowerCase())
      );
      setMedSuggestions(matches);
    } else {
      setMedSuggestions([]);
    }
  };

  const dispenseMedicine = (patientId, medName, cost) => {
    if (!medName.trim()) {
      showToast("Please enter a medicine name.", "error");
      return;
    }

    updatePatient(patientId, (p) => {
      const dispensedEntry = {
        name: medName.trim(),
        cost: Number(cost) || 0,
      };
      const existingMeds = Array.isArray(p.medicines) ? p.medicines : [];

      return {
        medicines: [...existingMeds, dispensedEntry],
        pharmacyTotalCost: (p.pharmacyTotalCost || 0) + dispensedEntry.cost,
      };
     
    });

    setMedInput("");
    setCostInput("");
    setMedSuggestions([]);
     showToast("Medicine dispensed successfully!");
  };

  const handleSelectMedicine = (patientId, medName) => {
    dispenseMedicine(patientId, medName, costInput);
  };

  const handleDispenseManual = (patientId) => {
    dispenseMedicine(patientId, medInput, costInput);
  };

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
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="pharmacy" />

     <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="pharmacy"
        renderRow={(patient) => (
          <>
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                openId === patient.patientId ? closePatient() : openPatient(patient)
              }
            >
              <td className="px-4 py-3 font-medium text-pharmacy-dark whitespace-nowrap">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.doctorAssigned?.name}</td>
              <td className="px-4 py-3 text-xs text-pharmacy-dark underline">
                {openId === patient.patientId
                  ? "▲ Hide"
                  : patient.prescription?.length > 0
                  ? `▼ ${patient.prescription.length} prescribed`
                  : "No prescription yet"}
              </td>
            </tr>

            {openId === patient.patientId && (
              <tr>
                <td colSpan={columns.length} className="bg-pharmacy-light px-6 py-5">
                  {(!patient.prescription || patient.prescription.length === 0) ? (
                    <p className="text-sm text-gray-500">
                      This patient has no prescription from the doctor yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="text-sm font-medium text-pharmacy-dark block mb-2">
                          Prescribed by Doctor
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {patient.prescription.map((med, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-pharmacy-DEFAULT text-pharmacy-dark text-xs px-3 py-1 rounded-full"
                            >
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-pharmacy-dark block mb-2">
                          Dispensed
                        </label>
                        {!patient.medicines || patient.medicines.length === 0 ? (
                          <span className="text-xs text-gray-400">
                            Nothing dispensed yet
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {patient.medicines.map((m, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-pharmacy-DEFAULT rounded-md px-3 py-2 text-xs flex justify-between"
                              >
                                <span>{m.name}</span>
                                <span className="text-pharmacy-dark font-medium">
                                  ₹{m.cost}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-pharmacy-dark block mb-1">
                          Dispense Medicine
                        </label>
                        <div className="relative flex flex-col sm:flex-row gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={medInput}
                              onChange={(e) => handleMedInputChange(e.target.value)}
                              placeholder="Type medicine name (e.g. Para...)"
                              className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-pharmacy-DEFAULT"
                            />
                            {medSuggestions.length > 0 && (
                              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-card-hover z-10 overflow-hidden">
                                {medSuggestions.map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() =>
                                      handleSelectMedicine(patient.patientId, m)
                                    }
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-pharmacy-light text-gray-700"
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type="number"
                            value={costInput}
                            onChange={(e) => setCostInput(e.target.value)}
                            placeholder="Cost (₹)"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-32 focus:outline-none focus:ring-2 focus:ring-pharmacy-DEFAULT"
                          />
                          <button
                            onClick={() => handleDispenseManual(patient.patientId)}
                            className="bg-pharmacy-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                          >
                            Dispense
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={closePatient}
                          className="bg-pharmacy-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90"
                        >
                          Close
                        </button>
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