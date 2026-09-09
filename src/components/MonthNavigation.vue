<script setup lang="ts">
defineProps<{
    currentMonth: number
    currentYear: number
}>();

const emit = defineEmits<{
    previousMonth: []
    nextMonth: []
    goToToday: []
}>()

function getMonthName(monthIndex: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex] || 'Unknown';
}

function getTodayDate(): string {
    const today = new Date();
    const day = today.getDate();
    const month = getMonthName(today.getMonth());
    const year = today.getFullYear();
    return `${month} ${day}, ${year}`;
}
</script>

<template>
    <div class="space-y-3 sm:space-y-0 mb-4">
        <div class="text-center sm:text-left">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {{ getMonthName(currentMonth) }} {{ currentYear }}
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 mb-1">
                Today: {{ getTodayDate() }}
            </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
            <button @click="emit('previousMonth')"
                class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                ← Previous
            </button>

            <button @click="emit('goToToday')"
                class="px-4 py-2.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base font-medium">
                Today
            </button>

            <button @click="emit('nextMonth')"
                class="px-4 py-2.5 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm sm:text-base font-medium">
                Next →
            </button>
        </div>
    </div>
</template>
