import { useState, useEffect } from "react";
import api from "../api/axios";

export function useLookups() {
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);

  useEffect(() => {
    api.get("/lookup/doctors").then((r) => setDoctors(r.data));
    api.get("/lookup/nurses").then((r) => setNurses(r.data));
    api.get("/lookup/medicines").then((r) => setMedicines(r.data));
    api.get("/lookup/tests").then((r) => setTests(r.data));
  }, []);

  return { doctors, nurses, medicines, tests };
}