<template>
  <div>
    <input
      type="file"
      name="encode-file"
      id="formDataInput"
      @change="changeFile($event)"
    >
    <button
      type="submit"
      id="formDataSubmit"
      style="margin-right: 20px"
      @click="upload"
    >上传</button>
    <button
      type="submit"
      id="formDataSubmit"
      @click="continueOrPauseHandler"
    >{{isUpload ? '暂停':'继续'}}</button>
    <button
      @click="reset"
      style="margin-left: 20px"
    >重置</button>
    <br>
    <br>
    <p>总上传进度</p>
    <el-progress
      :text-inside="true"
      :stroke-width="18"
      :percentage="uploadPercentage"
      status="success"
    ></el-progress>
    <br>
    <br>
    <br>
    <p>切片上传进度</p>
    <div
      v-for="(item, index) in uploadData"
      :key="index"
    >
      <p>{{hashes[index]}}</p>

      <el-progress
        :text-inside="true"
        :stroke-width="18"
        :percentage="item.percentage"
        status="success"
      ></el-progress>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import API from '@/model/api';
const { CODE } = require('@/../config/constant');
const sliceSize = 10 * 1024 * 1024; // 1M
export default Vue.extend({
  data() {
    return {
      isUpload: true,
      fileHash: '', // 文件hash
      fileChunks: [],
      filename: '',
      totalSize: 0,
      percentageTotal: 0,
      percentageItems: [],
      uploadedItems: [], // 已上传的内容大小
      cancels: [], // 请求取消
      requestList: [],
      formData: [],
      canceledRequest: [],
      uploadData: [] // 上传进度数据
    };
  },
  computed: {
    hashes() {
      return this.fileChunks.map((item, index) => {
        return this.fileHash + '-' + index;
      });
    },
    uploadPercentage() {
      if (!this.fileHash || !this.uploadData.length) return 0;
      let loaded = this.uploadData.reduce((acc, cur) => acc + (cur.size * cur.percentage) / 100, 0);
      return Math.floor((loaded / this.totalSize) * 100);
    }
  },
  methods: {
    uploadProgress(item) {
      return e => {
        item.percentage = Math.floor((e.loaded / e.total) * 100);
        // console.log(e);
        // this.uploadedItems[index] = e.loaded;
        // let percentageTotal = 0;
        // if (this.uploadedItems.length) {
        //   percentageTotal = Math.floor((this.uploadedItems.reduce((acc, cur) => acc + cur, 0) / this.totalSize) * 100);
        //   if (percentageTotal > 100) {
        //     percentageTotal = 100;
        //   }
        // }
        // this.percentageTotal = percentageTotal;
        // this.percentageItems[index] = Math.floor((e.loaded / e.total) * 100);
        // console.log(this.percentageTotal, this.percentageItems);
      };
    },
    reset() {
      this.isUpload = true;
      this.percentageItems = [];
      this.percentageTotal = 0;
      this.uploadedItems = [];
    },
    resetData() {
      this.isUpload = true;
      this.percentageTotal = 0;
      this.uploadedItems = [];
      this.filename = '';
      this.fileChunks = [];
      this.totalSize = 0;
      this.fileHash = '';
      this.percentageItems = [];
    },
    calcFileHash() {
      const worker = new Worker('/worker.js');
      worker.postMessage(this.fileChunks);
      return new Promise(res => {
        worker.onmessage = e => {
          this.fileHash = e.data.fileHash;
          res(this.fileHash);
        };
      });
    },
    changeFile(e) {
      this.resetData();
      this.fileChunks = [];
      let files = e.target.files;
      if (!files || !files.length) return;
      let file = files[0];
      this.totalSize = file.size;
      this.filename = file.name;
      let cur = 0;
      while (cur < file.size) {
        this.fileChunks.push(file.slice(cur, cur + sliceSize));
        cur += sliceSize;
      }
      this.calcFileHash().then(fileHash => {
        this.formData = this.fileChunks.map((blob, index) => {
          let formData = new FormData();
          formData.append('fileBinary', blob);
          formData.append('fileName', this.filename);
          formData.append('fileHash', fileHash);
          formData.append('index', index);
          this.$set(this.uploadData, index, { percentage: 0, size: blob.size });
          return formData;
        });
      });
      console.log(this.fileChunks);
    },
    continueOrPauseHandler() {
      this.isUpload ? this.pause() : this.continue();
      this.isUpload = !this.isUpload;
    },
    async continue() {
      this.getRequestList();
      let that = this;
      Promise.all(that.requestList)
        .then(() => {
          that.mergeChunksHash();
        })
        .catch(error => {
          console.log(error);
          that.$message({
            message: `${error.msg}` || '继续请求错误',
            type: 'success'
          });
        });
    },
    pause() {
      this.cancels.forEach((cancel, index) => {
        if (cancel && typeof cancel === 'function') {
          cancel('取消请求');
          this.percentageItems[index] = 0;
          this.canceledRequest.push(index);
        }
      });
    },
    getRequestList() {
      this.requestList = this.formData.map((formData, index) =>
        this.requestList.length && !this.requestList[index]
          ? Promise.resolve()
          : new Promise((res, rej) => {
              API.largeUploadHash(formData, this.uploadProgress(this.uploadData[index]), this.cancels, index)
                .then(result => {
                  this.uploadData[index].percentage = 100;
                  this.requestList[index] = null;
                  this.cancels[index] = null;
                  // this.requestList.splice(index, 1);
                  // this.cancels.splice(index, 1);
                  res(result);
                })
                .catch(error => {
                  rej(error);
                });
            })
      );
    },
    async upload() {
      let { code, msg, data } = await this.checkFile();
      console.log({ code, msg, data });
      if (code === CODE.FILE_EXIT) {
        this.uploadData.forEach(item => (item.percentage = 100));
        return this.$message({
          message: `${msg} 地址为：${data}`,
          type: 'success'
        });
      }
      this.getRequestList();
      let that = this;
      Promise.all(this.requestList)
        .then(() => {
          that.mergeChunksHash();
        })
        .catch(() => {
          that.$message({
            message: `上传失败`,
            type: 'error'
          });
        });
    },
    mergeChunksHash() {
      API.mergeChunksHash({ fileName: this.filename, size: sliceSize, fileHash: this.fileHash }).then(data => {
        this.$message({
          message: `上传成功，目录为：${data.data}`,
          type: 'success'
        });
      });
    },
    async checkFile() {
      let data = await API.checkFileHash({ fileName: this.filename, fileHash: this.fileHash });
      return data;
    }
  }
});
</script>

<style lang='scss' scoped></style>
