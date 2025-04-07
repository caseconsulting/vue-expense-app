import { updateStoreAvatars } from '@/utils/storeUtils';
import _find from 'lodash/find';

/**
 * Loads in basecamp avatars, setting them when finished
 */
export async function loadBasecampAvatars(store, employees) {
  await updateStoreAvatars();
  let avatars = store.getters.basecampAvatars;
  employees.forEach((employee) => {
    let avatar = _find(avatars, ['email_address', employee.email]);
    let avatarUrl = avatar ? avatar.avatar_url : null;
    employee.avatar = avatarUrl;
  });
}
