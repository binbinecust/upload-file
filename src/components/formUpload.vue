<template>
  <div>

    <form
      action="http://localhost:8000/uploadForm"
      method="POST"
      enctype="multipart/form-data"
    >
      单选
      <input
        type="file"
        name="myfile"
      />

      <input type="submit" />
    </form>
    <br>
    <br>
    <br>
    <form
      action="http://localhost:8000/uploadForm"
      method="POST"
      enctype="multipart/form-data"
    >

      多选
      <input
        type="file"
        name="myfile1"
        multiple
      />
      <input type="submit" />
    </form>
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {};
  },
  methods: {}
});
</script>

<style lang='scss' scoped></style>
