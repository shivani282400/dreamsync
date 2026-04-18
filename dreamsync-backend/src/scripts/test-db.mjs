import { Client } from 'pg';
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect()
  .then(() => {
    console.log("Connected successfully");
    client.end();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit(1);
  });
