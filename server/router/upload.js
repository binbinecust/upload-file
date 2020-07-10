const router = require('koa-router')();
const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const rename = promisify(fs.rename);
const writeFile = promisify(fs.writeFile);
const { CODE } = require('../../config/constant');

// -----------------------表单上传--------------------------
const uploadForm = router.post('/uploadForm', async (ctx, next) => {
  const { request, response } = ctx;
  // console.log({ request });
  // const file = req.files.myfile;
  // console.log()
  let files = request.files;
  console.log({
    file: request.files
  });
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
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log(staticPath);
  let newFileName = [];
  await Promise.all(
    Object.keys(filesObj).map(async (name, index) => {
      try {
        newFileName[index] = `/${+new Date()}-${name}`;
        // newFileName.push(`/${+new Date()}-${name}`)
        await rename(filesObj[name], `${staticPath}${newFileName[index]}`);
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
    })
  );
  // fs.rename()
  response.status = 200;
  // response.body = '上传成功'
  response.body = {
    code: 0,
    url: newFileName
  };
});

// -----------------------编码上传base64--------------------------

const uploadEncode = router.post('/uploadEncode', async (ctx, next) => {
  const { request, response } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request
  });
  let { data, name } = request.body;
  if (data.includes('base64')) {
    data = data.replace(/.*;base64,/, '');
    data = Buffer.from(data, 'base64');
  } else {
    data = Buffer.from(data, 'binary');
  }
  // imgBase64 = data.replace(/^data:image\/\w+;base64,/, '');
  // let dataBuffer = new Buffer(imgBase64, 'base64');
  try {
    name = +new Date() + '-' + name;
    await writeFile(`${staticPath}/${name}`, data);
    response.status = 200;
    response.body = {
      code: 0,
      data: `/${name}`,
      msg: 'upload success'
    };
  } catch (e) {
    console.error(e);
  }
});

// -----------------------编码上传binary--------------------------

// const uploadEncodeBinary = router.post(
//   '/uploadEncodeBinary',
//   async (ctx, next) => {
//     const { request, response } = ctx;
//     const staticPath = path.resolve(__dirname, '../', 'static');
//     console.log({
//       request
//     });

//     let fileObj = request.body;
//     Object.keys(fileObj).forEach(
//       (key) => (fileObj[key] = decodeURI(fileObj[key]))
//     );
//     // fs.writeFileSync(`${staticPath}/${+new Date()}-${fileObj.name}`, fileObj.text, (e) => {
//     //   if (e) console.error(e);
//     //   response.status = 200;
//     //   response.body = {
//     //     code: 0,
//     //     msg: 'upload success'
//     //   }
//     // })
//     try {
//       let name = `${+new Date()}-${fileObj.name}`;
//       await writeFile(`${staticPath}/${name}`, fileObj.binary);
//       response.status = 200;
//       response.body = {
//         code: 0,
//         data: name,
//         msg: 'upload success'
//       };
//     } catch (e) {
//       console.error(e);
//     }
//   }
// );

// -----------------------formdata 上传--------------------------

const uploadFormData = router.post('/uploadFormData', async (ctx, next) => {
  const { request, response } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request
  });

  let file = request.files.file;
  try {
    let name = `/${+new Date()}-${file.name}`;
    await rename(file.path, `${staticPath}/${name}`);
    response.status = 200;
    response.body = {
      code: 0,
      data: name,
      msg: 'upload success'
    };
  } catch (e) {
    console.error(e);
  }
});

// --------------------------大文件上传-------------------------
const largeUpload = router.post('/largeUpload', async (ctx, next) => {
  const { request, response } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request
  });
  let file = request.files.fileBinary;
  let { fileName: originFileName } = request.body;
  try {
    let fileName = originFileName.replace(/(.*)-(\d+)/, '$1');
    let index = originFileName.replace(/(.*)-(\d+)/, '$2');
    let uploadPath = `${staticPath}/${fileName}`;
    if (fs.existsSync(uploadPath)) {
      await rename(file.path, `${uploadPath}/${index}`);
    } else {
      fs.mkdirSync(uploadPath);
      await rename(file.path, `${uploadPath}/${index}`);
    }
    response.status = 200;
    response.body = {
      code: 0,
      data: index,
      msg: 'upload success'
    };
  } catch (e) {
    console.error(e);
  }
});

// --------------------------check file-------------------------
const checkFile = router.post('/checkFile', async (ctx, next) => {
  const { request, response } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  let fileName = request.body.fileName;
  let uploadPath = `${staticPath}/${fileName}`;
  if (fs.existsSync(uploadPath) && !fs.statSync(uploadPath).isDirectory()) {
    response.status = 200;
    response.body = {
      code: CODE.FILE_EXIT,
      data: fileName,
      msg: '秒传成功'
    };
  } else {
    response.status = 200;
    response.body = {
      code: CODE.FILE_NOT_EXIT,
      data: fileName,
      msg: '文件不存在！'
    };
  }
});

// --------------------------分片合并-------------------------
const mergeChunks = router.post('/mergeChunks', async (ctx, next) => {
  const { request, response } = ctx;
  const staticPath = path.resolve(__dirname, '../', 'static');
  console.log({
    request
  });
  let { fileName, size } = request.body;
  try {
    let uploadPath = `${staticPath}/${fileName}`;
    let chunkPaths = fs.readdirSync(uploadPath);
    let newFilePath = `${staticPath}/${+new Date()}-${fileName}`;
    let mergeList = chunkPaths.map((chunkpath, index) => {
      let filePath = path.resolve(uploadPath, chunkpath);
      return new Promise((res) => {
        let readableStream = fs.createReadStream(filePath);
        let writeableStream = fs.createWriteStream(newFilePath, {
          start: index * size,
          end: (index + 1) * size
        });
        readableStream.on('end', () => {
          fs.unlinkSync(filePath);
          res();
        });
        readableStream.pipe(writeableStream);
      });
    });
    try {
      await Promise.all(mergeList);
      fs.rmdirSync(uploadPath);
      fs.renameSync(newFilePath, uploadPath);
      response.status = 200;
      response.body = {
        code: 0,
        data: '/' + fileName,
        msg: 'upload success'
      };
    } catch (e) {
      console.error(e);
    }
  } catch (e) {
    console.error(e);
  }
});

module.exports = router;
