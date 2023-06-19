var express = require('express');
var router = express.Router();

module.exports = (pool) => {
    // Jaascripts Set Interval
    router.get('/', async (req, res, next) => {
        const {rows: data} = await pool.query('SELECT * FROM goods');
        res.json({ data: data })
    })
    return router
}