import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(verifyToken);

router.get("/vitals/:visitId", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM vitals WHERE visit_id = $1 ORDER BY recorded_at DESC",
    [req.params.visitId]
  );
  res.json(r.rows);
});

router.post("/vitals", async (req, res) => {
  const { visit_id, nurse_id, bp, temperature, pulse, notes } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO vitals(visit_id, nurse_id, bp, temperature, pulse, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [visit_id, nurse_id, bp, temperature, pulse, notes]
    );
    await pool.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('vitals_recorded','visit',$1,$2,$3)`,
      [visit_id, req.user?.full_name || "Unknown", `BP: ${bp || "—"}, Temp: ${temperature || "—"}, Pulse: ${pulse || "—"}`]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;