var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// const schedule = require('node-schedule');
var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var usersLoginRouter = require('./routes/login');
// var caterRouter = require('./routes/cater');
// var uploadRouter = require('./routes/upload');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
// app.use('/api/users', usersRouter);
// app.use('/api/login', usersLoginRouter);
// app.use('/api/cater', caterRouter);
// app.use('/api/upload', uploadRouter);



// 每天 00:00 清空购物车
// schedule.scheduleJob('0 0 0 * * *', function () {
//     console.log('开始清空购物车...');
//     const stmt = db.prepare('DELETE FROM cart');
//     stmt.run();
//     console.log('购物车已清空');
// });
module.exports = app;
