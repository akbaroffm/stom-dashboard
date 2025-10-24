<script setup>
import { message } from 'ant-design-vue';
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
  MedicineBoxOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from '@ant-design/icons-vue';
import { reactive, ref, computed, watch, onMounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/uz';
import { useFetch } from '@/composable/useFetch';

const { $get, $delete, $post, $put } = useFetch();

const activeTab = ref('notes');

const patients = ref([]);
const searchQuery = ref('');
const loading = ref(false);

const filteredPatients = computed(() => {
  let result = patients.value;
  if (searchQuery.value) {
    const lowerQuery = searchQuery.value?.toLowerCase();
    result = patients.value.filter((patient) =>
      patient.firstName?.toLowerCase().includes(lowerQuery)
    );
  }
  return result.slice(0, searchQuery.value ? result.length : 3);
});

const selectedPatient = ref(null);

const notes = ref([]);
const notesLoading = ref(false);

const medicalHistory = ref(null);
const historyLoading = ref(false);

const modalOpen = ref(false);
const historyModalOpen = ref(false);
const confirmLoading = ref(false);
const editingNote = ref(null);

const formState = reactive({
  patientId: null,
  title: '',
  description: '',
  noteDate: null,
  files: '',
});

const historyFormState = reactive({
  patientId: null,
  allergies: '',
  chronicDiseases: '',
  dentalHistory: '',
  currentMedications: '',
  surgeries: '',
  otherNotes: '',
});

const uploadFileList = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const uploadingFiles = ref(false);

const BASE_URL = 'http://95.182.119.19:5009/';

const loadPatients = async () => {
  loading.value = true;
  try {
    const response = await $get('/Patient/GetAllUsers?CanGetMyPatients=true');
    if (response && Array.isArray(response)) {
      patients.value = response;
      if (patients.value.length > 0 && !selectedPatient.value) {
        selectedPatient.value = patients.value[0];
        await loadNotes(patients.value[0].id);
        await loadMedicalHistory(patients.value[0].id);
      }
    }
  } catch (error) {
    message.error('Bemorlarni yuklashda xatolik yuz berdi');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadNotes = async (patientId) => {
  notesLoading.value = true;
  try {
    const response = await $get(
      `/Note/GetAll?FilteringExpression=patientId==${patientId}`
    );
    if (response && Array.isArray(response)) {
      notes.value = response.map((note) => ({
        ...note,
        attachments: note.files ? parseFiles(note.files) : [],
      }));
    }
  } catch (error) {
    message.error('Eslatmalarni yuklashda xatolik yuz berdi');
    console.error(error);
  } finally {
    notesLoading.value = false;
  }
};

const loadMedicalHistory = async (patientId) => {
  historyLoading.value = true;
  try {
    const response = await $get(
      `/MedicalHistory/GetAll?FilteringExpression=patientId==${patientId}`
    );
    if (response && Array.isArray(response) && response.length > 0) {
      medicalHistory.value = response[0];
    } else {
      medicalHistory.value = null;
    }
  } catch (error) {
    message.error('Tibbiy tarixni yuklashda xatolik yuz berdi');
    console.error(error);
  } finally {
    historyLoading.value = false;
  }
};

const filteredNotes = computed(() => {
  if (!selectedPatient.value) return [];
  return notes.value.filter(
    (note) => note.patientId === selectedPatient.value.id
  );
});

const selectPatient = async (patient) => {
  selectedPatient.value = patient;
  await loadNotes(patient.id);
  await loadMedicalHistory(patient.id);
};

const showModal = () => {
  resetForm();
  editingNote.value = null;
  modalOpen.value = true;
};

const showHistoryModal = () => {
  if (medicalHistory.value) {
    historyFormState.patientId = medicalHistory.value.patientId;
    historyFormState.allergies = medicalHistory.value.allergies || '';
    historyFormState.chronicDiseases =
      medicalHistory.value.chronicDiseases || '';
    historyFormState.dentalHistory = medicalHistory.value.dentalHistory || '';
    historyFormState.currentMedications =
      medicalHistory.value.currentMedications || '';
    historyFormState.surgeries = medicalHistory.value.surgeries || '';
    historyFormState.otherNotes = medicalHistory.value.otherNotes || '';
  } else {
    historyFormState.patientId = selectedPatient.value?.id || null;
    historyFormState.allergies = '';
    historyFormState.chronicDiseases = '';
    historyFormState.dentalHistory = '';
    historyFormState.currentMedications = '';
    historyFormState.surgeries = '';
    historyFormState.otherNotes = '';
  }
  historyModalOpen.value = true;
};

const parseFiles = (filesString) => {
  if (!filesString) return [];
  try {
    const fileNames = filesString
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f);
    return fileNames.map((name, index) => ({
      uid: `file-${index}`,
      name: extractFileName(name),
      status: 'done',
      url: name,
      fullPath: name,
    }));
  } catch (error) {
    return [];
  }
};

const extractFileName = (path) => {
  if (!path) return '';
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1];
};

const stringifyFiles = (fileList) => {
  if (!fileList || fileList.length === 0) return '';
  return fileList
    .map((file) => file.fullPath || file.url || file.name)
    .join(', ');
};

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (extension === 'pdf') {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'xls', 'xlsx'].includes(extension)) {
    return 'document';
  }
  return 'other';
};

const uploadFileToServer = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await $post(`/File/Upload`, formData);

    if (response) {
      return response.content;
    } else {
      throw new Error('Fayl yuklanmadi');
    }
  } catch (error) {
    console.error('Faylni yuklashda xatolik:', error);
    throw error;
  }
};

const handleBeforeUpload = async (file) => {
  const isValidType =
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'text/plain';

  if (!isValidType) {
    message.error('Faqat rasm, PDF, Word va Excel fayllarni yuklash mumkin!');
    return false;
  }

  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error("Fayl hajmi 10MB dan kichik bo'lishi kerak!");
    return false;
  }

  return false;
};

const handleUploadChange = async (info) => {
  const { file } = info;

  if (file.status !== 'removed') {
    const existingFile = uploadFileList.value.find((f) => f.uid === file.uid);
    if (!existingFile) {
      uploadFileList.value.push({
        uid: file.uid,
        name: file.name,
        status: 'uploading',
        originFileObj: file.originFileObj || file,
      });
    }
  }
};

const handlePreview = async (file) => {
  const fileType = getFileType(file.name);

  if (fileType === 'image') {
    if (file.url) {
      previewImage.value = `${BASE_URL}/${file.url}`;
    } else if (file.originFileObj) {
      previewImage.value = await getBase64(file.originFileObj);
    } else if (file.thumbUrl) {
      previewImage.value = file.thumbUrl;
    }
    previewVisible.value = true;
    previewTitle.value = file.name;
  } else if (fileType === 'pdf') {
    if (file.url) {
      previewImage.value = `${BASE_URL}/${file.url}`;
      previewVisible.value = true;
      previewTitle.value = file.name;
    } else {
      message.info(`${file.name} faylini yuklab olish uchun saqlang`);
    }
  } else {
    message.info(`${file.name} faylini ko'rish uchun yuklab oling`);
  }
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const handleDownload = (file) => {
  if (file.url) {
    window.open(`${BASE_URL}/${file.url}`, '_blank');
  } else {
    message.info('Fayl hali yuklanmagan');
  }
};

const editNote = (note) => {
  editingNote.value = note;
  formState.patientId = note.patientId;
  formState.title = note.title;
  formState.description = note.description;
  formState.noteDate = note.noteDate ? dayjs(note.noteDate) : null;
  formState.files = note.files || '';

  uploadFileList.value = note.attachments || [];
  modalOpen.value = true;
};

const deleteNote = async (noteId) => {
  try {
    await $delete(`/Note/Remove?id=${noteId}`);
    message.success("Eslatma muvaffaqiyatli o'chirildi!");
    await loadNotes(selectedPatient.value.id);
  } catch (error) {
    message.error("Eslatmani o'chirishda xatolik yuz berdi");
    console.error(error);
  }
};

const handleOk = async () => {
  if (
    !formState.patientId ||
    !formState.title ||
    !formState.description ||
    !formState.noteDate
  ) {
    message.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
    return;
  }

  confirmLoading.value = true;
  uploadingFiles.value = true;

  try {
    const uploadedFiles = [];

    for (const file of uploadFileList.value) {
      if (file.originFileObj && file.status !== 'done') {
        try {
          const serverPath = await uploadFileToServer(file.originFileObj);
          uploadedFiles.push({
            ...file,
            fullPath: serverPath,
            status: 'done',
            url: serverPath,
          });
        } catch (error) {
          message.error(`${file.name} yuklanmadi`);
          console.error(error);
        }
      } else if (file.fullPath || file.url) {
        uploadedFiles.push(file);
      }
    }

    uploadFileList.value = uploadedFiles;
    const filesString = stringifyFiles(uploadedFiles);

    const noteData = {
      id: editingNote.value?.id,
      patientId: formState.patientId,
      title: formState.title,
      description: formState.description,
      noteDate: formState.noteDate.toISOString(),
      files: filesString,
      createdAt: editingNote.value?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingNote.value) {
      await $put(`/Note/Update`, noteData);
      message.success('Eslatma muvaffaqiyatli yangilandi!');
    } else {
      await $post('/Note/Add', noteData);
      message.success("Yangi eslatma muvaffaqiyatli qo'shildi!");
    }

    await loadNotes(selectedPatient.value.id);
    modalOpen.value = false;
  } catch (error) {
    message.error('Xatolik yuz berdi');
    console.error(error);
  } finally {
    confirmLoading.value = false;
    uploadingFiles.value = false;
  }
};

const handleHistoryOk = async () => {
  if (!historyFormState.patientId) {
    message.error('Bemor tanlanmagan!');
    return;
  }

  confirmLoading.value = true;

  try {
    const historyData = {
      id: medicalHistory.value?.id,
      patientId: historyFormState.patientId,
      allergies: historyFormState.allergies,
      chronicDiseases: historyFormState.chronicDiseases,
      dentalHistory: historyFormState.dentalHistory,
      currentMedications: historyFormState.currentMedications,
      surgeries: historyFormState.surgeries,
      otherNotes: historyFormState.otherNotes,
      createdAt: medicalHistory.value?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (medicalHistory.value) {
      await $put(`/MedicalHistory/Update`, historyData);
      message.success('Tibbiy tarix muvaffaqiyatli yangilandi!');
    } else {
      await $post('/MedicalHistory/Add', historyData);
      message.success("Tibbiy tarix muvaffaqiyatli qo'shildi!");
    }

    await loadMedicalHistory(selectedPatient.value.id);
    historyModalOpen.value = false;
  } catch (error) {
    message.error('Xatolik yuz berdi');
    console.error(error);
  } finally {
    confirmLoading.value = false;
  }
};

const resetForm = () => {
  formState.patientId = selectedPatient.value ? selectedPatient.value.id : null;
  formState.title = '';
  formState.description = '';
  formState.noteDate = null;
  formState.files = '';
  uploadFileList.value = [];
};

const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return dayjs(dateTime).locale('uz').format('DD.MM.YYYY');
};

const handleRemoveAttachment = (file) => {
  uploadFileList.value = uploadFileList.value.filter((f) => f.uid !== file.uid);
  return true;
};

const clearSearch = () => {
  searchQuery.value = '';
  if (patients.value.length > 0) {
    selectedPatient.value = patients.value[0];
    loadNotes(patients.value[0].id);
    loadMedicalHistory(patients.value[0].id);
  }
};

const disabledDate = (current) => {
  return current && current > dayjs().endOf('day');
};

watch(searchQuery, (newVal) => {
  if (!newVal && patients.value.length > 0) {
    selectedPatient.value = patients.value[0];
    loadNotes(patients.value[0].id);
    loadMedicalHistory(patients.value[0].id);
  }
});

onMounted(() => {
  dayjs.locale('uz');
  loadPatients();
});
</script>

<template>
  <div>
    <a-spin :spinning="loading">
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
              {{ patient.firstName }} {{ patient.lastName }}
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

      <!-- Tabs -->
      <div
        v-if="selectedPatient"
        class="bg-white rounded-lg border border-gray-200 px-4 py-2"
      >
        <a-tabs v-model:activeKey="activeTab" class="px-4">
          <a-tab-pane key="notes">
            <template #tab>
              <span class="flex items-center">
                <FileTextOutlined class="!mr-2" />
                Eslatmalar
              </span>
            </template>

            <div class="pb-4">
              <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2"
              >
                <h2
                  class="text-base lg:text-lg font-semibold text-gray-800 mb-2 md:!mb-0"
                >
                  {{ selectedPatient.firstName }}
                  {{ selectedPatient.lastName }} uchun eslatmalar
                </h2>
                <a-button
                  @click="showModal"
                  type="primary"
                  class="w-full sm:w-auto"
                >
                  + Yangi eslatma qo'shish
                </a-button>
              </div>

              <a-spin :spinning="notesLoading">
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div
                    v-for="note in filteredNotes"
                    :key="note.id"
                    class="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-blue-500 transition-all duration-200"
                  >
                    <div
                      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2"
                    >
                      <h3 class="font-semibold text-base sm:text-lg">
                        {{ note.title }}
                      </h3>
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
                      class="flex items-center gap-1 mb-2 text-sm text-gray-600"
                    >
                      <CalendarOutlined />
                      <span>{{ formatDateTime(note.noteDate) }}</span>
                    </div>

                    <p
                      class="text-gray-700m !mb-0 leading-relaxed text-sm sm:text-base"
                    >
                      {{ note.description }}
                    </p>

                    <div
                      v-if="note.attachments && note.attachments.length > 0"
                      class="mt-3"
                    >
                      <div class="text-sm font-medium text-gray-600 mb-2">
                        Qo'shimcha fayllar:
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="attachment in note.attachments"
                          :key="attachment.uid"
                          class="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <FileOutlined
                            :class="
                              getFileType(attachment.name) === 'image'
                                ? 'text-green-600'
                                : getFileType(attachment.name) === 'pdf'
                                ? 'text-red-600'
                                : 'text-blue-600'
                            "
                          />
                          <span class="text-sm truncate max-w-[150px]">{{
                            attachment.name
                          }}</span>
                          <div class="flex gap-1">
                            <a-button
                              v-if="
                                getFileType(attachment.name) === 'image' ||
                                getFileType(attachment.name) === 'pdf'
                              "
                              type="text"
                              size="small"
                              @click="handlePreview(attachment)"
                              class="!p-0 !h-auto"
                            >
                              <EyeOutlined class="mb-1 !text-sm" />
                            </a-button>
                            <a-button
                              type="text"
                              size="small"
                              @click="handleDownload(attachment)"
                              class="!p-0 !h-auto"
                            >
                              <DownloadOutlined class="mb-1 !text-sm" />
                            </a-button>
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
              </a-spin>
            </div>
          </a-tab-pane>

          <a-tab-pane key="history">
            <template #tab>
              <span class="flex items-center">
                <MedicineBoxOutlined class="!mr-2" />
                Tibbiy Tarix
              </span>
            </template>

            <div class="pb-4">
              <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2"
              >
                <h2
                  class="text-base lg:text-lg font-semibold text-gray-800 mb-2 md:!mb-0"
                >
                  {{ selectedPatient.firstName }}
                  {{ selectedPatient.lastName }} - Tibbiy Tarix
                </h2>
                <a-button
                  @click="showHistoryModal"
                  type="primary"
                  class="w-full sm:w-auto"
                >
                  {{
                    medicalHistory ? 'Tahrirlash' : "+ Tibbiy Tarix Qo'shish"
                  }}
                </a-button>
              </div>

              <a-spin :spinning="historyLoading">
                <div
                  v-if="medicalHistory"
                  class="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
                >
                  <div v-if="medicalHistory.allergies">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Allergiyalar
                    </h4>
                    <p class="text-gray-600">{{ medicalHistory.allergies }}</p>
                  </div>

                  <div v-if="medicalHistory.chronicDiseases">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Surunkali Kasalliklar
                    </h4>
                    <p class="text-gray-600">
                      {{ medicalHistory.chronicDiseases }}
                    </p>
                  </div>

                  <div v-if="medicalHistory.dentalHistory">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Stomatologik Tarix
                    </h4>
                    <p class="text-gray-600">
                      {{ medicalHistory.dentalHistory }}
                    </p>
                  </div>

                  <div v-if="medicalHistory.currentMedications">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Hozirgi Dorilar
                    </h4>
                    <p class="text-gray-600">
                      {{ medicalHistory.currentMedications }}
                    </p>
                  </div>

                  <div v-if="medicalHistory.surgeries">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Operatsiyalar
                    </h4>
                    <p class="text-gray-600">{{ medicalHistory.surgeries }}</p>
                  </div>

                  <div v-if="medicalHistory.otherNotes">
                    <h4 class="font-semibold text-gray-700 mb-2">
                      Boshqa Eslatmalar
                    </h4>
                    <p class="text-gray-600">{{ medicalHistory.otherNotes }}</p>
                  </div>
                </div>

                <div v-else class="text-center py-8 text-gray-500">
                  <MedicineBoxOutlined class="text-2xl mb-2 mx-auto" />
                  <p>Tibbiy tarix mavjud emas</p>
                </div>
              </a-spin>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>

    <!-- Eslatma modali -->
    <a-modal
      v-model:open="modalOpen"
      :width="768"
      :title="editingNote ? 'Eslatmani tahrirlash' : 'Yangi eslatma qo\'shish'"
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
              {{ patient.firstName }} {{ patient.lastName }}
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
            v-model:value="formState.description"
            placeholder="Eslatma mazmunini kiriting"
            :rows="4"
          />
        </a-form-item>

        <a-form-item label="Eslatma sanasi" required>
          <a-date-picker
            v-model:value="formState.noteDate"
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
            :before-upload="handleBeforeUpload"
            @change="handleUploadChange"
            @preview="handlePreview"
            @remove="handleRemoveAttachment"
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          >
            <a-button class="w-full" type="dashed" :loading="uploadingFiles">
              {{
                uploadingFiles
                  ? 'Yuklanmoqda...'
                  : "+ Fayl qo'shish (rasm, pdf, doc, xlsx)"
              }}
            </a-button>
          </a-upload>
          <div class="text-xs text-gray-500 mt-2">
            Maksimal fayl hajmi: 10MB. Ruxsat etilgan formatlar: JPG, PNG, PDF,
            DOC, DOCX, XLS, XLSX, TXT
          </div>
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="modalOpen = false">Bekor qilish</a-button>
        <a-button type="primary" :loading="confirmLoading" @click="handleOk">
          {{ editingNote ? 'Yangilash' : "Qo'shish" }}
        </a-button>
      </template>
    </a-modal>

    <!-- Tibbiy Tarix Modali -->
    <a-modal
      v-model:open="historyModalOpen"
      :width="768"
      :title="
        medicalHistory ? 'Tibbiy Tarixni Tahrirlash' : 'Tibbiy Tarix Qo\'shish'
      "
      :confirm-loading="confirmLoading"
      @ok="handleHistoryOk"
      @cancel="historyModalOpen = false"
    >
      <a-form layout="vertical" class="mt-4">
        <a-form-item label="Allergiyalar">
          <a-textarea
            v-model:value="historyFormState.allergies"
            placeholder="Allergiyalar haqida ma'lumot kiriting"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="Surunkali Kasalliklar">
          <a-textarea
            v-model:value="historyFormState.chronicDiseases"
            placeholder="Surunkali kasalliklar haqida ma'lumot kiriting"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="Stomatologik Tarix">
          <a-textarea
            v-model:value="historyFormState.dentalHistory"
            placeholder="Stomatologik tarix haqida ma'lumot kiriting"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="Hozirgi Dorilar">
          <a-textarea
            v-model:value="historyFormState.currentMedications"
            placeholder="Hozirda qabul qilinayotgan dorilar"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="Operatsiyalar">
          <a-textarea
            v-model:value="historyFormState.surgeries"
            placeholder="O'tkazilgan operatsiyalar haqida ma'lumot"
            :rows="2"
          />
        </a-form-item>

        <a-form-item label="Boshqa Eslatmalar">
          <a-textarea
            v-model:value="historyFormState.otherNotes"
            placeholder="Qo'shimcha eslatmalar"
            :rows="2"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button @click="historyModalOpen = false">Bekor qilish</a-button>
        <a-button
          type="primary"
          :loading="confirmLoading"
          @click="handleHistoryOk"
        >
          {{ medicalHistory ? 'Yangilash' : "Qo'shish" }}
        </a-button>
      </template>
    </a-modal>

    <!-- Rasm va PDF preview modal -->
    <a-modal
      v-model:open="previewVisible"
      :title="previewTitle"
      :footer="null"
      centered
      :z-index="2000"
      width="1000px"
    >
      <div v-if="getFileType(previewTitle) === 'image'">
        <img alt="preview" style="width: 100%" :src="previewImage" />
      </div>
      <div v-else-if="getFileType(previewTitle) === 'pdf'" style="height: 70vh">
        <iframe
          :src="previewImage"
          style="width: 100%; height: 100%; border: none"
          frameborder="0"
        ></iframe>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
h3,
h4 {
  margin-bottom: 0 !important;
}

:deep(.ant-form-item) {
  margin-bottom: 16px !important;
}

:deep(.ant-form-item-label) {
  padding: 0 0 6px !important;
  font-weight: 500;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 0 !important;
}

:deep(.ant-tabs-content-holder) {
  padding-top: 16px;
}

.font {
  font-family: 'Lato', sans-serif;
}
</style>
