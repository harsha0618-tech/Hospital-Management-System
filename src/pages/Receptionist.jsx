import { useState } from "react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import mockPatients from "../data/mockPatients";
import doctorsList from "../data/doctorsList";
import nursesList from "../data/nursesList";
import { generatePatientId } from "../data/patientIdGenerator";
import { getTodayFormatted } from "../data/dateUtils";

const columns = [
  "Patient ID",
  "Name",
  "Age",
  "Gender",
  "Doctor Assigned",
  "Nurse Assigned",
  "Date",
  "Status",
  "Billing",
];

function Receptionist() {
  const [patients, setPatients] = useState(mockPatients);
  const [billingOpenId, setBillingOpenId] = useState(null);
  const [printBillId, setPrintBillId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [nurseName, setNurseName] = useState("");

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!name || !age || !gender || !doctorName || !nurseName) return;

    const selectedDoctor = doctorsList.find((d) => d.name === doctorName);

    const newPatient = {
      patientId: generatePatientId(),
      name,
      age,
      gender,
      date: getTodayFormatted(),
      doctorAssigned: selectedDoctor,
      nurseAssigned: nurseName,
      status: "Admitted",
      diagnosis: "",
      testsRecommended: [],
      prescription: [],
      labReports: [],
      labReport: "",
      labTestCost: 0,
      medicines: [],
      pharmacyTotalCost: 0,
      consultationFee: 500,
      totalBill: 0,
      visitHistory: [],
    };

    setPatients((prev) => [...prev, newPatient]);
    setName("");
    setAge("");
    setGender("");
    setDoctorName("");
    setNurseName("");
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

  const handleDischarge = (patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.patientId === patientId ? { ...p, status: "Discharged" } : p
      )
    );
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Receptionist Dashboard"
          subtitle="Manage patient appointments and billing"
          icon="📋"
          colorClass="reception"
        />

        {/* Add New Patient Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Register New Patient
          </h2>
          <form
            onSubmit={handleAddPatient}
            className="bg-white border border-gray-100 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient name"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Doctor Assigned
              </label>
              <select
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT"
              >
                <option value="">Select Doctor</option>
                {doctorsList.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} — {d.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nurse Assigned
              </label>
              <select
                value={nurseName}
                onChange={(e) => setNurseName(e.target.value)}
                required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT"
              >
                <option value="">Select Nurse</option>
                {nursesList.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-reception-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-reception-dark transition"
              >
                Register Patient
              </button>
            </div>
          </form>
        </div>

        {/* Patients Table */}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Patient Records
        </h2>

        <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="reception" />

        <DataTable
          columns={columns}
          rows={filteredPatients}
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
                {patient.doctorAssigned?.name}
                <span className="text-xs text-gray-400 block">
                  {patient.doctorAssigned?.department}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.nurseAssigned}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.date}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {patient.status === "Discharged" ? (
                  <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                    Discharged
                  </span>
                ) : (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="bg-reception-light text-reception-dark text-xs font-medium px-2.5 py-1 rounded-full">
                      Admitted
                    </span>
                    <button
                      onClick={() => handleDischarge(patient.patientId)}
                      className="text-[11px] text-gray-400 underline hover:text-gray-600"
                    >
                      Mark as Discharged
                    </button>
                  </div>
                )}
              </td>
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
                    {patient.status === "Discharged" && (
                      <button
                        onClick={() => setPrintBillId(patient.patientId)}
                        className="mt-1 bg-reception-dark text-white px-3 py-1 rounded-md hover:opacity-90"
                      >
                        🖨 Print Bill
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 items-start">
                    <button
                      onClick={() => setBillingOpenId(patient.patientId)}
                      className="text-reception-dark underline text-xs"
                    >
                      {patient.totalBill > 0
                        ? `Billed: ₹${patient.totalBill}`
                        : "View / Generate Bill"}
                    </button>
                    {patient.status === "Discharged" && (
                      <button
                        onClick={() => setPrintBillId(patient.patientId)}
                        className="text-reception-dark underline text-xs"
                      >
                        🖨 Print Bill
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          )}
        />
      </div>

      {printBillId && (
        <PrintBillModal
          patient={patients.find((p) => p.patientId === printBillId)}
          onClose={() => setPrintBillId(null)}
          total={calculateBill(patients.find((p) => p.patientId === printBillId))}
        />
      )}
    </div>
  );
}

function PrintBillModal({ patient, onClose, total }) {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 print:bg-white">
      <div className="bg-white rounded-card shadow-card-hover max-w-md w-full p-8 relative print:shadow-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 print:hidden"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand-DEFAULT text-white flex items-center justify-center text-xl font-bold mb-2">
            ✚
          </div>
          <h2 className="text-lg font-bold text-brand-dark">
            MCR Multispeciality Hospital
          </h2>
          <p className="text-xs text-gray-400">Patient Invoice</p>
        </div>

        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <p><strong>Patient ID:</strong> {patient.patientId}</p>
          <p><strong>Name:</strong> {patient.name}</p>
          <p><strong>Age / Gender:</strong> {patient.age} / {patient.gender}</p>
          <p><strong>Doctor:</strong> {patient.doctorAssigned?.name} ({patient.doctorAssigned?.department})</p>
          <p><strong>Date:</strong> {patient.date}</p>
        </div>

        <div className="border-t border-gray-200 pt-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span>Consultation Fee</span>
            <span>₹{patient.consultationFee || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Lab Charges</span>
            <span>₹{patient.labTestCost || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Pharmacy Charges</span>
            <span>₹{patient.pharmacyTotalCost || 0}</span>
          </div>
          <div className="flex justify-between font-bold text-brand-dark text-base border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full mt-6 bg-brand-DEFAULT text-white py-2.5 rounded-md text-sm font-medium hover:bg-brand-dark transition print:hidden"
        >
          Print
        </button>
      </div>
    </div>
  );
}

export default Receptionist;