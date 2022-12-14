(function () {
  var ns = $.namespace('pxtr.widgets');

  ns.SynchronizedInputs = function (options) {
    this.leftInput = options.leftInput;
    this.rightInput = options.rightInput;
    this.synchronize = options.synchronize;

    this.syncEnabled = true;
    this.lastInput = this.leftInput;

    pxtr.utils.Event.addEventListener(this.leftInput, 'input', this.onInput_, this);
    pxtr.utils.Event.addEventListener(this.rightInput, 'input', this.onInput_, this);
  };

  ns.SynchronizedInputs.prototype.destroy = function () {
    pxtr.utils.Event.removeAllEventListeners(this);

    this.leftInput = null;
    this.rightInput = null;
    this.lastInput = null;
  };

  ns.SynchronizedInputs.prototype.enableSync = function () {
    this.syncEnabled = true;
    this.synchronize(this.lastInput);
  };

  ns.SynchronizedInputs.prototype.disableSync = function () {
    this.syncEnabled = false;
  };

  ns.SynchronizedInputs.prototype.onInput_ = function (evt) {
    var target = evt.target;
    if (this.syncEnabled) {
      this.synchronize(target);
    }
    this.lastInput = target;
  };
})();
