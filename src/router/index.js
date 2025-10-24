import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: "/",
    //   name: "home",
    //   component: HomeView,
    // },
    {
      path: "/dashboard",
      redirect: "/dashboard/main",
    },
    {
      path: "/",
      name: "landing-layout",
      component: () => import("@/layouts/landing.layout.vue"),
      children: [
        {
          path: "",
          name: "landing-home",
          component: () => import("@/views/landing/home.view.vue"),
        },
        {
          path: "about",
          name: "landing-about",
          component: () => import("@/views/landing/about.view.vue"),
        },
      ],
    },
    // dashboard
    {
      path: "/dashboard",
      name: "dashboard-layout",
      component: () => import("@/layouts/dashboard.layout.vue"),
      redirect: "/dashboard",
      children: [
        {
          path: "main",
          name: "dashboard-main",
          meta: { title: "Asosiy", icon: "DashboardOutlined" },
          component: () => import("@/views/dashboard/main.view.vue"),
        },
        {
          path: "queues",
          name: "dashboard-queues",
          meta: { title: "Navbatlar", icon: "TeamOutlined" },
          component: () => import("@/views/dashboard/queues.view.vue"),
        },
        {
          path: "clients",
          name: "dashboard-clients",
          meta: { title: "Bemorlar", icon: "UserOutlined" },
          component: () => import("@/views/dashboard/clients.view.vue"),
        },
        {
          path: "notes",
          name: "dashboard-notes",
          meta: { title: "Eslatmalar", icon: "BellOutlined" },
          component: () => import("@/views/dashboard/notes.view.vue"),
        },
        {
          path: "finance",
          name: "dashboard-finance",
          meta: { title: "Moliya", icon: "LineChartOutlined" },
          component: () => import("@/views/dashboard/finance.view.vue"),
        },
      ],
    },
    {
      path: "/auth",
      name: "auth-layout",
      component: () => import("@/layouts/auth.layout.vue"),
      children: [],
    },
    {
      path: "/login",
      redirect: "/auth",
    },
  ],
});

export default router;
