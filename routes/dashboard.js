var express = require('express')
var router = express.Router()

module.exports = (pool) => {

    router.get('/', async (req, res, next) => {
        try {
            const Purchases = `SELECT  to_char(time, 'Mon YY') AS monthly, SUM(totalsum) AS TP FROM purchases GROUP BY monthly `
            const Sales = `SELECT to_char(time,'Mon YY') AS monthly, SUM(totalsum) AS TS FROM sales GROUP BY monthly`
            const TotalSales = 'SELECT COUNT(DISTINCT invoice) AS TotalSales FROM sales'
            const totalP = await pool.query(Purchases)
            const totalS = await pool.query(Sales)
            const total = await pool.query(TotalSales)
            const {rows: totalpurchases} = await pool.query(Purchases)
            const {rows: totalsales} = await pool.query(Sales)
            res.render('dashboard/index', {
                title: 'POS - Dashboard',
                current: 'dashboard',
                user: req.session.user,
                purchases: totalP.rows[0],
                sales: totalS.rows[0],
                total: total.rows,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Dashboard' })
        }
    })
    return router
}