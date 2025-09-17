import $api from "@/plugins/axios";
import { useLoading } from "@/stores/loading";
import { ref } from "vue";

export function useFetch(config = {}) {
  const loadingStore = useLoading();
  const data = ref(null);
  const response = ref(null);
  const error = ref(null);
  const loading = ref(false);
  const total = ref(0);

  // GET request function
  const $get = async (url, params, withLoading = false) => {
    if (withLoading) {
      loadingStore.startLoadingFn();
    }
    loading.value = true;
    error.value = null;
    try {
      const result = await $api.get(url, { ...config, params });
      total.value = result?.data["total"];
      data.value = result?.data["content"];
      response.value = result;
      return data.value;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
      if (withLoading) {
        loadingStore.stopLoadingFn();
      }
    }
  };

  // POST so'rovi
  const $post = async (url, payload) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await $api.post(url, payload, config);
      data.value = result.data;
      response.value = result;
      return data.value;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // PUT so'rovi
  const $put = async (url, payload) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await $api.put(url, payload, config);

      data.value = result.data;
      response.value = result;
      return data.value;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  // DELETE so'rovi
  const $delete = async (url) => {
    loading.value = true;
    error.value = null;

    try {
      const result = await $api.delete(url, config);
      response.value = result;
      data.value = result.data;
      return data.value;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    response,
    error,
    loading,
    $get,
    $post,
    $put,
    $delete,
    total,
  };
}
