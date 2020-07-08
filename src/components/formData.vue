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
  </div>
</template>

<script>
import Vue from 'vue';
import API from '@/model/api';

export default Vue.extend({
  data() {
    return {
      formData: new FormData()
    };
  },
  methods: {
    changeFile(e) {
      let files = e.target.files;
      if (!files || !files.length) return;
      let file = files[0];

      this.formData.append('file', file);
      this.formData.append('name', file.name);
    },
    upload() {
      API.uploadFormData(this.formData).then(res => {
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
