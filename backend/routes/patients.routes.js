import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const r = await pool.query(
    `SELECT DISTINCT ON (patient_id) * FROM patient_full_summary
     ORDER BY patient_id, visit_id DESC`
  );
  res.json(r.rows);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const patient = await pool.query("SELECT * FROM patients WHERE patient_id = $1", [id]);
  if (patient.rows.length === 0) return res.status(404).json({ error: "Patient not found" });
  const visits = await pool.query(
    "SELECT * FROM patient_full_summary WHERE patient_id = $1 ORDER BY visit_id DESC", [id]
  );
  res.json({ ...patient.rows[0], visits: visits.rows });
});

router.post("/", async (req, res) => {
  const { full_name, age, gender, phone } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO patients(full_name, age, gender, phone) VALUES ($1,$2,$3,$4) RETURNING *`,
      [full_name, age, gender, phone]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;