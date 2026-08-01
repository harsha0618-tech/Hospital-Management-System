import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import { useToast } from "../context/ToastContext";
import { useLookups } from "../hooks/useLookups";
import api from "../api/axios";

const columns = [
  "Queue #", "Patient ID", "Name", "Age", "Gender",
  "Doctor Assigned", "Nurse Assigned", "Date", "Status", "Billing",
];

function Receptionist() {
  const { patients, addPatient, refresh } = usePatients();
  const { doctors, nurses } = useLookups();
  const [printBillId, setPrintBillId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [formMode, setFormMode] = useState("new");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [nurseId, setNurseId] = useState("");
  const [returningPatientId, setReturningPatientId] = useState("");

  const resetForm = () => {
    setName(""); setAge(""); setGender("");
    setDoctorId(""); setNurseId(""); setReturningPatientId("");
  };

  const handleAddNewPatient = async (e) => {
    e.preventDefault();
    if (!name || !age || !gender || !doctorId || !nurseId) return;
    try {
      const patient = await addPatient({ full_name: name, age: Number(age), gender, phone: "" });
      await api.post("/visits", { patient_id: patient.patient_id, doctor_id: doctorId, nurse_id: nurseId });
      await refresh();
      showToast(`Patient ${patient.full_name} registered`);
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to register patient", "error");
    }
  };

  const handleReadmitPatient = async (e) => {
    e.preventDefault();
    if (!returningPatientId || !doctorId || !nurseId) return;
    try {
      await api.post("/visits", { patient_id: returningPatientId, doctor_id: doctorId, nurse_id: nurseId });
      await refresh();
      showToast("Patient re-admitted");
      resetForm();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to re-admit patient", "error");
    }
  };

  const handleDischarge = async (visitId) => {
    try {
      await api.put(`/visits/${visitId}/discharge`);
      await refresh();
      showToast("Patient discharged and billed");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to discharge", "error");
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Receptionist Dashboard" subtitle="Manage patient appointments and billing" icon="📋" colorClass="reception">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setFormMode("new"); resetForm(); }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${formMode === "new" ? "bg-reception-DEFAULT text-white" : "bg-white text-gray-500 border border-gray-200"}`}
        >
          🆕 New Patient
        </button>
        <button
          onClick={() => { setFormMode("returning"); resetForm(); }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${formMode === "returning" ? "bg-reception-DEFAULT text-white" : "bg-white text-gray-500 border border-gray-200"}`}
        >
          🔁 Returning Patient
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          {formMode === "new" ? "Register New Patient" : "Re-admit Returning Patient"}
        </h2>

        {formMode === "new" ? (
          <form onSubmit={handleAddNewPatient} className="bg-white border border-gray-100 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Patient name" required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Doctor Assigned</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.full_name} — {d.department_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Nurse Assigned</label>
              <select value={nurseId} onChange={(e) => setNurseId(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Nurse</option>
                {nurses.map((n) => (
                  <option key={n.nurse_id} value={n.nurse_id}>{n.full_name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 flex justify-end">
              <button type="submit" className="bg-reception-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-reception-dark transition">
                Register Patient
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReadmitPatient} className="bg-white border border-gray-100 rounded-card shadow-soft p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col lg:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1">Search Existing Patient</label>
              <select value={returningPatientId} onChange={(e) => setReturningPatientId(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Patient ID / Name</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>{p.patient_id} — {p.full_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Doctor Assigned</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.full_name} — {d.department_name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Nurse Assigned</label>
              <select value={nurseId} onChange={(e) => setNurseId(e.target.value)} required
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reception-DEFAULT">
                <option value="">Select Nurse</option>
                {nurses.map((n) => (
                  <option key={n.nurse_id} value={n.nurse_id}>{n.full_name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <button type="submit" className="bg-reception-DEFAULT text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-reception-dark transition">
                Re-admit Patient
              </button>
            </div>
          </form>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Patient Records</h2>
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="reception" />

      <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="reception"
        renderRow={(patient) => (
          <tr key={patient.patient_id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-3 whitespace-nowrap">
              {patient.queue_number ? (
                <span className="bg-reception-light text-reception-dark text-xs font-semibold px-2.5 py-1 rounded-full">
                  #{patient.queue_number}
                </span>
              ) : <span className="text-gray-300 text-xs">—</span>}
            </td>
            <td className="px-4 py-3 font-medium text-reception-dark whitespace-nowrap">{patient.patient_id}</td>
            <td className="px-4 py-3 whitespace-nowrap">{patient.full_name}</td>
            <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
            <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              {patient.doctor_name}
              <span className="text-xs text-gray-400 block">{patient.department_name}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">{patient.nurse_name}</td>
            <td className="px-4 py-3 whitespace-nowrap">{patient.visit_date}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              {patient.status === "Discharged" ? (
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">Discharged</span>
              ) : (
                <div className="flex flex-col gap-1 items-start">
                  <span className="bg-reception-light text-reception-dark text-xs font-medium px-2.5 py-1 rounded-full">Admitted</span>
                  <button onClick={() => handleDischarge(patient.visit_id)} className="text-[11px] text-gray-400 underline hover:text-gray-600">
                    Discharge & Generate Bill
                  </button>
                </div>
              )}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              {patient.total_amount ? (
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-xs">Total: ₹{patient.total_amount} ({patient.payment_status})</span>
                  <button onClick={() => setPrintBillId(patient.patient_id)} className="text-reception-dark underline text-xs">
                    🖨 Print Bill
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Not billed yet</span>
              )}
            </td>
          </tr>
        )}
      />

      {printBillId && (
        <PrintBillModal
          patient={patients.find((p) => p.patient_id === printBillId)}
          onClose={() => setPrintBillId(null)}
        />
      )}
    </DashboardLayout>
  );
}

function PrintBillModal({ patient, onClose }) {
  if (!patient) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 print:bg-white">
      <div className="bg-white rounded-card shadow-card-hover max-w-md w-full p-8 relative print:shadow-none">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 print:hidden">✕</button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand-DEFAULT text-white flex items-center justify-center text-xl font-bold mb-2">✚</div>
          <h2 className="text-lg font-bold text-brand-dark">MCR Multispeciality Hospital</h2>
          <p className="text-xs text-gray-400">Patient Invoice</p>
        </div>
        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <p><strong>Patient ID:</strong> {patient.patient_id}</p>
          <p><strong>Name:</strong> {patient.full_name}</p>
          <p><strong>Age / Gender:</strong> {patient.age} / {patient.gender}</p>
          <p><strong>Doctor:</strong> {patient.doctor_name} ({patient.department_name})</p>
          <p><strong>Date:</strong> {patient.visit_date}</p>
        </div>
        <div className="border-t border-gray-200 pt-3 text-sm space-y-1.5">
          <div className="flex justify-between"><span>Consultation Fee</span><span>₹{patient.consultation_fee || 0}</span></div>
          <div className="flex justify-between"><span>Lab Charges</span><span>₹{patient.lab_total || 0}</span></div>
          <div className="flex justify-between"><span>Pharmacy Charges</span><span>₹{patient.pharmacy_total || 0}</span></div>
          <div className="flex justify-between font-bold text-brand-dark text-base border-t border-gray-200 pt-2 mt-2">
            <span>Total</span><span>₹{patient.total_amount || 0}</span>
          </div>
        </div>
        <button onClick={() => window.print()} className="w-full mt-6 bg-brand-DEFAULT text-white py-2.5 rounded-md text-sm font-medium hover:bg-brand-dark transition print:hidden">
          Print
        </button>
      </div>
    </div>
  );
}

export default Receptionist;