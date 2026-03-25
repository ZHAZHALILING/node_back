var express = require('express');
var router = express.Router();
// 引入 better-sqlite3
const sqlite3 = require('sqlite3').verbose();
// const Database = require('better-sqlite3');
// 连接你的数据库文件（路径：项目根目录的 my_first_db.db）
const db = new sqlite3.Database('/tmp/my_first_db.db');
/* GET home page. */
router.get('/', function(req, res,) {
  res.json({ message: 'hello world112!' });
});

/* 新增：查询 users 表所有数据的接口 */
router.get('/dev_users', function(req, res) {
  try {
    // 预编译 SQL，查询 users 表所有数据
    const query = db.prepare('SELECT * FROM dev_user');
    const data = query.all(); // all() 拿到所有行
    
    // 返回 JSON 格式数据
    res.json({
      code: 200,
      message: '查询成功',
      data: data
    });
  } catch (err) {
    // 错误处理
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: err.message
    });
  }
});

/* 新增：按 ID 查询单条数据的接口 */
router.get('/dev_users/:id', function(req, res, next) {
  try {
    const userId = req.params.id;
    // 参数化查询，防止 SQL 注入
    const query = db.prepare('SELECT * FROM dev_user WHERE id = ?');
    const data = query.get(userId); // get() 只拿第一条
    
    if (!data) {
      return res.status(404).json({
        code: 404,
        message: '未找到该数据'
      });
    }
    res.json({
      code: 200,
      message: '查询成功',
      data: data
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '查询失败',
      error: err.message
    });
  }
});


module.exports = router;
