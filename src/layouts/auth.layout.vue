<script setup>
import { ref, reactive, h, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  LockOutlined,
  LoginOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
} from "@ant-design/icons-vue";
import { useFetch } from "@/composable/useFetch";

const router = useRouter();
const { $post } = useFetch();

const isRegisterMode = ref(false);

const formState = reactive({
  phoneNumber: "",
  password: "",
  firstName: "",
  lastName: "",
  genderId: null,
  roleId: 1,
});

onMounted(() => {
  formState.phoneNumber = "+998";
});

const rules = {
  phoneNumber: [
    { required: true, message: "Telefon raqami majburiy" },
    {
      validator: (_, value) => {
        if (!value.startsWith("+998")) {
          return Promise.reject("Telefon raqami +998 bilan boshlanishi kerak");
        }
        if (value.replace("+", "").length !== 16) {
          return Promise.reject("Telefon raqamni to'liq kiriting.");
        }
        return Promise.resolve();
      },
    },
  ],
  password: [
    { required: true, message: "Parol majburiy" },
    { min: 6, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
  ],
  firstName: [{ required: true, message: "Ism majburiy", trigger: "blur" }],
  lastName: [{ required: true, message: "Familiya majburiy", trigger: "blur" }],
  genderId: [{ required: true, message: "Jinsni tanlang", trigger: "change" }],
};

const isLoading = ref(false);

const genderOptions = [
  { label: "Erkak", value: 1, icon: ManOutlined },
  { label: "Ayol", value: 2, icon: WomanOutlined },
];

// Handle form submission
const handleSubmit = async () => {
  isLoading.value = true;

  try {
    if (isRegisterMode.value) {
      const registerPayload = {
        phoneNumber: formState.phoneNumber.replace(/\D/g, ""),
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName,
        genderId: formState.genderId,
        roleId: 1, // Default roleId
      };

      const registerResponse = await $post("auth/register", registerPayload);

      if (registerResponse) {
        // Switch to login mode without auto-login
        isRegisterMode.value = false;

        // Clear registration-specific fields and password, keep phoneNumber
        formState.firstName = "";
        formState.lastName = "";
        formState.genderId = null;
        formState.password = "";

        message.success(
          "Muvaffaqiyatli ro'yxatdan o'tdingiz! Iltimos, tizimga kiring.",
          5
        );
      } else {
        throw new Error("Registration failed");
      }
    } else {
      const loginPayload = {
        phoneNumber: formState.phoneNumber.replace(/\D/g, ""),
        password: formState.password,
      };

      const loginResponse = await $post("auth/login", loginPayload);

      if (loginResponse) {
        message.success("Muvaffaqiyatli tizimga kirdingiz!", 5);
        router.push("/dashboard/main");
        emit("loginSuccess");
      } else {
        throw new Error("Login failed");
      }
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      (isRegisterMode.value
        ? "Bu foydalanuvchi avval ro'yhatdan o'tgan!"
        : "Telefon raqam yoki parolda xatolik bor!");
    message.error(errorMessage, 5); // Display error for 5 seconds
  } finally {
    isLoading.value = false;
  }
};

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
};

const onlyNumber = (e) => {
  const charCode = e.charCode ? e.charCode : e.keyCode;
  // 48–57 -> '0'–'9'
  if (charCode < 48 || charCode > 57) {
    e.preventDefault();
  }
};

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

const emit = defineEmits(["loginSuccess"]);
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen bg-gray-50 px-4">
    <a-card
      class="shadow-lg border-0 max-w-md w-full"
      :bodyStyle="{ padding: '32px' }"
      style="border-radius: 16px"
    >
      <div class="text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">
          {{ isRegisterMode ? "Ro'yxatdan o'tish" : "Tizimga kirish" }}
        </h3>
      </div>

      <!-- Form -->
      <a-form
        :model="formState"
        :rules="
          isRegisterMode
            ? rules
            : {
                phoneNumber: rules.phoneNumber,
                password: rules.password,
              }
        "
        @finish="handleSubmit"
        layout="vertical"
        size="large"
      >
        <!-- Phone Number -->
        <a-form-item name="phoneNumber" label="Telefon raqami" class="!mb-2">
          <a-input
            v-model:value="formState.phoneNumber"
            placeholder="+998(__)___-__-__"
            @input="formatPhone"
            maxlength="17"
            @keypress="onlyNumber"
          >
            <template #prefix>
              <PhoneOutlined class="!text-gray-400 !mt-0.5 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <!-- First Name (Register only) -->
        <a-form-item
          v-if="isRegisterMode"
          name="firstName"
          label="Ism"
          class="!mb-2"
        >
          <a-input
            v-model:value="formState.firstName"
            placeholder="Mirolim"
            autocomplete="off"
          >
            <template #prefix>
              <UserOutlined class="!text-gray-400 !mt-0.5 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <!-- Last Name (Register only) -->
        <a-form-item
          v-if="isRegisterMode"
          name="lastName"
          label="Familiya"
          class="!mb-2"
        >
          <a-input
            v-model:value="formState.lastName"
            placeholder="Akbarov"
            autocomplete="off"
          >
            <template #prefix>
              <UserOutlined class="!text-gray-400 !mt-0.5 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <!-- Password -->
        <a-form-item name="password" label="Parol" class="!mb-2">
          <a-input-password
            v-model:value="formState.password"
            placeholder="••••••••"
            :prefix="h(LockOutlined, { class: '!text-gray-400 mr-1' })"
          />
        </a-form-item>

        <!-- Gender (Register only) -->
        <a-form-item
          v-if="isRegisterMode"
          name="genderId"
          label="Jins"
          class="!mb-4"
        >
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

        <!-- Submit Button -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            :loading="isLoading"
            block
            size="large"
            class="!rounded-xl !flex items-center justify-center !mt-4"
          >
            <template #icon>
              <login-outlined v-if="!isLoading" />
            </template>
            {{
              isLoading
                ? isRegisterMode
                  ? "Ro'yxatdan o'tish..."
                  : "Kirish..."
                : isRegisterMode
                ? "Ro'yxatdan o'tish"
                : "Kirish"
            }}
          </a-button>
        </a-form-item>

        <!-- Toggle Mode -->
        <div class="text-center">
          <span>
            {{
              isRegisterMode
                ? "Allaqachon akkauntingiz bormi?"
                : "Hisobingiz yo'qmi?"
            }}
          </span>
          <a
            href="#"
            class="text-blue-500 hover:underline text-base ml-2"
            @click.prevent="toggleMode"
          >
            {{ isRegisterMode ? "Tizimga kirish" : "Ro'yxatdan o'tish" }}
          </a>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
:deep(.ant-input-affix-wrapper),
:deep(.ant-select-selector) {
  border-radius: 12px;
}

:deep(.ant-form-item-label) {
  padding: 0 !important;
}

/* Ensure ant-message is visible */
:deep(.ant-message) {
  z-index: 9999 !important;
  top: 20px !important;
}
</style>
