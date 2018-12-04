import _ from 'lodash';

import { NamedPage } from 'vj/misc/PageLoader';
import Notification from 'vj/components/notification';
import { ConfirmDialog, ActionDialog } from 'vj/components/dialog';

import request from 'vj/utils/request';
import tpl from 'vj/utils/tpl';
import delay from 'vj/utils/delay';
import i18n from 'vj/utils/i18n';

const page = new NamedPage('domain_manage_group', () => {
  const createGroupDialog = new ActionDialog({
    $body: $('.dialog__body--create-group > div'),
    onDispatch(action) {
      const $group = createGroupDialog.$dom.find('[name="group"]');
      if (action === 'ok' && $group.val() === '') {
        $group.focus();
        return false;
      }
      return true;
    },
  });
  createGroupDialog.clear = function () {
    this.$dom.find('[name="group"]').val('');
    return this;
  };

  function ensureAndGetSelectedGroups() {
    const groups = _.map(
      $('.domain-groups tbody [type="checkbox"]:checked'),
      ch => $(ch).closest('tr').attr('data-group'),
    );
    if (groups.length === 0) {
      Notification.error(i18n('Please select at least one group to perform this operation.'));
      return null;
    }
    return groups;
  }

  async function handleClickCreateGroup() {
    const action = await createGroupDialog.clear().open();
    if (action !== 'ok') {
      return;
    }
    const group = createGroupDialog.$dom.find('[name="group"]').val();
    try {
      await request.post('', {
        operation: 'add',
        group,
      });
      window.location.reload();
    } catch (error) {
      Notification.error(error.message);
    }
  }

  async function handleClickDeleteSelected() {
    const selectedGroups = ensureAndGetSelectedGroups();
    if (selectedGroups === null) {
      return;
    }
    const action = await new ConfirmDialog({
      $body: tpl`
        <div class="typo">
          <p>${i18n('Confirm deleting the selected groups?')}</p>
          <p>${i18n('Users with those groups will be remained with this group,' +
            'but you cannot manage them as a group or add new users to the group.')}</p>
        </div>`,
    }).open();
    if (action !== 'yes') {
      return;
    }
    try {
      await request.post('', {
        operation: 'delete',
        group: selectedGroups,
      });
      Notification.success(i18n('Selected groups have been deleted.'));
      await delay(2000);
      window.location.reload();
    } catch (error) {
      Notification.error(error.message);
    }
  }

  $('[name="create_group"]').click(() => handleClickCreateGroup());
  $('[name="delete_selected"]').click(() => handleClickDeleteSelected());
});

export default page;
