/* globals casper, setPixetorFromGrid, pixetorFrameEqualsGrid, isDrawerExpanded, getValue, isChecked, evalLine */

casper.test.begin('Test resize content works, and check the output', 18, function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);

  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    // Setup test Pixetor
    setPixetorFromGrid('[[B, T],' +
                      ' [T, B]]');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
    test.assertDoesntExist('.settings-section-resize', 'Check if resize settings drawer is closed');

    // Open resize panel.
    this.click('[data-setting="resize"]');
    this.waitForSelector('.settings-section-resize', onResizePanelReady, test.timeout, 10000);
  }

  function onResizePanelReady() {
    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-resize', 'Check if resize panel is opened');

    // Check resize inputs have the proper initial values
    test.assertEquals(getValue('[name="resize-width"]'), "2", 'Resize width is 2px');
    test.assertEquals(getValue('[name="resize-height"]'), "2", 'Resize height is 2px');
    // Check that the resize ratio checkbox is available and checked.
    test.assertExists('.resize-ratio-checkbox', 'Check if resize ratio checkbox is available');
    test.assert(isChecked('.resize-ratio-checkbox'), 'Keep ratio checkbox is checked');

    // Update width/height
    casper.sendKeys('[name="resize-width"]', casper.page.event.key.Backspace);
    casper.sendKeys('[name="resize-width"]', "4");
    // Check resize inputs have the proper value
    test.assertEquals(getValue('[name="resize-width"]'), "4", 'Resize width is 4px');
    test.assertEquals(getValue('[name="resize-height"]'), "4", 'Resize height is 4px');

    test.assertExists('.resize-content-checkbox', 'Check if resize ratio checkbox is available');
    test.assert(!isChecked('.resize-content-checkbox'), 'Keep content checkbox is unchecked');
    test.assertExists('.anchor-wrapper:not(.disabled)', 'Check the resize anchor widget is currently disabled');

    casper.click('.resize-content-checkbox');
    // Enabling "Resize content" will disabled the resize anchor widget.
    casper.waitForSelector('.anchor-wrapper.disabled', onResizeOriginDisabled, test.timeout, 10000);
  }

  function onResizeOriginDisabled() {
    casper.click('.resize-button');
    // Resizing the pixetor should close the panel automatically
    casper.waitForSelector('[data-pxtr-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 4, 'Pixetor width is now 4 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 4, 'Pixetor height is now 4 pixels');

    // Check that the pixetor content has been resized.
    test.assert(pixetorFrameEqualsGrid('[\
      [B, B, T, T],                     \
      [B, B, T, T],                     \
      [T, T, B, B],                     \
      [T, T, B, B],                     \
    ]', 0, 0), 'Resized pixetor content is as expected');
  }

  startTest(test, onTestStart);
});
