<script setup>
import { ref, watch } from "vue";
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

const dashboardRoutes =
  router.getRoutes().find((r) => r.name === "dashboard-layout")?.children || [];

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

const handleMenuClick = (e) => {
  router.push(e.key);
};
</script>

<template>
  <div class="h-screen flex flex-col bg-white">
    <div class="mt-0 md:mt-16">
      <Menu
        mode="inline"
        :inline-collapsed="collapsed"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="handleMenuClick"
      >
        <template v-for="item in dashboardRoutes" :key="item.path">
          <!-- Oddiy menu -->
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
