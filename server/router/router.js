const upload = require('./upload')
const breakUpload = require('./breakUpload');
const router = require('koa-router')()
router.use(upload.routes(), upload.allowedMethods())
router.use(breakUpload.routes(), breakUpload.allowedMethods())

module.exports = router