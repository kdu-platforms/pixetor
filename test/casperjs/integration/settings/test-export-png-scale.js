/* globals casper, setPixetorFromGrid, isDrawerExpanded, getValue, isChecked,
   evalLine, waitForEvent, pixetorFrameEqualsGrid, replaceFunction, setPixetorFromImageSrc */

// PNG export will be tested with single frame export and spritesheet export.
// This global variable will be set before starting each test.
var testButtonClass;

casper.test.begin('PNG export test, with 2x scaling', 32, function(test) {
  test.timeout = test.fail.bind(test, ['Test timed out']);
  function onTestStart() {
    test.assertExists('#drawing-canvas-container canvas', 'Pixetor ready, test starting');

    test.assert(!isDrawerExpanded(), 'settings drawer is closed');

        // Setup test Pixetor
    setPixetorFromGrid('['+
      '[B, T],' +
      '[T, B],' +
    ']');

    // Open export panel.
    test.assertDoesntExist('.settings-section-export', 'Check if export panel is closed');
    casper.click('[data-setting="export"]');

    casper.waitForSelector('.settings-section-export', onExportPanelReady, test.timeout, 10000);
  }

  function onExportPanelReady() {
    casper.echo('Export panel ready');

    test.assert(isDrawerExpanded(), 'settings drawer is expanded');
    test.assertExists('.settings-section-export', 'Check if export panel is opened');

    // Switch to PNG export tab.
    test.assertDoesntExist('.export-panel-png', 'Check if PNG export panel is hidden');
    casper.click('[data-tab-id="png"]');

    casper.waitForSelector('.export-panel-png', onPngExportTabReady, test.timeout, 10000);
  }

  function onPngExportTabReady() {
    casper.echo('Png export tab ready');

    replaceFunction(test,
      'pxtr.controller.settings.exportimage.PngExportController.prototype.downloadCanvas_',
      function (canvas) {
        window.casperImageData = canvas.toDataURL('image/png');
        var el = document.createElement("div");
        el.id = "casper-imagedata-ready";
        document.body.appendChild(el);
      }
    );

    casper.echo('Test that the scaling works');

    test.assertExists('[name="resize-width"]', 'The resize width input is available');
    casper.sendKeys('[name="resize-width"]', casper.page.event.key.Backspace);
    casper.sendKeys('[name="resize-width"]', "4");

    // Check the scale and height inputs have been synchronized as expected.
    test.assertEquals(getValue('[name="scale-input"]'), "2", 'Resize scale is 2');
    test.assertEquals(getValue('[name="resize-height"]'), "4", 'Resize height is 4px');
    test.assertEquals(getValue('[name="resize-height"]'), "4", 'Resize height is 4px');

    casper.echo('Clicking on the export button');
    casper.click(testButtonClass);

    casper.echo('Wait for #casper-imagedata-ready');
    casper.waitForSelector('#casper-imagedata-ready', onImageDataReady, test.timeout, 10000);
  }

  function onImageDataReady() {
    casper.echo('Found casper-imagedata-ready element');

    // cleanup
    casper.evaluate(function () {
      document.body.removeChild(document.getElementById('casper-imagedata-ready'));
    });

    var imageData = evalLine('window.casperImageData');

    // Check the exported gif is valid
    test.assert(imageData.indexOf('data:image/png;base64') === 0, 'The png image data was generated');

    // Recreate a new pixetor from the source
    waitForEvent('PIXETOR_RESET', onPixetorReset, test.timeout);
    setPixetorFromImageSrc(imageData);
  }

  function onPixetorReset() {
    casper.echo('Received PIXETOR_RESET event after loading pixetor from scaled GIF source');

    // Check the expected pixetor was correctly loaded.
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getWidth()'), 4, 'Pixetor width is now 4 pixels');
    test.assertEquals(evalLine('pxtr.app.pixetorController.getPixetor().getHeight()'), 4, 'Pixetor height is now 4 pixels');

    // Check that the pixetor content has been resized.
    test.assert(pixetorFrameEqualsGrid('['+
      '[B, B, T, T],' +
      '[B, B, T, T],' +
      '[T, T, B, B],' +
      '[T, T, B, B],' +
    ']', 0, 0), 'Scaled pixetor content is as expected');

    // Click on export again to close the settings drawer.
    casper.click('[data-setting="export"]');
    casper.waitForSelector('[data-pxtr-controller="settings"]:not(.expanded)', onDrawerClosed, test.timeout, 10000);
  }

  function onDrawerClosed() {
    test.assert(!isDrawerExpanded(), 'settings drawer is closed');
  }

  casper.echo("Test with spritesheet PNG export");
  testButtonClass = '.png-download-button';
  startTest(test, onTestStart).then(function () {
    casper.echo("Test with single frame PNG export");
    testButtonClass = '.selected-frame-download-button';
    startTest(test, onTestStart);
  });
});
