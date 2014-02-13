// for working with audio data

var levels,
    microphone;

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
      data[i] = Math.random();
      data[i+1] = 0.0;
      data[i+2] = 0.0;
      data[i+3] = 1.0; 
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

    microphone = context.createMediaStreamSource(stream);
    microphone.connect(context.destination);

    var analyser = context.createScriptProcessor(streamOpts.bufferSize, streamOpts.inputChannels, streamOpts.outputChannels);
    microphone.connect(analyser);

    analyser.connect(context.destination);

    // define audioDataProcessor outside onaudioprocess bc onaudioprocess is like a render loop
    analyser.onaudioprocess = window.audioProcess = audioDataProcessor;

    console.log('finished setting up audio');

  });
}

/* do textures since they're more accessible than buffers (glsl array indexing limitations)
 *
 */

function initAudioTexture() {

  audioTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);

  // these options are required for floating-point textures
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);

}

function updateAudioTexture(data) {
  gl.useProgram( currentProgram );

  gl.activeTexture(gl.TEXTURE11);               // 11 for no reason
  gl.bindTexture(gl.TEXTURE_2D, audioTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 2d coordinates to 3d coordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.FLOAT, data);
  
  gl.uniform1i(gl.getUniformLocation(currentProgram, 'audioTex'), 11);  // to the shader
}




