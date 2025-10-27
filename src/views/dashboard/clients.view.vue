<script setup>
import { message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref, onMounted } from "vue";
import { useFetch } from "@/composable/useFetch";
import { useLoading } from "@/stores/loading";
import dayjs from "dayjs";
import { formatDate } from "@/utils/format-number";

const { $get, $post, $put, $delete } = useFetch();

const clients = ref([]);
const modalOpen = ref(false);
const confirmLoading = ref(false);
const editingClient = ref(null);
const loadingStore = useLoading();

const formState = reactive({
  firstName: "",
  lastName: "",
  phoneNumber: "",
  birthDate: "",
  address: "",
  genderId: null,
});

const genderOptions = [
  { label: "Erkak", value: 1, icon: ManOutlined },
  { label: "Ayol", value: 2, icon: WomanOutlined },
];

const columns = [
  {
    title: "Ism",
    dataIndex: "firstName",
    key: "firstName",
    width: 200,
  },
  {
    title: "Familiya",
    dataIndex: "lastName",
    key: "lastName",
    width: 200,
  },
  {
    title: "Telefon",
    dataIndex: "phoneNumber",
    key: "phoneNumber",
    width: 200,
  },
  {
    title: "Tug'ilgan sana",
    dataIndex: "birthDate",
    key: "birthDate",
    width: 200,
  },
  {
    title: "Manzili",
    dataIndex: "address",
    key: "address",
    width: 300,
  },
  {
    title: "Amallar",
    key: "actions",
    width: 200,
  },
];

// Fetch clients
const fetchPatients = async () => {
  try {
    loadingStore.startLoadingFn();
    const response = await $get("Patient/GetAllUsers?CanGetMyPatients=true&take=-1");
    clients.value = response.filter((user) => user.roleId === 2);
  } catch (error) {
    message.error("Mijozlar ro'yxatini olishda xatolik yuz berdi!", 5);
  } finally {
    loadingStore.stopLoadingFn();
  }
};

// Delete client
const deleteClient = async (clientId) => {
  try {
    const response = await $delete(`Patient/RemoveUser?id=${clientId}`);

    if (response?.code === 200) {
      await fetchPatients();
      message.success("Mijoz muvaffaqiyatli o'chirildi!");
    }
  } catch (error) {
    message.error("Mijozni o'chirishda xatolik yuz berdi!", 5);
  }
};

const showModal = () => {
  resetForm();
  editingClient.value = null;
  modalOpen.value = true;
};

// Edit client
const editClient = (client) => {
  editingClient.value = client;
  formState.firstName = client.firstName;
  formState.lastName = client.lastName;
  formState.phoneNumber = client.phoneNumber;
  formState.birthDate = client.birthDate ? dayjs(client.birthDate) : null;
  formState.address = client.address;
  formState.genderId = client.genderId;
  modalOpen.value = true;
};

const handleOk = async () => {
  if (
    !formState.firstName ||
    !formState.lastName ||
    !formState.phoneNumber ||
    !formState.birthDate ||
    !formState.address ||
    !formState.genderId
  ) {
    message.error("Iltimos, barcha maydonlarni to'ldiring!");
    return;
  }

  confirmLoading.value = true;

  try {
    if (editingClient.value) {
      const payload = {
        id: editingClient.value.id,
        firstName: formState.firstName,
        lastName: formState.lastName,
        phoneNumber: formState.phoneNumber.replace(/\D/g, ""),
        birthDate: formState.birthDate
          ? formState.birthDate.format("YYYY-MM-DD")
          : null,
        address: formState.address,
        genderId: formState.genderId,
        roleId: 2,
      };

      const response = await $put(`Patient/UpdateUser`, payload);
      if (response) {
        const index = clients.value.findIndex(
          (client) => client.id === editingClient.value.id
        );
        if (index !== -1) {
          clients.value[index] = {
            ...payload,
            birthDate: payload.birthDate.split("T")[0],
          };
          await fetchPatients();
          message.success("Mijoz ma'lumotlari muvaffaqiyatli yangilandi!");
        }
      }
    } else {
      // Add new client
      const payload = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        phoneNumber: formState.phoneNumber.replace(/\D/g, ""),
        birthDate: formState.birthDate,
        address: formState.address,
        genderId: formState.genderId,
        roleId: 2,
      };
      const response = await $post("Patient/AddPatient", payload);
      if (response) {
        await fetchPatients();
        message.success("Yangi mijoz muvaffaqiyatli qo'shildi!");
      }
    }
    modalOpen.value = false;
  } catch (error) {
    message.error(
      error.response?.data?.message || "Operatsiyada xatolik yuz berdi!",
      5
    );
  } finally {
    confirmLoading.value = false;
  }
};

// Reset form
const resetForm = () => {
  formState.firstName = "";
  formState.lastName = "";
  formState.phoneNumber = "+998";
  formState.birthDate = null;
  formState.address = "";
  formState.genderId = null;
};

// Format phone number
const formatPhone = (e) => {
  let value = e.target.value.replace(/\D/g, "");

  if (!value.startsWith("998")) {
    value = "998" + value;
  }
  value = value.substring(0, 12);

  // formatlash: +998(93)515-48-84
  let formatted = "+998";
  if (value.length > 3) formatted += "(" + value.substring(3, 5);
  if (value.length >= 5) formatted += ")";
  if (value.length > 5) formatted += value.substring(5, 8);
  if (value.length >= 8) formatted += "-";
  if (value.length > 8) formatted += value.substring(8, 10);
  if (value.length >= 10) formatted += "-";
  if (value.length > 10) formatted += value.substring(10, 12);

  formState.phoneNumber = formatted;
};
// Allow only numbers for phone input
const onlyNumber = (e) => {
  const charCode = e.charCode ? e.charCode : e.keyCode;
  if (charCode < 48 || charCode > 57) {
    e.preventDefault();
  }
};

onMounted(async () => {
  await fetchPatients();
});
</script>

<template>
  <div class="">
    <div class="flex justify-end items-center mb-2">
      <a-button @click="showModal" type="primary">
        + Yangi mijoz qo'shish
      </a-button>
    </div>

    <div class="bg-white rounded-lg border border-gray-200">
      <a-table
        :loading="loadingStore.isLoading"
        :columns="columns"
        :data-source="clients"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }"
        :scroll="{ x: 1000 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'firstName'">
            <div class="flex items-center gap-3">
              <a-avatar size="small" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="font-medium">{{ record.firstName }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'lastName'">
            <span>{{ record.lastName }}</span>
          </template>

          <template v-else-if="column.key === 'phoneNumber'">
            <div class="flex items-center gap-2">
              <PhoneOutlined class="text-green-600" />
              <span>{{ record.phoneNumber }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'birthDate'">
            <div class="flex items-center gap-2">
              <CalendarOutlined class="text-blue-600" />
              <span>{{ formatDate(record.birthDate) }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'address'">
            <div class="flex items-center gap-2">
              <HomeOutlined class="text-orange-600" />
              <span>{{ record.address }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="flex gap-2">
              <a-button
                size="small"
                type="text"
                @click="editClient(record)"
                class="text-blue-600 hover:text-blue-800"
              >
                <template #icon><EditOutlined /></template>
              </a-button>

              <a-popconfirm
                title="Rostdan o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo'q"
                @confirm="deleteClient(record.id)"
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
          </template>
        </template>
      </a-table>
    </div>

    <a-modal v-model:open="modalOpen" @ok="handleOk" width="600px">
      <template #title>
        <h3 class="text-lg font-semibold text-center !mb-4">
          {{
            editingClient
              ? "Mijoz ma'lumotlarini tahrirlash"
              : "Yangi mijoz qo'shish"
          }}
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
          {{ editingClient ? "Yangilash" : "Qo'shish" }}
        </a-button>
      </template>

      <a-form layout="vertical">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <a-form-item label="Ism" required>
            <a-input
              v-model:value="formState.firstName"
              placeholder="Ismni kiriting"
            >
              <template #prefix>
                <UserOutlined class="!text-gray-400 mr-1" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Familiya" required>
            <a-input
              v-model:value="formState.lastName"
              placeholder="Familiyani kiriting"
            >
              <template #prefix>
                <UserOutlined class="!text-gray-400 mr-1" />
              </template>
            </a-input>
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <a-form-item label="Telefon raqami" required>
            <a-input
              v-model:value="formState.phoneNumber"
              placeholder="+998(__)___-__-__"
              @input="formatPhone"
              maxlength="17"
              @keypress="onlyNumber"
            >
              <template #prefix>
                <PhoneOutlined class="!text-gray-400 mr-1" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="Tug'ilgan sana" required>
            <a-date-picker
              v-model:value="formState.birthDate"
              style="width: 100%"
            >
              <template #prefix>
                <CalendarOutlined class="!text-gray-400 mr-1" />
              </template>
            </a-date-picker>
          </a-form-item>
        </div>

        <a-form-item label="Jins" required>
          <a-select
            v-model:value="formState.genderId"
            placeholder="Jinsni tanlang"
            :options="genderOptions"
            show-search
          >
            <template #option="{ value, label, icon }">
              <span class="flex items-center">
                <component :is="icon" class="mr-2" />
                {{ label }}
              </span>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item label="Manzili" required>
          <a-textarea
            v-model:value="formState.address"
            placeholder="To'liq manzilni kiriting"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
:deep(.ant-form-item) {
  margin-bottom: 16px !important;
}

:deep(.ant-form-item-label) {
  padding: 0 0 6px !important;
  font-weight: 500;
}

.font {
  font-family: "Lato", sans-serif;
}
</style>
