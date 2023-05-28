var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
  /* GET users listing. */
  router.get('/', isLoggedIn, async (req, res, next) => {
    const sql = `SELECT * FROM users`
    const data = await pool.query(sql)

    res.render('users/index', { title: 'POS', user: req.session.user, data: data.rows })
  })

  router.get('/add', (req, res, next) => {
    res.render('users/add', { title: 'Add Data', user: req.session.user })
  })

  router.post('/add', async (req, res, next) => {
    try {
      const { email, name, password, role } = req.body
      const hash = bcrypt.hashSync(password, saltRounds);
      let sql = `INSERT INTO users(email,name,password,role) VALUES ($1,$2,$3,$4)`
      await pool.query(sql, [email, name, hash, role])
      console.log('Data User Added')
      res.redirect('/users')
      // res.status(200).json({ success: "Data User Added Successfully" });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Creating Data User" })
    }
  })

  router.get('/edit/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params
      const sql = 'SELECT * FROM users WHERE userid = $1';
      const data = await pool.query(sql, [userid])
      // console.log(data)
      res.render('users/edit', { title: 'Add Data', user: req.session.user, data: data.rows[0] })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Getting Data User" })
    }
  })

  router.post('/edit/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params;
      const { email, name, role } = req.body;
      let sql = `UPDATE users SET email = $1, name =$2, role = $3 WHERE userid = $4`
      await pool.query(sql, [email, name, role, userid]);
      console.log('Data User Edited');
      res.redirect('/users');
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Updating Data User" })
    }
  })

  router.get('/delete/:userid', async (req, res, next) => {
    try {
      const { userid } = req.params;
      let sql = `DELETE FROM users WHERE userid = $1`
      await pool.query(sql, [userid]);
      console.log('Delete User Success');
      res.redirect('/users');
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Deleting Data User" })
    }
  })
  return router
}
