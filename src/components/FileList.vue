<template>
  <v-navigation-drawer permanent class="sidebar">
    <v-list v-for="(group, pathId) in categorizedFiles" :key="pathId">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ pathInfo[pathId]?.dirname || pathId }}</v-list-item-title>
          <v-list-item-subtitle>{{ pathInfo[pathId]?.name }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{ pathId }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="file in group" :key="file.id" @click="selectFile(file.id)" @contextmenu.prevent="showMoveDialog(file)" class="file-item">
        <v-list-item-content>
          <v-list-item-title>{{ file.name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list-item @click="createNewFile" class="file-item">
      <v-list-item-content>
        <v-list-item-title>Create New File</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-navigation-drawer>

  <!-- Move File Dialog -->
  <v-dialog v-model="showMoveFileDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Move File</v-card-title>
      <v-card-text>
        <v-select
            v-model="selectedPathId"
            :items="pathIds"
            item-text="name"
            item-value="id"
            label="Select Destination Directory"
            outlined
            dense
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="showMoveFileDialog = false">Cancel</v-btn>
        <v-btn color="success" @click="moveFile">Move</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      files: [],
      categorizedFiles: {},
      pathInfo: {},
      showMoveFileDialog: false,
      selectedFileId: null,
      selectedPathId: null
    };
  },
  created() {
    this.fetchFiles();
  },
  computed: {
    pathIds() {
      return Object.keys(this.pathInfo).map(id => ({
        id,
        name: this.pathInfo[id]?.name || id
      }));
    }
  },
  methods: {
    async fetchFiles() {
      try {
        const response = await axios.get('http://127.0.0.1:8071/api/files/get');
        this.files = response.data;
        this.categorizeFiles();
        this.fetchPathInfo();
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },
    categorizeFiles() {
      this.categorizedFiles = {};
      this.files.forEach(file => {
        if (!this.categorizedFiles[file.pathId]) {
          this.categorizedFiles[file.pathId] = [];
        }
        this.categorizedFiles[file.pathId].push(file);
      });
    },
    async fetchPathInfo() {
      try {
        const pathIds = Object.keys(this.categorizedFiles);
        for (const pathId of pathIds) {
          const response = await axios.get(`http://127.0.0.1:8071/api/files/path?id=${pathId}`);
          this.pathInfo[pathId] = response.data;
        }
      } catch (error) {
        console.error('Error fetching path info:', error);
      }
    },
    selectFile(id) {
      this.$emit('edit-file', id);
    },
    createNewFile() {
      this.$emit('create-file');
    },
    showMoveDialog(file) {
      this.selectedFileId = file.id;
      this.showMoveFileDialog = true;
    },
    async moveFile() {
      if (!this.selectedFileId || !this.selectedPathId) {
        console.error('File ID or Path ID is missing');
        return;
      }
      try {
        await axios.get(`http://127.0.0.1:8071/api/files/to?fileId=${this.selectedFileId}&toId=${this.selectedPathId}`);
        this.showMoveFileDialog = false;
        this.fetchFiles(); // Refresh the file list after moving the file
      } catch (error) {
        console.error('Error moving file:', error);
      }
    }
  }
};
</script>

<style scoped>
.file-item {
  margin-bottom: 4px; /* Adjust the margin between items */
}
</style>
