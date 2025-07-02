CREATE TABLE staff (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  position varchar(255) NOT NULL,
  block_id integer REFERENCES political_blocks(id),
  bio text,
  image_url varchar(255),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);