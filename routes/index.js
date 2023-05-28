var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
  /* GET home page. */
  router.get('/login', (req, res, next) => {
    res.render('login', { title: 'POS', info: req.flash('info') });
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body
      const sql = `SELECT * FROM users WHERE email = $1`
      const { rows } = await pool.query(sql, [email])
      if (rows.length === 0) {
        req.flash('info', "users doesn't exits")
        return res.redirect('/login')
      }

      if (!bcrypt.compareSync(password, rows[0].password)) {
        req.flash('info', "password wrong")
        return res.redirect('/login')
      }
      req.session.user = rows[0]
      res.redirect('/')
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Fail to login" })
    }
  })

  router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      res.redirect('/login')
    })
  })

  router.get('/', isLoggedIn, (req, res, next) => {
    res.render('dashboard/index', { title: 'POS', user: req.session.user })
  })
  return router
};
