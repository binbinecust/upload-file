<template>
  <div>
    <p>base64</p>
    <input type="file" name="encode-file" id="encodeFile" @change="fileChange($event, true)">
    <button type="submit" id="submit" @click="upload">上传</button>
    <br>
    <br>
    <br>
    <p>binary</p>
    <input type="file" name="encode-file" id="encodeFile1" @change="fileChange($event)">
    <button type="submit" id="submit1" @click="upload">上传</button>
  </div>
</template>

<script>
import Vue from 'vue';
import API from '@/model/api';
export default Vue.extend({
  data() {
    return {
      fileData: {}
    };
  },
  methods: {
    fileChange(e, isBase64Type) {
      let files = e.target.files;
      if (!files || !files.length) return;
      let file = files[0];

      let reader = new FileReader();
      reader.onload = () => {
        // this.fileData.binary = reader.result;
        this.fileData.data = reader.result;
      };
      this.fileData.name = file.name;
      if (isBase64Type) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsBinaryString(file);
      }
    },
    upload() {
      API.uploadEncode(this.fileData).then((res) => {
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
