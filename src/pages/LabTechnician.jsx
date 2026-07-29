import { useState } from "react";
import DataTable from "../components/DataTable";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { usePatients } from "../context/PatientContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useToast } from "../context/ToastContext";
const columns = ["Patient ID", "Name", "Age", "Gender", "Doctor", "Test Reports"];

function LabTechnician() {
  const { patients, updatePatient } = usePatients();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [reportInput, setReportInput] = useState("");
  const [costInput, setCostInput] = useState("");
  const [selectedTest, setSelectedTest] = useState("");

  const openPatient = (patient) => {
    setOpenId(patient.patientId);
    setReportInput("");
    setCostInput("");
    setSelectedTest(patient.testsRecommended.length > 0 ? patient.testsRecommended[0] : "");
  };

  const closePatient = () => setOpenId(null);

  const handleAddReport = (patientId) => {
    if (!selectedTest || !reportInput.trim()) return;

    updatePatient(patientId, (p) => {
      const newReportEntry = {
        test: selectedTest,
        report: reportInput.trim(),
        cost: Number(costInput) || 0,
      };

      const existingReports = Array.isArray(p.labReports) ? p.labReports : [];

      return {
        labReports: [...existingReports, newReportEntry],
        labTestCost: (p.labTestCost || 0) + newReportEntry.cost,
        labReport: newReportEntry.report,
        
      };
      showToast("Patient discharged");
    });

    setReportInput("");
    setCostInput("");
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Lab Technician Dashboard"
      subtitle="Submit test reports and results"
      icon="🧪"
      colorClass="lab"
    >
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="lab" />

     <DataTable
        columns={columns}
        rows={filteredPatients}
        roleColor="lab"
        renderRow={(patient) => (
          <>
            <tr
              key={patient.patientId}
              className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() =>
                openId === patient.patientId ? closePatient() : openPatient(patient)
              }
            >
              <td className="px-4 py-3 font-medium text-lab-dark whitespace-nowrap">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.name}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.age}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.gender}</td>
              <td className="px-4 py-3 whitespace-nowrap">{patient.doctorAssigned?.name}</td>
              <td className="px-4 py-3 text-xs text-lab-dark underline">
                {openId === patient.patientId
                  ? "▲ Hide"
                  : patient.testsRecommended.length === 0
                  ? "No tests assigned"
                  : `▼ ${patient.testsRecommended.length} test(s)`}
              </td>
            </tr>

            {openId === patient.patientId && (
              <tr>
                <td colSpan={columns.length} className="bg-lab-light px-6 py-5">
                  {patient.testsRecommended.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      This patient has no tests recommended by the doctor yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div>
                        <label className="text-sm font-medium text-lab-dark block mb-2">
                          Submitted Reports
                        </label>
                        {!patient.labReports || patient.labReports.length === 0 ? (
                          <span className="text-xs text-gray-400">
                            No reports submitted yet
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {patient.labReports.map((r, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-lab-DEFAULT rounded-md px-3 py-2 text-xs flex justify-between"
                              >
                                <span>
                                  <strong>{r.test}:</strong> {r.report}
                                </span>
                                <span className="text-lab-dark font-medium">₹{r.cost}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-lab-dark block mb-1">
                          Add Report for Test
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select
                            value={selectedTest}
                            onChange={(e) => setSelectedTest(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
                          >
                            {patient.testsRecommended.map((test, idx) => (
                              <option key={idx} value={test}>
                                {test}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={reportInput}
                            onChange={(e) => setReportInput(e.target.value)}
                            placeholder="Report result / notes"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
                          />
                          <input
                            type="number"
                            value={costInput}
                            onChange={(e) => setCostInput(e.target.value)}
                            placeholder="Cost (₹)"
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-32 focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT"
                          />
                          <button
                            onClick={() => handleAddReport(patient.patientId)}
                            className="bg-lab-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
                          >
                            Submit Report
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={closePatient}
                          className="bg-lab-dark text-white px-5 py-2 rounded-md text-sm font-medium hover:opacity-90"
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

export default LabTechnician;