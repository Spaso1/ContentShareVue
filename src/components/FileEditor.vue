<template>
  <v-container class="content">
    <v-card>
      <v-card-title>Edit File</v-card-title>
      <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
      <v-card-text>
        <v-text-field label="File Name" v-model="fileName" outlined dense class="rounded-input"></v-text-field>
        <v-textarea v-model="content" rows="20" label="Content" outlined dense class="rounded-input"></v-textarea>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="saveFile">Save</v-btn>
        <v-btn @click="cancelEdit">Cancel</v-btn>
        <v-btn color="error" @click="deleteFile">Delete</v-btn> <!-- 添加 Delete 按钮 -->
      </v-card-actions>
    </v-card>

    <!-- Save Success Snackbar -->
    <v-snackbar v-model="showSaveSnackbar" top right :timeout="3000">
      File saved successfully!
      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="showSaveSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this file?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    fileId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      content: '',
      fileName: '',
      loading: false,
      showSaveSnackbar: false,
      showDeleteDialog: false // 添加删除确认对话框的状态
    };
  },
  watch: {
    fileId: {
      immediate: true,
      handler(newId) {
        if (newId) {
          this.fetchFile();
        }
      }
    }
  },
  methods: {
    async fetchFile() {
      this.loading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:8071/api/files/${this.fileId}`);
        this.content = response.data.content;
        this.fileName = response.data.name; // Assuming the API returns a 'name' field
      } catch (error) {
        console.error('Error fetching file:', error);
      } finally {
        this.loading = false;
      }
    },
    async saveFile() {
      try {
        await axios.put(`http://127.0.0.1:8071/api/files/${this.fileId}`, { content: this.content, name: this.fileName });
        this.showSaveSnackbar = true; // Show the save success snackbar
        this.$emit('file-saved');
      } catch (error) {
        console.error('Error saving file:', error);
      }
    },
    cancelEdit() {
      this.$emit('cancel-edit');
    },
    resetEditor() {
      this.content = '';
      this.fileName = '';
    },
    deleteFile() {
      this.showDeleteDialog = true; // 显示删除确认对话框
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8071/api/files/${this.fileId}`);
        this.showDeleteDialog = false;
        this.$emit('file-deleted'); // 通知父组件文件已删除
        this.resetEditor();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
};
</script>

<style scoped>
.v-card {
  margin-top: 20px;
  font-family: 'Roboto', sans-serif; /* 应用自定义字体 */
}

.rounded-input .v-input__control .v-input__slot {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(220, 64, 186, 0.73);
}

/* 可以进一步自定义其他元素的字体 */
.v-card-title, .v-text-field__label, .v-textarea__label {
  font-family: 'Roboto', sans-serif; /* 应用自定义字体 */
}
</style>
