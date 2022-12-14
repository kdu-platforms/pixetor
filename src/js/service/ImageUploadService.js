(function () {
  var ns = $.namespace('pxtr.service');
  ns.ImageUploadService = function () {};
  ns.ImageUploadService.prototype.init = function () {};

  /**
   * Upload a base64 image data to distant service.
   * If successful, will call provided callback with the image URL as first argument;
   * @param {String} imageData base64 image data (such as the return value of canvas.toDataUrl())
   * @param {Function} success success callback. 1st argument will be the uploaded image URL
   * @param {Function} error error callback
   */
  ns.ImageUploadService.prototype.upload = function (imageData, success, error) {
    var data = {
      data : imageData
    };

    var protocol = pxtr.utils.Environment.isHttps() ? 'https' : 'http';
    var wrappedSuccess = function (response) {
      var getUrl = pxtr.utils.Template.replace(Constants.IMAGE_SERVICE_GET_URL, {
        protocol: protocol
      });
      success(getUrl + response.responseText);
    };

    var uploadUrl = pxtr.utils.Template.replace(Constants.IMAGE_SERVICE_UPLOAD_URL, {
      protocol: protocol
    });
    pxtr.utils.Xhr.post(uploadUrl, data, wrappedSuccess, error);
  };
})();
