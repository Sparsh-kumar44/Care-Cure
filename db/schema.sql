
CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  emp_id    TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  password  TEXT NOT NULL,                      
  role      TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee'))
);


CREATE TABLE IF NOT EXISTS medicines (
  id                SERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  strips            DOUBLE PRECISION NOT NULL CHECK (strips >= 0),   
  tablets_per_strip INTEGER NOT NULL CHECK (tablets_per_strip >= 1),
  expiry            DATE NOT NULL,
  price             NUMERIC(10, 2) NOT NULL CHECK (price >= 0)      
);


CREATE TABLE IF NOT EXISTS bills (
  id             SERIAL PRIMARY KEY,
  bill_no        INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1001) UNIQUE,
  patient_name   TEXT NOT NULL,
  patient_age    INTEGER NOT NULL,
  patient_phone  TEXT NOT NULL DEFAULT '',
  patient_gender TEXT NOT NULL DEFAULT '',
  grand_total    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  generated_by   TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS bill_items (
  id                SERIAL PRIMARY KEY,
  bill_id           INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  medicine_id       INTEGER REFERENCES medicines(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  tablets           INTEGER NOT NULL CHECK (tablets > 0),
  tablets_per_strip INTEGER NOT NULL,
  price_per_tablet  NUMERIC(10, 2) NOT NULL,
  total             NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
