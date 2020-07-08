// const path = require('path');
const extractExt = filename =>
  filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名

module.exports = {
  extractExt,
}