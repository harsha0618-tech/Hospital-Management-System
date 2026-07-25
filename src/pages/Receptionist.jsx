import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import EntryForm from "../components/EntryForm";
import mockPatients from "../data/mockPatients";
import { generatePatientId } from "../data/patientIdGenerator";
import { getTodayFormatted } from "../data/dateUtils";
import PageHeader from "../components/PageHeader";

const columns = [
  "Patient ID",
  "Name",
  "Age",
  "Gender",
  "Doctor Assigned",
  "Date",
  "Billing",
];

const formFields = [
  { name: "name", label: "Name", required: true },
  { name: "age", label: "Age", type: "number", required: true },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female", "Other"],
    required: true,
  },
  { name: "doctorAssigned", label: "Doctor Assigned", required: true },
];

function Receptionist() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(mockPatients);
  const [billingOpenId, setBillingOpenId] = useState(null);

  const handleAddPatient = (formData) => {
    const newPatient = {
      patientId: generatePatientId(),
      name: formData.name,
      age: formData.age,
      gender: formData.gender,
      date: getTodayFormatted(),
      doctorAssigned: formData.doctorAssigned,
      diagnosis: "",
      testsRecommended: [],
      prescription: [],
      labReport: "",
      labTestCost: 0,
      medicines: [],
      pharmacyTotalCost: 0,
      consultationFee: 500,
      totalBill: 0,
    };
    setPatients((prev) => [...prev, newPatient]);
  };

  const calculateBill = (patient) => {
    return (
      (patient.consultationFee || 0) +
      (patient.labTestCost || 0) +
      (patient.pharmacyTotalCost || 0)
    );
  };

  const handleGenerateBill = (patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.patientId === patientId ? { ...p, totalBill: calculateBill(p) } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
      <PageHeader
  title="Receptionist Dashboard"
  subtitle="Manage patient appointments and billing"
  icon="📋"
  colorClass="reception"
/>
        {/* Add New Patient Form */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-3">
            Add New Patient
          </h2>
          <EntryForm
            fields={formFields}
            onSubmit={handleAddPatient}
            submitLabel="Register Patient"
          />
        </div>

        {/* Patients Table */}
        <h2 className="text-lg font-medium text-gray-700 mb-3">
          Patient Records
        </h2>
        <DataTable
          columns={columns}
          rows={patients}
          renderRow={(patient) => (
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium text-reception-dark whitespace-nowrap">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {patient.doctorAssigned}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.date}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {billingOpenId === patient.patientId ? (
                  <div className="flex flex-col gap-1 bg-reception-light p-3 rounded-md text-xs">
                    <div>Consultation: ₹{patient.consultationFee}</div>
                    <div>Lab: ₹{patient.labTestCost}</div>
                    <div>Pharmacy: ₹{patient.pharmacyTotalCost}</div>
                    <div className="font-semibold border-t border-reception-DEFAULT pt-1 mt-1">
                      Total: ₹{calculateBill(patient)}
                    </div>
                    <button
                      onClick={() => handleGenerateBill(patient.patientId)}
                      className="mt-2 bg-reception-DEFAULT text-white px-3 py-1 rounded-md hover:opacity-90"
                    >
                      Generate Bill
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setBillingOpenId(patient.patientId)}
                    className="text-reception-dark underline text-xs"
                  >
                    {patient.totalBill > 0
                      ? `Billed: ₹${patient.totalBill}`
                      : "View / Generate Bill"}
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}

export default Receptionist;