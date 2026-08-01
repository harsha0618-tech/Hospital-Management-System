import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/revenue-by-department", async (req, res) => {
  res.json((await pool.query("SELECT * FROM revenue_by_department")).rows);
});

router.get("/low-stock", async (req, res) => {
  res.json((await pool.query("SELECT * FROM low_stock_medicines")).rows);
});

router.get("/top-medicines", async (req, res) => {
  const r = await pool.query(`
    SELECT m.medicine_name, SUM(pr.quantity) AS total_prescribed
    FROM prescriptions pr JOIN medicines m ON pr.medicine_id = m.medicine_id
    GROUP BY m.medicine_name ORDER BY total_prescribed DESC LIMIT 5
  `);
  res.json(r.rows);
});

router.get("/doctor-load", async (req, res) => {
  const r = await pool.query(`
    SELECT d.full_name, COUNT(v.visit_id) AS total_patients
    FROM doctors d LEFT JOIN visits v ON v.doctor_id = d.doctor_id
    GROUP BY d.full_name ORDER BY total_patients DESC
  `);
  res.json(r.rows);
});

export default router;