# MCR Multispeciality Hospital — Hospital Management System (HMS)

A digital hospital management platform that unifies reception, doctor
consultation, nursing, laboratory, pharmacy, and administration under a
single patient record, with role-based dashboards and a PostgreSQL
database at its core.

---

****Here db is the database folder*****

## Table of Contents

- [Overview](#overview)
- [Database Design](#database-design)
  - [Entity Overview](#entity-overview)
  - [Schema Diagram Summary](#schema-diagram-summary)
  - [Key Design Decisions](#key-design-decisions)
  - [Normalization](#normalization)
  - [Automated Database Logic](#automated-database-logic-triggers-views-procedures)
- [How the Application Works](#how-the-application-works)
  - [User Roles](#user-roles)
  - [Core Patient Journey](#core-patient-journey)
  - [Cross-Role Visibility](#cross-role-visibility)
  - [Billing Flow](#billing-flow)
  - [Inventory Management](#inventory-management)
  - [Activity Logging](#activity-logging)

---

## Overview

MCR HMS replaces siloed, paper-based (or spreadsheet-based) hospital
workflows with one shared system. Every department — reception,
doctors, nurses, lab, pharmacy, and admin — reads from and writes to
the same underlying patient record, so information entered by one role
is instantly visible to every other role that needs it, with no manual
handoffs.

---

## Database Design

The system is built on **PostgreSQL** (hosted on Supabase). The schema
consists of 14 tables, modeling patients, staff, visits, and every
clinical/billing event tied to a visit.

### Entity Overview

| Table | Purpose |
|---|---|
| `users` | Login credentials and role for every staff member |
| `departments` | Hospital departments (Cardiology, Pediatrics, etc.) |
| `doctors` | Doctor profile, linked 1:1 to a `users` account |
| `nurses` | Nurse profile, linked 1:1 to a `users` account |
| `patients` | Core patient record, independent of any login |
| `visits` | One hospital visit/admission for a patient |
| `vitals` | BP, temperature, pulse, and notes recorded per visit |
| `tests` | Master list of lab tests offered |
| `visit_tests` | Which tests were ordered for which visit (many-to-many) |
| `lab_reports` | Result of a specific test for a specific visit |
| `medicines` | Pharmacy inventory master list |
| `prescriptions` | Medicines prescribed during a visit |
| `billing` | Consolidated, auto-computed bill for a visit |
| `audit_log` | System-wide record of every significant staff action |

### Schema Diagram Summary

- `patients` → `visits` — one patient can have many visits over time
  (returning patients keep their full history)
- `visits` → `vitals`, `lab_reports`, `prescriptions`, `billing` — each
  of these exists only in the context of a specific visit and is
  removed automatically if that visit is deleted
- `visits` ↔ `tests` — a many-to-many relationship resolved through
  the `visit_tests` junction table
- `doctors`/`nurses` → `users` — each staff profile is tied 1:1 to a
  login account, keeping authentication separate from role-specific
  data

### Key Design Decisions

- **Surrogate primary keys everywhere.** Every table uses an
  auto-incrementing ID (or a system-generated code for `patients`)
  rather than a natural/composite key. This was a deliberate choice
  that avoids most of the classic normalization problems (partial and
  transitive dependencies) from the outset.
- **System-generated identifiers.** Patient IDs follow a readable
  format like `MCR260001` (hospital code + year + sequence), and each
  visit gets an automatically assigned daily queue number — both
  generated inside the database itself, not the application code, so
  they stay correct even under concurrent access.
- **A computed billing total.** `billing.total_amount` is a PostgreSQL
  `GENERATED ALWAYS AS` column — it is never entered manually and is
  always guaranteed to equal `consultation_fee + lab_total +
  pharmacy_total`, eliminating an entire class of billing
  inconsistency.
- **Cascading deletes on visit-owned data.** `vitals`, `prescriptions`,
  `lab_reports`, and `billing` are all tied to their parent visit with
  `ON DELETE CASCADE`, reflecting that none of them have a meaningful
  existence independent of the visit that produced them.

### Normalization

Every table in the schema satisfies **Boyce-Codd Normal Form (BCNF)**.
Because every relation uses a single-attribute surrogate key, partial
dependency (a 2NF violation) is structurally impossible everywhere
except the one genuine many-to-many junction table (`visit_tests`),
which has no non-key attributes to be partially dependent in the first
place. Transitive dependency is avoided everywhere except one
deliberate, risk-free exception: `billing.total_amount`, which is a
database-generated column rather than independently stored data, so it
introduces no real update-anomaly risk despite technically being
"derived" from other columns in the same row.

### Automated Database Logic (Triggers, Views, Procedures)

The database does meaningful work on its own, rather than leaving
every rule to the application layer:

- **Triggers** auto-generate each new patient's ID and each visit's
  daily queue number at insert time.
- **Views** provide ready-to-use, pre-joined data for the dashboards —
  a full per-patient summary (patient + latest visit + doctor + nurse
  + billing in one row), department-wise revenue, and a low-stock
  medicine alert list.
- **A stored procedure** (`finalize_billing`) computes a visit's final
  bill by summing the doctor's consultation fee, the total cost of all
  lab tests performed, and the total cost of all medicines prescribed
  — triggered automatically when a patient is discharged.

---

## How the Application Works

### User Roles

The system supports six roles, each with its own dashboard scoped to
exactly what that role needs to see and do:

1. **Receptionist** — registers new patients, re-admits returning
   patients, tracks queue and payment status
2. **Doctor** — reviews a patient's full history (including
   nurse-recorded vitals and lab results), records diagnoses, orders
   tests, prescribes medicines
3. **Nurse** — records vital signs and care notes for admitted patients
4. **Lab Technician** — enters results for ordered tests, can add new
   test types to the system
5. **Pharmacist** — dispenses prescribed medicines, restocks and adds
   inventory
6. **Admin** — full oversight: manages staff accounts, tracks
   department revenue, reviews the complete activity log across the
   hospital

### Core Patient Journey

1. **Registration** — Reception registers a new patient (or looks up a
   returning one) and creates a visit, assigning a doctor and nurse.
   The patient's queue position for the day is assigned automatically.
2. **Consultation** — The doctor reviews any vitals the nurse has
   already recorded, records a diagnosis, orders any lab tests needed,
   and prescribes medicines.
3. **Care and testing** — The nurse records vitals for the patient;
   the lab technician processes any ordered tests and submits results,
   which appear back on the doctor's view for that same visit.
4. **Dispensing** — The pharmacist dispenses each prescribed medicine.
   Stock only decreases at the moment of actual dispensing, not when
   the doctor merely prescribes it — reflecting what's physically
   leaving the pharmacy shelf.
5. **Discharge and billing** — On discharge, the system automatically
   computes the final bill from three sources: the doctor's
   consultation fee, the sum of all lab test costs, and the sum of all
   dispensed medicine costs.
6. **Payment** — Reception (or Admin) marks the bill as paid once
   payment is collected.

### Cross-Role Visibility

A defining feature of the system is that information recorded by one
role is immediately visible to the roles that need it — a doctor sees
the nurse's vitals and the lab technician's results for the same
visit without anyone needing to manually relay that information.
Returning patients keep their entire visit history (past diagnoses,
vitals, and lab results across every previous visit), viewable by
doctors, receptionists, and admin alike.

### Billing Flow

Billing is never entered by hand. It is assembled automatically from
three live sources the moment a patient is discharged — the assigned
doctor's consultation fee, the running total of every lab test cost
for that visit, and the running total of every dispensed medicine's
cost — and the grand total is computed by the database itself, so it
can never drift out of sync with its components.

### Inventory Management

The pharmacy dashboard tracks live stock levels for every medicine.
Dispensing a prescription reduces stock (and is blocked if there isn't
enough left), while a separate restock action lets the pharmacist
top up existing medicines or add entirely new ones to the catalog —
the same pattern applies to lab tests, which the lab technician can
add to the master list as the hospital's offerings grow.

### Activity Logging

Every significant action across every role — logins, diagnoses saved,
vitals recorded, medicines dispensed/restocked/added, tests added,
payments marked, staff added or deactivated, and password changes —
is written to a system-wide activity log with the exact staff member's
name attached, giving Admin a complete, auditable trail of who did
what and when across the entire hospital.
