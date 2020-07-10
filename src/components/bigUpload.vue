<template>
  <div>
    <input type="file" name="encode-file" id="formDataInput" @change="changeFile($event)">
    <button type="submit" id="formDataSubmit" @click="upload">上传</button>
    <br>
    <br>
    <p>上传进度</p>
    <el-progress
      :text-inside="true"
      :stroke-width="18"
      :percentage="uploadPercentage"
      status="success"
    ></el-progress>
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
      fileChunks: [],
      filename: '',
      totalSize: 0,
      uploaded: false,
      uploadData: [] // 已上传的内容大小 [{percentage, size}]
    };
  },
  computed: {
    uploadPercentage() {
      if (this.uploaded) return 100;
      if (!this.uploadData.length) return 0;
      let loaded = this.uploadData.reduce(
        (acc, cur) => acc + (cur.size * cur.percentage) / 100,
        0
      );
      return Math.floor((loaded / this.totalSize) * 100);
    }
  },
  methods: {
    uploadProgress(item) {
      return (e) => {
        item.percentage = Math.floor((e.loaded / e.total) * 100);
        // console.log(e);
        // this.uploadedItems[index] = e.loaded;
        // let percentage = 0;
        // if (this.uploadedItems.length) {
        //   percentage = Math.floor(
        //     (this.uploadedItems.reduce((acc, cur) => acc + cur, 0) /
        //       this.totalSize) *
        //       100
        //   );
        //   if (percentage > 100) {
        //     percentage = 100;
        //   }
        // }
        // this.percentage = percentage;
      };
    },
    resetData() {
      this.uploadData.length = 0;
      // this.percentage = 0;
      this.uploadedItems = [];
      this.filename = '';
      this.fileChunks = [];
      this.totalSize = 0;
      this.uploaded = false;
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
      console.log(this.fileChunks);
    },
    async upload() {
      let { code, msg, data } = await this.checkFile();
      console.log({ code, msg, data });
      if (code === CODE.FILE_EXIT) {
        this.uploaded = true;
        return this.$message({
          message: `${msg} 地址为：${data}`,
          type: 'success'
        });
      }

      this.uploaded = false;
      let requestList = this.fileChunks
        .map((blob, index) => {
          let formData = new FormData();
          formData.append('fileBinary', blob);
          formData.append('fileName', `${this.filename}-${index}`);
          this.$set(this.uploadData, index, { percentage: 0, size: blob.size });
          return formData;
        })
        .map((formData, index) =>
          API.largeUpload(formData, this.uploadProgress(this.uploadData[index]))
        );
      let that = this;
      Promise.all(requestList)
        .then(() => {
          API.mergeChunks({ fileName: that.filename, size: sliceSize }).then(
            (data) => {
              that.$message({
                message: `上传成功，目录为：${data.data}`,
                type: 'success'
              });
            }
          );
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
