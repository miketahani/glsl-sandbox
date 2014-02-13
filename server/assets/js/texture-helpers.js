// texture helpers

// http://webglfactory.blogspot.com/2011/06/render-text-with-canvas-2d.html
function setTextureFromCanvas(audioCanvas, textTexture, idx) {
  gl.activeTexture(gl.TEXTURE0 + idx);
  gl.bindTexture(gl.TEXTURE_2D, textTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  // if (isPowerOfTwo(canvas.width) && isPowerOfTwo(canvas.height)){
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // } else {
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // } 

  gl.bindTexture(gl.TEXTURE_2D, textTexture);
  gl.uniform1i(shaderTextureIndices[idx], idx);  
}

function createTextureFromImage(image, offset, uniform) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, image);
  // if (isPowerOfTwo(image.width) &&
      // isPowerOfTwo(image.height)){
           gl.texParameteri(gl.TEXTURE_2D,
              gl.TEXTURE_MAG_FILTER, gl.NEAREST);
           gl.texParameteri(gl.TEXTURE_2D,
              gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // }else{
  // gl.texParameteri(gl.TEXTURE_2D,
                   // gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,
                   // gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,
                   // gl.CLAMP_TO_EDGE);
  // } 
  // texturesToLoad--;
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

// http://stackoverflow.com/questions/9046643/webgl-create-texture
function textureFromPixelArray(gl, dataArray, width, height, isTypedArray) {

  dataTypedArray = isTypedArray ? dataArray : new Uint8Array(dataArray);

  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);
  // Other texture setup here, like filter modes and mipmap generation
  return texture;
}

// 
function dataToTexture(audioCanvas) {
  var canvas2d = document.getElementById('textureData');
  gl.bindTexture(gl.TEXTURE_2D, myTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, audioCanvas);
}

// http://stackoverflow.com/questions/17262574/packing-vertex-data-into-a-webgl-texture
function textureFromFloats(data) {
  var vMapTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, vMapTexture);
  gl.uniform1i(gl.getUniformLocation(program, "audioTex"), 2);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 16, 16, 0, gl.RGB, gl.FLOAT, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function tff(data) {
  audioTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.FLOAT, data);

  return texture;
}
