import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/all-factories-data', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH measurements_data AS (
                SELECT 
                    cm.factory_id,
                    c.id as category_id,
                    c.category_name,
                    cc.component_name,
                    cm.value,
                    cm.unit,
                    TO_CHAR(cm.measurement_date, 'YYYY-MM-DD') as measurement_date
                FROM component_measurement cm
                JOIN category_component cc ON cm.component_id = cc.id
                JOIN category c ON cc.category_id = c.id
                ORDER BY cm.measurement_date ASC
            )
            SELECT 
                ef.id,
                ef.factory_name,
                fc.latitude,
                fc.longitude,
                json_agg(
                    json_build_object(
                        'category_id', md.category_id,
                        'category_name', md.category_name,
                        'component_name', md.component_name,
                        'value', md.value,
                        'unit', md.unit,
                        'measurement_date', md.measurement_date
                    ) ORDER BY md.measurement_date
                ) as measurements
            FROM eco_factory ef
            JOIN factory_coordinates fc ON ef.id = fc.factory_id
            LEFT JOIN measurements_data md ON ef.id = md.factory_id
            GROUP BY ef.id, ef.factory_name, fc.latitude, fc.longitude
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;