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

  router.get('/register', (req, res, next) => {
    res.render('register', { title: 'Register User' })
  })

  router.get('/', isLoggedIn, (req, res, next) => {
    res.render('dashboard/index', { title: 'POS', user: req.session.user })
  })

  // router.get('/users', isLoggedIn, (req, res, next) => {
  //   res.render('users', { title: 'POS', user: req.session.user })
  // })

  router.post('/register', async (req, res, next) => {
    try {
      const { userid, email, name, password, role } = req.body
      const hash = bcrypt.hashSync(password, saltRounds);
      let sql = `INSERT INTO users(userid,email,name,password,role) VALUES($1,$2,$3,$4,$5)`
      await pool.query(sql, [userid, email, name, hash, role])
      console.log('ADDING USER DATA SUCCESS')
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Error Creating Data User" })
    }

    router.get('/edit', (req, res, next) => {
      res.render('edit', { title: 'Edit Data User' })
    })

    router.post('/edit/:userid', async (req, res, next) => {
      try {
        const { userid } = req.params;
        const { email, name, password, role } = req.body;
        let sql = `UPDATE users SET email = $1, name = $2, password = $3,  role = $4 WHERE id = $5`;
        await pool.query(sql, [email, name, password, role, userid]);
        console.log('EDIT USER DATA SUCEES');
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error Updating Data User" })
      }
    })
    router.get('/delete/:userid', async (req, res, next) => {
      try {
        const { userid } = req.params
        const sql = `DELETE FROM users WHERE userid = $1`
        await pool.query(sql, [userid])
        console.log('DELETE USER DATA SUCCESS')
      } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error Deleting Data User" })
      }
    })



  })
  return router
};
