<script setup>
import { message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";

const formatDateUz = (dateStr) => {
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const monthName = months[date.getMonth()];
  const dayNum = date.getDate();
  return `${dayNum}-${monthName}`;
};

const sortedAppointments = (list = []) => {
  return [...list].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });
};

const disabledDate = (current) => {
  return current && current < new Date().setHours(0, 0, 0, 0);
};

const appointments = ref({
  waiting: [
    {
      id: 1,
      patientName: "Og'abek Hamzakulov",
      treatment: "Konsultatsiya",
      date: "2025-09-08",
      time: "14:00",
    },
    {
      id: 2,
      patientName: "Mirolim Akbarov",
      treatment: "Plomba qo'yish",
      date: "2025-09-08",
      time: "15:00",
    },
  ],
  completed: [],
  cancelled: [],
});

const draggedItem = ref(null);
const draggedFrom = ref(null);
const isMobile = ref(false);

const modalOpen = ref(false);
const confirmLoading = ref(false);
const editingAppointment = ref(null);

const formState = reactive({
  patientName: "",
  treatment: "Konsultatsiya",
  date: null,
  time: null,
});

const treatmentOptions = [
  "Konsultatsiya",
  "Plomba qo'yish",
  "Xirurgiya",
  "Davolash",
  "Tish tozalash",
  "Implant qo'yish",
  "Breket qo'yish",
];

// Detect if device is mobile (tablet or phone)
const checkIsMobile = () => {
  const touchAvailable =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 1024; // lg breakpoint
  isMobile.value = touchAvailable || isSmallScreen;
};

// Update isMobile on window resize
const handleResize = () => {
  checkIsMobile();
};

onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const onDragStart = (item, from) => {
  if (!isMobile.value) {
    draggedItem.value = item;
    draggedFrom.value = from;
  }
};

const onDragOver = (event) => {
  if (!isMobile.value) {
    event.preventDefault();
  }
};

const onDrop = (to) => {
  if (!isMobile.value && draggedItem.value && draggedFrom.value !== to) {
    appointments.value[draggedFrom.value] = appointments.value[
      draggedFrom.value
    ].filter((item) => item.id !== draggedItem.value.id);
    appointments.value[to].push(draggedItem.value);
    message.success("Bemor muvaffaqiyatli ko'chirildi!");
  }
};

const moveAppointment = (appointmentId, fromStatus, toStatus) => {
  if (fromStatus !== toStatus) {
    const appointment = appointments.value[fromStatus].find(
      (app) => app.id === appointmentId
    );
    if (appointment) {
      appointments.value[fromStatus] = appointments.value[fromStatus].filter(
        (app) => app.id !== appointmentId
      );
      appointments.value[toStatus].push(appointment);
      message.success("Bemor muvaffaqiyatli ko'chirildi!");
    }
  }
};

const deleteAppointment = (appointmentId, status) => {
  appointments.value[status] = appointments.value[status].filter(
    (app) => app.id !== appointmentId
  );
  message.success("Qabul muvaffaqiyatli o'chirildi!");
};

const showModal = () => {
  resetForm();
  editingAppointment.value = null;
  modalOpen.value = true;
};

const editAppointment = (appointment) => {
  editingAppointment.value = appointment;
  formState.patientName = appointment.patientName;
  formState.treatment = appointment.treatment;
  formState.date = dayjs(appointment.date);
  formState.time = dayjs(appointment.time, "HH:mm");
  formState.price = appointment.price;
  modalOpen.value = true;
};

const handleOk = () => {
  confirmLoading.value = true;
  const formattedDate = dayjs(formState.date).format("YYYY-MM-DD");
  const formattedTime = dayjs(formState.time).format("HH:mm");

  setTimeout(() => {
    if (editingAppointment.value) {
      const index = appointments.value.waiting.findIndex(
        (app) => app.id === editingAppointment.value.id
      );
      if (index !== -1) {
        appointments.value.waiting[index] = {
          ...appointments.value.waiting[index],
          patientName: formState.patientName,
          treatment: formState.treatment,
          date: formattedDate,
          time: formattedTime,
          price: formState.price,
        };
        message.success("Qabul muvaffaqiyatli yangilandi!");
      }
    } else {
      const newAppointment = {
        id:
          Math.max(
            ...Object.values(appointments.value)
              .flat()
              .map((item) => item.id)
          ) + 1,
        patientName: formState.patientName,
        treatment: formState.treatment,
        date: formattedDate,
        time: formattedTime,
        price: formState.price,
      };
      appointments.value.waiting.push(newAppointment);
      message.success("Qabul muvaffaqiyatli qo'shildi!");
    }
    confirmLoading.value = false;
    modalOpen.value = false;
  }, 2000);
};

const resetForm = () => {
  formState.patientName = "";
  formState.treatment = "Konsultatsiya";
  formState.date = null;
  formState.time = null;
  formState.price = 0;
};
</script>

<template>
  <div class="pb-4">
    <div class="flex justify-end mb-2">
      <a-button @click="showModal" type="primary" size="middle">{{
        "+ Qabul qo'shish"
      }}</a-button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-[300px]">
      <!-- Kutilmoqda -->
      <div
        class="bg-[#F3F4F6] rounded-lg p-4"
        :class="{ 'drag-target': !isMobile }"
        @dragover="onDragOver"
        @drop="() => onDrop('waiting')"
      >
        <span
          class="font-semibold flex justify-between items-center mb-4 text-[17px] text-[#374151]"
        >
          Kutilmoqda
          <span
            class="rounded-full px-2 py-1 text-[12px] font-semibold bg-[#EAB308] text-[#fff]"
            >{{ appointments.waiting.length }}</span
          >
        </span>
        <div
          v-if="appointments.waiting.length > 0"
          v-for="appointment in sortedAppointments(appointments.waiting)"
          :key="appointment.id"
          :draggable="!isMobile"
          @dragstart="onDragStart(appointment, 'waiting')"
          class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#EAB308]"
        >
          <div class="flex flex-wrap gap-2 justify-between mb-2">
            <div class="flex items-center gap-2">
              <a-avatar size="small" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="2xl:text-base text-md font-semibold">{{
                appointment.patientName
              }}</span>
            </div>
            <div
              class="flex items-center gap-2 2xl:text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
            >
              <div class="flex items-center gap-2">
                <CalendarOutlined class="text-gray-500 mb-0.5" />
                {{ formatDateUz(appointment.date) }}
              </div>
              <div class="flex items-center gap-1">
                <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                {{ appointment.time }}
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[#808080] text-sm">{{
              appointment.treatment
            }}</span>
          </div>
          <div
            class="flex gap-2"
            :class="{
              'justify-between mt-4': isMobile,
              'justify-end mt-2': !isMobile,
            }"
          >
            <div>
              <a-popconfirm
                title="Rostdan o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo‘q"
                @confirm="deleteAppointment(appointment.id, 'waiting')"
              >
                <a-button size="small" type="text" danger>
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
              <a-button
                size="small"
                type="text"
                @click="editAppointment(appointment)"
              >
                <template #icon><EditOutlined /></template>
              </a-button>
            </div>
            <div v-if="isMobile" class="flex gap-2">
              <a-button
                size="small"
                type="primary"
                class="!bg-[#10B981]"
                @click="moveAppointment(appointment.id, 'waiting', 'completed')"
              >
                Bajarildi
              </a-button>
              <a-button
                size="small"
                type="primary"
                class="!bg-[#EF4444]"
                @click="moveAppointment(appointment.id, 'waiting', 'cancelled')"
              >
                Bekor qilindi
              </a-button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="border-2 border-dashed h-[115px] border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500"
        >
          Hozirda bemorlar yo'q
        </div>
      </div>

      <!-- Bajarildi -->
      <div
        class="bg-[#F3F4F6] rounded-lg p-4"
        :class="{ 'drag-target': !isMobile }"
        @dragover="onDragOver"
        @drop="() => onDrop('completed')"
      >
        <span
          class="font-semibold flex justify-between items-center mb-4 text-[17px] text-[#374151]"
        >
          Bajarildi
          <span
            class="rounded-full px-2 py-1 text-[12px] font-semibold bg-[#10B981] text-[#fff]"
            >{{ appointments.completed.length }}</span
          >
        </span>
        <div
          v-if="appointments.completed.length > 0"
          v-for="appointment in sortedAppointments(appointments.completed)"
          :key="appointment.id"
          :draggable="!isMobile"
          @dragstart="onDragStart(appointment, 'completed')"
          class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#10B981]"
        >
          <div class="flex flex-wrap gap-2 justify-between mb-2">
            <div class="flex items-center gap-2">
              <a-avatar size="small" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="2xl:text-base text-md font-semibold">{{
                appointment.patientName
              }}</span>
            </div>
            <div
              class="flex items-center gap-2 2xl:text-xs text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
            >
              <div class="flex items-center gap-2">
                <CalendarOutlined class="text-gray-500 mb-0.5" />
                {{ formatDateUz(appointment.date) }}
              </div>
              <div class="flex items-center gap-1">
                <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                {{ appointment.time }}
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[#808080]">{{ appointment.treatment }}</span>
          </div>
          <div
            class="flex gap-2"
            :class="{
              'justify-between mt-4': isMobile,
              'justify-end mt-2': !isMobile,
            }"
          >
            <div>
              <a-popconfirm
                title="Rostdan o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo‘q"
                @confirm="deleteAppointment(appointment.id, 'completed')"
              >
                <a-button size="small" type="text" danger>
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
              <a-button
                size="small"
                type="text"
                @click="editAppointment(appointment)"
              >
                <template #icon><EditOutlined /></template>
              </a-button>
            </div>
            <div v-if="isMobile" class="flex gap-2">
              <a-button
                size="small"
                type="primary"
                class="!bg-[#EAB308]"
                @click="moveAppointment(appointment.id, 'completed', 'waiting')"
              >
                Kutilmoqda
              </a-button>
              <a-button
                size="small"
                type="primary"
                class="!bg-[#EF4444]"
                @click="
                  moveAppointment(appointment.id, 'completed', 'cancelled')
                "
              >
                Bekor qilindi
              </a-button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="border-2 border-dashed h-[115px] border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500"
        >
          Hozirda bemorlar yo'q
        </div>
      </div>

      <!-- Bekor qilindi -->
      <div
        class="bg-[#F3F4F6] rounded-lg p-4"
        :class="{ 'drag-target': !isMobile }"
        @dragover="onDragOver"
        @drop="() => onDrop('cancelled')"
      >
        <span
          class="font-semibold flex justify-between items-center mb-4 text-[17px] text-[#374151]"
        >
          Bekor qilindi
          <span
            class="rounded-full px-2 py-1 text-[12px] font-semibold bg-[#EF4444] text-[#fff]"
            >{{ appointments.cancelled.length }}</span
          >
        </span>
        <div
          v-if="appointments.cancelled.length > 0"
          v-for="appointment in sortedAppointments(appointments.cancelled)"
          :key="appointment.id"
          :draggable="!isMobile"
          @dragstart="onDragStart(appointment, 'cancelled')"
          class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#EF4444]"
        >
          <div class="flex flex-wrap gap-2 justify-between mb-2">
            <div class="flex items-center gap-2">
              <a-avatar size="small" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="2xl:text-base text-md font-semibold">{{
                appointment.patientName
              }}</span>
            </div>
            <div
              class="flex items-center gap-2 2xl:text-xs text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
            >
              <div class="flex items-center gap-2">
                <CalendarOutlined class="text-gray-500 mb-0.5" />
                {{ formatDateUz(appointment.date) }}
              </div>
              <div class="flex items-center gap-1">
                <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                {{ appointment.time }}
              </div>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[#808080]">{{ appointment.treatment }}</span>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <div>
              <a-popconfirm
                title="Rostdan o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo‘q"
                @confirm="deleteAppointment(appointment.id, 'cancelled')"
              >
                <a-button size="small" type="text" danger>
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
              <a-button
                size="small"
                type="text"
                @click="editAppointment(appointment)"
              >
                <template #icon><EditOutlined /></template>
              </a-button>
            </div>
            <!-- <div v-if="isMobile" class="flex gap-2">
              <a-button
                size="small"
                type="primary"
                class="!bg-[#EAB308]"
                @click="moveAppointment(appointment.id, 'cancelled', 'waiting')"
              >
                Kutilmoqda
              </a-button>
              <a-button
                size="small"
                type="primary"
                class="!bg-[#10B981]"
                @click="
                  moveAppointment(appointment.id, 'cancelled', 'completed')
                "
              >
                Bajarildi
              </a-button>
            </div> -->
          </div>
        </div>
        <div
          v-else
          class="border-2 border-dashed h-[115px] border-gray-300 rounded-lg flex flex-col justify-center items-center text-gray-500"
        >
          Hozirda bemorlar yo'q
        </div>
      </div>
    </div>

    <a-modal v-model:open="modalOpen" @ok="handleOk">
      <template #title>
        <h3 class="text-lg font-semibold text-center !mb-4">
          {{
            editingAppointment ? "Qabulni tahrirlash" : "Yangi qabul qo'shish"
          }}
        </h3>
      </template>
      <template #footer>
        <a-button danger key="back" @click="modalOpen = false"
          >Bekor qilish</a-button
        >
        <a-button
          key="submit"
          type="primary"
          :loading="confirmLoading"
          @click="handleOk"
        >
          {{ editingAppointment ? "Tahrirlash" : "Qabul qo'shish" }}
        </a-button>
      </template>
      <a-form layout="vertical">
        <a-form-item label="Bemorning ism va familiyasi">
          <a-input
            v-model:value="formState.patientName"
            placeholder="Ism va familiyani kiriting"
          />
        </a-form-item>
        <a-form-item label="Davolash turi">
          <a-select
            v-model:value="formState.treatment"
            :options="
              treatmentOptions.map((item) => ({ label: item, value: item }))
            "
            placeholder="Davolash turini tanlang"
            default-value="Konsultatsiya"
            allow-clear
            show-search
          />
        </a-form-item>
        <div class="grid grid-cols-2 gap-4">
          <a-form-item label="Sana">
            <a-date-picker
              v-model:value="formState.date"
              placeholder="Sanani kiriting"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </a-form-item>
          <a-form-item label="Vaqti">
            <a-time-picker
              v-model:value="formState.time"
              placeholder="Vaqtni kiriting"
              format="HH:mm"
              style="width: 100%"
            />
          </a-form-item>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 12px !important;
}
:deep(.ant-form-item-label) {
  padding: 0 0 4px !important;
}
.font {
  font-family: "Lato", sans-serif;
}
.drag-target {
  cursor: grab;
}
</style>
