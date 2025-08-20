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
          path: "",
          name: "dashboard-dashboard",
          meta: { title: "Dashboard", icon: "DashboardOutlined" },
          component: () => import("@/views/dashboard/dashboard.view.vue"),
        },
        {
          path: "clients",
          name: "dashboard-clients",
          meta: { title: "Clients", icon: "UserOutlined" },
          component: () => import("@/views/dashboard/clients.view.vue"),
        },
        {
          path: "notes",
          name: "dashboard-notes",
          meta: { title: "Notes", icon: "FileTextOutlined" },
          component: () => import("@/views/dashboard/notes.view.vue"),
        },
        {
          path: "reports",
          name: "dashboard-reports",
          meta: { title: "Reports", icon: "BarChartOutlined" },
          children: [
            {
              path: "analytics",
              name: "dashboard-reports-analytics",
              meta: { title: "Analytics" },
              // component: () =>
              //   import("@/views/dashboard/reports/analytics.view.vue"),
            },
            {
              path: "performance",
              name: "dashboard-reports-performance",
              meta: { title: "Performance" },
              // component: () =>
              //   import("@/views/dashboard/reports/performance.view.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/auth",
      name: "auth-layout",
      component: () => import("@/layouts/auth.layout.vue"),
      children: [],
    },
  ],
});

export default router;
