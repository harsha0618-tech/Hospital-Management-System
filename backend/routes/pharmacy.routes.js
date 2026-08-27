import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.use(verifyToken);

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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pres = await client.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND dispensed = FALSE`,
      [req.params.id]
    );
    if (pres.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Prescription already dispensed or not found" });
    }
    const { medicine_id, quantity, visit_id } = pres.rows[0];
    const med = await client.query(`SELECT * FROM medicines WHERE medicine_id = $1`, [medicine_id]);
    if (med.rows[0].stock_qty < quantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: `Not enough stock for ${med.rows[0].medicine_name} (only ${med.rows[0].stock_qty} left)` });
    }
    const r = await client.query(
      `UPDATE prescriptions SET dispensed = TRUE WHERE prescription_id = $1 RETURNING *`,
      [req.params.id]
    );
    await client.query(`UPDATE medicines SET stock_qty = stock_qty - $1 WHERE medicine_id = $2`, [quantity, medicine_id]);
    await client.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('medicine_dispensed','prescription',$1,$2,$3)`,
      [req.params.id, req.user?.full_name || "Unknown", `Dispensed ${quantity} x ${med.rows[0].medicine_name} for visit #${visit_id}`]
    );
    await client.query("COMMIT");
    res.json(r.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put("/:id/restock", async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: "Restock quantity must be a positive number" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const r = await client.query(
      `UPDATE medicines SET stock_qty = stock_qty + $1 WHERE medicine_id = $2 RETURNING *`,
      [Number(quantity), req.params.id]
    );
    if (r.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Medicine not found" });
    }
    await client.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('medicine_restocked','medicine',$1,$2,$3)`,
      [req.params.id, req.user?.full_name || "Unknown", `Restocked ${quantity} units of ${r.rows[0].medicine_name} (new total: ${r.rows[0].stock_qty})`]
    );
    await client.query("COMMIT");
    res.json(r.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.post("/medicine", async (req, res) => {
  const { medicine_name, unit_price, stock_qty } = req.body;
  if (!medicine_name || !medicine_name.trim()) {
    return res.status(400).json({ error: "Medicine name is required" });
  }
  if (unit_price === undefined || Number(unit_price) < 0) {
    return res.status(400).json({ error: "Unit price must be a valid number" });
  }
  try {
    const r = await pool.query(
      `INSERT INTO medicines(medicine_name, unit_price, stock_qty)
       VALUES ($1, $2, $3) RETURNING *`,
      [medicine_name.trim(), Number(unit_price), Number(stock_qty) || 0]
    );
    await pool.query(
      `INSERT INTO audit_log(action, entity_type, entity_id, performed_by, details)
       VALUES ('medicine_added','medicine',$1,$2,$3)`,
      [r.rows[0].medicine_id, req.user?.full_name || "Unknown", `Added new medicine: ${medicine_name} (₹${unit_price}, initial stock ${stock_qty || 0})`]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A medicine with this name already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get("/stock", async (req, res) => {
  res.json((await pool.query("SELECT * FROM medicines ORDER BY stock_qty ASC")).rows);
});

export default router;