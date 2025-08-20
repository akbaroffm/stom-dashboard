<script setup>
import { loadImage, loadSvg } from "@/utils/image-utils";
import { computed, defineAsyncComponent } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  isSvg: {
    type: Boolean,
    default: false,
  },
  svgToImg: {
    type: Boolean,
    default: false,
  },
});

const computedSvgICon = computed(() => {
  if (props.isSvg) {
    const svgName = props.name;
    return defineAsyncComponent(() =>
      import(`@/assets/images/svg/${svgName}.svg`)
    );
  }
});
</script>

<template>
  <component v-if="props.isSvg" :is="computedSvgICon" :key="props.name">
  </component>
  <img
    v-else-if="props.svgToImg"
    :src="loadSvg(props.name)"
    :alt="props.name"
    :draggable="false"
  />
  <img
    v-else
    :src="loadImage(props.name)"
    :alt="props.name"
    :draggable="false"
  />
</template>
