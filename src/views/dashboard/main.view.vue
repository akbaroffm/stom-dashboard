<script setup>
import * as Icons from "@ant-design/icons-vue";

const cards = [
  {
    key: "todayPatients",
    title: "Bugungi bemorlar",
    value: 5,
    suffix: "ta",
    trend: { dir: "up", pct: 10 },
    icon: "UserOutlined",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "completed",
    title: "Tugallangan muolajalar",
    value: 3,
    suffix: "ta",
    trend: { dir: "up", pct: 70 },
    icon: "CheckCircleOutlined",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    key: "todayRevenue",
    title: "Bugungi daromad",
    value: 645000,
    suffix: " so'm",
    trend: { dir: "up", pct: 12 },
    icon: "DollarCircleOutlined",
    color: "from-amber-500 to-amber-600",
  },
  {
    key: "monthRevenue",
    title: "Oy bo‘yicha daromad",
    value: 18450000,
    suffix: " so'm",
    trend: { dir: "up", pct: 8 },
    icon: "LineChartOutlined",
    color: "from-violet-500 to-violet-600",
  },
  {
    key: "noShows",
    title: "Kelmagan bemorlar",
    value: 1,
    suffix: "ta",
    trend: { dir: "down", pct: 3 },
    icon: "FieldTimeOutlined",
    color: "from-rose-500 to-rose-600",
  },
];

const fmt = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("uz-UZ").format(n) : n;
</script>

<template>
  <div>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <div
        v-for="c in cards"
        :key="c.key"
        class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-400 transition"
      >
        <div
          class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-0"
          :class="`bg-gradient-to-br ${c.color}`"
        />
        <div
          class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
          :class="`bg-gradient-to-br ${c.color}`"
        >
          <component :is="Icons[c.icon]" class="h-5 w-5 text-lg" />
        </div>

        <div class="text-sm text-gray-500 font-semibold">{{ c.title }}</div>

        <div class="mt-1 flex items-baseline gap-1">
          <div class="text-2xl font-bold text-gray-900">
            {{ fmt(c.value) }}
          </div>
          <span class="text-sm text-gray-500">{{ c.suffix }}</span>
        </div>

        <div class="mt-2 flex items-center gap-1">
          <component
            :is="
              c.trend?.dir === 'up'
                ? Icons.CaretUpOutlined
                : Icons.CaretDownOutlined
            "
            :class="[
              'h-3.5 w-3.5',
              c.trend?.dir === 'up' ? 'text-emerald-600' : 'text-rose-600',
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              c.trend?.dir === 'up' ? 'text-emerald-700' : 'text-rose-700',
            ]"
          >
            {{ c.trend?.pct }}
          </span>
          <span class="text-xs text-gray-400">/ so‘nggi 7 kun</span>
        </div>
      </div>
    </div>
  </div>
</template>
