<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Menu } from "ant-design-vue";
import * as Icons from "@ant-design/icons-vue";

const props = defineProps({
  collapsed: Boolean,
});

const route = useRoute();
const router = useRouter();

const selectedKeys = ref([route.path]);
const openKeys = ref([]);
const emit = defineEmits(["menu-item-click"]);

const dashboardRoutes =
  router.getRoutes().find((r) => r.name === "dashboard-layout")?.children || [];

const isMobile = ref(false);

const handleResize = () => {
  isMobile.value = window.innerWidth < 769;
};

onMounted(() => {
  handleResize(); // sahifa yuklanganda ham tekshir
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath];
    const parent = dashboardRoutes.find((r) =>
      r.children?.some((child) => newPath.includes(child.path))
    );
    if (parent) {
      openKeys.value = [parent.path];
    }
  },
  { immediate: true }
);

const handleMenuClick = ({ key }) => {
  router.push(key);
  emit("menu-item-click");
};
</script>

<template>
  <div class="flex flex-col bg-white">
    <!-- logolar faqat desktopda -->
    <div v-if="!isMobile" class="flex items-center justify-center pt-3 pb-2">
      <img
        v-if="!collapsed"
        src="@/assets/images/png/logo.png"
        alt="Logo"
        class="!w-[150px] !h-[50px] !object-contain"
      />
      <img
        v-else
        src="@/assets/images/png/half-logo.png"
        alt="Mini Logo"
        class="!w-[100px] !h-[50px] !object-contain"
      />
    </div>

    <Menu
      mode="inline"
      :inline-collapsed="collapsed"
      :selected-keys="selectedKeys"
      :open-keys="openKeys"
      @click="handleMenuClick"
      :class="isMobile ? '!pt-4' : '!pt-0'"
    >
      <template v-for="item in dashboardRoutes" :key="item.path">
        <Menu.Item v-if="!item.children" :key="`/dashboard/${item.path}`">
          <template #icon>
            <component :is="Icons[item.meta?.icon]" />
          </template>
          {{ item.meta?.title }}
        </Menu.Item>

        <Menu.SubMenu v-else :key="item.path">
          <template #icon>
            <component :is="Icons[item.meta?.icon]" />
          </template>
          <template #title>{{ item.meta?.title }}</template>

          <Menu.Item
            v-for="child in item.children"
            :key="`/dashboard/${item.path}/${child.path}`"
          >
            {{ child.meta?.title }}
          </Menu.Item>
        </Menu.SubMenu>
      </template>
    </Menu>
  </div>
</template>

<style scoped>
:deep(.anticon) {
  font-size: 18px !important;
}
:deep(.ant-menu-light.ant-menu-root.ant-menu-inline) {
  border-right: none;
}
</style>
