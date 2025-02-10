const { Pool } = require('pg');

const pool = new Pool({
  user: 'notes',
  host: 'localhost',
  database: 'notes',
  password: 'notes',
  port: 5432,
});

module.exports = { pool };
