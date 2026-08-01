import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import SearchBar from "../components/SearchBar";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

function LabTechnician() {
  const [pending, setPending] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast();
  const [reportText, setReportText] = useState({});
  const [cost, setCost] = useState({});

  const loadPending = async () => {
    const { data } = await api.get("/lab/pending");
    setPending(data);
  };

  useEffect(() => { loadPending(); }, []);

  const handleSubmitReport = async (item) => {
    const key = `${item.visit_id}-${item.test_id}`;
    if (!reportText[key]?.trim()) return;
    try {
      await api.post("/lab/report", {
        visit_id: item.visit_id,
        test_id: item.test_id,
        report_text: reportText[key],
        cost: Number(cost[key]) || 0,
      });
      showToast("Report submitted");
      await loadPending();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to submit", "error");
    }
  };

  const filteredPending = pending.filter(
    (p) =>
      p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.test_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Lab Technician Dashboard" subtitle="Submit test reports and results" icon="🧪" colorClass="lab">
      <SearchBar value={searchTerm} onChange={setSearchTerm} colorClass="lab" />

      <div className="flex flex-col gap-4 mt-4">
        {filteredPending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending tests.</p>
        ) : (
          filteredPending.map((item) => {
            const key = `${item.visit_id}-${item.test_id}`;
            return (
              <div key={key} className="bg-white border border-gray-100 rounded-card shadow-soft p-5">
                <p className="text-sm font-semibold text-lab-dark mb-2">{item.patient_name} — {item.test_name}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" value={reportText[key] || ""} onChange={(e) => setReportText({ ...reportText, [key]: e.target.value })}
                    placeholder="Report result / notes"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT" />
                  <input type="number" value={cost[key] || ""} onChange={(e) => setCost({ ...cost, [key]: e.target.value })}
                    placeholder="Cost (₹)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:w-32 focus:outline-none focus:ring-2 focus:ring-lab-DEFAULT" />
                  <button onClick={() => handleSubmitReport(item)} className="bg-lab-DEFAULT text-white px-4 py-2 rounded-md text-sm hover:opacity-90">
                    Submit Report
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}

export default LabTechnician;