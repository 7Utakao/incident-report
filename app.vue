<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// メタデータ
useHead({
  title: 'Incident Report System',
  meta: [{ name: 'description', content: 'チーム向けインシデント管理システム' }],
});
</script>
