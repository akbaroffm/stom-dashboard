import axios from "axios";
import { config } from "@/config";
import { notification } from "ant-design-vue";
import router from "@/router";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const $api = axios.create({
  baseURL: config.api.base_url,
  withCredentials: true,
});

// ✅ Request interceptor - har bir so'rov oldidan token qo'shish
$api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - token yangilash
$api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return $api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${config.api.base_url}auth/refreshToken`,
          {
            accessToken: localStorage.getItem("accessToken"),
            refreshToken: localStorage.getItem("refreshToken"),
          },
          { withCredentials: true }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data.content;

        if (!newAccessToken) {
          throw new Error("New access token not found in response");
        }

        // Ikkala tokenni ham yangilash
        localStorage.setItem("accessToken", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Default headerlarni yangilash
        $api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return $api(originalRequest);
      } catch (err) {
        console.error("Token refresh failed:", err);
        processQueue(err, null);

        // Tokenlarni tozalash
        localStorage.removeItem("isAuth");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Login sahifasiga yo'naltirish
        router.push("/auth");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Faqat 401 bo'lmagan xatoliklar uchun notification ko'rsatish
    if (error.response?.status !== 401) {
      notification.error({
        message: "Error",
        description: error?.response?.data?.error || "Something went wrong",
      });
    }

    return Promise.reject(error);
  }
);

export default $api;
