<script setup>
import { ref, onMounted, watch } from "vue";
import { DatePicker, message } from "ant-design-vue";
import { useFetch } from "@/composable/useFetch";
import * as Icons from "@ant-design/icons-vue";
import dayjs from "dayjs";

const { $get } = useFetch();
const RangePicker = DatePicker.RangePicker;

const today = dayjs();
const dateRange = ref([today, today]); // default bugungi kun

const stats = ref(null);
const loading = ref(false);
const cards = ref([]);

const fetchStats = async () => {
  try {
    loading.value = true;

    let url = "Visit/VisitStatistics";

    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      const from = dateRange.value[0].format("YYYY-MM-DD");
      const to = dateRange.value[1].format("YYYY-MM-DD");
      url += `?from=${from}&to=${to}`;
    }

    const res = await $get(url);
    stats.value = res || {};

    cards.value = [
      {
        key: "awaiting",
        title: "Kutilayotgan bemorlar",
        value: stats.value.awaiting,
        suffix: "ta",
        icon: "ClockCircleOutlined",
        color: "from-blue-500 to-blue-600",
      },
      {
        key: "completed",
        title: "Tugallangan muolajalar",
        value: stats.value.completed,
        suffix: "ta",
        icon: "CheckCircleOutlined",
        color: "from-emerald-500 to-emerald-600",
      },
      {
        key: "cancelled",
        title: "Bekor qilingan",
        value: stats.value.cancelled,
        suffix: "ta",
        icon: "CloseCircleOutlined",
        color: "from-rose-500 to-rose-600",
      },
    ];
  } catch (e) {
    message.error("Statistikani yuklashda xatolik!");
  } finally {
    loading.value = false;
  }
};

const fmt = (n) =>
  typeof n === "number" ? new Intl.NumberFormat("uz-UZ").format(n) : n;

watch(dateRange, () => {
  fetchStats();
});

onMounted(fetchStats);
</script>

<template>
  <div>
    <div class="flex justify-end mb-2">
      <RangePicker
        v-model:value="dateRange"
        format="YYYY-MM-DD"
        :allow-clear="true"
      />
    </div>

    <div v-if="cards.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="c in cards"
        :key="c.key"
        class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-400 transition"
      >
        <div
          class="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10"
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
      </div>
    </div>
  </div>
</template>
