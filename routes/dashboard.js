var express = require('express')
const { isAdmin, isLoggedIn } = require('../helpers/util')
var router = express.Router()


module.exports = (pool) => {

    router.get('/', isLoggedIn, isAdmin, async (req, res, next) => {
        try {
            const { startDate, endDate } = req.query
            if (startDate && endDate) {
                const { rows: purchase } = await pool.query(`SELECT SUM(totalsum) AS tp from purchases WHERE time BETWEEN $1 AND $2`, [startDate, endDate])
                const { rows: sales } = await pool.query(`SELECT SUM(totalsum) AS ts from sales WHERE time BETWEEN $1 AND $2`,[startDate, endDate])
                const { rows: total } = await pool.query(`SELECT COUNT(DISTINCT invoice) AS totalSales FROM sales WHERE time BETWEEN $1 AND $2`, [startDate, endDate])
                const { rows: totalpurchase } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalpurchases FROM purchases WHERE time BETWEEN $1 AND $2 GROUP BY monthly,sortmonth ORDER BY sortmonth", [startDate, endDate]
                );
                const { rows: totalsales } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalsales FROM sales WHERE time BETWEEN $1 AND $2 GROUP BY monthly,sortmonth ORDER BY sortmonth", [startDate, endDate]
                );
                const { rows: direct } = await pool.query(`SELECT COUNT(invoice) as directbuyer FROM sales WHERE customer = 1 AND time BETWEEN $1 AND $2`, [startDate, endDate])
                const { rows: customer } = await pool.query(`SELECT COUNT(invoice) as customerbuyer FROM sales WHERE customer != 1 AND time BETWEEN $1 AND $2`, [startDate, endDate])
                const tableData = []
                let data = totalpurchase.concat(totalsales)
                let result = {}
                let getMonth = []
                let monthlyIncome = []
                data.forEach(item => {
                    if (result[item.monthly]) {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : result[item.monthly].expense, revenue: item.totalsales ? item.totalsales : result[item.monthly].revenue }
                    } else {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : 0, revenue: item.totalsales ? item.totalsales : 0 }
                        getMonth.push(item.monthly)
                    }
                });
                // Get Income monthly 
                for (const key in result) {
                    monthlyIncome.push(result[key].revenue - result[key].expense)
                }
                // Get Table Data
                for (const key in result) {
                    tableData.push({ monthly: result[key].monthly, expense: result[key].expense, revenue: result[key].revenue })
                }
                // console.log(data)
                res.render('dashboard/index', {
                    title: 'POS - Dashboard',
                    current: 'dashboard',
                    user: req.session.user,
                    purchases: purchase[0],
                    sales: sales[0],
                    total: total[0],
                    tableData,
                    getMonth,
                    monthlyIncome,
                    direct: direct[0].directbuyer,
                    customer: customer[0].customerbuyer,
                    query: req.query
                })
            } else if (startDate) {
                const { rows: purchase } = await pool.query(`SELECT SUM(totalsum) AS tp from purchases WHERE time >= $1`,[startDate])
                const { rows: sales } = await pool.query(`SELECT SUM(totalsum) AS ts from sales WHERE time >= $1`,[startDate])
                const { rows: total } = await pool.query(`SELECT COUNT(DISTINCT invoice) AS totalSales FROM sales WHERE time >= $1`,[startDate])
                const { rows: totalpurchase } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalpurchases FROM purchases WHERE time >= $1 GROUP BY monthly,sortmonth ORDER BY sortmonth", [startDate]
                );
                const { rows: totalsales } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalsales FROM sales WHERE time >= $1 GROUP BY monthly,sortmonth ORDER BY sortmonth", [startDate]
                );
                const { rows: direct } = await pool.query(`SELECT COUNT(invoice) as directbuyer FROM sales WHERE customer = 1 AND time >= $1`, [startDate])
                const { rows: customer } = await pool.query(`SELECT COUNT(invoice) as customerbuyer FROM sales WHERE customer != 1 AND time >= $1`, [startDate])
                const tableData = []
                let data = totalpurchase.concat(totalsales)
                let result = {}
                let getMonth = []
                let monthlyIncome = []
                data.forEach(item => {
                    if (result[item.monthly]) {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : result[item.monthly].expense, revenue: item.totalsales ? item.totalsales : result[item.monthly].revenue }
                    } else {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : 0, revenue: item.totalsales ? item.totalsales : 0 }
                        getMonth.push(item.monthly)
                    }
                });
                // Get Income monthly 
                for (const key in result) {
                    monthlyIncome.push(result[key].revenue - result[key].expense)
                }
                // Get Table Data
                for (const key in result) {
                    tableData.push({ monthly: result[key].monthly, expense: result[key].expense, revenue: result[key].revenue })
                }
                // console.log(data)
                res.render('dashboard/index', {
                    title: 'POS - Dashboard',
                    current: 'dashboard',
                    user: req.session.user,
                    purchases: purchase[0],
                    sales: sales[0],
                    total: total[0],
                    tableData,
                    getMonth,
                    monthlyIncome,
                    direct: direct[0].directbuyer,
                    customer: customer[0].customerbuyer,
                    query: req.query
                })
            } else if (endDate) {
                const { rows: purchase } = await pool.query(`SELECT SUM(totalsum) AS tp from purchases WHERE time <= $1`, [endDate])
                const { rows: sales } = await pool.query(`SELECT SUM(totalsum) AS ts from sales WHERE time <= $1`, [endDate])
                const { rows: total } = await pool.query(`SELECT COUNT(DISTINCT invoice) AS totalSales FROM sales WHERE time <= $1`, [endDate])
                const { rows: totalpurchase } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalpurchases FROM purchases WHERE time <= $1 GROUP BY monthly,sortmonth ORDER BY sortmonth", [endDate]
                );
                const { rows: totalsales } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalsales FROM sales WHERE time <= $1 GROUP BY monthly,sortmonth ORDER BY sortmonth", [endDate]
                );
                const { rows: direct } = await pool.query(`SELECT COUNT(invoice) as directbuyer FROM sales WHERE customer = 1 AND time <= $1`, [endDate])
                const { rows: customer } = await pool.query(`SELECT COUNT(invoice) as customerbuyer FROM sales WHERE customer != 1 AND time <= $1`, [endDate])
                const tableData = []
                let data = totalpurchase.concat(totalsales)
                let result = {}
                let getMonth = []
                let monthlyIncome = []
                data.forEach(item => {
                    if (result[item.monthly]) {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : result[item.monthly].expense, revenue: item.totalsales ? item.totalsales : result[item.monthly].revenue }
                    } else {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : 0, revenue: item.totalsales ? item.totalsales : 0 }
                        getMonth.push(item.monthly)
                    }
                });
                // Get Income monthly 
                for (const key in result) {
                    monthlyIncome.push(result[key].revenue - result[key].expense)
                }
                // Get Table Data
                for (const key in result) {
                    tableData.push({ monthly: result[key].monthly, expense: result[key].expense, revenue: result[key].revenue })
                }
                // console.log(data)
                res.render('dashboard/index', {
                    title: 'POS - Dashboard',
                    current: 'dashboard',
                    user: req.session.user,
                    purchases: purchase[0],
                    sales: sales[0],
                    total: total[0],
                    tableData,
                    getMonth,
                    monthlyIncome,
                    direct: direct[0].directbuyer,
                    customer: customer[0].customerbuyer,
                    query: req.query
                })
            } else {
                const { rows: purchase } = await pool.query(`SELECT SUM(totalsum) AS tp from purchases`)
                const { rows: sales } = await pool.query(`SELECT SUM(totalsum) AS ts from sales`)
                const { rows: total } = await pool.query(`SELECT COUNT(DISTINCT invoice) AS totalSales FROM sales`)
                const { rows: totalpurchase } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalpurchases FROM purchases GROUP BY monthly,sortmonth ORDER BY sortmonth"
                );
                const { rows: totalsales } = await pool.query(
                    "SELECT to_char(time, 'Mon YY') AS monthly,to_char(time, 'YY-MM') AS sortmonth,SUM(totalsum) AS totalsales FROM sales GROUP BY monthly,sortmonth ORDER BY sortmonth"
                );
                const { rows: direct } = await pool.query(`SELECT COUNT(invoice) as directbuyer FROM sales WHERE customer = 1`)
                const { rows: customer } = await pool.query(`SELECT COUNT(invoice) as customerbuyer FROM sales WHERE customer != 1`)
                const tableData = []
                let data = totalpurchase.concat(totalsales)
                let result = {}
                let getMonth = []
                let monthlyIncome = []
                data.forEach(item => {
                    if (result[item.monthly]) {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : result[item.monthly].expense, revenue: item.totalsales ? item.totalsales : result[item.monthly].revenue }
                    } else {
                        result[item.monthly] = { monthly: item.monthly, expense: item.totalpurchases ? item.totalpurchases : 0, revenue: item.totalsales ? item.totalsales : 0 }
                        getMonth.push(item.monthly)
                    }
                });
                // Get Income monthly 
                for (const key in result) {
                    monthlyIncome.push(result[key].revenue - result[key].expense)
                }
                // Get Table Data
                for (const key in result) {
                    tableData.push({ monthly: result[key].monthly, expense: result[key].expense, revenue: result[key].revenue })
                }
                console.log(req.session.user.role)
                // console.log(data)
                res.render('dashboard/index', {
                    title: 'POS - Dashboard',
                    current: 'dashboard',
                    user: req.session.user,
                    purchases: purchase[0],
                    sales: sales[0],
                    total: total[0],
                    tableData,
                    getMonth,
                    monthlyIncome,
                    direct: direct[0].directbuyer,
                    customer: customer[0].customerbuyer,
                    query: req.query
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error Showing Data Dashboard' })
        }
    })


    return router
}
