(function () {
  var ns = $.namespace('pxtr.service');

  ns.CurrentColorsService = function (pixetorController) {
    this.pixetorController = pixetorController;
    // cache of current colors by history state
    this.cache = {};
    this.currentColors = [];

    this.cachedFrameProcessor = new pxtr.model.frame.AsyncCachedFrameProcessor();
    this.cachedFrameProcessor.setFrameProcessor(this.getFrameColors_.bind(this));

    this.throttledUpdateCurrentColors_ = pxtr.utils.FunctionUtils.throttle(
      this.updateCurrentColors_.bind(this),
      1000
    );

    this.paletteService = pxtr.app.paletteService;
  };

  ns.CurrentColorsService.prototype.init = function () {
    $.subscribe(Events.HISTORY_STATE_SAVED, this.throttledUpdateCurrentColors_);
    $.subscribe(Events.HISTORY_STATE_LOADED, this.loadColorsFromCache_.bind(this));
  };

  ns.CurrentColorsService.prototype.getCurrentColors = function () {
    return this.currentColors;
  };

  ns.CurrentColorsService.prototype.setCurrentColors = function (colors) {
    var historyIndex = pxtr.app.historyService.currentIndex;
    this.cache[historyIndex] = colors;
    if (colors.join('') !== this.currentColors.join('')) {
      this.currentColors = colors;
      $.publish(Events.CURRENT_COLORS_UPDATED);
    }
  };

  ns.CurrentColorsService.prototype.isCurrentColorsPaletteSelected_ = function () {
    var paletteId = pxtr.UserSettings.get(pxtr.UserSettings.SELECTED_PALETTE);
    var palette = this.paletteService.getPaletteById(paletteId);

    return palette.id === Constants.CURRENT_COLORS_PALETTE_ID;
  };

  ns.CurrentColorsService.prototype.loadColorsFromCache_ = function () {
    var historyIndex = pxtr.app.historyService.currentIndex;
    var colors = this.cache[historyIndex];
    if (colors) {
      this.setCurrentColors(colors);
    } else {
      this.updateCurrentColors_();
    }
  };

  var batchAll = function (frames, job) {
    var batches = [];
    frames = frames.slice(0);
    while (frames.length) {
      batches.push(frames.splice(0, 10));
    }
    var result = Q([]);
    batches.forEach(function (batch) {
      result = result.then(function (results) {
        return Q.all(batch.map(job)).then(function (partials) {
          return results.concat(partials);
        });
      });
    });
    return result;
  };

  ns.CurrentColorsService.prototype.updateCurrentColors_ = function () {
    var layers = this.pixetorController.getLayers();

    // Concatenate all frames in a single array.
    var frames = layers.map(function (l) {
      return l.getFrames();
    }).reduce(function (p, n) {
      return p.concat(n);
    });

    batchAll(frames, function (frame) {
      return this.cachedFrameProcessor.get(frame);
    }.bind(this))
      .then(function (results) {
        var colors = {};
        results.forEach(function (result) {
          Object.keys(result).forEach(function (color) {
            colors[color] = true;
          });
        });
        // Remove transparent color from used colors
        delete colors[pxtr.utils.colorToInt(Constants.TRANSPARENT_COLOR)];

        var hexColors = Object.keys(colors).map(function (color) {
          return pxtr.utils.intToHex(color);
        });
        this.setCurrentColors(hexColors);
      }.bind(this));
  };

  ns.CurrentColorsService.prototype.isCurrentColorsPaletteSelected_ = function () {
    var paletteId = pxtr.UserSettings.get(pxtr.UserSettings.SELECTED_PALETTE);
    var palette = this.paletteService.getPaletteById(paletteId);

    return palette && palette.id === Constants.CURRENT_COLORS_PALETTE_ID;
  };

  ns.CurrentColorsService.prototype.loadColorsFromCache_ = function () {
    var historyIndex = pxtr.app.historyService.currentIndex;
    var colors = this.cache[historyIndex];
    if (colors) {
      this.setCurrentColors(colors);
    }
  };

  ns.CurrentColorsService.prototype.getFrameColors_ = function (frame, processorCallback) {
    var frameColorsWorker = new pxtr.worker.framecolors.FrameColors(frame,
      function (event) {
        processorCallback(event.data.colors);
      },
      function () {},
      function (event) {processorCallback({});}
    );

    frameColorsWorker.process();
  };
})();
