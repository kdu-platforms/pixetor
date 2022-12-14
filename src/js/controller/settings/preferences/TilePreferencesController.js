(function () {
  var ns = $.namespace('pxtr.controller.settings.preferences');

  ns.TilePreferencesController = function (pixetorController, preferencesController) {
    this.pixetorController = pixetorController;
    this.preferencesController = preferencesController;
  };

  pxtr.utils.inherit(ns.TilePreferencesController, pxtr.controller.settings.AbstractSettingController);

  ns.TilePreferencesController.prototype.init = function () {
    // Tile mode
    var tileMode = pxtr.UserSettings.get(pxtr.UserSettings.SEAMLESS_MODE);
    var tileModeCheckbox = document.querySelector('.tile-mode-checkbox');
    if (tileMode) {
      tileModeCheckbox.setAttribute('checked', tileMode);
    }
    this.addEventListener(tileModeCheckbox, 'change', this.onTileModeChange_);

    // Tile mask opacity
    var tileMaskOpacityInput = document.querySelector('.tile-mask-opacity-input');
    tileMaskOpacityInput.value = pxtr.UserSettings.get(pxtr.UserSettings.SEAMLESS_OPACITY);
    this.addEventListener(tileMaskOpacityInput, 'change', this.onTileMaskOpacityChange_);
    this.addEventListener(tileMaskOpacityInput, 'input', this.onTileMaskOpacityChange_);
    this.updateTileMaskOpacityText_(tileMaskOpacityInput.value);
  };

  ns.TilePreferencesController.prototype.onTileModeChange_ = function (evt) {
    pxtr.UserSettings.set(pxtr.UserSettings.SEAMLESS_MODE, evt.currentTarget.checked);
  };

  ns.TilePreferencesController.prototype.onTileMaskOpacityChange_ = function (evt) {
    var target = evt.target;
    var opacity = parseFloat(target.value);
    if (!isNaN(opacity)) {
      pxtr.UserSettings.set(pxtr.UserSettings.SEAMLESS_OPACITY, opacity);
      this.updateTileMaskOpacityText_(opacity);
    } else {
      target.value = pxtr.UserSettings.get(pxtr.UserSettings.SEAMLESS_OPACITY);
    }
  };

  ns.TilePreferencesController.prototype.updateTileMaskOpacityText_ = function (opacity) {
    var seamlessOpacityText = document.querySelector('.tile-mask-opacity-text');
    seamlessOpacityText.innerHTML = (opacity * 1).toFixed(2);
  };
})();
