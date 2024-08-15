import { emitter } from '@/main';
import { onBeforeUnmount, onMounted } from 'vue';

/**
 * Emits the `prepareSubmit` function to EmployeeForm
 * @param {*} tabId The key of the tab, as defined in the `tab` object in EmployeeForm
 * @param {*} func The prepareSubmit function
 */
export function usePrepareSubmit(tabId, func) {
  onMounted(() => {
    emitter.emit('edit-tab-opened', { name: tabId, value: { prepareSubmit: func } });
  });

  onBeforeUnmount(() => {
    emitter.emit('edit-tab-closed', { name: tabId });
  });

  onBeforeUnmount(async () => {
    await func();
  });
}
