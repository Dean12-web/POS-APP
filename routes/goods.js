var express = require('express');
var router = express.Router();
var path = require('path');
const { isLoggedIn, isAdmin } = require('../helpers/util')


module.exports = (pool) => {
    /* GET users listing. */
    router.get('/', isAdmin, async (req, res, next) => {
        const sql = `SELECT * FROM goods`
        const data = await pool.query(sql)

        res.render('goods/index', { title: 'POS',current: 'goods', user: req.session.user, data: data.rows })
    })

    router.get('/add', async (req, res, next) => {
        const sql = `SELECT * FROM units`
        const data = await pool.query(sql)
        console.log(data)
        res.render('goods/form', { title: 'POS', user: req.session.user, current: 'goods', dataUnit: data.rows, data:{}, cardheader: 'Form Add' })
    })

    router.post('/add', async (req, res, next) => {
        try {
            const { barcode, name, stock, purchaseprice, sellingprice, unit} = req.body
            let sql = `INSERT INTO goods(barcode,name,stock,purchaseprice,sellingprice,unit,picture) VALUES ($1,$2,$3,$4,$5,$6,$7)`
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
            }
            const sampleFile = req.files.picture;
            const fileName = `${Date.now()}-${sampleFile.name}`;
            const uploadPath = path.join(__dirname, '..', 'public', 'images', fileName);
            
            sampleFile.mv(uploadPath, async function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                await pool.query(sql, [barcode, name, stock, purchaseprice, sellingprice, unit, fileName]);
                console.log('Data Goods Added');
                res.redirect('/goods');
            });            
            } catch (error) {
                console.log(error)
                res.status(500).json({ error: "Error Creating Data Goods" })
            }
        })

    router.get('/edit/:barcode', async (req, res, next) => {
        try {
            const { barcode } = req.params
            const sql = 'SELECT * FROM goods WHERE barcode = $1';
            const sql2 = 'SELECT * FROM units';
            const data = await pool.query(sql, [barcode])
            const unit = await pool.query(sql2)
            console.log(data)
            res.render('goods/form', { title: 'POS', current: 'goods', user: req.session.user,dataUnit: unit.rows, data: { ...data.rows[0], readonly: true }, cardheader: 'Form Edit' })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Getting Data User" })
        }
    })

    router.post('/edit/:barcode', async (req, res, next) => {
        try {
            const { barcode } = req.params;
            const { name, stock, purchaseprice, sellingprice, unit } = req.body;
            let sql = `UPDATE goods SET name = $1, stock = $2, purchaseprice = $3, sellingprice = $4, unit = $5 WHERE barcode = $6`;
    
            if (!req.files || !req.files.picture) {
                // No file was uploaded, proceed with updating other fields
                await pool.query(sql, [name, stock, purchaseprice, sellingprice, unit, barcode]);
                console.log('Data Goods Updated');
                return res.redirect('/goods');
            }
    
            const sampleFile = req.files.picture;
            const fileName = `${Date.now()}-${sampleFile.name}`;
            const uploadPath = path.join(__dirname, '..', 'public', 'images', fileName);
    
            sampleFile.mv(uploadPath, async function (err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                }
    
                // File uploaded successfully, update all fields including the picture
                sql = `UPDATE goods SET name = $1, stock = $2, purchaseprice = $3, sellingprice = $4, unit = $5, picture = $6 WHERE barcode = $7`;
                await pool.query(sql, [name, stock, purchaseprice, sellingprice, unit, fileName, barcode]);
                console.log('Data Goods Updated');
                res.redirect('/goods');
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error Updating Data Goods" });
        }
    });
    

    router.get('/delete/:barcode', async (req, res, next) => {
        try {
            const { barcode } = req.params;
            let sql = `DELETE FROM goods WHERE barcode = $1`
            await pool.query(sql, [barcode]);
            console.log('Delete Unit Success');
            res.redirect('/goods');
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error Deleting Data User" })
        }
    })
    return router
}
