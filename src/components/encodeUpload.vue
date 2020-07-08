<template>
  <div>
    <p>base64</p>
    <input
      type="file"
      name="encode-file"
      id="encodeFile"
      @change="fileChange($event)"
    >
    <button
      type="submit"
      id="submit"
      @click="upload"
    >上传</button>
    <br>
    <br>
    <br>
    <p>binary</p>
    <input
      type="file"
      name="encode-file"
      id="encodeFile1"
      @change="fileChangeBinary($event)"
    >
    <button
      type="submit"
      id="submit1"
      @click="uploadBinary"
    >上传</button>
  </div>
</template>

<script>
import Vue from 'vue';
import API from '@/model/api';
import { getImageBase64 } from '@/utils';
export default Vue.extend({
  data() {
    return {
      file: null,
      fileData: {}
    };
  },
  methods: {
    fileChange(e) {
      let files = e.target.files;
      if (!files || !files.length) return;
      this.file = files[0];
    },
    fileChangeBinary(e) {
      let files = e.target.files;
      if (!files || !files.length) return;
      let file = files[0];
      let reader = new FileReader();
      reader.onload = () => {
        // this.fileData.binary = reader.result;
        this.fileData.binary = encodeURI(reader.result);
      };
      reader.readAsBinaryString(file);
      this.fileData.name = file.name;
    },
    upload() {
      getImageBase64(this.file).then(imgBase64 => {
        API.uploadEncode({ imgBase64, name: this.file.name }).then(res => {
          this.$message({
            message: res.data,
            type: 'success'
          });
        });
      });
    },
    uploadBinary() {
      let { name, binary } = this.fileData;
      API.uploadEncodeBinary({ name, binary }).then(res => {
        this.$message({
          message: res.data,
          type: 'success'
        });
      });
    }
  }
});
</script>

<style lang='scss' scoped></style>
