<template>
  <v-navigation-drawer permanent class="sidebar">
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Files</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="file in files" :key="file.id" @click="selectFile(file.id)" class="file-item">
        <v-list-item-content>
          <v-list-item-title>{{ file.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="createNewFile" class="file-item">
        <v-list-item-content>
          <v-list-item-title>Create New File</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      files: []
    };
  },
  created() {
    this.fetchFiles();
  },
  methods: {
    async fetchFiles() {
      try {
        const response = await axios.get('http://127.0.0.1:8071/api/files/get');
        this.files = response.data;
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },
    selectFile(id) {
      this.$emit('edit-file', id);
    },
    createNewFile() {
      this.$emit('create-file');
    }
  }
};
</script>

<style scoped>
.file-item {
  margin-bottom: 4px; /* Adjust the margin between items */
}
</style>
