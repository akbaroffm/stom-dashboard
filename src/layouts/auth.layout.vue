<script setup>
import { ref, reactive, h } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();

// Reactive state
const loginForm = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const isLoading = ref(false);

// Form validation rules
const loginRules = {
  email: [
    { required: true, message: "Login majburiy" },
    { message: "Login noto'g'ri formatda" },
  ],
  password: [
    { required: true, message: "Parol majburiy" },
    { min: 6, message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" },
  ],
};

const emit = defineEmits(["loginSuccess"]);

const handleLogin = async (values) => {
  isLoading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    message.success("Muvaffaqiyatli tizimga kirdingiz!");

    router.push("/dashboard");

    emit("loginSuccess");
  } catch (error) {
    message.error("Login xatosi yuz berdi!");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="flex items-center justify-center w-full h-screen bg-gray-50 px-4">
    <a-card
      class="shadow-xl border-0 max-w-md w-full"
      :bodyStyle="{ padding: '32px' }"
      style="border-radius: 16px"
    >
      <div class="text-center">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Tizimga kirish</h3>
      </div>

      <!-- Login Form -->
      <a-form
        :model="loginForm"
        :rules="loginRules"
        @finish="handleLogin"
        layout="vertical"
        size="large"
      >
        <a-form-item name="email" label="Login" class="!mb-2">
          <a-input
            v-model:value="loginForm.email"
            placeholder="akbarov-mirolim"
            autocomplete="off"
          >
            <template #prefix>
              <UserOutlined class="!text-gray-400 !mt-0.5 mr-1" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" label="Parol" class="!mb-4">
          <a-input-password
            v-model:value="loginForm.password"
            placeholder="••••••••"
            :prefix="h(LockOutlined, { class: '!text-gray-400 mr-1' })"
          />
        </a-form-item>

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
            {{ isLoading ? "Kirish..." : "Kirish" }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
:deep(.ant-card) {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 12px;
}

:deep(.ant-form-item-label) {
  padding: 0 !important;
}
</style>
