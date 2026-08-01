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
  <Route path="/receptionist" element={<ProtectedRoute role="receptionist"><Receptionist /></ProtectedRoute>} />
  <Route path="/doctor" element={<ProtectedRoute role="doctor"><Doctor /></ProtectedRoute>} />
  <Route path="/nurse" element={<ProtectedRoute role="nurse"><Nurse /></ProtectedRoute>} />
 <Route path="/lab" element={<ProtectedRoute role="labtech"><LabTechnician /></ProtectedRoute>} />
  <Route path="/pharmacy" element={<ProtectedRoute role="pharmacist"><Pharmacy /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
</Routes>
      </HashRouter>
     
    </PatientProvider>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;