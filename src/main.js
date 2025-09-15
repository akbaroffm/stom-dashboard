import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";

import App from "./App.vue";
import router from "./router";
import "ant-design-vue/dist/reset.css";
import Icon from "./components/icon/icon.vue";
import i18next from "i18next";

const app = createApp(App);

app.use(createPinia());
app.component("Icon", Icon);
app.use(router);
app.use(Antd);
app.use(i18next);

app.mount("#app");
