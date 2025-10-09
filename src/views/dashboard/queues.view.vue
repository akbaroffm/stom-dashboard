<script setup>
import { message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, onMounted, onUnmounted, computed, watch } from "vue";
import dayjs from "dayjs";
import { useFetch } from "@/composable/useFetch";
import moment from "moment";

const { $get, $post, $put, $delete } = useFetch();
const dateRange = ref([dayjs().startOf("day"), dayjs().endOf("day")]);

const formatDateUz = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
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
    const dateA = new Date(a.visitDate);
    const dateB = new Date(b.visitDate);
    return dateA - dateB;
  });
};

const disabledDate = (current) => {
  return current && current < new Date().setHours(0, 0, 0, 0);
};

// Data
const visits = ref([]);
const patients = ref([]);
const treatmentTypes = ref([]);
const paymentTypes = ref([]);
const visitStatuses = ref([]);

const draggedItem = ref(null);
const draggedFrom = ref(null);
const isMobile = ref(false);

const modalOpen = ref(false);
const confirmLoading = ref(false);
const editingVisit = ref(null);
const loading = ref(false);

const paymentModalOpen = ref(false);
const pendingStatusUpdate = ref(null);

const formState = reactive({
  patientId: null,
  visitDate: null,
  complaint: "",
  diagnosis: "",
  notes: "",
  invoiceAmount: null,
  paymentTypeId: null,
  statusId: 1,
  treatmentTypeId: null,
  treatmentDescription: "",
  isPaid: false,
});

const appointments = computed(() => {
  const waiting = visits.value.filter((visit) => visit.statusId === 1);
  const completed = visits.value.filter((visit) => visit.statusId === 2);
  const cancelled = visits.value.filter((visit) => visit.statusId === 3);

  return { waiting, completed, cancelled };
});

const checkIsMobile = () => {
  const touchAvailable =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 1024;
  isMobile.value = touchAvailable || isSmallScreen;
};

const handleResize = () => {
  checkIsMobile();
};

onMounted(async () => {
  checkIsMobile();
  window.addEventListener("resize", handleResize);
  await Promise.all([
    loadVisits(),
    loadPatients(),
    loadTreatmentTypes(),
    loadPaymentTypes(),
    loadVisitStatuses(),
  ]);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const loadVisits = async () => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) return;
  try {
    loading.value = true;

    const fromDate = dateRange.value[0].format("YYYY-MM-DD");
    const toDate = dateRange.value[1].format("YYYY-MM-DD");

    const response = await $get(
      `Visit/GetAll?from=${fromDate}&to=${toDate}&take=-1`
    );
    visits.value = response || [];
  } catch (error) {
    message.error("Qabullarni yuklashda xatolik yuz berdi!");
    console.error("Error loading visits:", error);
  } finally {
    loading.value = false;
  }
};

const loadPatients = async () => {
  try {
    const response = await $get("Patient/GetAllUsers?CanGetMyPatients=true");
    patients.value = (response || []).filter((user) => user.roleId === 2);
  } catch (error) {
    console.error("Error loading patients:", error);
  }
};

const loadTreatmentTypes = async () => {
  try {
    const response = await $get("TreatmentType/GetAll");
    treatmentTypes.value = response || [];
  } catch (error) {
    message.error("Davolash turlarini yuklashda xatolik yuz berdi!");
    console.error("Error loading treatment types:", error);
  }
};

const loadPaymentTypes = async () => {
  try {
    const response = await $get("PaymentType/GetAll");
    paymentTypes.value = response || [];
  } catch (error) {
    message.error("To'lov turlarini yuklashda xatolik yuz berdi!");
    console.error("Error loading payment types:", error);
  }
};

const loadVisitStatuses = async () => {
  try {
    const response = await $get("VisitStatus/GetAll");
    visitStatuses.value = response || [];
  } catch (error) {
    message.error("Status turlarini yuklashda xatolik yuz berdi!");
    console.error("Error loading visit statuses:", error);
  }
};

const showPaymentConfirmation = (visitId, newStatusId) => {
  const visit = visits.value.find((v) => v.id === visitId);
  pendingStatusUpdate.value = {
    visitId,
    newStatusId,
    currentAmount: visit?.invoice?.amount || visit?.invoiceAmount || 0,
  };
  paymentModalOpen.value = true;
};

const handlePaymentConfirmation = async (isPaid) => {
  if (pendingStatusUpdate.value) {
    await updateVisitStatus(
      pendingStatusUpdate.value.visitId,
      pendingStatusUpdate.value.newStatusId,
      isPaid
    );
    paymentModalOpen.value = false;
    pendingStatusUpdate.value = null;
  }
};

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

const onDrop = async (to) => {
  if (!isMobile.value && draggedItem.value && draggedFrom.value !== to) {
    const statusMap = { waiting: 1, completed: 2, cancelled: 3 };
    const newStatusId = statusMap[to];

    if (newStatusId === 2) {
      showPaymentConfirmation(draggedItem.value.id, newStatusId);
    } else {
      await updateVisitStatus(draggedItem.value.id, newStatusId);
    }
  }
};

const moveAppointment = async (visitId, fromStatus, toStatus) => {
  const statusMap = { waiting: 1, completed: 2, cancelled: 3 };
  const newStatusId = statusMap[toStatus];

  if (newStatusId === 2) {
    showPaymentConfirmation(visitId, newStatusId);
  } else {
    await updateVisitStatus(visitId, newStatusId);
  }
};

const updateVisitStatus = async (visitId, newStatusId, isPaid = false) => {
  try {
    const visit = visits.value.find((v) => v.id === visitId);
    if (!visit) return;

    const invoiceAmount = visit.invoice?.amount || visit.invoiceAmount || 0;

    const updatePayload = {
      patientId: visit.patient.id,
      visitDate: visit.visitDate
        ? moment(visit.visitDate).format("YYYY-MM-DDTHH:mm:ss")
        : null,

      complaint: visit.complaint || "",
      diagnosis: visit.diagnosis || "",
      notes: visit.notes || "",
      invoiceAmount: invoiceAmount,
      paymentTypeId: visit.paymentTypeId || visit.invoice?.paymentTypeId || 1,
      statusId: newStatusId,
      treatmentTypeId: visit?.treatmentTypeId || 1,
      treatmentDescription: visit?.treatmentDescription || "",
      visitId: visitId,
      isPaid:
        newStatusId === 2
          ? isPaid
          : visit.isPaid || visit.invoice?.isPaid || false,
    };

    await $put("Visit/UpdateVisit", updatePayload);
    await loadVisits();
    message.success("Status muvaffaqiyatli yangilandi!");
  } catch (error) {
    message.error("Statusni yangilashda xatolik yuz berdi!");
    console.error("Error updating visit status:", error);
  }
};
const deleteVisit = async (visitId) => {
  try {
    await $delete(`Visit/DeleteVisit/${visitId}`);
    await loadVisits();
    message.success("Qabul muvaffaqiyatli o'chirildi!");
  } catch (error) {
    message.error("Qabulni o'chirishda xatolik yuz berdi!");
    console.error("Error deleting visit:", error);
  }
};

const showModal = () => {
  resetForm();
  editingVisit.value = null;
  modalOpen.value = true;
};

const editAppointment = (visit) => {
  editingVisit.value = visit;
  formState.patientId = visit.patient.id;
  formState.visitDate = dayjs(visit.visitDate);
  formState.complaint = visit.complaint || "";
  formState.diagnosis = visit.diagnosis || "";
  formState.notes = visit.notes || "";
  formState.invoiceAmount = visit.invoice?.amount || 0;
  formState.paymentTypeId = visit.invoice.paymentType;
  formState.statusId = visit.statusId;
  formState.treatmentTypeId = visit?.treatmentTypeId;
  formState.treatmentDescription = visit?.treatmentDescription || "";
  formState.isPaid = visit.isPaid || false;
  modalOpen.value = true;
};

const handleOk = async () => {
  try {
    confirmLoading.value = true;

    if (editingVisit.value) {
      const updatePayload = {
        patientId: formState.patientId,
        visitDate: formState.visitDate
          ? formState.visitDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        complaint: formState.complaint,
        diagnosis: formState.diagnosis,
        notes: formState.notes,
        invoiceAmount: formState.invoiceAmount,
        paymentTypeId: formState.paymentTypeId,
        statusId: formState.statusId,
        treatmentTypeId: formState.treatmentTypeId,
        treatmentDescription: formState.treatmentDescription,
        visitId: editingVisit.value.id,
        isPaid: formState.isPaid,
      };

      const res = await $put("Visit/UpdateVisit", updatePayload);
      if (res?.code === 200) {
        message.success("Qabul muvaffaqiyatli yangilandi!");
      } else {
        message.error("Yangilashda xatolik yuz berdi!");
        return;
      }
    } else {
      const createPayload = {
        patientId: formState.patientId,
        visitDate: formState.visitDate
          ? formState.visitDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
        complaint: formState.complaint,
        diagnosis: formState.diagnosis,
        notes: formState.notes,
        invoiceAmount: formState.invoiceAmount,
        paymentTypeId: formState.paymentTypeId,
        statusId: formState.statusId,
        treatmentTypeId: formState.treatmentTypeId,
        treatmentDescription: formState.treatmentDescription,
      };

      const res = await $post("Visit/AddVisit", createPayload);
      if (res?.code === 200) {
        message.success("Qabul muvaffaqiyatli qo'shildi!");
      } else {
        message.error("Qo'shishda xatolik yuz berdi!");
        return;
      }
    }

    await loadVisits();
    modalOpen.value = false;
  } catch (error) {
    message.error("Xatolik yuz berdi!");
    console.error("Error saving visit:", error);
  } finally {
    confirmLoading.value = false;
  }
};

const priceFormatter = new Intl.NumberFormat("uz-UZ", {
  currency: "UZS",
  minimumFractionDigits: 0,
});

const onlyNumber = (event) => {
  const charCode = event.charCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
};

const resetForm = () => {
  formState.patientId = null;
  formState.visitDate = null;
  formState.complaint = "";
  formState.diagnosis = "";
  formState.notes = "";
  formState.invoiceAmount = null;
  formState.paymentTypeId = null;
  formState.statusId = 1;
  formState.treatmentTypeId = null;
  formState.treatmentDescription = "";
  formState.isPaid = false;
};

const getPatientName = (visit) => {
  if (visit.patient) {
    return `${visit.patient.firstName} ${visit.patient.lastName}`;
  }
  return "Unknown Patient";
};

const getTreatmentName = (visit) => {
  return visit.treatmentType.uz || "No treatment specified";
};

watch(
  dateRange,
  () => {
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      loadVisits();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="pb-4">
    <div class="flex items-center justify-between gap-2 mb-2">
      <div class="hidden md:flex items-center flex-1">
        <a-range-picker
          v-model:value="dateRange"
          format="DD.MM.YYYY"
          :placeholder="['Boshlanish', 'Tugash']"
          :get-popup-container="(trigger) => trigger.parentNode"
        />
        <a-button
          @click="showModal"
          type="primary"
          class="whitespace-nowrap !hidden"
        >
          + Qabul qo'shish
        </a-button>
      </div>

      <div class="flex md:hidden gap-2 flex-1">
        <a-date-picker
          v-model:value="dateRange[0]"
          format="DD.MM.YYYY"
          placeholder="Boshlanish sanasi"
          :get-popup-container="(trigger) => trigger.parentNode"
          class="w-full"
          @change="loadVisits"
        />
        <a-date-picker
          v-model:value="dateRange[1]"
          format="DD.MM.YYYY"
          placeholder="Tugash sanasi"
          :get-popup-container="(trigger) => trigger.parentNode"
          class="w-full"
          @change="loadVisits"
        />
      </div>
      <a-button
        @click="showModal"
        type="primary"
        class="whitespace-nowrap md:hidden block"
      >
        + Qabul qo'shish
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <div
        class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 xl:gap-6 gap-4 h-[400px]"
      >
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
            >
              {{ appointments.waiting.length }}
            </span>
          </span>
          <div>
            <div
              v-if="appointments.waiting.length > 0"
              v-for="visit in sortedAppointments(appointments.waiting)"
              :key="visit.id"
              :draggable="!isMobile"
              @dragstart="onDragStart(visit, 'waiting')"
              class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#EAB308]"
            >
              <div class="flex flex-wrap gap-2 justify-between mb-2">
                <div class="flex items-center gap-2">
                  <a-avatar size="small" class="bg-blue-500">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span class="2xl:text-base text-md font-semibold">
                    {{ getPatientName(visit) }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 2xl:text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <CalendarOutlined class="text-gray-500 mb-0.5" />
                    {{ formatDateUz(visit.visitDate) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                    {{ dayjs(visit.visitDate).format("HH:mm") }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-y-2">
                <div class="flex items-center justify-between pt-2">
                  <span class="font-medium"
                    >Davolash:
                    <span class="font-[400]">
                      {{ getTreatmentName(visit) }}
                    </span></span
                  >
                  <span
                    class="py-0.5 px-2 rounded-md"
                    :class="{
                      'bg-[#10B9811a] text-[#10B981]': visit.invoice?.isPaid,
                      'bg-[#EF44441a] text-[#EF4444]': !visit.invoice?.isPaid,
                    }"
                  >
                    {{ priceFormatter.format(visit.invoice?.amount || 0) }} so'm
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium"
                    >Mijoz shikoyati:
                    <span class="font-[400]">
                      {{ visit.complaint }}
                    </span></span
                  >
                </div>
              </div>
              <div
                class="flex gap-2"
                :class="{
                  'justify-between mt-6': isMobile,
                  'justify-end mt-2': !isMobile,
                }"
              >
                <div>
                  <a-popconfirm
                    title="Rostdan o'chirmoqchimisiz?"
                    ok-text="Ha"
                    cancel-text="Yo'q"
                    @confirm="deleteVisit(visit.id)"
                  >
                    <a-button size="small" type="text" danger>
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                  <a-button
                    size="small"
                    type="text"
                    @click="editAppointment(visit)"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </div>
                <div v-if="isMobile" class="flex gap-2">
                  <a-button
                    size="small"
                    type="primary"
                    class="!bg-[#10B981] !shadow-none"
                    @click="moveAppointment(visit.id, 'waiting', 'completed')"
                  >
                    Bajarildi
                  </a-button>
                  <a-button
                    size="small"
                    type="primary"
                    class="!bg-[#EF4444] !shadow-none"
                    @click="moveAppointment(visit.id, 'waiting', 'cancelled')"
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
            >
              {{ appointments.completed.length }}
            </span>
          </span>
          <div>
            <div
              v-if="appointments.completed.length > 0"
              v-for="visit in sortedAppointments(appointments.completed)"
              :key="visit.id"
              :draggable="!isMobile"
              @dragstart="onDragStart(visit, 'completed')"
              class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#10B981]"
            >
              <div class="flex flex-wrap gap-2 justify-between mb-2">
                <div class="flex items-center gap-2">
                  <a-avatar size="small" class="bg-blue-500">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span class="2xl:text-base text-md font-semibold">
                    {{ getPatientName(visit) }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 2xl:text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <CalendarOutlined class="text-gray-500 mb-0.5" />
                    {{ formatDateUz(visit.visitDate) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                    {{ dayjs(visit.visitDate).format("HH:mm") }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-y-2">
                <div class="flex items-center justify-between pt-2">
                  <span class="font-medium"
                    >Davolash:
                    <span class="font-[400]">
                      {{ getTreatmentName(visit) }}
                    </span></span
                  >
                  <span
                    class="py-0.5 px-2 rounded-md"
                    :class="{
                      'bg-[#10B9811a] text-[#10B981]': visit.invoice?.isPaid,
                      'bg-[#EF44441a] text-[#EF4444]': !visit.invoice?.isPaid,
                    }"
                  >
                    {{ priceFormatter.format(visit.invoice?.amount || 0) }} so'm
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium"
                    >Mijoz shikoyati:
                    <span class="font-[400]">
                      {{ visit.complaint }}
                    </span></span
                  >
                </div>
              </div>
              <div
                class="flex gap-2"
                :class="{
                  'justify-between mt-6': isMobile,
                  'justify-end mt-2': !isMobile,
                }"
              >
                <div>
                  <a-popconfirm
                    title="Rostdan o'chirmoqchimisiz?"
                    ok-text="Ha"
                    cancel-text="Yo'q"
                    @confirm="deleteVisit(visit.id)"
                  >
                    <a-button size="small" type="text" danger>
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                  <a-button
                    size="small"
                    type="text"
                    @click="editAppointment(visit)"
                  >
                    <template #icon><EditOutlined /></template>
                  </a-button>
                </div>
                <div v-if="isMobile" class="flex gap-2">
                  <a-button
                    size="small"
                    type="primary"
                    class="!bg-[#EAB308] !shadow-none"
                    @click="moveAppointment(visit.id, 'completed', 'waiting')"
                  >
                    Kutilmoqda
                  </a-button>
                  <a-button
                    size="small"
                    type="primary"
                    class="!bg-[#EF4444] !shadow-none"
                    @click="moveAppointment(visit.id, 'completed', 'cancelled')"
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
            >
              {{ appointments.cancelled.length }}
            </span>
          </span>
          <div>
            <div
              v-if="appointments.cancelled.length > 0"
              v-for="visit in sortedAppointments(appointments.cancelled)"
              :key="visit.id"
              :draggable="!isMobile"
              @dragstart="onDragStart(visit, 'cancelled')"
              class="mb-3 cursor-grab shadow-xs hover:shadow-sm transition-shadow duration-200 bg-white rounded-lg p-4 border-l-4 border-[#EF4444]"
            >
              <div class="flex flex-wrap gap-2 justify-between mb-2">
                <div class="flex items-center gap-2">
                  <a-avatar size="small" class="bg-blue-500">
                    <template #icon><UserOutlined /></template>
                  </a-avatar>
                  <span class="2xl:text-base text-md font-semibold">
                    {{ getPatientName(visit) }}
                  </span>
                </div>
                <div
                  class="flex items-center gap-2 2xl:text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md"
                >
                  <div class="flex items-center gap-2">
                    <CalendarOutlined class="text-gray-500 mb-0.5" />
                    {{ formatDateUz(visit.visitDate) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <ClockCircleOutlined class="text-gray-500 mb-0.5" />
                    {{ dayjs(visit.visitDate).format("HH:mm") }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-y-2">
                <div class="flex items-center justify-between pt-2">
                  <span class="font-medium"
                    >Davolash:
                    <span class="font-[400]">
                      {{ getTreatmentName(visit) }}
                    </span></span
                  >
                  <span
                    class="py-0.5 px-2 rounded-md"
                    :class="{
                      'bg-[#10B9811a] text-[#10B981]': visit.invoice?.isPaid,
                      'bg-[#EF44441a] text-[#EF4444]': !visit.invoice?.isPaid,
                    }"
                  >
                    {{ priceFormatter.format(visit.invoice?.amount || 0) }} so'm
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-medium"
                    >Mijoz shikoyati:
                    <span class="font-[400]">
                      {{ visit.complaint }}
                    </span></span
                  >
                </div>
              </div>
              <div class="flex justify-end gap-2 mt-4">
                <div>
                  <a-popconfirm
                    title="Rostdan o'chirmoqchimisiz?"
                    ok-text="Ha"
                    cancel-text="Yo'q"
                    @confirm="deleteVisit(visit.id)"
                  >
                    <a-button size="small" type="text" danger>
                      <template #icon><DeleteOutlined /></template>
                    </a-button>
                  </a-popconfirm>
                  <a-button
                    size="small"
                    type="text"
                    @click="editAppointment(visit)"
                  >
                    <template #icon><EditOutlined /></template>
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
        </div>
      </div>
    </a-spin>

    <!-- Payment Confirmation Modal -->
    <a-modal
      v-model:open="paymentModalOpen"
      :width="400"
      @cancel="paymentModalOpen = false"
    >
      <div class="text-center">
        <p class="text-lg !font-semibold !mb-4">
          Mijoz to'lovni amalga oshirdimi?
        </p>
        <div class="flex justify-center gap-4">
          <a-button
            type="primary"
            class="!bg-[#10B981]"
            @click="handlePaymentConfirmation(true)"
          >
            Ha, to'landi
          </a-button>
          <a-button @click="handlePaymentConfirmation(false)">
            Yo'q, to'lanmadi
          </a-button>
        </div>
      </div>
      <template #footer>
        <span></span>
      </template>
    </a-modal>

    <!-- Main Modal -->
    <a-modal v-model:open="modalOpen" @ok="handleOk" :width="600">
      <template #title>
        <h3 class="text-lg font-semibold text-center !mb-4">
          {{ editingVisit ? "Qabulni tahrirlash" : "Yangi qabul qo'shish" }}
        </h3>
      </template>
      <template #footer>
        <a-button danger key="back" @click="modalOpen = false">
          Bekor qilish
        </a-button>
        <a-button
          key="submit"
          type="primary"
          :loading="confirmLoading"
          @click="handleOk"
        >
          {{ editingVisit ? "Tahrirlash" : "Qabul qo'shish" }}
        </a-button>
      </template>

      <a-form layout="vertical">
        <a-form-item label="Bemorni tanlang" required>
          <a-select
            v-model:value="formState.patientId"
            placeholder="Bemorni tanlang"
            show-search
            :filter-option="
              (input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            "
          >
            <a-select-option
              v-for="patient in patients"
              :key="patient.id"
              :value="patient.id"
              :label="`${patient.firstName} ${patient.lastName}`"
            >
              {{ patient.firstName }} {{ patient.lastName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <a-form-item label="Sana va vaqt" required>
            <a-date-picker
              v-model:value="formState.visitDate"
              show-time
              placeholder="Sana va vaqtni tanlang"
              style="width: 100%"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD HH:mm"
            />
          </a-form-item>
          <a-form-item label="Hisob miqdori (so'm)">
            <a-input-number
              style="width: 100%"
              v-model:value="formState.invoiceAmount"
              placeholder="Hisob miqdorini kiriting"
              :controls="false"
              :precision="0"
              :min="0"
              @keypress="onlyNumber"
            />
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <a-form-item label="Davolash turi">
            <a-select
              v-model:value="formState.treatmentTypeId"
              placeholder="Davolash turini tanlang"
            >
              <a-select-option
                v-for="treatment in treatmentTypes"
                :key="treatment.id"
                :value="treatment.id"
              >
                {{ treatment.name.uz }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="To'lov turi">
            <a-select
              v-model:value="formState.paymentTypeId"
              placeholder="To'lov turini tanlang"
            >
              <a-select-option
                v-for="payment in paymentTypes"
                :key="payment.id"
                :value="payment.id"
              >
                {{ payment.name.uz }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <a-form-item label="Shikoyat">
          <a-textarea
            v-model:value="formState.complaint"
            placeholder="Bemorning shikoyatini kiriting"
            :rows="2"
          />
        </a-form-item>
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
:deep(.ant-modal-contentl) {
  padding: 10px 12px !important;
}
</style>
