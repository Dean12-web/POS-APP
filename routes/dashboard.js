var express = require('express')
var router = express.Router()

module.exports = (pool) => {

    router.get('/', async (req, res, next) => {
        try {
            // USE BETWEEN TO SORT THE DATE 
            const totalP = await pool.query(`SELECT SUM(totalsum) AS TP FROM purchases`)
            const totalS = await pool.query('SELECT SUM(totalsum) AS TS FROM sales')
            const total = await pool.query(`SELECT COUNT(DISTINCT invoice) AS TotalSales FROM sales`)
            const tablePurchases = await pool.query(`SELECT to_char(time, 'Mon YY') AS monthly, SUM(totalsum) AS tp from purchases GROUP BY monthly `)
            const tableSales = await pool.query(`SELECT to_char(time, 'Mon YY') AS monthly, SUM(totalsum) AS ts from sales GROUP BY monthly `)

            const purchasesSum = parseFloat(totalP.rows[0].tp);
            const salesSum = parseFloat(totalS.rows[0].ts);
            const subtractionResult = (salesSum - purchasesSum).toFixed(2);

            // object that will hold data from table 
            const monthlyData = {}
            // iterate over the totalpurchases and populate the monthlyData object
            for (const purchase of tablePurchases.rows) {
                const { monthly, tp } = purchase;
                monthlyData[monthly] = { ...monthlyData[monthly], monthly, expense: tp };
            }
            // iterate over totalsales and populate the monthlyData object
            for (const sale of tableSales.rows) {
                const { monthly, ts } = sale
                monthlyData[monthly] = { ...monthlyData[monthly], monthly, revenue: ts }
            }
            // iterate over the monghtlyData object and calculate earnings
            for (const month in monthlyData) {
                const { expense = 0, revenue = 0 } = monthlyData[month];
                monthlyData[month].earning = revenue - expense
            }
            // Create an array to store the final table data
            const tableData = []
            // iterate over the monthlyData object and format the data for the table
            for (const month in monthlyData) {
                const { monthly, expense = '0.00', revenue = '0.00', earning = '0.00' } = monthlyData[month]
                const formattedEarning = parseFloat(earning).toFixed(2);
                const row = {
                    monthly,
                    expense: parseFloat(expense).toFixed(2),
                    revenue: parseFloat(revenue).toFixed(2),
                    earning: formattedEarning
                }
                tableData.push(row)
            }
            console.log(tableData)
            res.render('dashboard/index', {
                title: 'POS - Dashboard',
                current: 'dashboard',
                user: req.session.user,
                purchases: totalP.rows[0],
                sales: totalS.rows[0],
                total: total.rows[0],
                subtractionResult,
                tableData
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Dashboard' })
        }
    })
    return router
}
