const Koa = require('koa');
const onerror = require('koa-onerror');
const koastatic = require('koa-static');
const path = require('path');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const cors = require('@koa/cors');
const routes = require('./router/router.js');
const config = require('../config');

const app = new Koa();
onerror(app);

app.use(cors());

app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 20 * 1024 * 1024 // 设置上传文件大小最大限制，默认20M
    }
  })
);
app.use(koastatic(path.resolve(__dirname, 'static')));
app.use(logger());

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(async (ctx, next) => {
  await next();
  ctx.response.set('Content-Type', 'application/json');
  // ctx.response.set('Content-Type', 'text/html; charset=UTF-8')
});

app.use(routes.routes(), routes.allowedMethods());

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection', error.message, 'binbin');
});

const server = app.listen(config.port, () => {
  console.log('\n');
  console.log("Calling app.listen's callback function.", '\n');
  // var host = server.address().address;
  var port = server.address().port;
  console.log(`Example app listening at http://localhost:${port}`, '\n\n\n');
});
