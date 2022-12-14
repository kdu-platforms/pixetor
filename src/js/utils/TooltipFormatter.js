(function () {
  var ns = $.namespace('pxtr.utils');

  ns.TooltipFormatter = {};

  ns.TooltipFormatter.format = function(helpText, shortcut, descriptors) {
    var tpl = pxtr.utils.Template.get('tooltip-container-template');
    shortcut = shortcut ? '(' + shortcut.getDisplayKey() + ')' : '';
    return pxtr.utils.Template.replace(tpl, {
      helptext : helpText,
      shortcut : shortcut,
      // Avoid sanitization for descriptors (markup)
      '!descriptors!' : this.formatDescriptors_(descriptors)
    });
  };

  ns.TooltipFormatter.formatDescriptors_ = function(descriptors) {
    descriptors = descriptors || [];
    return descriptors.reduce(function (p, descriptor) {
      return p += this.formatDescriptor_(descriptor);
    }.bind(this), '');
  };

  ns.TooltipFormatter.formatDescriptor_ = function(descriptor) {
    var tpl;
    if (descriptor.key) {
      tpl = pxtr.utils.Template.get('tooltip-modifier-descriptor-template');
      descriptor.key = descriptor.key.toUpperCase();
      if (pxtr.utils.UserAgent.isMac) {
        descriptor.key = descriptor.key.replace('CTRL', 'CMD');
        descriptor.key = descriptor.key.replace('ALT', 'OPTION');
      }
    } else {
      tpl = pxtr.utils.Template.get('tooltip-simple-descriptor-template');
    }
    return pxtr.utils.Template.replace(tpl, descriptor);
  };
})();
