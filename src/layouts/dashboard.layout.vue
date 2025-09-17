<script setup>
import { ref, computed, onMounted, onUnmounted, watch, h } from "vue";
import { Layout, Button, Breadcrumb, Drawer, message } from "ant-design-vue";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/dashboard/SideBar.vue";
import router from "@/router";
import { useLoading } from "@/stores/loading";
import { useFetch } from "@/composable/useFetch";

const loadingStore = useLoading();
const { $post } = useFetch();
const route = useRoute();
const collapsed = ref(false);
const mobileMenuOpen = ref(false);
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024
);

// Responsive breakpoints
const isMobile = computed(() => windowWidth.value < 769);
const isTablet = computed(
  () => windowWidth.value >= 769 && windowWidth.value < 1024
);
const isDesktop = computed(() => windowWidth.value >= 1024);

// Sidebar width based on screen size
const sidebarWidth = computed(() => {
  if (isDesktop.value) return 240;
  if (isTablet.value) return 220;
  return 200;
});

const collapsedWidth = computed(() => {
  if (isMobile.value) return 0;
  return 64;
});

// Breadcrumb computation
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

// Window resize handler
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", updateWindowWidth);
  // Auto-collapse on mobile/tablet
  if (isMobile.value) {
    collapsed.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWindowWidth);
});

// Watch for screen size changes
watch([isMobile, isTablet], ([newIsMobile, newIsTablet]) => {
  if (newIsMobile) {
    collapsed.value = true;
    mobileMenuOpen.value = false;
  } else if (newIsTablet) {
    mobileMenuOpen.value = false;
  }
});

// Toggle functions
const toggleCollapse = () => {
  if (isMobile.value) {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  } else {
    collapsed.value = !collapsed.value;
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const handleMenuItemClick = () => {
  if (isMobile.value) {
    mobileMenuOpen.value = false;
  }
  // Tabletda ham yopish kerak bo'lsa:
  // else if (isTablet.value) {
  //   collapsed.value = true;
  // }
};

async function handleLogout() {
  loadingStore.startLoadingFn();
  try {
    await $post("/Auth/Logout");
    message.success("Muvaffaqiyatli chiqdingiz");

    router.push({
      path: "/auth",
    });
    loadingStore.stopLoadingFn();
  } catch (error) {
    message.error("Xatolik yuz berdi");
  }
}
</script>

<template>
  <Layout class="h-screen overflow-hidden bg-gray-50">
    <!-- Desktop/Tablet Sidebar -->
    <Layout.Sider
      v-if="!isMobile"
      v-model:collapsed="collapsed"
      :trigger="null"
      :width="sidebarWidth"
      :collapsed-width="collapsedWidth"
      theme="light"
      class="fixed left-0 top-0 h-screen b shadow-sm z-30 transition-all duration-300"
    >
      <Sidebar :collapsed="collapsed" @menu-item-click="handleMenuItemClick" />
    </Layout.Sider>

    <!-- Mobile Drawer Menu -->
    <Drawer
      v-if="isMobile"
      v-model:open="mobileMenuOpen"
      placement="left"
      :closable="true"
      :width="280"
      title="Menu"
      class="mobile-drawer"
      @close="closeMobileMenu"
    >
      <div class="h-full bg-white -mt-4">
        <Sidebar :collapsed="false" @menu-item-click="handleMenuItemClick" />
      </div>
    </Drawer>

    <!-- Main Layout -->
    <Layout class="flex flex-col h-screen transition-all duration-300 w-full">
      <!-- Header -->
      <Layout.Header
        class="!bg-white !flex !justify-between !items-center !p-0 !h-14 md:!h-16 border-b border-gray-200 shadow-sm"
      >
        <div class="flex items-center justify-between px-3 md:px-6 w-full">
          <!-- Menu Toggle Button -->
          <div>
            <Button
              type="text"
              :size="isMobile ? 'middle' : 'large'"
              @click="toggleCollapse"
              class="!flex !items-center !justify-center"
            >
              <MenuOutlined v-if="isMobile" class="!text-lg" />
              <MenuUnfoldOutlined v-else-if="collapsed" class="!text-lg" />
              <MenuFoldOutlined v-else class="!text-lg" />
            </Button>

            <!-- Breadcrumb - hidden on very small screens -->
            <Breadcrumb class="!mt-0 hidden xs:block">
              <Breadcrumb.Item
                v-for="item in breadcrumbItems"
                :key="item.path"
                class="!text-xs sm:!text-sm"
              >
                <router-link
                  v-if="!item.isLast"
                  :to="item.path"
                  class="text-gray-500 hover:text-blue-500 transition-colors"
                >
                  {{ item.title }}
                </router-link>
                <span v-else class="font-medium text-gray-800">
                  {{ item.title }}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <a-popconfirm
            title="Rostdan tizimdan chiqmoqchimisiz?"
            @confirm="handleLogout"
          >
            <a-button class="!flex !items-center" type="primary" danger>
              <LogoutOutlined />
              Chiqish
            </a-button>
          </a-popconfirm>
        </div>

        <!-- Header Actions (Optional) -->
      </Layout.Header>

      <!-- Content -->
      <Layout.Content class="flex-1 !h-[calc(100vh-64px)] overflow-hidden">
        <div class="h-full bg-gray-50">
          <!-- Content wrapper -->
          <div class="h-full">
            <!-- bg-white endi to'liq balandlik oladi -->
            <div class="bg-white h-full flex flex-col">
              <!-- faqat shu joy scroll qiladi -->
              <div class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
                <RouterView />
              </div>
            </div>
          </div>
        </div>
      </Layout.Content>
    </Layout>
  </Layout>
</template>

<style>
.ant-drawer-body {
  padding: 24px 12px !important;
}
</style>
