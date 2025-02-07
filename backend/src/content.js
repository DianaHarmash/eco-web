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

router.get('/measurements', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                component_measurement.id,
                component_measurement.component_id,
                component_measurement.factory_id,
                component_measurement.measurement_date,
                component_measurement.value,
                component_measurement.unit
            FROM 
                component_measurement
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// content.js
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
                    cm.measurement_date
                FROM component_measurement cm
                JOIN category_component cc ON cm.component_id = cc.id
                JOIN category c ON cc.category_id = c.id
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
                    )
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