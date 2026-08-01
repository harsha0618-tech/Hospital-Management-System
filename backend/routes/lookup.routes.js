import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/doctors", async (req, res) => {
  const r = await pool.query(
    `SELECT d.doctor_id, d.full_name, dep.department_name, d.consultation_fee
     FROM doctors d JOIN departments dep ON d.department_id = dep.department_id`
  );
  res.json(r.rows);
});

router.get("/nurses", async (req, res) => {
  res.json((await pool.query("SELECT nurse_id, full_name FROM nurses")).rows);
});

router.get("/medicines", async (req, res) => {
  res.json((await pool.query("SELECT * FROM medicines ORDER BY medicine_name")).rows);
});

router.get("/tests", async (req, res) => {
  res.json((await pool.query("SELECT * FROM tests ORDER BY test_name")).rows);
});

export default router;