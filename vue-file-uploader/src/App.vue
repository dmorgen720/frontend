<template>
  <div id="app">
    <h1>File Uploader</h1>
    <FileUploader />
  </div>
</template>

<script>
import FileUploader from './components/FileUploader.vue';

export default {
  components: {
    FileUploader
  }
};
</script>

<style scoped>
#app {
  text-align: center;
  font-family: Arial, sans-serif;
  margin-top: 50px;
}
</style>