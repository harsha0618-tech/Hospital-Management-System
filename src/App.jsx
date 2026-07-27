import { HashRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider";
import Landing from "./pages/Landing";
import Receptionist from "./pages/Receptionist";
import Doctor from "./pages/Doctor";
import LabTechnician from "./pages/LabTechnician";
import Pharmacy from "./pages/Pharmacy";
import Admin from "./pages/Admin";

function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/receptionist" element={<Receptionist />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/lab" element={<LabTechnician />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;