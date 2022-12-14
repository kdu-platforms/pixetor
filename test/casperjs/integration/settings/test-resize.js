/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test resize feature works', 16 , function(test) {
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

    testResizePixetor();
  }

  function testResizePixetor() {
    test.assertExists('[name="resize-width"]', 'Check if width input is available');
    test.assertExists('[name="resize-height"]', 'Check if height input is available');

    test.assertEquals(getValue('[name="resize-width"]'), "32", 'Resize width is 32px');
    test.assertEquals(getValue('[name="resize-height"]'), "32", 'Resize height is 32px');

    // Check that the resize ratio checkbox is available and checked.
    test.assertExists('.resize-ratio-checkbox', 'Check if resize ratio checkbox is available');
    test.assert(casper.evaluate(function () {
      return document.querySelector('.resize-ratio-checkbox').checked;
    }), 'Keep ratio checkbox is checked');

    // Update width/height
    casper.sendKeys('[name="resize-width"]', "0");
    test.assertEquals(getValue('[name="resize-width"]'), "320", 'Resize width is 320px');
    test.assertEquals(getValue('[name="resize-height"]'), "320", 'Resize height is 320px');

    casper.click('.resize-button');
    // Resizing the pixetor should close the panel automatically
    casper.waitForSelector('[data-pxtr-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 320, 'Pixetor width is now 320 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 320, 'Pixetor height is now 320 pixels');
  }

  startTest(test, onTestStart);
});
