<template>
  <div class="p-4 space-y-4">
    <h3>Switch 测试</h3>

    <!-- 测试 1: 基本用法 -->
    <div class="flex items-center gap-4">
      <span>基本开关:</span>
      <Switch v-model:checked="test1" />
      <span>状态: {{ test1 }}</span>
    </div>

    <!-- 测试 2: 受控开关 -->
    <div class="flex items-center gap-4">
      <span>受控开关:</span>
      <Switch :checked="test2" @update:checked="test2 = $event" />
      <span>状态: {{ test2 }}</span>
      <button class="px-2 py-1 bg-blue-500 text-white rounded" @click="test2 = !test2">切换</button>
    </div>

    <!-- 测试 3: 禁用状态 -->
    <div class="flex items-center gap-4">
      <span>禁用开关:</span>
      <Switch :checked="true" disabled />
      <span>状态: 禁用</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Switch } from '@/components/ui/switch'

const test1 = ref(false)
const test2 = ref(true)
</script>
