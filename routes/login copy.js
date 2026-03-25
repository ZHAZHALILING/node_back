var express = require('express');
var router = express.Router();
const Database = require('better-sqlite3');
const axios = require('axios'); // 用于调用微信接口
const crypto = require('crypto'); // 生成token
router.get('/', function(req, res,) {
  res.json({ message: 'hello world1!' });
});
// 连接数据库
const db = new Database('/tmp/my_first_db.db');

// 1. 生成随机token
const generateToken = (openid) => {
  return crypto
    .createHash('sha256')
    .update(openid + Date.now())
    .digest('hex');
};
// 1. 初始化用户表（如果还没建）
const initUserTable = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wechat_user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      identity_type TEXT NOT NULL,
      create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      update_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
initUserTable();
// 3. 微信登录接口
router.post('/wechat', async (req, res) => {
  try {
    const { code, identityType } = req.body;

    // 校验参数
    if (!code) {
      return res.status(400).json({
        code: 400,
        message: '缺少code'
      });
    }
    if (!identityType) {
      return res.status(400).json({
        code: 400,
        message: '缺少身份类型'
      });
    }
    if (!['butler', 'housekeeper'].includes(identityType)) {
      return res.status(400).json({
        code: 400,
        message: '身份类型不合法'
      });
    }

    // 调用微信接口获取openid（替换成你的小程序appid和secret）
    const appid = process.env.WX_APPID;
    const secret =process.env.WX_SECRET;
    const wxRes = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`
    );

    const { openid } = wxRes.data;
    if (!openid) {
      return res.status(500).json({
        code: 500,
        message: '微信授权失败'
      });
    }

    // 查询用户是否存在
    const findUser = db.prepare('SELECT * FROM wechat_user WHERE openid = ?').get(openid);
    let user;
    if (findUser) {
      // 更新身份类型
      db.prepare('UPDATE wechat_user SET identity_type = ?, update_time = CURRENT_TIMESTAMP WHERE openid = ?')
        .run(identityType, openid);
      user = { ...findUser, identity_type: identityType };
    } else {
      // 新用户注册（这里先存openid和身份，昵称/头像后续小程序再更新）
      const insert = db.prepare('INSERT INTO wechat_user (openid, identity_type) VALUES (?, ?)')
        .run(openid, identityType);
      user = {
        id: insert.lastInsertRowid,
        openid,
        identity_type: identityType,
        nickname: '',
        avatar: ''
      };
    }

    // 生成token
    const token = generateToken(openid);

    // 返回登录结果
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        openid,
        identityType,
        userInfo: {
          id: user.id,
          name: user.nickname,
          avatar: user.avatar
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '登录失败',
      error: err.message
    });
  }
});

module.exports = router;




















module.exports = router;
