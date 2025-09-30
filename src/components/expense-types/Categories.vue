<template>
  <v-row>
    <v-col v-if="expenseType.categories.length == 0" cols="12" class="ml-4 slim">
      <p>No categories.</p>
    </v-col>
    <v-col cols="12" v-else>
      <v-list>
        <v-list-item v-for="(category, index) in expenseType.categories" :key="index">
          <v-list-item-title>
            {{ category.name }}
            <v-dialog v-model="editModal[index]" title="Edit Category">
              <template #activator="{ props }">
                <v-btn :key="`edit-${index}`" small variant="text" icon="mdi-pencil-box-outline" v-bind="props">
                </v-btn>
              </template>
              <category-form
                :model="category"
                :expenseType="expenseType"
                :index="index"
                :subForm="subForm"
              ></category-form>
            </v-dialog>
            <v-btn
              :key="`delete-${index}`"
              small
              variant="text"
              @click="deleteModal[index] = true"
              icon="mdi-trash-can-outline"
            >
            </v-btn>
            <delete-modal
              :toggle-delete-modal="deleteModal[index]"
              type="category"
              :delete-info="`(${category.name})`"
              :delete-method="() => deleteCategory(index)"
            />
          </v-list-item-title>
          <v-list-item-subtitle v-if="!subForm" class="d-block">
            <boolean-flag displayText="Show On Feed" :field="category.showOnFeed"></boolean-flag>
            <boolean-flag displayText="Require URL" :field="category.requireURL"></boolean-flag>
            <boolean-flag displayText="Require Receipt" :field="category.requireReceipt"></boolean-flag>
            <p>
              <b>To: </b>
              <span v-if="category.to">{{ category.to }}</span>
              <span v-else>None</span>
            </p>
            <p>
              <b>CC: </b>
              <span v-if="category.cc">{{ category.cc }}</span>
              <span v-else>None</span>
            </p>
            <p>
              <b>BCC: </b>
              <span v-if="category.bcc">{{ category.bcc }}</span>
              <span v-else>None</span>
            </p>
            <p>
              <b>Reply-To: </b>
              <span v-if="category.replyTo">{{ category.replyTo }}</span>
              <span v-else>None</span>
            </p>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-col>
    <v-col cols="12" class="d-flex justify-center mb-3 slim">
      <v-dialog v-model="addModal" title="Create Category">
        <template #activator="{ props }">
          <add-primary title="Category" v-bind="props" :disabled="expenseType.categories.length === 10"></add-primary>
        </template>
        <category-form :model="newCategory" :expenseType="expenseType" :subForm="subForm"></category-form>
      </v-dialog>
    </v-col>
  </v-row>
</template>
<script setup>
import AddPrimary from '@/components/shared/buttons/AddPrimary.vue';
import BooleanFlag from '@/components/shared/Boolean.vue';
import CategoryForm from '@/components/expense-types/CategoryForm.vue';
import DeleteModal from '@/components/modals/DeleteModal.vue';
import { inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { Category } from '@/models/expense-types/category.js';

const emitter = inject('emitter');

const props = defineProps({
  expenseType: {
    type: Object,
    required: true
  },
  subForm: {
    type: Boolean,
    default: false
  }
});
const addModal = ref(false);
const editModal = ref({});
const deleteModal = ref({});

const newCategory = ref(new Category(props.expenseType, true));

onBeforeMount(() => {
  emitter.on('save-category', async () => {
    addModal.value = false;
    editModal.value = {};
    newCategory.value = new Category(props.expenseType, true);
  });
});

onBeforeUnmount(() => {
  emitter.off('save-category');
});

async function deleteCategory(index) {
  if (index !== -1) {
    props.expenseType.categories.splice(index, 1);
    await props.expenseType.updateCategories(props.expenseType.categories, !props.subForm);
  }
  deleteModal.value[index] = false;
}

watch(
  () => props.expenseType,
  () => {
    newCategory.value = new Category(props.expenseType, true);
  },
  { deep: true }
);
</script>
