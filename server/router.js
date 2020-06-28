const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const uploadForm = router.post('/uploadForm', async (ctx, next) => {
  const { request, respose } = ctx;
  // const file = req.files.myfile;
  // console.log()
  let files = request.files;
  console.log({ file: request.files });
  let filesObj = {};
  Object.entries(files).forEach(([inputName, inputFiles]) => {
    if (Array.isArray(inputFiles)) {
      inputFiles.forEach(({ name, path }) => {
        filesObj[name] = path;
      });
    } else {
      let { name, path } = inputFiles;
      filesObj[name] = path;
    }
  });
  console.log(filesObj);
  const staticPath = path.resolve(__dirname, 'static');
  Object.entries(filesObj).forEach(([name, temPath]) => {
    fs.rename(temPath, `${staticPath}/${name}`, (err) => {
      if (err) throw err;
      // 删除临时文件夹文件,
      fs.unlink(temPath, function () {
        if (err) throw err;
        respose.body = 'File uploaded to: ' + staticPath;
        respose.status = 200;
        // respose.send('File uploaded to: ' + staticPath);
      });
    });
  });
  // fs.rename()
});

router.use(uploadForm.routes(), uploadForm.allowedMethods());

module.exports = router;
