(function () {
  var ns = $.namespace('pxtr.service.pensize');

  var MIN_PENSIZE = 1;
  var MAX_PENSIZE = 32;

  /**
   * Service to retrieve and modify the current pen size.
   */
  ns.PenSizeService = function () {
    this.size = MIN_PENSIZE;
  };

  ns.PenSizeService.prototype.init = function () {
    this.size = pxtr.UserSettings.get(pxtr.UserSettings.PEN_SIZE);

    var shortcuts = pxtr.service.keyboard.Shortcuts;
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.INCREASE_PENSIZE, this.increasePenSize_.bind(this));
    pxtr.app.shortcutService.registerShortcut(shortcuts.MISC.DECREASE_PENSIZE, this.decreasePenSize_.bind(this));
  };

  ns.PenSizeService.prototype.increasePenSize_ = function () {
    this.setPenSize(this.size + 1);
  };

  ns.PenSizeService.prototype.decreasePenSize_ = function () {
    this.setPenSize(this.size - 1);
  };

  ns.PenSizeService.prototype.getPenSize = function () {
    return this.size;
  };

  ns.PenSizeService.prototype.setPenSize = function (size) {
    if (this.isPenSizeValid_(size) && size != this.size) {
      this.size = size;
      pxtr.UserSettings.set(pxtr.UserSettings.PEN_SIZE, size);
      $.publish(Events.PEN_SIZE_CHANGED);
    }
  };

  ns.PenSizeService.prototype.isPenSizeValid_ = function (size) {
    if (isNaN(size)) {
      return false;
    }

    return size >= MIN_PENSIZE && size <= MAX_PENSIZE;
  };

})();
