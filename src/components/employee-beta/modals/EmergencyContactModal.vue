<template>
  <v-dialog max-width="800px">
    <template v-slot:default v-if="isAdmin || isUser">
      <v-card>
        <v-card-title class="d-flex align-center header_style">
          <v-container class="d-flex flex-nowrap justify-space-between">
            <h3 class="text-white">Emergency Contact info for {{ employeeName }}</h3>
            <v-spacer></v-spacer>
            <v-btn @click="emitter.emit('editing', 'Emergency Contacts')" density="comfortable" variant="text" icon="">
              <v-tooltip activator="parent" location="top"> Edit Emergency Contacts </v-tooltip>
              <v-icon id="edit" color="white"> mdi-pencil </v-icon>
            </v-btn>
          </v-container>
        </v-card-title>
        <v-card-text class="my-6">
          <v-row v-if="contacts.length == 0">
            <strong class="mx-auto">No Emergency Contact information provided</strong>
          </v-row>
          <v-row v-for="(contact, index) in contacts" :key="index">
            <!-- basic info -->
            <v-col cols="12" class="py-0">
              <h3 v-if="!_isEmpty(contact.name)" class="d-inline mb-0">{{ contact.name }}</h3>
              <h3 v-else class="font-italic">No name provided</h3>
              <p v-if="!_isEmpty(contact.relationship)" class="d-inline ml-2 font-italic mb-0">
                {{ contact.relationship }}
              </p>
              <p v-if="isPrimary(index)" class="text-overline text-primary my-0">Primary Contact</p>
              <p v-else><!-- just for spacing --></p>
            </v-col>

            <!-- contact info -->
            <v-col cols="6" class="py-0">
              <p
                v-if="
                  hasNone(
                    index,
                    contactMethods.map((m) => m.key)
                  )
                "
                class="font-italic"
              >
                <strong>No phone/email information provided</strong>
              </p>
              <p v-else class="my-0"><strong>Contact:</strong></p>
              <div v-for="method of contactMethods" :key="method.key">
                <p v-if="contact[method.key]" class="my-0">
                  <strong>{{ method.name }}: </strong>{{ contact[method.key] }}
                </p>
              </div>
            </v-col>

            <!-- address -->
            <v-col cols="6" class="py-0">
              <p
                v-if="hasNone(index, ['addressLine1', 'addressLine2', 'city', 'state', 'zipcode', 'country'])"
                class="font-italic"
              >
                <strong>No address information provided</strong>
              </p>
              <p v-else class="my-0"><strong>Address:</strong></p>
              <p class="my-0" v-if="contact.addressLine1">{{ contact.addressLine1 }}</p>
              <p class="my-0" v-if="contact.addressLine2">{{ contact.addressLine2 }}</p>
              <p class="my-0">
                <span class="maybe-comma" v-if="contact.city">{{ contact.city }}</span>
                <span class="maybe-comma" v-if="contact.state">{{ contact.state }}</span>
                <span v-if="contact.zipcode">{{ contact.zipcode }}</span>
              </p>
              <p class="my-0" v-if="contact.country && contact.country !== 'United States'">{{ contact.country }}</p>
            </v-col>

            <v-divider v-if="index < contacts.length - 1" class="border-opacity-25 mb-6 mt-4" thickness="3" />
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, onMounted, inject } from 'vue';
import _isEmpty from 'lodash/isEmpty';

const isAdmin = inject('isAdmin');
const isUser = inject('isUser');
const props = defineProps(['model']);
const contacts = ref(props.model.emergencyContacts || []);
const employeeName = ref(`${props.model.nickname || props.model.firstName} ${props.model.lastName}`);
const primaryContactIndex = ref(-1);
const contactMethods = ref([
  {
    name: 'Mobile Phone',
    key: 'mobilePhone'
  },
  {
    name: 'Home Phone',
    key: 'homePhone'
  },
  {
    name: 'Work Phone',
    key: 'workPhone'
  },
  {
    name: 'Email',
    key: 'email'
  }
]);

onMounted(() => {
  // Extract primary emergency contact, either one labeled as such or the only contact in list
  for (let i = 0; i < contacts.value.length; i++) {
    if (contacts.value[i].primaryContact || contacts.value.length == 1) primaryContactIndex.value = i;
  }
  if (primaryContactIndex.value >= 0) {
    let primaryContact = contacts.value.splice(primaryContactIndex.value, 1)[0];
    contacts.value.unshift(primaryContact);
  }
});

/**
 * Returns true if the index corresponds to the primary contact as discovered
 * in onMounted()
 *
 * @param index index of contact in contacts array
 * @return true if primary contact
 */
function isPrimary(index) {
  return primaryContactIndex.value != -1 && index === 0;
}

/**
 * Returns true if there is none of the values specified in contact from the array
 *
 * @param index index of contact to check
 * @param attrs array of values to check in contact
 * @return true if all attributes are empty
 */
function hasNone(index, attrs) {
  let contact = contacts.value[index];
  for (let attr of attrs) if (!_isEmpty(contact[attr])) return false;
  return true;
}
</script>

<style scoped>
.header-style {
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.25 !important;
  letter-spacing: 0.0073529412em;
}
.no-overflow {
  white-space: initial;
}
.maybe-comma:not(:last-of-type)::after {
  content: ', ';
}
</style>
