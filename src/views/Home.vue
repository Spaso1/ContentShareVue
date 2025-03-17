<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Content Share Hub</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-row>
          <v-col cols="3">
            <FileList @edit-file="editFile" @create-file="showCreateFile" ref="fileList" />
          </v-col>
          <v-col cols="9">
            <FileEditor
                v-if="currentFileId && isAuthenticated"
                :file-id="currentFileId"
                @file-saved="onFileSaved"
                @cancel-edit="cancelEdit"
                @file-deleted="onFileDeleted"
            ref="fileEditor"
            />
            <FileCreator
                v-if="showCreator && isAuthenticated"
                @file-created="onFileCreated"
                @cancel-create="cancelCreate"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Login Dialog -->
    <v-dialog v-model="showLoginDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Login Required</v-card-title>
        <v-card-text>
          You need to log in to access this feature.
          <v-form ref="loginForm" @submit.prevent="loginUser">
            <v-text-field
                v-model="loginRequest.username"
                label="Username"
                outlined
                dense
                class="rounded-input"
                required
            ></v-text-field>
            <v-text-field
                v-model="loginRequest.password"
                label="Password"
                type="password"
                outlined
                dense
                class="rounded-input"
                required
            ></v-text-field>
            <v-btn color="primary" type="submit">Login</v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showLoginDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import FileList from '@/components/FileList.vue';
import FileEditor from '@/components/FileEditor.vue';
import FileCreator from '@/components/FileCreator.vue';
import axios from 'axios';

// 创建一个 axios 实例
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8071/api',
});

// 添加请求拦截器
apiClient.interceptors.request.use(config => {
  const cookie = localStorage.getItem('userCookie');
  if (cookie) {
    config.headers.Cookie = cookie;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default {
  components: {
    FileList,
    FileEditor,
    FileCreator
  },
  data() {
    return {
      currentFileId: null,
      showCreator: false,
      showLoginDialog: false,
      isAuthenticated: true,
      loginRequest: {
        username: '',
        password: ''
      }
    };
  },
  created() {
    // this.checkUserInfo();
  },
  methods: {
    async fetchFiles() {
      if (this.isAuthenticated) {
        try {
          const response = await apiClient.get('/files/get');
          this.files = response.data;
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      }
    },
    editFile(id) {
      if (this.currentFileId !== id) {
        if (this.$refs.fileEditor) {
          this.$refs.fileEditor.resetEditor();
        }
        this.currentFileId = id;
        this.showCreator = false;
      }
    },
    showCreateFile() {
      this.currentFileId = null;
      this.showCreator = true;
    },
    onFileSaved() {
      this.$refs.fileList.fetchFiles(); // Refresh the file list
    },
    cancelEdit() {
      this.currentFileId = null;
    },
    onFileCreated() {
      this.showCreator = false;
      this.$refs.fileList.fetchFiles(); // Refresh the file list
    },
    cancelCreate() {
      this.showCreator = false;
    },
    async checkUserInfo() {
      try {
        const config = {
          headers: {
            'Cookie': localStorage.getItem('userCookie')
          }
        };
        await apiClient.post('/users/info', {}, config);
        this.isAuthenticated = true;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.showLoginDialog = true;
        } else {
          console.error('Error checking user info:', error);
        }
      }
    },
    async loginUser() {
      try {
        const response = await apiClient.post('/users/loginUser', this.loginRequest);
        console.log('Response headers:', response.headers); // 打印所有的响应头

        if (response.data.message === 'Login successful') {
          // 提取 Set-Cookie 值
          const cookies = response.headers['Set-Cookie'];
          console.log('Cookies:', cookies);
          if (cookies) {
            // 假设只有一个 cookie 值
            const cookie = cookies[0].split(';')[0];
            localStorage.setItem('userCookie', cookie);
            console.log('User cookie:', cookie);
          }
          this.isAuthenticated = true;
          this.showLoginDialog = false;
          await this.fetchFiles(); // Refresh the file list
        } else {
          alert('Login failed. Please try again.');
        }
      } catch (error) {
        console.error('Error logging in:', error);
        alert('Login failed. Please try again.');
      }
    },
    logout() {
      // 清除存储的 Cookie
      localStorage.removeItem('userCookie');
      this.isAuthenticated = false;
      this.currentFileId = null;
      this.showCreator = false;
      // 可以重定向到登录页面或其他操作
      this.showLoginDialog = true;
    },
    onFileDeleted() {
      this.$refs.fileList.fetchFiles(); // 刷新文件列表
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
