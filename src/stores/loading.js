import { defineStore } from "pinia";

export const useLoading = defineStore("loadingStore", {
  state: () => ({
    isLoading: false,
  }),

  actions: {
    startLoadingFn() {
      this.isLoading = true;
    },
    stopLoadingFn() {
      this.isLoading = false;
    },
  },
});
