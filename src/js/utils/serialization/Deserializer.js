(function () {
  var ns = $.namespace('pxtr.utils.serialization');

  ns.Deserializer = function (data, callback) {
    this.layersToLoad_ = 0;
    this.data_ = data;
    this.callback_ = callback;
    this.pixetor_ = null;
    this.layers_ = [];
  };

  ns.Deserializer.deserialize = function (data, onSuccess, onError) {
    try {
      var deserializer;
      if (data.modelVersion == Constants.MODEL_VERSION) {
        deserializer = new ns.Deserializer(data, onSuccess);
      } else if (data.modelVersion == 1) {
        deserializer = new ns.backward.Deserializer_v1(data, onSuccess);
      } else {
        deserializer = new ns.backward.Deserializer_v0(data, onSuccess);
      }
      deserializer.deserialize();
    } catch (e) {
      console.error(e);
      if (typeof onError === 'function') {
        onError(e);
      }
    }
  };

  ns.Deserializer.prototype.deserialize = function () {
    var data = this.data_;
    var pixetorData = data.pixetor;
    var name = pixetorData.name || 'Deserialized pixetor';
    var description = pixetorData.description || '';
    var fps = typeof pixetorData.fps != 'undefined' ? pixetorData.fps : 12;

    var descriptor = new pxtr.model.pixetor.Descriptor(name, description);
    this.pixetor_ = new pxtr.model.Pixetor(pixetorData.width, pixetorData.height, fps, descriptor);
    this.hiddenFrames = pixetorData.hiddenFrames || [];

    this.layersToLoad_ = pixetorData.layers.length;
    pixetorData.layers.forEach(this.deserializeLayer.bind(this));
  };

  ns.Deserializer.prototype.deserializeLayer = function (layerString, index) {
    var layerData = JSON.parse(layerString);
    var layer = new pxtr.model.Layer(layerData.name);
    layer.setOpacity(layerData.opacity);

    // Backward compatibility: if the layerData is not chunked but contains a single base64PNG,
    // create a fake chunk, expected to represent all frames side-by-side.
    if (typeof layerData.chunks === 'undefined' && layerData.base64PNG) {
      this.normalizeLayerData_(layerData);
    }

    var chunks = layerData.chunks;

    // Prepare a frames array to store frame objects extracted from the chunks.
    var frames = [];
    Q.all(chunks.map(function (chunk) {
      // Create a promise for each chunk.
      var deferred = Q.defer();
      var image = new Image();
      // Load the chunk image in an Image object.
      image.onload = function () {
        // extract the chunkFrames from the chunk image
        var chunkFrames = pxtr.utils.FrameUtils.createFramesFromChunk(image, chunk.layout);
        // add each image to the frames array, at the extracted index
        chunkFrames.forEach(function (chunkFrame) {
          frames[chunkFrame.index] = chunkFrame.frame;
        });
        deferred.resolve();
      };
      image.src = chunk.base64PNG;
      return deferred.promise;
    })).then(function () {
      frames.forEach(function (frame) {
        layer.addFrame(frame);
      });
      this.layers_[index] = layer;
      this.onLayerLoaded_();
    }.bind(this)).catch(function (error) {
      console.error('Failed to deserialize layer');
      console.error(error);
    });

    return layer;
  };

  ns.Deserializer.prototype.onLayerLoaded_ = function () {
    this.layersToLoad_ = this.layersToLoad_ - 1;
    if (this.layersToLoad_ === 0) {
      this.layers_.forEach(function (layer) {
        this.pixetor_.addLayer(layer);
      }.bind(this));
      this.pixetor_.hiddenFrames = this.hiddenFrames;
      this.callback_(this.pixetor_);
    }
  };

  /**
   * Backward comptibility only. Create a chunk for layerData objects that only contain
   * an single base64PNG without chunk/layout information.
   */
  ns.Deserializer.prototype.normalizeLayerData_ = function (layerData) {
    var layout = [];
    for (var i = 0 ; i < layerData.frameCount ; i++) {
      layout.push([i]);
    }
    layerData.chunks = [{
      base64PNG : layerData.base64PNG,
      layout : layout
    }];
  };
})();
