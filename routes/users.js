var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const { isLoggedIn } = require('../helpers/util')
const saltRounds = 10


module.exports = (pool) => {
  /* GET users listing. */
  // router.get('/',(res,req,next)=>{
  //   console.log(req.session.user)
  //   res.render('users', { title: 'POS'})
  // })

  return router
}
