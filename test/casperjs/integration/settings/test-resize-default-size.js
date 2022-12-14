/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test updating default size works', 14 , function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
    test.assertDoesntExist('.settings-section-resize', 'Check if resize settings drawer is closed');

    // Open resize panel.
    this.click('[data-setting="resize"]');
    this.waitForSelector('.settings-section-resize', onResizePanelReady, test.timeout, 10000);
  }

  function onResizePanelReady() {
    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-resize', 'Check if resize panel is opened');

    testSetDefaultSize();
  }

  function testSetDefaultSize() {
    test.assertExists('[name="default-width"]', 'Check if width input is available');
    test.assertExists('[name="default-height"]', 'Check if height input is available');

    test.assertEquals(getValue('[name="default-width"]'), "32", 'Default width is 32px');
    test.assertEquals(getValue('[name="default-height"]'), "32", 'Default height is 32px');

    // Update width/height
    casper.sendKeys('[name="default-width"]', "1");
    casper.sendKeys('[name="default-height"]', "2");
    test.assertEquals(getValue('[name="default-width"]'), "321", 'Default width is 321px');
    test.assertEquals(getValue('[name="default-height"]'), "322", 'Default height is 322px');

    casper.click('.default-size-button');
    // Changing the pixetor default size should close the panel automatically
    casper.waitForSelector('[data-pxtr-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    test.assertEquals(evalLine('pxtr.UserSettings.get("DEFAULT_SIZE").width'),
      321, 'Pixetor width is now 321 pixels');

    test.assertEquals(evalLine('pxtr.UserSettings.get("DEFAULT_SIZE").height'),
      322, 'Pixetor height is now 322 pixels');
  }

  startTest(test, onTestStart);
});
