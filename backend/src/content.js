import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/all-factories', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                eco_factory.factory_name, 
                factory_coordinates.latitude, 
                factory_coordinates.longitude
            FROM 
                eco_factory
            JOIN 
                factory_coordinates ON eco_factory.id = factory_coordinates.factory_id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;