<template>
  <v-container class="content">
    <v-card>
      <v-card-title>Create New File</v-card-title>
      <v-card-text>
        <v-text-field label="File Name" v-model="fileName" outlined dense class="rounded-input"></v-text-field>
        <v-textarea v-model="content" rows="20" label="Content" outlined dense class="rounded-input"></v-textarea>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="createFile">Create</v-btn>
        <v-btn @click="cancelCreate">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      content: '',
      fileName: ''
    };
  },
  methods: {
    async createFile() {
      try {
        await axios.post('http://127.0.0.1:8071/api/files/create', { content: this.content, name: this.fileName });
        this.$emit('file-created');
      } catch (error) {
        console.error('Error creating file:', error);
      }
    },
    cancelCreate() {
      this.$emit('cancel-create');
    }
  }
};
</script>

<style scoped>
.rounded-input .v-input__control .v-input__slot {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
