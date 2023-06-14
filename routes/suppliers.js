var express = require('express');
const { isLoggedIn } = require('../helpers/util');
var router = express.Router();


module.exports = (pool) => {
    /* GET suppliers listing. */
    router.get('/', isLoggedIn, async (req, res, next) => {
        const sql = `SELECT * FROM suppliers`
        const data = await pool.query(sql)
        res.render('suppliers/index', { title: 'POS', current: 'supplier', user: req.session.user, data: data.rows })
    })

    router.get('/add', (req, res, next) => {
        res.render('suppliers/form', { title: 'POS - Add', current: 'supplier', user: req.session.user, data: {}, cardheader: 'Form Add' })
    })

    router.post('/add', async (req, res, next) => {
        try {
            const { name, address, phone } = req.body
            let sql = `INSERT INTO suppliers(name,address,phone) VALUES ($1,$2,$3)`
            await pool.query(sql, [name, address, phone])
            console.log('Data Supplier Added')
            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Creating Data Supplier" })
        }
    })

    router.get('/edit/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params
            const sql = 'SELECT * FROM suppliers WHERE supplierid = $1';
            const data = await pool.query(sql, [supplierid])
            console.log(data)
            res.render('suppliers/form', { title: 'POS - Edit', current: 'supplier', user: req.session.user, data: data.rows[0], cardheader: 'Form Edit' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Supplier' })
        }
    })

    router.post('/edit/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params
            const { name, address, phone } = req.body
            const sql = `UPDATE suppliers SET name = $1, address = $2, phone = $3 WHERE supplierid = $4`
            await pool.query(sql, [name, address, phone, supplierid])
            console.log('Data Supplier Edited')
            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Updating Data Supplier' })
        }
    })

    router.get('/delete/:supplierid', async (req, res, next) => {
        try {
            const { supplierid } = req.params
            const sql = `DELETE FROM suppliers WHERE supplierid = $1`
            await pool.query(sql, [supplierid])
            console.log('DELETE Supplier Success')
            res.redirect('/suppliers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Deleting Supllier Data' })
        }
    })

    router.get('/datatable', async (req, res, next) => {
        let params = []

        if(req.query.search.value){
            params.push(`name ILIKE '%${req.query.search.value}'`)
        }
        if(req.query.search.value){
            params.push(`address ILIKE '%${req.query.search.value}'`)
        }
        if(req.query.search.value){
            params.push(`phone ILIKE '%${req.query.search.value}'`)
        }
    
        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir

        const sqlData = `SELECT * FROM suppliers${params.length > 0 ?` WHERE ${params.join(' OR ')}` : ''} ORDER BY ${sortBy} ${sortMode} LIMIT ${limit} OFFSET ${offset} `
        const sqlTotal = `SELECT COUNT(*) as total FROM suppliers${params.length > 0 ? ` WHERE ${params.join(' OR ')}`: ''}`
    
        const data = await pool.query(sqlData)
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