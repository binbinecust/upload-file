const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const {
  CODE
} = require('../../config/constant');

const getExtent = (fileName) => fileName.slice(fileName.lastIndexOf('.'));

// --------------------------切片上传-------------------------
const largeUploadHash = router.post('/largeUploadHash', async (ctx, next) => {
  const {
    request,
    response
  } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request,
  });
  let file = request.files.fileBinary;
  let {
    fileName,
    fileHash,
    index
  } = request.body;
  let ext = getExtent(fileName);
  try {
    let uploadPath = `${staticPath}/${fileHash}${ext}`;
    if (fs.existsSync(uploadPath)) {
      fs.renameSync(file.path, `${uploadPath}/${index}`);
    } else {
      fs.mkdirSync(uploadPath);
      fs.renameSync(file.path, `${uploadPath}/${index}`);
    }
    response.status = 200;
    response.body = {
      code: 0,
      data: index,
      msg: 'upload success',
    };
  } catch (e) {
    console.error(e);
  }
});


// --------------------------check file-------------------------
const checkFileHash = router.post('/checkFileHash', async (ctx, next) => {
  const {
    request,
    response
  } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  let {
    fileHash,
    fileName
  } = request.body;
  let uploadPath = `${staticPath}/${fileHash}${getExtent(fileName)}`;
  if (fs.existsSync(uploadPath) && !(fs.statSync(uploadPath).isDirectory())) {
    response.status = 200;
    response.body = {
      code: CODE.FILE_EXIT,
      data: fileHash,
      msg: '秒传成功',
    };
  } else {

    response.status = 200;
    response.body = {
      code: CODE.FILE_NOT_EXIT,
      data: fileHash,
      msg: '文件不存在！',
    };
  }
});


// --------------------------分片合并-------------------------
const mergeChunksHash = router.post('/mergeChunksHash', async (ctx, next) => {
  const {
    request,
    response
  } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request,
  });
  let {
    fileHash,
    size,
    fileName
  } = request.body;
  try {
    let uploadPath = `${staticPath}/${fileHash}${getExtent(fileName)}`;
    let chunkPaths = fs.readdirSync(uploadPath);
    let newFilePath = `${staticPath}/${+new Date()}-${fileHash}`
    let mergeList = chunkPaths.map((chunkpath, index) => {
      let filePath = path.resolve(uploadPath, chunkpath)
      return new Promise((res) => {
        let readableStream = fs.createReadStream(filePath);
        let writeableStream = fs.createWriteStream(newFilePath, {
          start: index * size,
          end: (index + 1) * size
        })
        readableStream.on("end", () => {
          fs.unlinkSync(filePath);
          res();
        });
        readableStream.pipe(writeableStream);
      })
    })
    try {
      await Promise.all(mergeList);
      fs.rmdirSync(uploadPath);
      fs.renameSync(newFilePath, uploadPath);
      response.status = 200;
      response.body = {
        code: 0,
        data: '/' + fileHash + getExtent(fileName),
        msg: 'upload success',
      };
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    console.error(e);
  }
});



module.exports = router;