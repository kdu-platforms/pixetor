(function () {
  var ns = $.namespace('pxtr.controller.dialogs');

  var SHORTCUT_EDITING_CLASSNAME = 'cheatsheet-shortcut-editing';

  ns.CheatsheetController = function () {};

  pxtr.utils.inherit(ns.CheatsheetController, ns.AbstractDialogController);

  ns.CheatsheetController.prototype.init = function () {
    this.superclass.init.call(this);

    this.cheatsheetEl = document.getElementById('cheatsheetContainer');
    this.eventTrapInput = document.getElementById('cheatsheetEventTrap');

    this.addEventListener('.cheatsheet-restore-defaults', 'click', this.onRestoreDefaultsClick_);
    this.addEventListener(this.cheatsheetEl, 'click', this.onCheatsheetClick_);
    this.addEventListener(this.eventTrapInput, 'keydown', this.onEventTrapKeydown_);

    this.onShortcutsChanged_ = this.onShortcutsChanged_.bind(this);
    $.subscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_);

    this.initMarkup_();
    document.querySelector('.cheatsheet-helptext').setAttribute('title', this.getHelptextTitle_());
  };

  ns.CheatsheetController.prototype.destroy = function () {
    this.eventTrapInput.blur();

    $.unsubscribe(Events.SHORTCUTS_CHANGED, this.onShortcutsChanged_);
    this.cheatsheetEl = null;

    this.superclass.destroy.call(this);
  };

  ns.CheatsheetController.prototype.onRestoreDefaultsClick_ = function () {
    if (window.confirm('Replace all custom shortcuts by the default Pixetor shortcuts ?')) {
      pxtr.app.shortcutService.restoreDefaultShortcuts();
    }
  };

  ns.CheatsheetController.prototype.onShortcutsChanged_ = function () {
    this.initMarkup_();
  };

  ns.CheatsheetController.prototype.onCheatsheetClick_ = function (evt) {
    var shortcutEl = pxtr.utils.Dom.getParentWithData(evt.target, 'shortcutId');
    if (!shortcutEl) {
      pxtr.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      return;
    }

    var shortcutId = shortcutEl.dataset.shortcutId;
    var shortcut = pxtr.app.shortcutService.getShortcutById(shortcutId);

    if (shortcutEl.classList.contains(SHORTCUT_EDITING_CLASSNAME)) {
      pxtr.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      this.eventTrapInput.blur();
    } else if (shortcut.isEditable()) {
      pxtr.utils.Dom.removeClass(SHORTCUT_EDITING_CLASSNAME);
      shortcutEl.classList.add(SHORTCUT_EDITING_CLASSNAME);
      this.eventTrapInput.focus();
    }
  };

  ns.CheatsheetController.prototype.onEventTrapKeydown_ = function (evt) {
    var shortcutEl = document.querySelector('.' + SHORTCUT_EDITING_CLASSNAME);
    if (!shortcutEl) {
      return;
    }

    var shortcutKeyObject = pxtr.service.keyboard.KeyUtils.createKeyFromEvent(evt);
    if (!shortcutKeyObject) {
      return;
    }

    var shortcutKeyString = pxtr.service.keyboard.KeyUtils.stringify(shortcutKeyObject);
    var shortcutId = shortcutEl.dataset.shortcutId;
    var shortcut = pxtr.app.shortcutService.getShortcutById(shortcutId);
    pxtr.app.shortcutService.updateShortcut(shortcut, shortcutKeyString);

    shortcutEl.classList.remove(SHORTCUT_EDITING_CLASSNAME);
    this.eventTrapInput.blur();

    evt.preventDefault();
  };

  ns.CheatsheetController.prototype.initMarkup_ = function () {
    this.initMarkupForCategory_('TOOL', '.cheatsheet-tool-shortcuts', this.getToolIconClass_);
    this.initMarkupForCategory_('MISC', '.cheatsheet-misc-shortcuts');
    this.initMarkupForCategory_('COLOR', '.cheatsheet-color-shortcuts');
    this.initMarkupForCategory_('SELECTION', '.cheatsheet-selection-shortcuts');
    this.initMarkupForCategory_('STORAGE', '.cheatsheet-storage-shortcuts');
  };

  ns.CheatsheetController.prototype.getToolIconClass_ = function (shortcut) {
    return 'tool-icon cheatsheet-icon-' + shortcut.getId();
  };

  ns.CheatsheetController.prototype.initMarkupForCategory_ = function (category, container, iconClassProvider) {
    var shortcutMap = pxtr.service.keyboard.Shortcuts[category];

    var descriptors = Object.keys(shortcutMap).map(function (shortcutKey) {
      return this.toDescriptor_(shortcutMap[shortcutKey], iconClassProvider);
    }.bind(this));

    this.initMarkupForDescriptors_(descriptors, container);
  };

  ns.CheatsheetController.prototype.toDescriptor_ = function (shortcut, iconClassProvider) {
    var iconClass = typeof iconClassProvider == 'function' ? iconClassProvider(shortcut) : '';
    return {
      'shortcut' : shortcut,
      'iconClass' : iconClass
    };
  };

  ns.CheatsheetController.prototype.initMarkupForDescriptors_ = function (descriptors, containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) {
      return;
    }
    var markupArray = descriptors.map(this.getMarkupForDescriptor_.bind(this));
    container.innerHTML = markupArray.join('');
  };

  ns.CheatsheetController.prototype.getMarkupForDescriptor_ = function (descriptor) {
    var shortcutTemplate = pxtr.utils.Template.get('cheatsheet-shortcut-template');
    var shortcut = descriptor.shortcut;
    var description = shortcut.isCustom() ? shortcut.getDescription() + ' *' : shortcut.getDescription();

    var shortcutClasses = [];
    if (shortcut.isUndefined()) {
      shortcutClasses.push('cheatsheet-shortcut-undefined');
    }
    if (shortcut.isEditable()) {
      shortcutClasses.push('cheatsheet-shortcut-editable');
    }

    var title = shortcut.isEditable() ? 'Click to edit the key' : 'Shortcut cannot be remapped';

    var markup = pxtr.utils.Template.replace(shortcutTemplate, {
      id : shortcut.getId(),
      title : title,
      icon : descriptor.iconClass,
      description : description,
      // Avoid sanitization
      '!key!' : this.formatKey_(shortcut.getDisplayKey()),
      className : shortcutClasses.join(' ')
    });

    return markup;
  };

  ns.CheatsheetController.prototype.formatKey_ = function (key) {
    if (pxtr.utils.UserAgent.isMac) {
      key = key.replace('ctrl', 'cmd');
      key = key.replace('alt', 'option');
    }
    key = key.replace(/left/i, '&larr;');
    key = key.replace(/up/i, '&uarr;');
    key = key.replace(/right/i, '&rarr;');
    key = key.replace(/down/i, '&darr;');
    key = key.replace(/>/g, '&gt;');
    key = key.replace(/</g, '&lt;');
    // add spaces around '+' delimiters
    key = key.replace(/([^ ])\+([^ ])/g, '$1 + $2');
    return key;
  };

  ns.CheatsheetController.prototype.getHelptextTitle_ = function () {
    var helpItems = [
      'Click on a shortcut to change the key.',
      'When the shortcut blinks, press the key on your keyboard to assign it.',
      'White shortcuts can not be edited.',
      'Click on \'Restore default shortcuts\' to erase all custom shortcuts.'
    ];

    var helptextTitle = helpItems.reduce(function (p, n) {
      return p + '<div class="cheatsheet-helptext-tooltip-item">' + n + '</div>';
    }, '');
    helptextTitle = '<div class="cheatsheet-helptext-tooltip">' + helptextTitle + '</div>';
    return helptextTitle;
  };
})();
