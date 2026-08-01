import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/patients");
    setPatients(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const addPatient = async (newPatient) => {
    const { data } = await api.post("/patients", newPatient);
    await fetchPatients();
    return data;
  };

  const getPatient = async (patientId) => (await api.get(`/patients/${patientId}`)).data;

  return (
    <PatientContext.Provider value={{ patients, loading, addPatient, getPatient, refresh: fetchPatients }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatients must be used within a PatientProvider");
  return ctx;
}