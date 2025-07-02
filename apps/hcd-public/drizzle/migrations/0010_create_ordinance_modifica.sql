CREATE TABLE ordinance_modifica (
  id SERIAL PRIMARY KEY,
  ordinance_id INTEGER NOT NULL REFERENCES ordinances(id),
  target_id INTEGER NOT NULL REFERENCES ordinances(id)
);