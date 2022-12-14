(function () {
  var ns = $.namespace('pxtr.controller.settings');

  var tabs = {
    'misc' : {
      template : 'templates/settings/preferences/misc.html',
      controller : ns.preferences.MiscPreferencesController
    },
    'grid' : {
      template : 'templates/settings/preferences/grid.html',
      controller : ns.preferences.GridPreferencesController
    },
    'tile' : {
      template : 'templates/settings/preferences/tile.html',
      controller : ns.preferences.TilePreferencesController
    }
  };

  ns.PreferencesController = function () {
    this.tabsWidget = new pxtr.widgets.Tabs(tabs, this, pxtr.UserSettings.PREFERENCES_TAB);
  };

  pxtr.utils.inherit(ns.PreferencesController, pxtr.controller.settings.AbstractSettingController);

  ns.PreferencesController.prototype.init = function() {
    var container = document.querySelector('.settings-section-preferences');
    this.tabsWidget.init(container);
  };

  ns.PreferencesController.prototype.destroy = function () {
    this.tabsWidget.destroy();
    this.superclass.destroy.call(this);
  };

})();
