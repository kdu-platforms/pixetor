(function () {
  var ns = $.namespace('pxtr.tools.transform');

  ns.Flip = function () {
    this.toolId = 'tool-flip';
    this.helpText = 'Flip horizontally';
    this.tooltipDescriptors = [
      {key : 'alt', description : 'Flip vertically'},
      {key : 'ctrl', description : 'Apply to all layers'},
      {key : 'shift', description : 'Apply to all frames'}
    ];
  };

  pxtr.utils.inherit(ns.Flip, ns.AbstractTransformTool);

  ns.Flip.prototype.applyToolOnFrame_ = function (frame, altKey) {
    var axis;

    if (altKey) {
      axis = ns.TransformUtils.HORIZONTAL;
    } else {
      axis = ns.TransformUtils.VERTICAL;
    }

    ns.TransformUtils.flip(frame, axis);
  };

})();
