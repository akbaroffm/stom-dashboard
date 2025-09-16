<script setup>
import { message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  FileOutlined,
  AlertOutlined,
  SearchOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, computed, watch, onMounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/uz";

// Bemorlar ro'yxati
const patients = ref([
  {
    id: 1,
    fullName: "Og'abek Hamzakulov",
    phone: "+998 90 123 45 67",
    birthYear: "1995",
    code: "C001",
  },
  {
    id: 2,
    fullName: "Mirolim Akbarov",
    phone: "+998 91 987 65 43",
    birthYear: "1988",
    code: "C002",
  },
  {
    id: 3,
    fullName: "Dilnoza Rahimova",
    phone: "+998 93 555 44 33",
    birthYear: "1992",
    code: "C003",
  },
  {
    id: 4,
    fullName: "Zafar Usmonov",
    phone: "+998 94 111 22 33",
    birthYear: "1990",
    code: "C004",
  },
]);

const searchQuery = ref("");

const filteredPatients = computed(() => {
  let result = patients.value;
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value.toLowerCase();
    result = patients.value.filter((patient) =>
      patient.fullName.toLowerCase().includes(lowerQuery)
    );
  }
  return result.slice(0, searchQuery.value ? result.length : 3);
});

const selectedPatient = ref(patients.value[0] || null);

// Eslatmalar ro'yxati
const notes = ref([
  {
    id: 1,
    patientId: 1,
    type: "Davolash",
    title: "Muntazam Tozalash - Yanvar 2024",
    content:
      "Bemor muntazam tozalash uchun keldi. Tish chuqurchalari aniqlandi. Pastki aziz tishlarida engil plaque to'plami. Yaxshiroq ig'bwal tozalash usulini tavvista qildim. Keyingi tozalash 6 oydan keyin rejalashtirildi.",
    dateTime: "2024-01-15",
    attachments: [
      {
        uid: "1",
        name: "rentgen_yan2024.jpg",
        status: "done",
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        type: "image/jpeg",
      },
      {
        uid: "2",
        name: "tozalash_eslatmalari.pdf",
        status: "done",
        url: "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooSGVsbG8gV29ybGQhKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMTIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDIKJSVFT0YK",
        type: "application/pdf",
      },
    ],
    status: "completed",
  },
  {
    id: 2,
    patientId: 1,
    type: "Tibbiy Tarix",
    title: "Tibbiy Tarix Yangilanishi",
    content:
      "Bemor yangi tibbiy holatlar haqida xabar bermadi. Hozirda qon bosimi dori (Lisinopril 10mg kunlik) qabul qilmoqda. Ma'lum dori allergiyalari yo'q. Oilada diabet tarixi mavjud.",
    dateTime: "2024-01-15",
    attachments: [],
    status: "active",
  },
]);

// Eslatma turlari
const noteTypes = [
  { value: "Davolash", label: "Davolash", color: "#1890ff" },
  { value: "Tibbiy Tarix", label: "Tibbiy Tarix", color: "#52c41a" },
  { value: "Eslatma", label: "Eslatma", color: "#faad14" },
  {
    value: "Navbatdagi Uchrashuv",
    label: "Navbatdagi Uchrashuv",
    color: "#722ed1",
  },
];

const modalOpen = ref(false);
const confirmLoading = ref(false);
const editingNote = ref(null);

const formState = reactive({
  patientId: null,
  type: "Davolash",
  title: "",
  content: "",
  dateTime: null,
  attachments: [],
});

const uploadFileList = ref([]);
const previewVisible = ref(false);
const previewImage = ref("");
const previewTitle = ref("");

const filteredNotes = computed(() => {
  if (!selectedPatient.value) return [];
  return notes.value.filter(
    (note) => note.patientId === selectedPatient.value.id
  );
});

const selectPatient = (patient) => {
  selectedPatient.value = patient;
};

const showModal = () => {
  resetForm();
  editingNote.value = null;
  modalOpen.value = true;
};

// Fayl formatini aniqlash
const getFileType = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const documentExtensions = ["pdf", "doc", "docx", "txt"];

  if (imageExtensions.includes(extension)) {
    return "image";
  } else if (documentExtensions.includes(extension)) {
    return "document";
  }
  return "other";
};

// Fayl preview uchun
const handlePreview = async (file) => {
  const fileType = getFileType(file.name);

  if (fileType === "image") {
    previewImage.value = file.url || file.thumbUrl;
    previewVisible.value = true;
    previewTitle.value = file.name;
  } else {
    // Boshqa fayl turlari uchun download
    if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.info(`${file.name} faylini yuklab olish uchun saqlang`);
    }
  }
};

const handleUploadChange = (info) => {
  let fileList = [...info.fileList];

  // Har bir fayl uchun preview yaratish
  fileList = fileList.map((file) => {
    if (file.originFileObj) {
      const fileType = getFileType(file.name);

      if (fileType === "image" && !file.url && !file.preview) {
        file.url = URL.createObjectURL(file.originFileObj);
      }

      // Base64 formatda saqlash uchun FileReader ishlatish
      if (!file.base64 && file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          file.base64 = e.target.result;
          file.url = e.target.result;
        };
        reader.readAsDataURL(file.originFileObj);
      }
    }
    return file;
  });

  uploadFileList.value = fileList;
};

const editNote = (note) => {
  editingNote.value = note;
  formState.patientId = note.patientId;
  formState.type = note.type;
  formState.title = note.title;
  formState.content = note.content;
  formState.dateTime = note.dateTime
    ? dayjs(note.dateTime, "YYYY-MM-DD")
    : null;
  formState.attachments = [...(note.attachments || [])];

  // Upload file list ni to'g'ri formatga keltirish
  uploadFileList.value = (note.attachments || []).map((attachment, index) => {
    if (typeof attachment === "string") {
      // Eski format - faqat fayl nomi
      return {
        uid: `existing-${index}`,
        name: attachment,
        status: "done",
        url: attachment,
      };
    } else {
      // Yangi format - to'liq fayl ma'lumoti
      return {
        uid: attachment.uid || `existing-${index}`,
        name: attachment.name,
        status: "done",
        url: attachment.url,
        type: attachment.type,
      };
    }
  });

  modalOpen.value = true;
};

const deleteNote = (noteId) => {
  notes.value = notes.value.filter((note) => note.id !== noteId);
  message.success("Eslatma muvaffaqiyatli o'chirildi!");
};

const handleOk = () => {
  if (
    !formState.patientId ||
    !formState.type ||
    !formState.title ||
    !formState.content ||
    !formState.dateTime
  ) {
    message.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
    return;
  }

  confirmLoading.value = true;

  setTimeout(() => {
    // Fayllarni to'g'ri formatda saqlash
    const attachments = uploadFileList.value.map((file) => ({
      uid: file.uid,
      name: file.name,
      status: file.status,
      url: file.url || file.base64,
      type: file.type || file.originFileObj?.type,
    }));

    const formattedDate = formState.dateTime
      ? formState.dateTime.format("YYYY-MM-DD")
      : "";

    if (editingNote.value) {
      const index = notes.value.findIndex(
        (note) => note.id === editingNote.value.id
      );
      if (index !== -1) {
        notes.value[index] = {
          ...notes.value[index],
          patientId: formState.patientId,
          type: formState.type,
          title: formState.title,
          content: formState.content,
          dateTime: formattedDate,
          attachments: attachments,
        };
        message.success("Eslatma muvaffaqiyatli yangilandi!");
      }
    } else {
      const newNote = {
        id: Math.max(0, ...notes.value.map((item) => item.id)) + 1,
        patientId: formState.patientId,
        type: formState.type,
        title: formState.title,
        content: formState.content,
        dateTime: formattedDate,
        attachments: attachments,
        status: "active",
      };
      notes.value.push(newNote);
      message.success("Yangi eslatma muvaffaqiyatli qo'shildi!");

      // Tanlangan bemorni active holatda saqlash
      selectedPatient.value =
        patients.value.find((patient) => patient.id === formState.patientId) ||
        patients.value[0] ||
        null;
    }
    confirmLoading.value = false;
    modalOpen.value = false;
  }, 1000);
};

const resetForm = () => {
  formState.patientId = selectedPatient.value ? selectedPatient.value.id : null;
  formState.type = "Davolash";
  formState.title = "";
  formState.content = "";
  formState.dateTime = null;
  formState.attachments = [];
  uploadFileList.value = [];
};

const getNoteTypeColor = (type) => {
  const noteType = noteTypes.find((t) => t.value === type);
  return noteType ? noteType.color : "#1890ff";
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return "";
  return dayjs(dateTime, "YYYY-MM-DD").locale("uz").format("DD.MM.YYYY");
};

const handleRemoveAttachment = (file) => {
  uploadFileList.value = uploadFileList.value.filter((f) => f.uid !== file.uid);
  return true;
};

const clearSearch = () => {
  searchQuery.value = "";
  selectedPatient.value = patients.value[0] || null;
};

const disabledDate = (current) => {
  return current && current < dayjs().startOf("day");
};

watch(searchQuery, (newVal) => {
  if (!newVal) {
    selectedPatient.value = patients.value[0] || null;
  }
});

onMounted(() => {
  dayjs.locale("uz");
});
</script>

<template>
  <div>
    <div v-if="patients.length === 0" class="text-center py-8 text-gray-500">
      <AlertOutlined class="text-2xl mb-2 mx-auto" />
      <p>Avval bemor qo'shing</p>
    </div>
    <div v-else class="mb-4 sm:mb-6">
      <a-input
        v-model:value="searchQuery"
        placeholder="Bemor ism-sharifi bo'yicha qidiruv..."
        class="mb-4 w-full"
      >
        <template #prefix>
          <SearchOutlined class="text-gray-400" />
        </template>
        <template #suffix v-if="searchQuery">
          <a-button type="text" size="small" @click="clearSearch">
            <CloseOutlined />
          </a-button>
        </template>
      </a-input>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 sm:max-h-96 overflow-y-auto"
      >
        <div
          v-for="patient in filteredPatients"
          :key="patient.id"
          @click="selectPatient(patient)"
          :class="[
            'p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center',
            selectedPatient?.id === patient.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
          ]"
        >
          <a-avatar size="small" class="bg-blue-500 flex-shrink-0">
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <div class="font-medium text-sm ml-3 truncate">
            {{ patient.fullName }}
          </div>
        </div>
      </div>
      <div
        v-if="filteredPatients.length === 0"
        class="text-center py-4 text-gray-500"
      >
        Hech qanday bemor topilmadi
      </div>
    </div>

    <!-- Eslatmalar qismi -->
    <div
      v-if="selectedPatient"
      class="bg-white rounded-lg border border-gray-200"
    >
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 px-4"
      >
        <h2
          class="text-base lg:text-lg font-semibold text-gray-800 mb-2 md:!mb-0"
        >
          {{ selectedPatient.fullName }} uchun eslatmalar
        </h2>
        <a-button @click="showModal" type="primary" class="w-full sm:w-auto">
          + Yangi eslatma qo'shish
        </a-button>
      </div>

      <!-- Eslatmalar ro'yxati -->
      <div class="p-4 space-y-4">
        <div
          v-for="note in filteredNotes"
          :key="note.id"
          class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-blue-500 transition-all duration-200"
        >
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2"
          >
            <div class="flex flex-wrap items-center gap-2">
              <a-tag :color="getNoteTypeColor(note.type)" class="mb-0">
                {{ note.type }}
              </a-tag>
              <h3 class="font-semibold text-base sm:text-lg">
                {{ note.title }}
              </h3>
            </div>
            <div class="flex gap-1 sm:gap-2">
              <a-button
                size="small"
                type="text"
                @click="editNote(note)"
                class="text-blue-600 hover:text-blue-800"
              >
                <template #icon><EditOutlined /></template>
              </a-button>
              <a-popconfirm
                title="Rostdan o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo'q"
                @confirm="deleteNote(note.id)"
              >
                <a-button
                  size="small"
                  type="text"
                  danger
                  class="text-red-600 hover:text-red-800"
                >
                  <template #icon><DeleteOutlined /></template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-3 text-sm text-gray-600"
          >
            <div class="flex items-center gap-1">
              <CalendarOutlined />
              <span>{{ formatDateTime(note.dateTime) }}</span>
            </div>
          </div>

          <p class="text-gray-700 mb-3 leading-relaxed text-sm sm:text-base">
            {{ note.content }}
          </p>

          <!-- Qo'shimcha fayllar -->
          <div
            v-if="note.attachments && note.attachments.length > 0"
            class="mt-3"
          >
            <div class="text-sm font-medium text-gray-600 mb-2">
              Qo'shimcha fayllar:
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                @click="handlePreview(attachment)"
                v-for="attachment in note.attachments"
                :key="attachment.uid || attachment"
                class="flex items-center gap-4 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <span class="flex items-center gap-1 text-sm truncate max-w-xs">
                  <FileOutlined
                    :class="
                      getFileType(attachment.name || attachment) === 'image'
                        ? 'text-green-600'
                        : 'text-blue-600'
                    "
                  />
                  {{
                    typeof attachment === "string"
                      ? attachment
                      : attachment.name
                  }}
                </span>
                <div class="flex">
                  <EyeOutlined
                    @click="
                      handlePreview(
                        typeof attachment === 'string'
                          ? { name: attachment, url: attachment }
                          : attachment
                      )
                    "
                    class="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="filteredNotes.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <AlertOutlined class="text-2xl mb-2 mx-auto" />
          <p>Hali eslatmalar yo'q</p>
        </div>
      </div>
    </div>

    <!-- Eslatma modali -->
    <a-modal
      v-model:open="modalOpen"
      :width="768"
      :title="
        editingNote ? 'Eslatmani tahrirlash' : 'Yangi eslatma qo\u0027shish'
      "
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="modalOpen = false"
    >
      <a-form layout="vertical" class="mt-4">
        <a-form-item label="Bemor" required>
          <a-select
            v-model:value="formState.patientId"
            placeholder="Bemorni tanlang"
            :disabled="!!editingNote"
          >
            <a-select-option
              v-for="patient in patients"
              :key="patient.id"
              :value="patient.id"
            >
              {{ patient.fullName }} ({{ patient.code }})
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Eslatma turi" required>
          <a-select
            v-model:value="formState.type"
            placeholder="Turini tanlang"
            allow-clear
            show-search
          >
            <a-select-option
              v-for="type in noteTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Sarlavha" required>
          <a-input
            v-model:value="formState.title"
            placeholder="Eslatma sarlavhasini kiriting"
          />
        </a-form-item>

        <a-form-item label="Mazmuni" required>
          <a-textarea
            v-model:value="formState.content"
            placeholder="Eslatma mazmunini kiriting"
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="Eslatma sanasi" required>
          <a-date-picker
            v-model:value="formState.dateTime"
            format="DD.MM.YYYY"
            placeholder="Sanani tanlang"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </a-form-item>

        <a-form-item label="Qo'shimcha fayllar">
          <a-upload
            v-model:file-list="uploadFileList"
            name="file"
            :multiple="true"
            :show-upload-list="{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: false,
            }"
            :before-upload="() => false"
            @change="handleUploadChange"
            @preview="handlePreview"
            @remove="handleRemoveAttachment"
            accept="image/*,.pdf,.doc,.docx,.txt"
          >
            <a-button class="w-full" type="dashed">
              + Fayl yuklash (rasm, PDF, DOC va boshqalar)
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="modalOpen = false"> Bekor qilish </a-button>
        <a-button type="primary" :loading="confirmLoading" @click="handleOk">
          {{ editingNote ? "Yangilash" : "Qo'shish" }}
        </a-button>
      </template>
    </a-modal>

    <!-- Rasm preview modal -->
    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
      centered
      :z-index="2000"
      :mask-style="{ zIndex: 1999 }"
      :wrap-style="{ zIndex: 2000 }"
    >
      <img alt="preview" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<style scoped>
h3 {
  margin-bottom: 0 !important;
}
:deep(.ant-form-item) {
  margin-bottom: 16px !important;
}

:deep(.ant-form-item-label) {
  padding: 0 0 6px !important;
  font-weight: 500;
}

:deep(.ant-tag) {
  margin-bottom: 0;
}

:deep(.ant-upload-list-item-thumbnail) {
  width: 48px !important;
  height: 48px !important;
  line-height: 54px !important;
}

:deep(.ant-upload-list-item-name) {
  padding-left: 8px !important;
}

.font {
  font-family: "Lato", sans-serif;
}
</style>
