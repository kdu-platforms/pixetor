describe("TransformUtils suite", function() {
  var A = '#000000';
  var B = '#ff0000';
  var O = Constants.TRANSPARENT_COLOR;

  var HORIZONTAL = pxtr.tools.transform.TransformUtils.HORIZONTAL;
  var VERTICAL = pxtr.tools.transform.TransformUtils.VERTICAL;

  var CLOCKWISE = pxtr.tools.transform.TransformUtils.CLOCKWISE;
  var COUNTERCLOCKWISE = pxtr.tools.transform.TransformUtils.COUNTERCLOCKWISE;

  // shortcuts
  var frameEqualsGrid = test.testutils.frameEqualsGrid;
  var toFrameGrid = test.testutils.toFrameGrid;

  /*******************************/
  /************ FLIP *************/
  /*******************************/

  it("flips a frame vertically", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [O, B]
    ]));

    // should have flipped
    pxtr.tools.transform.TransformUtils.flip(frame, VERTICAL);
    frameEqualsGrid(frame, [
      [O, A],
      [B, O]
    ]);
  });

  it("flips a frame horizontally", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [O, B]
    ]));

    // should have flipped
    pxtr.tools.transform.TransformUtils.flip(frame, HORIZONTAL);
    frameEqualsGrid(frame, [
      [O, B],
      [A, O]
    ]);
  });

  it("flips rectangular frame", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [A, O],
      [A, O]
    ]));

    // should have flipped
    pxtr.tools.transform.TransformUtils.flip(frame, VERTICAL);
    frameEqualsGrid(frame, [
      [O, A],
      [O, A],
      [O, A]
    ]);

    // should be the same
    pxtr.tools.transform.TransformUtils.flip(frame, HORIZONTAL);
    frameEqualsGrid(frame, [
      [O, A],
      [O, A],
      [O, A]
    ]);
  });

  /*******************************/
  /*********** ROTATE ************/
  /*******************************/

  it("rotates a frame counterclockwise", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [O, B]
    ]));

    // rotate once
    pxtr.tools.transform.TransformUtils.rotate(frame, COUNTERCLOCKWISE);
    frameEqualsGrid(frame, [
      [O, B],
      [A, O]
    ]);

    // rotate twice
    pxtr.tools.transform.TransformUtils.rotate(frame, COUNTERCLOCKWISE);
    frameEqualsGrid(frame, [
      [B, O],
      [O, A]
    ]);

    // rotate 3
    pxtr.tools.transform.TransformUtils.rotate(frame, COUNTERCLOCKWISE);
    frameEqualsGrid(frame, [
      [O, A],
      [B, O]
    ]);

    // rotate 4 - back to initial state
    pxtr.tools.transform.TransformUtils.rotate(frame, COUNTERCLOCKWISE);
    frameEqualsGrid(frame, [
      [A, O],
      [O, B]
    ]);
  });

  it("rotates a frame clockwise", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [O, B]
    ]));

    // rotate once
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, A],
      [B, O]
    ]);

    // rotate twice
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [B, O],
      [O, A]
    ]);

    // rotate 3
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, B],
      [A, O]
    ]);

    // rotate 4 - back to initial state
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [A, O],
      [O, B]
    ]);
  });

  it("rotates a rectangular frame", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, O],
      [A, O],
      [B, O],
      [B, O]
    ]));

    // rotate once
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O],
      [B, A],
      [O, O],
      [O, O]
    ]);

    // rotate twice
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O],
      [O, B],
      [O, A],
      [O, O]
    ]);

    // rotate 3
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O],
      [O, O],
      [A, B],
      [O, O]
    ]);

    // rotate 4
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O],
      [A, O],
      [B, O],
      [O, O]
    ]);
  });

  it("rotates a rectangular (horizontal) frame", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [O, O, O, O],
      [A, A, B, B]
    ]));

    // rotate once
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, A, O, O],
      [O, B, O, O]
    ]);

    // rotate twice
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, B, A, O],
      [O, O, O, O]
    ]);

    // rotate 3
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O, B, O],
      [O, O, A, O]
    ]);

    // rotate 4
    pxtr.tools.transform.TransformUtils.rotate(frame, CLOCKWISE);
    frameEqualsGrid(frame, [
      [O, O, O, O],
      [O, A, B, O]
    ]);
  });

  /*******************************/
  /*********** CENTER ************/
  /*******************************/

  it("centers a frame", function () {
    // create frame
    var frame = pxtr.model.Frame.fromPixelGrid(toFrameGrid([
      [A, B, O, O],
      [B, A, O, O],
      [O, O, O, O],
      [O, O, O, O]
    ]));

    // should be centered
    pxtr.tools.transform.TransformUtils.center(frame);
    frameEqualsGrid(frame, [
      [O, O, O, O],
      [O, A, B, O],
      [O, B, A, O],
      [O, O, O, O]
    ]);
  });

});
