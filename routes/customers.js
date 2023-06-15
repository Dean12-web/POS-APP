var express = require('express')
const { isLoggedIn } = require('../helpers/util')
var router = express.Router()

module.exports = (pool) => {
    router.get('/', isLoggedIn, async (req, res, next) => {
        const sql = 'SELECT * FROM customers'
        const data = await pool.query(sql)
        res.render('customers/index', { title: 'POS - Customers', current: 'customers', user: req.session.user, data: data.rows })
    })

    router.get('/add', (req, res, next) => {
        res.render('customers/form', { title: 'POS - Add', current: 'customers', user: req.session.user, data: {}, cardheader: 'Form Add' })
    })

    router.post('/add', async (req, res, next) => {
        try {
            const { name, address, phone } = req.body
            const sql = `INSERT INTO customers(name, address, phone) VALUES($1,$2,$3)`
            await pool.query(sql, [name, address, phone])
            console.log('Data Customer Added')
            res.redirect('/customers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Adding Data Customer" })
        }
    })

    router.get('/edit/:customerid', async (req, res, next) => {
        try {
            const { customerid } = req.params
            const sql = `SELECT * FROM customers WHERE customerid = $1`
            const data = await pool.query(sql, [customerid])
            res.render('customers/form', { title: 'POS - Edit', current: 'customers', user: req.session.user, data: data.rows[0], cardheader: 'Form Edit' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Customer' })
        }
    })

    router.post('/edit/:customerid', async (req, res, next) => {
        try {
            const { customerid } = req.params
            const { name, address, phone } = req.body
            const sql = `UPDATE customers SET name = $1, address = $2, phone = $3 WHERE customerid = $4`
            await pool.query(sql, [name, address, phone, customerid])
            console.log('Data Customer Updated')
            res.redirect('/customers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Updating Data Customer' })
        }
    })

    router.get('/delete/:customerid', async (req, res, next) => {
        try {
            const { customerid } = req.params
            const sql = `DELETE FROM customers WHERE customerid = $1`
            await pool.query(sql, [customerid])
            console.log('Delete Data Customer Success')
            res.redirect('/customers')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Deleting Data Customer' })
        }
    })

    router.get('/datatable', async (req, res, next) => {
        let params = []
        
        if(req.query.search.value){
            params.push(`name ILIKE '%${req.query.search.value}%'`)
        }

        if(req.query.search.value){
            params.push(`address ILIKE '%${req.query.search.value}%'`)
        }

        if(req.query.search.value){
            params.push(`phone ILIKE '%${req.query.search.value}%'`)
        }
        console.log(params)

        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir
        const sqlData = `SELECT * FROM customers${params.length > 0 ?` WHERE ${params.join(' OR ')}` : ''} ORDER BY ${sortBy} ${sortMode} LIMIT ${limit} OFFSET ${offset} `
        const sqlTotal = `SELECT COUNT(*) as total FROM customers${params.length > 0 ? ` WHERE ${params.join(' OR ')}`: ''}`
        const data = await pool.query(sqlData)
        const total = await pool.query(sqlTotal)
        console.log(total.rows[0].total)
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
