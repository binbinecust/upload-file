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
      @click="upload"
    >上传</button>
    <br>
    <br>
    <p>总上传进度</p>
    <el-progress
      :text-inside="true"
      :stroke-width="18"
      :percentage="percentageTotal"
      status="success"
    ></el-progress>
    <br>
    <br>
    <br>
    <p>切片上传进度</p>
    <div
      v-for="(item, index) in fileChunks"
      :key="index"
    >
      <p>{{hashes[index]}}</p>

      <el-progress
        :text-inside="true"
        :stroke-width="18"
        :percentage="percentageItems[index]"
        status="success"
      ></el-progress>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import API from '@/model/api';
const { CODE } = require('@/../config/constant');
const sliceSize = 10 * 1024 * 1024; // 10M
export default Vue.extend({
  data() {
    return {
      fileHash: '', // 文件hash
      fileChunks: [],
      filename: '',
      totalSize: 0,
      percentageTotal: 0,
      percentageItems: [],
      uploadedItems: [] // 已上传的内容大小
    };
  },
  computed: {
    hashes() {
      return this.fileChunks.map((item, index) => {
        return this.fileHash + '-' + index;
      });
    }
  },
  methods: {
    uploadProgress(index) {
      return e => {
        console.log(e);
        this.uploadedItems[index] = e.loaded;
        let percentageTotal = 0;
        if (this.uploadedItems.length) {
          percentageTotal = Math.floor((this.uploadedItems.reduce((acc, cur) => acc + cur, 0) / this.totalSize) * 100);
          if (percentageTotal > 100) {
            percentageTotal = 100;
          }
        }
        this.percentageTotal = percentageTotal;
        this.percentageItems[index] = Math.floor((e.loaded / e.total) * 100);
      };
    },
    resetData() {
      this.percentageTotal = 0;
      this.uploadedItems = [];
      this.filename = '';
      this.fileChunks = [];
      this.totalSize = 0;
      this.fileHash = '';
      this.hashes = [];
      this.percentageItems = [];
    },
    calcFileHash() {
      const worker = new Worker('/worker.js');
      worker.postMessage(this.fileChunks);
      worker.onmessage = e => {
        this.fileHash = e.data.fileHash;
      };
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
      this.calcFileHash();
      // this.calcFileHash().then(res => {
      //   this.fileHash = res;
      //   this.fileChunks.forEach((item, index) => {
      //     this.hashes[index] = this.fileHash + '-' + index;
      //   });
      // });
      console.log(this.fileChunks);
    },
    async upload() {
      let { code, msg, data } = await this.checkFile();
      console.log({ code, msg, data });
      if (code === CODE.FILE_EXIT) {
        return this.$message({
          message: `${msg} 地址为：${data}`,
          type: 'success'
        });
      }
      let requestList = this.fileChunks
        .map((blob, index) => {
          let formData = new FormData();
          formData.append('fileBinary', blob);
          formData.append('fileName', `${this.filename}-${index}`);
          return formData;
        })
        .map((formData, index) => API.largeUpload(formData, this.uploadProgress(index)));
      let that = this;
      Promise.all(requestList)
        .then(() => {
          API.mergeChunks({ fileName: that.filename, size: sliceSize }).then(data => {
            that.$message({
              message: `上传成功，目录为：${data.data}`,
              type: 'success'
            });
          });
        })
        .catch(() => {
          that.$message({
            message: `上传失败`,
            type: 'error'
          });
        });
    },
    async checkFile() {
      let data = await API.checkFile({ fileName: this.filename });
      return data;
    }
  }
});
</script>

<style lang='scss' scoped></style>
