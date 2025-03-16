import { createApp } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import './styles/main.css';
import axios from 'axios';

const app = createApp(App);
app.use(vuetify);

// Configure Axios to handle cookies
axios.defaults.withCredentials = true;

app.mount('#app');
