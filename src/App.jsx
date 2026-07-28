import { HashRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Receptionist from "./pages/Receptionist";
import Doctor from "./pages/Doctor";
import LabTechnician from "./pages/LabTechnician";
import Pharmacy from "./pages/Pharmacy";
import Admin from "./pages/Admin";

function App() {
  return (
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
  );
}

export default App;