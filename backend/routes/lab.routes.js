import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/pending", async (req, res) => {
  const r = await pool.query(`
    SELECT vt.visit_id, t.test_id, t.test_name, p.full_name AS patient_name
    FROM visit_tests vt
    JOIN tests t ON vt.test_id = t.test_id
    JOIN visits v ON vt.visit_id = v.visit_id
    JOIN patients p ON v.patient_id = p.patient_id
    LEFT JOIN lab_reports lr ON lr.visit_id = vt.visit_id AND lr.test_id = vt.test_id
    WHERE lr.report_id IS NULL
  `);
  res.json(r.rows);
});

router.post("/report", async (req, res) => {
  const { visit_id, test_id, report_text, cost } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO lab_reports(visit_id, test_id, report_text, cost) VALUES ($1,$2,$3,$4) RETURNING *`,
      [visit_id, test_id, report_text, cost]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;