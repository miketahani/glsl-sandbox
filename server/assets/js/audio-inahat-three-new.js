var renderhooks = [],
    mags = [],
    pCount = 128,
    textureOffset = 11,
    side = 16,
    dampener = 1,
    shaderData = new Float32Array(1024);

function initMic() {

  navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  navigator.getUserMedia_({
    audio: true
  }, startaudio, function() {});

  var context = new webkitAudioContext();
  var analyser = context.createAnalyser();

  console.log(context, analyser);

  function startaudio(stream) {
    var mediaStreamSource = context.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyser);

    renderhooks.push(function() {
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      var bin_size = Math.floor(data.length / pCount);

      for (var i = 0; i < pCount; i++) {
        var sum = 0;

        for (var j =0; j < bin_size; j++) {
          sum += data[(i * bin_size) + j];
        }

        var average = sum / bin_size;

        // var particle = particleSystem.geometry.vertices[i];
        var magnitude = average / 256;

        // emit magnitude
        mags[i] = magnitude;

        // shaderData[i] = magnitude;
        // shaderData[i+1] = 0;
        // shaderData[i+2] = 0;
        // shaderData[i+3] = 1;

          
      }
      // updateAudioTexture(shaderData);

    });
  }
}

function initAudioTexture() {

  audioTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);

  // NEAREST req'd for floating-point texture TEXTURE_{MIN/MAG}_FILTER
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);

}

function updateAudioTexture(data) {
  // console.log(data.length);

  gl.useProgram(currentProgram);

  gl.activeTexture(gl.TEXTURE0 + textureOffset);
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 2d coordinates to 3d coordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, side, side, 0, gl.RGBA, gl.FLOAT, data);
  
  gl.uniform1i(gl.getUniformLocation(currentProgram, 'audioTex'), textureOffset);  // to the shader
}

window.addEventListener('click', function(e) {
  console.log('clicked');
});
