<template>
  <div id="app">
    <el-tabs type="border-card">
      <el-tab-pane label="表单上传">
        <form-upload></form-upload>
      </el-tab-pane>
      <el-tab-pane label="无跳转上传">
        <iframe-upload></iframe-upload>
      </el-tab-pane>
      <el-tab-pane label="编码上传">
        <encode-upload></encode-upload>
      </el-tab-pane>
      <el-tab-pane label="form-data">
        <form-data></form-data>
      </el-tab-pane>
      <el-tab-pane label="大文件上传">
        <big-upload></big-upload>
      </el-tab-pane>
      <el-tab-pane label="断点续传">
        <break-upload></break-upload>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import formUpload from './components/formUpload.vue';
import iframeUpload from './components/iframeUpload.vue';
import encodeUpload from './components/encodeUpload.vue';
import formData from './components/formData.vue';
import breakUpload from './components/breakUpload.vue';
import bigUpload from './components/bigUpload.vue';

export default {
  name: 'App',
  components: {
    formUpload,
    encodeUpload,
    formData,
    breakUpload,
    iframeUpload,
    bigUpload
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
