const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    const users = await sql`SELECT * FROM users`;
    console.log("Usuarios encontrados en la base de datos:", users);
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
  }
})();