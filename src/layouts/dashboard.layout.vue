<script setup>
import { ref, computed } from "vue";
import { Layout, Button, Breadcrumb } from "ant-design-vue";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/dashboard/SideBar.vue";

const route = useRoute();
const collapsed = ref(false);

const breadcrumbItems = computed(() => {
  const parts = route.path.split("/").filter(Boolean);
  let current = "";
  return parts.map((segment, i) => {
    current += `/${segment}`;
    return {
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: current,
      isLast: i === parts.length - 1,
    };
  });
});

const toggleCollapse = () => (collapsed.value = !collapsed.value);
</script>

<template>
  <Layout class="h-screen overflow-hidden">
    <Layout.Sider
      v-model:collapsed="collapsed"
      :trigger="null"
      :width="220"
      :collapsed-width="64"
      theme="dark"
      class="fixed h-screen border-r border-gray-200"
    >
      <Sidebar :collapsed="collapsed" />
    </Layout.Sider>

    <Layout class="flex flex-col h-screen transition-all">
      <Layout.Header
        class="!bg-white !flex !justify-between !items-center !h-14 !p-4"
      >
        <div class="flex items-center gap-4">
          <Button type="text" size="large" @click="toggleCollapse">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </Button>

          <Breadcrumb class="!mt-2">
            <Breadcrumb.Item v-for="item in breadcrumbItems" :key="item.path">
              <router-link
                v-if="!item.isLast"
                :to="item.path"
                class="text-gray-500 hover:text-blue-500"
              >
                {{ item.title }}
              </router-link>
              <span v-else class="font-medium text-gray-800">
                {{ item.title }}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </Layout.Header>

      <Layout.Content class="flex-1 overflow-y-auto bg-gray-100">
        <div class="m-4 p-4 bg-white rounded min-h-full">
          <RouterView />
        </div>
      </Layout.Content>
    </Layout>
  </Layout>
</template>
