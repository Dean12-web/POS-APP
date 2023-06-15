var express = require('express');
var router = express.Router();
var moment = require('moment');
const { isLoggedIn } = require('../helpers/util');
module.exports = (pool) => {


    router.get('/', isLoggedIn, async (req, res, next) => {
        try {
            const sql = `SELECT * FROM purchases LEFT JOIN suppliers ON purchases.supplier = suppliers.supplierid ORDER BY time desc`
            const data = await pool.query(sql)
            const hasil = req.session.user.id !== data.rows[0].operator
            console.log(req.session.user)
            res.render('purchases/index', { title: 'POS - Purchase', current: 'purchases', user: req.session.user, data: data.rows, moment, current_user: req.session.user })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Purchases' })
        }
    })

    router.get('/create', async (req, res, next) => {
        try {
            const { userid } = req.session.user
            const sql = `INSERT INTO purchases(invoice,totalsum,operator) VALUES(purchaseinvoice(), 0, $1) returning *`
            const data = await pool.query(sql, [userid])
            res.redirect(`/purchases/show/${data.rows[0].invoice}`)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Creating Data Purchases' })
        }
    })

    router.get('/show/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const invoicesql = `SELECT * FROM purchases WHERE invoice = $1`
            const goodssql = `SELECT * FROM goods ORDER BY barcode`
            const supsql = `SELECT * FROM suppliers ORDER BY supplierid`
            const getInvoice = await pool.query(invoicesql, [invoice])
            const getBarcode = await pool.query(goodssql)
            const getSuppplier = await pool.query(supsql)
            res.render('purchases/form',
                {
                    title: 'POS - Purchases',
                    current: 'purchases',
                    user: req.session.user,
                    moment,
                    data: getInvoice.rows[0],
                    barcode: getBarcode.rows,
                    supplier: getSuppplier.rows,
                    cardheader: 'TRANSACTION'
                }
            )
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Purchases' })
        }
    })
    router.post('/show/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const { totalsum, suppliername } = req.body
            const { userid } = req.session.user
            const sql = `UPDATE purchases SET totalsum = $1, supplier = $2, operator = $3 WHERE invoice = $4`
            await pool.query(sql, [totalsum, suppliername, userid, invoice])
            console.log('Succes Creating Data Purchases')
            res.redirect('/purchases')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Creating Data Purchases' })
        }
    })
    router.get('/tables/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const sql = `SELECT purchaseitems.*, goods.name FROM purchaseitems LEFT JOIN goods ON purchaseitems.itemcode = goods.barcode WHERE purchaseitems.invoice = $1 ORDER BY purchaseitems.id`
            const data = await pool.query(sql, [invoice])
            console.log('Showing Table Purchase Items Succes')
            res.json(data.rows)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Table Purchase Items' })
        }
    })
    router.get('/goods/:barcode', async (req, res, next) => {
        try {
            const { barcode } = req.params
            const sql = `SELECT * FROM goods WHERE barcode = $1`
            const data = await pool.query(sql, [barcode])
            console.log('Showing Data Barcode Succes')
            res.json(data.rows[0])
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Barcode' })
        }
    })
    router.post('/additems', async (req, res, next) => {
        try {
            const { invoice, itemcode, quantity } = req.body
            const sqlPurchaseItem = `INSERT INTO purchaseitems(invoice, itemcode, quantity) VALUES($1,$2,$3)`
            const sqlPurchase = `SELECT * FROM purchases WHERE invoice = $1`
            await pool.query(sqlPurchaseItem, [invoice, itemcode, quantity])
            const data = await pool.query(sqlPurchase, [invoice])
            console.log('Adding Purchase Items Success')
            res.json(data.rows[0])
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Adding Data Purchase Items' })
        }
    })
    router.get('/deleteitems/:id', async (req, res, next) => {
        try {
            const { id } = req.params
            const sql = `DELETE FROM purchaseitems WHERE id = $1 returning *`
            const data = await pool.query(sql, [id])
            res.redirect(`/purchases/show/${data.rows[0].invoice}`)
        } catch (error) {
            console.log(error)
        }
    })
    router.get('/delete/:invoice', async (req, res, next) => {
        try {
            const { invoice } = req.params
            const sql = `DELETE FROM purchases WHERE invoice = $1`
            await pool.query(sql, [invoice])
            res.redirect('/purchases')
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Deleting Data Purchases' })
        }
    })

    router.get('/datatable', async (req, res, next) => {
        let params = []
        const value = req.query.search.value
        if(value){
            params.push(`invoice ILIKE '%${value}%'`)
        }
        const limit = req.query.length
        const offset = req.query.start
        const sortBy = req.query.columns[req.query.order[0].column].data
        const sortMode = req.query.order[0].dir
        const sqlData = `SELECT purchases.*, suppliers.* FROM purchases LEFT JOIN suppliers ON purchases.supplier = suppliers.supplierid${params.length > 0 ?` WHERE ${params.join(' OR ')}` : ''} ORDER BY ${sortBy} ${sortMode} LIMIT ${limit} OFFSET ${offset} `
        const sqlTotal = `SELECT COUNT(*) as total FROM purchases${params.length > 0 ? ` WHERE ${params.join(' OR ')}`: ''}`
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