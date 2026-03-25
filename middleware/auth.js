const crypto = require('crypto');
const Database = require('better-sqlite3');
const db = new Database('/tmp/my_first_db.db');

/**
 * 鉴权中间件：验证token是否有效
 * 小程序请求时需在header里带 token: xxx
 */
const authMiddleware = (req, res, next) => {
  try {
    // 从header获取token
    const token = req.headers.token || req.query.token;
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未登录，请先登录'
      });
    }

    // 从token解析openid（简化版：实际可存到redis，或加密存储）
    // 这里用openid+时间戳生成的token，反向验证（生产环境建议用jwt）
      const findUser = db.prepare(`
      SELECT * FROM wechat_user 
      WHERE token = ? AND expire_time > datetime('now')
    `).get(token);

    if (!findUser) {
      return res.status(401).json({
        code: 401,
          message: 'Token已过期/无效，请重新登录'
      });
    }

    // 将用户信息挂载到req，后续接口可直接用
    req.user = findUser;
    next();
  } catch (err) {
    res.status(500).json({
      code: 500,
      message: '鉴权失败',
      error: err.message
    });
  }
};

module.exports = authMiddleware;