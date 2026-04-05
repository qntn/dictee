<template>
  <div class="min-h-screen bg-yellow-50">
    <nav class="bg-yellow-400 p-4 flex gap-6 text-lg font-bold">
      <RouterLink to="/" class="hover:underline">📋 Les dictées</RouterLink>
      <RouterLink to="/creer" class="hover:underline">✏️ Créer une dictée</RouterLink>
    </nav>
    <main class="p-6 max-w-2xl mx-auto">
      <RouterView />
    </main>
  </div>
</template>
