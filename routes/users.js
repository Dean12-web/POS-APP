var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
  /* GET users listing. */
  router.get('/', isLoggedIn, (req, res, next) => {
    res.render('users/index', { title: 'POS', user: req.session.user })
  })

  return router
}
