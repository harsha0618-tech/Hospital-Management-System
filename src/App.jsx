import { HashRouter, Routes, Route } from "react-router-dom";
import { PatientProvider } from "./context/PatientContext";
import Landing from "./pages/Landing";
import Receptionist from "./pages/Receptionist";
import Doctor from "./pages/Doctor";
import Nurse from "./pages/Nurse";
import LabTechnician from "./pages/LabTechnician";
import Pharmacy from "./pages/Pharmacy";
import Admin from "./pages/Admin";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
function App() {
  return (
     <ToastProvider>
      <AuthProvider>
    <PatientProvider>
     
        <HashRouter>
          <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/receptionist" element={<Receptionist />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/nurse" element={<Nurse />} />
          <Route path="/lab" element={<LabTechnician />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/doctor" element={<ProtectedRoute role="doctor"><Doctor /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
     
    </PatientProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;