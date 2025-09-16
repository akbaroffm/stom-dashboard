<script setup>
import { message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons-vue";
import { reactive, ref } from "vue";

const clients = ref([
  {
    id: 1,
    fullName: "Og'abek Hamzakulov",
    phone: "+998 90 123 45 67",
    birthYear: "1995",
    address: "Toshkent sh., Yunusobod t., 12-uy",
  },
  {
    id: 2,
    fullName: "Mirolim Akbarov",
    phone: "+998 91 987 65 43",
    birthYear: "1988",
    address: "Samarqand sh., Registon ko'ch., 25-uy",
  },
]);

const modalOpen = ref(false);
const confirmLoading = ref(false);
const editingClient = ref(null);

const formState = reactive({
  fullName: "",
  phone: "",
  birthYear: "",
  address: "",
});

const columns = [
  {
    title: "To'liq ism",
    dataIndex: "fullName",
    key: "fullName",
    width: "25%",
  },
  {
    title: "Telefon",
    dataIndex: "phone",
    key: "phone",
    width: "20%",
  },
  {
    title: "Tug'ilgan yili",
    dataIndex: "birthYear",
    key: "birthYear",
    width: "15%",
  },
  {
    title: "Manzili",
    dataIndex: "address",
    key: "address",
    width: "25%",
  },
  {
    title: "Amallar",
    key: "actions",
    width: "15%",
  },
];

const deleteClient = (clientId) => {
  clients.value = clients.value.filter((client) => client.id !== clientId);
  message.success("Mijoz muvaffaqiyatli o'chirildi!");
};

const showModal = () => {
  resetForm();
  editingClient.value = null;
  modalOpen.value = true;
};

const editClient = (client) => {
  editingClient.value = client;
  formState.fullName = client.fullName;
  formState.phone = client.phone;
  formState.birthYear = client.birthYear;
  formState.address = client.address;
  modalOpen.value = true;
};

const handleOk = () => {
  if (
    !formState.fullName ||
    !formState.phone ||
    !formState.birthYear ||
    !formState.address
  ) {
    message.error("Iltimos, barcha maydonlarni to'ldiring!");
    return;
  }

  confirmLoading.value = true;

  setTimeout(() => {
    if (editingClient.value) {
      // Tahrirlash
      const index = clients.value.findIndex(
        (client) => client.id === editingClient.value.id
      );
      if (index !== -1) {
        clients.value[index] = {
          ...clients.value[index],
          fullName: formState.fullName,
          phone: formState.phone,
          birthYear: formState.birthYear,
          address: formState.address,
        };
        message.success("Mijoz ma'lumotlari muvaffaqiyatli yangilandi!");
      }
    } else {
      // Yangi qo'shish
      const newClient = {
        id: Math.max(...clients.value.map((item) => item.id)) + 1,
        fullName: formState.fullName,
        phone: formState.phone,
        birthYear: formState.birthYear,
        address: formState.address,
      };
      clients.value.push(newClient);
      message.success("Yangi mijoz muvaffaqiyatli qo'shildi!");
    }
    confirmLoading.value = false;
    modalOpen.value = false;
  }, 1000);
};

const resetForm = () => {
  formState.fullName = "";
  formState.phone = "";
  formState.birthYear = "";
  formState.address = "";
};
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
        :columns="columns"
        :data-source="clients"
        :pagination="{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }"
        :scroll="{ x: 1000 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'fullName'">
            <div class="flex items-center gap-3">
              <a-avatar size="small" class="bg-blue-500">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="font-medium">{{ record.fullName }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'phone'">
            <div class="flex items-center gap-2">
              <PhoneOutlined class="text-green-600" />
              <span>{{ record.phone }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'birthYear'">
            <div class="flex items-center gap-2">
              <CalendarOutlined class="text-blue-600" />
              <span>{{ record.birthYear }}</span>
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
        <a-form-item label="To'liq ism" required>
          <a-input
            v-model:value="formState.fullName"
            placeholder="Ism va familiyani kiriting"
          >
            <template #prefix>
              <UserOutlined class="!text-gray-400 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="Telefon raqami" required>
          <a-input
            v-model:value="formState.phone"
            placeholder="+998 90 123 45 67"
            maxlength="13"
          >
            <template #prefix>
              <PhoneOutlined class="!text-gray-400 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="Tug'ilgan yili" required>
          <a-input v-model:value="formState.birthYear" placeholder="1990">
            <template #prefix>
              <CalendarOutlined class="!text-gray-400 mr-1" />
            </template>
          </a-input>
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
