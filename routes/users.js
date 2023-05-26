var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10


module.exports = (pool) => {
  /* GET users listing. */
  router.get('/', async (req, res, next) => {
    try {
      let sql = 'SELECT * FROM users;'
      const data = await pool.query(sql)
      res.json({
        succes: true,
        data: data.rows
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Errors' })
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const { userid, email, name, password, role } = req.body
      console.log(req.body)
      console.log(userid,email,name)
      const hash = bcrypt.hashSync(password, saltRounds);
      let sql = `INSERT INTO users(userid,email,name,password,role) VALUES($1,$2,$3,$4,$5)`
      const data = await pool.query(sql, [userid, email, name, hash, role]);
      res.json({
        succes:true,
        data:data.rows
      })
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error Creating Data User" })
    }
  })

  router.delete('/:userid', async(req,res,next)=>{
    try {
      const {userid} = req.params
      const sql = `DELETE FROM users WHERE userid = $1`
      const data = await pool.query(sql,[userid])
      res.json({
        succes:true,
        data:data.rows
      })
    } catch (error) {
      console.error(error);
      res.status(500).json({error:"Error Deleting Data User"})
    }
  })

  return router
}
