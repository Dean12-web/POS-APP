var express = require('express')
var router = express.Router()
var moment = require('moment')
const { isLoggedIn } = require('../helpers/util')

module.exports = (pool) => {
    router.get('/',isLoggedIn, async (req, res, next) => {
        try {
            const sql = `SELECT * FROM sales LEFT JOIN customers ON sales.customer = customers.customerid `
            const data = await pool.query(sql)
            res.render('sales/index', { title: 'POS - Sales', current: 'sales', user: req.session.user, data: data.rows, moment })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Sales' })
        }
    })

    router.get('/create', async (req, res, next) => {
        try {
            const { userid } = req.session.user
            const sql = `INSERT INTO sales(invoice,totalsum,operator) VALUES (sales(),0,$1) returning *`
            const data = await pool.query(sql, [userid])
            res.redirect(`/sales/show/${data.rows[0].invoice}`)
        } catch (error) {
            console.log(error)
            res.status(500).json({ erro: 'Error Creating Data Sales' })
        }
    })

    router.get('/show/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const invoicesql = `SELECT * FROM sales WHERE invoice = $1`
            const goodsSql = 'SELECT * FROM goods'
            const custSql = 'SELECT * FROM customers'
            const getInvoice = await pool.query(invoicesql, [invoice])
            const getBarcode = await pool.query(goodsSql)
            const getCustomer = await pool.query(custSql)
            res.render('sales/form', {
                title: 'POS - Sales',
                current: 'sales',
                user: req.session.user,
                moment,
                cardheader: 'TRANSACTION',
                data: getInvoice.rows[0],
                barcode: getBarcode.rows,
                customer: getCustomer.rows
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Sales' })
        }
    })

    router.post('/show/:invoice', async (req, res, next) => {
        const { invoice } = req.params
        const { totalsum, pay, change, customername } = req.body
        const {userid} = req.session.user
        const sql = `UPDATE sales SET totalsum = $1, pay = $2, change = $3, customer = $4 , operator = $5 WHERE invoice = $6`
        await pool.query(sql, [totalsum, pay, change, customername, userid,invoice])
        console.log('Success Creating Data Sales')
        res.redirect('/sales')
    })

    router.get('/goods/:barcode', async (req, res, next) => {
        try {
            const { barcode } = req.params
            const sql = `SELECT * FROM goods WHERE barcode = $1`
            const data = await pool.query(sql, [barcode])
            console.log('Showing Data Barcode Success')
            res.json(data.rows[0])
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Goods' })
        }
    })

    router.get('/tables/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const sql = `SELECT saleitems.*, goods.name FROM saleitems LEFT JOIN goods ON saleitems.itemcode = goods.barcode WHERE saleitems.invoice = $1 ORDER BY saleitems.id`
            const data = await pool.query(sql, [invoice])
            console.log('Showing Table Sale Items Success')
            // console.log(data.rows)
            res.json(data.rows)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Sale Items' })
        }
    })

    router.post('/additems', async (req, res, next) => {
        try {
            const { invoice, itemcode, quantity } = req.body
            const sqlSaleItem = `INSERT INTO saleitems(invoice, itemcode, quantity) VALUES($1,$2,$3)`
            const sqlSale = `SELECT * FROM sales WHERE invoice = $1`
            await pool.query(sqlSaleItem, [invoice, itemcode, quantity])
            const data = await pool.query(sqlSale, [invoice])
            res.json(data.rows[0])
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Adding Data Sale items' })
        }
    })

    router.get('/deleteitems/:id', async (req, res, next) => {
        try {
            const { id } = req.params
            const sql = `DELETE FROM saleitems WHERE id = $1 returning *`
            const data = await pool.query(sql, [id])
            res.redirect(`/sales/show/${data.rows[0].invoice}`)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Deleting Sale Items' })
        }
    })


    router.get('/delete/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const sql = `DELETE FROM sales WHERE invoice = $1`
            await pool.query(sql, [invoice])
            console.log('Delete Data Sales Success')
            res.redirect('/sales')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Deleting Data Sales' })
        }
    })
    return router
}