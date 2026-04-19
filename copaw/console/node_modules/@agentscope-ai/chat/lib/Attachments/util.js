// Follow code is copy from `antd/components/upload/utils.ts`:

export var isImageFileType = function isImageFileType(type) {
  return type.indexOf('image/') === 0;
};
var MEASURE_SIZE = 200;
export function previewImage(file) {
  return new Promise(function (resolve) {
    if (!file || !file.type || !isImageFileType(file.type)) {
      resolve('');
      return;
    }
    var img = new Image();
    img.onload = function () {
      var width = img.width,
        height = img.height;
      var ratio = width / height;
      var MEASURE_SIZE_WIDTH = ratio > 1 ? MEASURE_SIZE : MEASURE_SIZE * ratio;
      var MEASURE_SIZE_HEIGHT = ratio > 1 ? MEASURE_SIZE / ratio : MEASURE_SIZE;
      var canvas = document.createElement('canvas');
      canvas.width = MEASURE_SIZE_WIDTH;
      canvas.height = MEASURE_SIZE_HEIGHT;
      canvas.style.cssText = "position: fixed; left: 0; top: 0; width: ".concat(MEASURE_SIZE_WIDTH, "px; height: ").concat(MEASURE_SIZE_HEIGHT, "px; z-index: 9999; display: none;");
      document.body.appendChild(canvas);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, MEASURE_SIZE_WIDTH, MEASURE_SIZE_HEIGHT);
      var dataURL = canvas.toDataURL();
      document.body.removeChild(canvas);
      window.URL.revokeObjectURL(img.src);
      resolve(dataURL);
    };
    img.crossOrigin = 'anonymous';
    if (file.type.startsWith('image/svg+xml')) {
      var reader = new FileReader();
      reader.onload = function () {
        if (reader.result && typeof reader.result === 'string') {
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/gif')) {
      var _reader = new FileReader();
      _reader.onload = function () {
        if (_reader.result) {
          resolve(_reader.result);
        }
      };
      _reader.readAsDataURL(file);
    } else {
      img.src = window.URL.createObjectURL(file);
    }
  });
}