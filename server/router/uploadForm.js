const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const uploadForm = router.post('/uploadForm', async (ctx, next) => {
  const {
    request,
    response
  } = ctx;
  // const file = req.files.myfile;
  // console.log()
  let files = request.files;
  console.log({
    file: request.files
  });
  let filesObj = {};
  Object.entries(files).forEach(([inputName, inputFiles]) => {
    if (Array.isArray(inputFiles)) {
      inputFiles.forEach(({
        name,
        path
      }) => {
        filesObj[name] = path;
      });
    } else {
      let {
        name,
        path
      } = inputFiles;
      filesObj[name] = path;
    }
  });
  console.log(filesObj);
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log(staticPath);
  await Promise.all(
    Object.entries(filesObj).map(async ([name, temPath]) => {
      try {
        await rename(temPath, `${staticPath}/${Math.round(Math.random()*10000)}-${name}`)
        await unlink(temPath)
      } catch (e) {
        console.error(e);
      }
      // fs.renameSync(temPath, `${staticPath}/${name}`, (err) => {
      //   debugger
      //   if (err) throw err;
      //   // 删除临时文件夹文件,
      //   fs.unlinkSync(temPath, function () {
      //     if (err) throw err;
      //   });
      // });
    }))
  // fs.rename()
  response.status = 200;
  response.body = `upload success, path: ${staticPath}`
});

module.exports = router;