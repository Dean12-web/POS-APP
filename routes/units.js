var express = require('express');
var router = express.Router();
const { isLoggedIn, isAdmin } = require('../helpers/util')


module.exports = (pool) => {
    /* GET unitas listing. */
    router.get('/', isLoggedIn, isAdmin, async (req, res, next) => {
        const sql = `SELECT * FROM units`
        const data = await pool.query(sql)

        res.render('units/index', { title: 'POS - units', current: 'unit', user: req.session.user, data: data.rows })
    })

    router.get('/add', (req, res, next) => {
        res.render('units/form', { title: 'POS - Add', current: 'unit', user: req.session.user, data: {}, cardheader: 'Form Add' })
    })

    router.post('/add', async (req, res, next) => {
        try {
            const { unit, name, note } = req.body
            let sql = `INSERT INTO units(unit,name,note) VALUES ($1,$2,$3)`
            await pool.query(sql, [unit, name, note])
            console.log('Data Unit Added')
            res.redirect('/units')
            // res.status(200).json({ success: "Data User Added Successfully" });
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Creating Data User" })
        }
    })

    router.get('/edit/:unit', async (req, res, next) => {
        try {
            const { unit } = req.params
            const sql = 'SELECT * FROM units WHERE unit = $1';
            const data = await pool.query(sql, [unit])
            // console.log(data)
            res.render('units/form', { title: 'POS - Edit', current: 'unit', user: req.session.user, data: data.rows[0], cardheader: 'Form Edit' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Getting Data Unit" })
        }
    })

    router.post('/edit/:unit', async (req, res, next) => {
        try {
            const { unit } = req.params;
            const { newUnit, name, note } = req.body;
            let sql = `UPDATE units SET unit = $1, name =$2, note = $3 WHERE unit = $4`
            await pool.query(sql, [newUnit, name, note, unit]);
            console.log('Data Unit Edited');
            res.redirect('/units');
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Updating Data Unit" })
        }
    })

    router.get('/delete/:unit', async (req, res, next) => {
        try {
            const { unit } = req.params;
            let sql = `DELETE FROM units WHERE unit = $1`
            await pool.query(sql, [unit]);
            console.log('Delete Unit Success');
            res.redirect('/units');
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Deleting Data User" })
        }
    })

    router.get('/datatable', async (req, res, next) => {
        let params = []

        if(req.query.search.value){
            params.push(`unit ILIKE '%${req.query.search.value}%'`)
        }
        if(req.query.search.value){
            params.push(`name ILIKE '%${req.query.search.value}%'`)
        }
        if(req.query.search.value){
            params.push(`note ILIKE '%${req.query.search.value}%'`)
        }

        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir
        const sqlData = `SELECT * FROM units${params.length > 0 ?` WHERE ${params.join(' OR ')}` : ''} ORDER BY ${sortBy} ${sortMode} LIMIT ${limit} OFFSET ${offset} `
        const sqlTotal = `SELECT COUNT(*) as total FROM units${params.length > 0 ? ` WHERE ${params.join(' OR ')}`: ''}`
        const data = await pool.query(sqlData)
        console.log(sqlData)
        const total = await pool.query(sqlTotal)

        const response = {
            "draw" : Number(req.query.draw),
            "recordsTotal" : total.rows[0].total,
            "recordsFiltered" : total.rows[0].total,
            "data" : data.rows
        }

        res.json(response)
    })
    return router
}
