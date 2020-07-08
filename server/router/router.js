const upload = require('./upload')
const router = require('koa-router')()
router.use(upload.routes(), upload.allowedMethods())

module.exports = router