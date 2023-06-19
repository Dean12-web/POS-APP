var express = require('express');
var router = express.Router();

module.exports = (pool) => {
    router.get('/', async (req, res, next) => {
        const  data  = await pool.query('SELECT * FROM goods WHERE stock <= 5');
        res.json({ datas: data.rows })
    })

    router.get('/count', async (req, res, next) => {
        const {rows : total} = await pool.query('SELECT COUNT(barcode) as total FROM goods WHERE stock <= 5');
        res.json(total)
    })
    return router
}