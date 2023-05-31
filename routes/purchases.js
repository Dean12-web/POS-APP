var express = require('express');
var router = express.Router();

module.exports = (pool) => {

    router.get('/', async (req, res, next) => {
        try {
            const sql = `SELECT * FROM purchases`
            const data = await pool.query(sql)
            res.render('purchases/index', { title: 'POS - Purchases', current: 'purchases', user: req.session.user, data: data.rows })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Getting Data Purchases' })
        }
    })
    router.get('/create', async (req, res, next) => {
        try {
            const {userid}  = req.session.user
            // console.log({user : user.userid})
            console.log(userid)
            const sql = `INSERT INTO purchases(invoice, totalsum, operator) VALUES(purchaseinvoice(),0,$1) returning *`
            const data = await pool.query(sql, [userid])
            res.redirect(`/purchases/show/${data.rows[0].invoice}`)
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ error: 'Error Creating Data Purchases' })
        }
    })

    router.get('/show/:invoice', async (req, res, next) => {
        try {
            const data = await pool.query('SELECT * FROM purchases WHERE invoice = $1', [req.params.invoice])
            console.log(data)
            res.render('purchases/form', { title: 'POS - Add', current: 'purchases', user: req.session.user, data: data, cardheader: 'TRANSACTION' })
        } catch (error) {
            console.log(error.message)
            res.status(500).json({ error: 'Error Showing Data Purchases' })
        }
    })

    router.post('/show/:invoice', (req, res, next) => {

    })


    router.post('/add', (req, res, next) => {

    })

    router.get('/edit', async (req, res, next) => {

    })

    router.post('/edit', (req, res, next) => {

    })

    router.get('/delete', (req, res, next) => {

    })
    return router
}