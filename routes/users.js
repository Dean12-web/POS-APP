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

    res.render('users/index', { title: 'POS', user: req.session.user, data : data.rows })
  })
  router.get('/add', (req,res,next)=>{
    res.render('users/add', {title:'Add Data', user: req.session.user})
  })

  router.get('/edit', (req,res,next)=>{
    res.render('users/edit', {title:'Add Data', user: req.session.user})
  })
  return router
}
