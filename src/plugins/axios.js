import axios from "axios";

import { config } from "@/config";
import { notification } from "ant-design-vue";
import router from "@/router";

const $api = axios.create({
  baseURL: config.api.base_url,
  withCredentials: true,
});

$api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const { response } = error;
    if (response.status === 401) {
      localStorage.removeItem("isAuth");
      router.push({
        path: "/auth",
      });
    } else {
      notification.error({
        message: "Error",
        description: t(error?.response?.data?.error),
      });
      return Promise.reject(error);
    }
  }
);

export default $api;
