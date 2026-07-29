import { createContext, useContext, useState } from "react";
import mockPatients from "../data/mockPatients";

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState(mockPatients);

  const addPatient = (newPatient) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const updatePatient = (patientId, updates) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.patientId === patientId
          ? {
              ...p,
              ...(typeof updates === "function" ? updates(p) : updates),
            }
          : p
      )
    );
  };

  const getPatient = (patientId) =>
    patients.find((p) => p.patientId === patientId);

  const value = {
    patients,
    setPatients,
    addPatient,
    updatePatient,
    getPatient,
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) {
    throw new Error("usePatients must be used within a PatientProvider");
  }
  return ctx;
}