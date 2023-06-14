var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn, isAdmin } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
  /* GET users listing. */
  router.get('/', isLoggedIn, isAdmin, async (req, res, next) => {
    const sql = `SELECT * FROM users`
    const data = await pool.query(sql)

    res.render('users/index', { title: 'POS', current: 'user', user: req.session.user, data: data.rows })
  })

  router.get('/add', (req, res, next) => {
    res.render('users/add', { title: 'Add Data', current: 'user', user: req.session.user })
  })

  router.post('/add', async (req, res, next) => {
    try {
      const { email, name, password, role } = req.body
      const hash = bcrypt.hashSync(password, saltRounds);
      let sql = `INSERT INTO users(email,name,password,role) VALUES ($1,$2,$3,$4)`
      const data = await pool.query(sql, [email, name, hash, role])
      console.log('Data User Added')
      // res.json({
      //   succes:true,
      //   data: data
      // })
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
      res.render('users/edit', { title: 'Edit Data', current: 'user', user: req.session.user, data: data.rows[0] })
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

  router.get('/profile/', async (req, res, next) => {
    try {
      res.render('users/profile', { title: 'POS - Profile', current: 'dashboard', user: req.session.user, info: req.flash('info') })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Getting Profile User" })
    }
  })

  router.post('/profile', async (req, res, next) => {
    try {
      const { userid } = req.session.user
      const { email, name } = req.body
      // console.log(email)
      await pool.query(`UPDATE users SET email = $1, name = $2 WHERE userid = $3`, [email, name, userid])
      const { rows: datas } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email])
      // console.log(datas[0])
      const data = datas[0]
      req.session.user = data
      req.session.save()
      req.flash('info', 'Your profile has been updated');
      res.redirect('/users/profile')
    } catch (error) {
      console.log('Error in query:', error)
      res.status(500).json({ error: 'Error Updating Profile' })
    }
  })

  router.get('/changepassword', (req, res, next) => {
    try {
      res.render('users/password', { title: 'POS - Change Password', current: 'dashboard', user: req.session.user, error: req.flash('error'), info: req.flash('info') })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Getting Data" })
    }
  })

  router.post('/changepassword', async (req, res, next) => {
    try {
      const { userid } = req.session.user
      const { oldpassword, newpassword, repassword } = req.body

      // Check old password and paswword in the data user same or not
      const { rows: [user] } = await pool.query(`SELECT * FROM users WHERE userid = $1`, [userid]);
      if (!bcrypt.compareSync(oldpassword, user.password)) {
        req.flash('error', 'Old Password is Wrong')
        return res.redirect('/users/changepassword')
      }

      if (newpassword !== repassword) {
        req.flash('error', "Retype Password is doesn't match")
        return res.redirect('/users/changepassword')
      }
      const hash = bcrypt.hashSync(newpassword, saltRounds)

      await pool.query(`UPDATE users set password = $1 WHERE userid = $2`, [hash, userid])
      req.flash('info', 'Your Password Has Been Updated')
      res.redirect('/users/changepassword')
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Changig Password User" })
    }
  })

  router.get('/datatable', async (req, res, next) => {
    let params = []

    if (req.query.search.value) {
      params.push(`name ilike '%${req.query.search.value}%'`)
    }
    // console.log(req.query.search.value)
    // console.log(params)
    if (req.query.search.value) {
      params.push(`email ilike '%${req.query.search.value}%'`)
    }

    const limit = req.query.length
    const offset = req.query.start
    const sortBy = req.query.columns[req.query.order[0].column].data
    const sortMode = req.query.order[0].dir
    const sqlData = `SELECT * FROM users${params.length > 0 ? ` WHERE ${params.join(' OR ')}`: ''} ORDER BY ${sortBy} ${sortMode} limit ${limit} offset ${offset} `
    const sqlTotal = `SELECT COUNT(*) as total FROM users${params.length > 0 ? ` WHERE ${params.join(' OR ')}` : ''}`
    const total = await pool.query(sqlTotal)
    const data = await pool.query(sqlData)
    // console.log(sqlData)
    // console.log(limit, offset)
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
