var express = require('express');
var router = express.Router();
const { isLoggedIn } = require('../helpers/util')


module.exports = (pool) => {
    /* GET unitas listing. */
    router.get('/', isLoggedIn, async (req, res, next) => {
        const sql = `SELECT * FROM units`
        const data = await pool.query(sql)

        res.render('units/index', { title: 'POS', current: 'unit', user: req.session.user, data: data.rows })
    })

    router.get('/add', (req, res, next) => {
        res.render('units/form', { title: 'POS - Add', current: 'unit', user: req.session.user, data: {}, cardheader: 'Form Add'})
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
    return router
}
