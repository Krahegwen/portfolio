<script setup lang="ts">
defineProps<{
  index: string
  eyebrow: string
  title: string
  lede?: string
}>()

const root = ref<HTMLElement | null>(null)
const { track } = useMotionScope()

onMounted(() => {
  if (!root.value) return
  track(revealOnScroll(root.value.querySelectorAll('[data-reveal]'), { y: 22, stagger: 0.08 }))
})
</script>

<template>
  <header ref="root" class="head">
    <p data-reveal class="head__meta">
      <span class="head__index mono">{{ index }}</span>
      <span class="head__rule" />
      <span class="eyebrow">{{ eyebrow }}</span>
    </p>
    <h2 data-reveal class="head__title serif">
      {{ title }}
    </h2>
    <p v-if="lede" data-reveal class="head__lede">
      {{ lede }}
    </p>
  </header>
</template>

<style scoped>
.head { margin-bottom: clamp(2.5rem, 2rem + 3vw, 4rem); }

.head__meta {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.15rem;
}

.head__index { color: var(--accent); font-size: 0.72rem; }

.head__rule {
  width: clamp(28px, 6vw, 58px);
  height: 1px;
  background: var(--line-strong);
}

.head__title {
  font-size: var(--step-5);
  max-width: 20ch;
}

.head__lede {
  max-width: var(--measure);
  margin-top: 1.15rem;
  font-size: var(--step-1);
  font-weight: 300;
  color: var(--fg-dim);
}
</style>
