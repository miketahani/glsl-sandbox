// for working with audio data

var levels,
    liveSource;

var streamOptsDefaults = {
  bufferSize: 256,
  inputChannels: 1,
  outputChannels: 1
};


var processors = {

  defaultProcessor: function(e) {

    var buffer = e.inputBuffer.getChannelData(0);
    parameters.audio = buffer;

  },

  avgLevels: function(e) {
    
    var buffer = e.inputBuffer.getChannelData(0);
    var last = parameters.audio,
        curr = buffer,
        avg  = new Float32Array(n);

    var i = n;
    while (i--) {
      avg[i] = (last[i] + curr[i]) / 2;
    }

    parameters.audio = avg;
    
  },

  data2texture: function(e) {

    var buffer = e.inputBuffer.getChannelData(0);
    var b = 256 * 4;
    var data   = new Float32Array(b);
    
    for (var i = 0; i < b; i+=4) {
      var datum = (buffer[i/4] + 1) / 2;
      data[i] = datum;
      data[i+1] = 0;
      data[i+2] = 0;
      data[i+3] = 1; 
    }

    updateAudioTexture(data);

  }

};

function setupAudioStream(streamOpts, audioDataProcessor) {
  if (!streamOpts) streamOpts = streamOptsDefaults;
  if (!audioDataProcessor) 
    audioDataProcessor = processors.defaultProcessor;

  var context = new webkitAudioContext();  

  navigator.webkitGetUserMedia({audio: true}, function(stream) {

    liveSource = context.createMediaStreamSource(stream);
    liveSource.connect(context.destination);

    var levelChecker = context.createScriptProcessor(streamOpts.bufferSize, streamOpts.inputChannels, streamOpts.outputChannels);
    liveSource.connect(levelChecker);

    levelChecker.connect(context.destination);

    // define audioDataProcessor outside onaudioprocess bc onaudioprocess is like a render loop
    levelChecker.onaudioprocess = window.audioProcess = audioDataProcessor;

    console.log('finished setting up audio');

  });
}

/* textures are more accessible than buffers (glsl array indexing limitations).
 * https://developer.mozilla.org/en-US/docs/Web/WebGL/Animating_textures_in_WebGL
 */
function initAudioTexture() {
  audioTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


  // textureCoordAttribute = gl.getAttribLocation(currentProgram, "aTextureCoord");
  // gl.enableVertexAttribArray(textureCoordAttribute);

  gl.bindTexture(gl.TEXTURE_2D, null);
}

function updateAudioTexture(data) {
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.FLOAT, data); // XXX
  // gl.uniform1i(gl.getUniformLocation(currentProgram, "tex"), 11);
}




