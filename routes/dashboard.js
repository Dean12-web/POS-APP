var express = require('express')
var router = express.Router()

module.exports = (pool) =>{

    router.get('/',(req,res,next)=>{
        res.render('dashboard/index', { title: 'POS - Dashboard', current: 'dashboard', user: req.session.user })
    })
    return router
}