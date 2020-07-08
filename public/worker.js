/*
 * @Author: binbin@sohu-inc.com
 * @Date: 2020-07-08 16:28:20
 * @Last Modified by: binbin@sohu-inc.com
 * @Last Modified time: 2020-07-08 18:22:57
 * 根据文件内容生成唯一hash
 */
/* eslint-disable */
importScripts('/spark-md5.min.js');
console.log(self);
const spark = new self.SparkMD5.ArrayBuffer();
onmessage = (e) => {
  const fileChunks = e.data;
  const length = fileChunks.length;
  let count = 0;
  const loadNext = (index) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileChunks[index]);
    fileReader.onload = (event) => {
      count++;
      spark.append(event.target.result);
      if (count === length) {
        postMessage({
          fileHash: spark.end(),
        });
      } else {
        loadNext(count);
      }
    };
  };
  loadNext(0);
};