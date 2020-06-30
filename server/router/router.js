const uploadFormRouter = require('./uploadForm')
const router = require('koa-router')()

router.use(uploadFormRouter.routes(), uploadFormRouter.allowedMethods())

module.exports = router