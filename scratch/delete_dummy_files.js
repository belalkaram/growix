const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB');

  const res = await client.query(
    "DELETE FROM package_files WHERE file_size = '45 MB' OR file_size LIKE '%45 MB%' RETURNING id, file_name, file_key"
  );
  console.log(`Deleted ${res.rows.length} dummy records:`);
  console.log(res.rows);

  const remaining = await client.query('SELECT id, file_name, file_key, file_size FROM package_files ORDER BY id');
  console.log(`\nRemaining records count: ${remaining.rows.length}`);
  console.log(remaining.rows);

  await client.end();
}

main().catch(console.error);
