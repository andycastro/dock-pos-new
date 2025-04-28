module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      // Aqui o Strapi vai buscar a variável de ambiente DATABASE_URL automaticamente
      connectionString: env("DATABASE_URL"),
      ssl: {
        rejectUnauthorized: false, // Para permitir conexões SSL
      },
    },
  },
});
