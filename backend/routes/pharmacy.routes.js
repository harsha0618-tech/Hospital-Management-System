import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/pending", async (req, res) => {
  const r = await pool.query(`
    SELECT pr.prescription_id, pr.visit_id, m.medicine_name, pr.quantity, p.full_name AS patient_name
    FROM prescriptions pr
    JOIN medicines m ON pr.medicine_id = m.medicine_id
    JOIN visits v ON pr.visit_id = v.visit_id
    JOIN patients p ON v.patient_id = p.patient_id
    WHERE pr.dispensed = FALSE
  `);
  res.json(r.rows);
});

router.put("/:id/dispense", async (req, res) => {
  const r = await pool.query(
    `UPDATE prescriptions SET dispensed = TRUE WHERE prescription_id = $1 RETURNING *`,
    [req.params.id]
  );
  res.json(r.rows[0]);
});

router.get("/stock", async (req, res) => {
  res.json((await pool.query("SELECT * FROM medicines ORDER BY stock_qty ASC")).rows);
});

export default router;