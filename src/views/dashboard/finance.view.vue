<script setup>
import * as Icons from "@ant-design/icons-vue";
import { ref, onMounted, watch } from "vue";
import { useFetch } from "@/composable/useFetch";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

const { $get } = useFetch();

const stats = ref({});
const loading = ref(false);

// Date range state
const dateRange = ref([dayjs().startOf("day"), dayjs().endOf("day")]);

const rangePresets = ref([
  {
    label: "Bugun",
    value: [dayjs().startOf("day"), dayjs().endOf("day")],
  },
  {
    label: "Kecha",
    value: [
      dayjs().subtract(1, "day").startOf("day"),
      dayjs().subtract(1, "day").endOf("day"),
    ],
  },
  {
    label: "So'nggi 7 kun",
    value: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
  },
  {
    label: "So'nggi 30 kun",
    value: [dayjs().subtract(30, "day").startOf("day"), dayjs().endOf("day")],
  },
  {
    label: "Shu oy",
    value: [dayjs().startOf("month"), dayjs().endOf("month")],
  },
  {
    label: "O'tgan oy",
    value: [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month"),
    ],
  },
]);

const loadStats = async () => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) return;
  try {
    loading.value = true;

    const fromDate = dateRange.value[0].format("YYYY-MM-DD");
    const toDate = dateRange.value[1].format("YYYY-MM-DD");

    const response = await $get(
      `Invoice/GetInvoiceStat?from=${fromDate}&to=${toDate}`
    );

    if (response) {
      stats.value = response;
    }
  } catch (error) {
    console.error("Error loading stats:", error);
    message.error("Statistikalarni yuklashda xatolik yuz berdi!");
  } finally {
    loading.value = false;
  }
};

watch(
  dateRange,
  () => {
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      loadStats();
    }
  },
  { deep: true }
);

const getPaymentAmount = (type) => {
  return stats.value.amountByPaymentType?.[type] || 0;
};

const getPaymentCount = (type) => {
  return stats.value.countByPaymentType?.[type] || 0;
};

const getTotalRevenue = () => {
  return stats.value.totalAmount || 0;
};

const getPaidRevenue = () => {
  return stats.value.paid || 0;
};

const getPaidPercentage = () => {
  return Math.round(stats.value.paidPercentage || 0);
};

const cards = ref([
  {
    key: "completed",
    title: "To'landi",
    value: () => stats.value.paidInvoices || 0,
    suffix: "ta",
    trend: { dir: "up", pct: () => getPaidPercentage() },
    color: "from-emerald-500 to-emerald-600",
  },
  {
    key: "uncompleted",
    title: "To'lanmadi",
    value: () => stats.value.unPaidInvoices || 0,
    suffix: "ta",
    trend: { dir: "up", pct: () => getPaidPercentage() },
    color: "from-rose-500 to-rose-600",
  },
  {
    key: "totalRevenue",
    title: "Jami hisob miqdori",
    value: () => getTotalRevenue(),
    suffix: " so'm",
    trend: {
      dir: "up",
      pct: () => Math.round(stats.value.unPaidPercentage || 0),
    },
    color: "from-violet-500 to-violet-600",
  },
  {
    key: "todayRevenue",
    title: "To'langan miqdor",
    value: () => getPaidRevenue(),
    suffix: " so'm",
    trend: { dir: "up", pct: () => getPaidPercentage() },
    color: "from-amber-500 to-amber-600",
  },
  {
    key: "unpaidInvoices",
    title: "To'lanmagan miqdor",
    value: () => stats.value.unPaid || 0,
    suffix: "ta",
    trend: {
      dir: "down",
      pct: () => Math.round(stats.value.unPaidPercentage || 0),
    },
    color: "from-rose-500 to-rose-600",
  },
]);

const paymentMethodCards = ref([
  {
    key: "naqd",
    title: "Naqd to'lov",
    value: () => getPaymentAmount("Naqd"),
    count: () => getPaymentCount("Naqd"),
    suffix: " so'm",
    color: "from-green-500 to-green-600",
  },
  {
    key: "karta",
    title: "Karta to'lovi",
    value: () => getPaymentAmount("Karta"),
    count: () => getPaymentCount("Karta"),
    suffix: " so'm",
    color: "from-blue-500 to-blue-600",
  },
  {
    key: "aralash",
    title: "Aralash to'lov",
    value: () => getPaymentAmount("Aralash"),
    count: () => getPaymentCount("Aralash"),
    suffix: " so'm",
    color: "from-purple-500 to-purple-600",
  },
  {
    key: "online",
    title: "Online to'lov",
    value: () => getPaymentAmount("Online"),
    count: () => getPaymentCount("Online"),
    suffix: " so'm",
    color: "from-indigo-500 to-indigo-600",
  },
]);

const fmt = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("uz-UZ").format(n) : n;

onMounted(async () => {
  await loadStats();
});
</script>

<template>
  <div>
    <div class="mb-2">
      <div class="hidden md:flex items-center justify-end">
        <a-range-picker
          v-model:value="dateRange"
          :presets="rangePresets"
          format="DD.MM.YYYY"
          :placeholder="['Boshlanish', 'Tugash']"
          :get-popup-container="(trigger) => trigger.parentNode"
        />
      </div>

      <div class="flex md:hidden gap-2">
        <a-date-picker
          v-model:value="dateRange[0]"
          format="DD.MM.YYYY"
          placeholder="Boshlanish sanasi"
          :get-popup-container="(trigger) => trigger.parentNode"
          class="w-full"
          @change="loadStats"
        />
        <a-date-picker
          v-model:value="dateRange[1]"
          format="DD.MM.YYYY"
          placeholder="Tugash sanasi"
          :get-popup-container="(trigger) => trigger.parentNode"
          class="w-full"
          @change="loadStats"
        />
      </div>
    </div>

    <a-spin :spinning="loading">
      <!-- Main Statistics -->
      <div
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mb-4"
      >
        <div
          v-for="c in cards"
          :key="c.key"
          class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-400 transition"
        >
          <div
            class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-0"
            :class="`bg-gradient-to-br ${c.color}`"
          />

          <div class="text-sm text-gray-500 font-semibold">{{ c.title }}</div>

          <div class="mt-1 flex items-baseline gap-1">
            <div class="text-2xl font-bold text-gray-900">
              {{ fmt(typeof c.value === "function" ? c.value() : c.value) }}
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
              {{
                typeof c.trend?.pct === "function"
                  ? c.trend.pct()
                  : c.trend?.pct
              }}%
            </span>
            <span class="text-xs text-gray-400">/ foiz</span>
          </div>
        </div>
      </div>

      <!-- Payment Methods Breakdown -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          To'lov usullari bo'yicha
        </h3>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="c in paymentMethodCards"
            :key="c.key"
            class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-400 transition"
          >
            <div
              class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-0"
              :class="`bg-gradient-to-br ${c.color}`"
            />

            <div class="text-sm text-gray-500 font-semibold">{{ c.title }}</div>

            <div class="mt-1 flex items-baseline gap-1">
              <div class="text-2xl font-bold text-gray-900">
                {{ fmt(c.value()) }}
              </div>
              <span class="text-sm text-gray-500">{{ c.suffix }}</span>
            </div>

            <div class="mt-2 flex items-center gap-1">
              <component
                :is="Icons.ShoppingOutlined"
                class="h-3.5 w-3.5 text-blue-600"
              />
              <span class="text-sm font-medium text-blue-700">
                {{ c.count() }}
              </span>
              <span class="text-xs text-gray-400">ta hisob</span>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  :deep(.ant-picker) {
    width: 100% !important;
    max-width: 100% !important;
  }
}
</style>
