<template>
  <div>
    <iframe id="temp-iframe" name="temp-iframe" src="" style="display:none;"></iframe>
    <form
      method="post"
      target="temp-iframe"
      action="http://localhost:8082/api/uploadForm"
      enctype="multipart/form-data"
    >
      选择文件(可多选):
      <input type="file" name="f1" id="f1" multiple>
      <br>
      <br>
      <br>
      <button type="submit" id="btn-0">上 传</button>
    </form>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  data() {
    return {};
  },
  methods: {},
  mounted() {
    var iframe = document.getElementById('temp-iframe');
    iframe.addEventListener('load', () => {
      var result = iframe.contentWindow.document.body.innerText;
      if (!result) return;
      console.log({ result });
      //接口数据转换为 JSON 对象
      var obj = JSON.parse(result);
      if (obj && obj.url.length) {
        this.$message({
          message: `上传成功, url: ${obj.url.join(',')}`,
          type: 'success'
        });
      }
      console.log(obj);
    });
  }
});
</script>

<style lang='scss' scoped></style>
