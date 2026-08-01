import bcrypt from "bcrypt";
import { pool } from "./db.js";

const users = [
  { username: "admin", password: "admin123", role: "admin", full_name: "System Admin" },
  { username: "anita.rao", password: "doctor123", role: "doctor", full_name: "Dr. Anita Rao" },
  { username: "lakshmi", password: "nurse123", role: "nurse", full_name: "Nurse Lakshmi" },
  { username: "reception1", password: "recep123", role: "receptionist", full_name: "Reception Desk" },
  { username: "pharm1", password: "pharm123", role: "pharmacist", full_name: "Pharmacy Desk" },
  { username: "lab1", password: "lab123", role: "labtech", full_name: "Lab Desk" },
];

const run = async () => {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await pool.query(
      `INSERT INTO users(username, password_hash, role, full_name)
       VALUES ($1,$2,$3,$4) ON CONFLICT (username) DO NOTHING`,
      [u.username, hash, u.role, u.full_name]
    );
  }

  // Link a doctor row + nurse row to real user_ids so FKs work
  const doctorUser = await pool.query("SELECT user_id FROM users WHERE username='anita.rao'");
  const cardio = await pool.query("SELECT department_id FROM departments WHERE department_name='Cardiology'");
  await pool.query(
    `INSERT INTO doctors(user_id, full_name, department_id, consultation_fee)
     VALUES ($1,'Dr. Anita Rao',$2,500) ON CONFLICT DO NOTHING`,
    [doctorUser.rows[0].user_id, cardio.rows[0].department_id]
  );

  const nurseUser = await pool.query("SELECT user_id FROM users WHERE username='lakshmi'");
  await pool.query(
    `INSERT INTO nurses(user_id, full_name) VALUES ($1,'Nurse Lakshmi') ON CONFLICT DO NOTHING`,
    [nurseUser.rows[0].user_id]
  );

  console.log("Users + linked staff seeded.");
  process.exit();
};

run();