import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'web-eco-management',
    password: process.env.DB_PASSWORD || '1234',
    port: 5432
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Successfully connected to database');
    }
});

export default pool;