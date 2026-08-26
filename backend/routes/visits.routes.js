import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(verifyToken);

router.post("/", async (req, res) => {
  const { patient_id, doctor_id, nurse_id } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO visits(patient_id, doctor_id, nurse_id) VALUES ($1,$2,$3) RETURNING *`,
      [patient_id, doctor_id, nurse_id]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id/consult", async (req, res) => {
  const { id } = req.params;
  const { diagnosis, test_ids = [], medicine_ids = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE visits SET diagnosis = $1 WHERE visit_id = $2", [diagnosis, id]);
    for (const test_id of test_ids) {
      await client.query(
        `INSERT INTO visit_tests(visit_id, test_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [id, test_id]
      );
    }
       for (const med of medicine_ids) {
      await client.query(
        `INSERT INTO prescriptions(visit_id, medicine_id, quantity) VALUES ($1,$2,$3)`,
        [id, med.medicine_id, med.quantity || 1]
      );
    }
    await client.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('consultation_saved','visit',$1,$2,$3)`,
      [id, req.user?.full_name || "Unknown", `Diagnosis "${diagnosis || "—"}" recorded for visit #${id}`]
    );
    await client.query("COMMIT");
    res.json({ message: "Consultation saved" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

router.put("/:id/discharge", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CALL finalize_billing($1)", [id]);
    await client.query(
      "UPDATE visits SET status = 'Discharged', discharged_at = NOW() WHERE visit_id = $1",
      [id]
    );
    await client.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('patient_discharged','visit',$1,$2,$3)`,
      [id, req.user?.full_name || "Unknown", `Visit #${id} discharged and billed`]
    );
    await client.query("COMMIT");
    res.json({ message: "Patient discharged and billed" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});
router.put("/:id/payment", async (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body;
  if (!["Paid", "Pending"].includes(payment_status)) {
    return res.status(400).json({ error: "payment_status must be 'Paid' or 'Pending'" });
  }
  try {
    const r = await pool.query(
      `UPDATE billing SET payment_status = $1, payment_updated_at = NOW()
       WHERE visit_id = $2 RETURNING *`,
      [payment_status, id]
    );
    if (r.rows.length === 0) {
      return res.status(404).json({ error: "No bill found for this visit" });
    }
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;