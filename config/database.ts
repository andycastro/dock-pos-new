import { parse } from "pg-connection-string";

const { DATABASE_URL } = process.env;
const config = parse(DATABASE_URL);

export default ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: { rejectUnauthorized: false },
    },
  },
});
