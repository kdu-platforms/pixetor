(function () {
  var ns = $.namespace('pxtr.controller.dialogs');

  ns.AbstractDialogController = function () {};

  ns.AbstractDialogController.prototype.init = function () {
    var closeButton = document.querySelector('.dialog-close');
    this.addEventListener(closeButton, 'click', this.closeDialog);
  };

  ns.AbstractDialogController.prototype.addEventListener = function (el, type, cb) {
    pxtr.utils.Event.addEventListener(el, type, cb, this);
  };

  ns.AbstractDialogController.prototype.destroy = function () {
    pxtr.utils.Event.removeAllEventListeners(this);
  };

  ns.AbstractDialogController.prototype.closeDialog = function () {
    $.publish(Events.DIALOG_HIDE);
  };

  ns.AbstractDialogController.prototype.setTitle = function (title) {
    var dialogTitle = document.querySelector('.dialog-title');
    if (dialogTitle) {
      dialogTitle.innerText = title;
    }
  };
})();
