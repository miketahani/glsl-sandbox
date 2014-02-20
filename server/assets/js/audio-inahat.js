// for working with audio data
// todo: clean this up

var levels,
    microphone,
    bufSize = 256,
    side = Math.sqrt(bufSize),
    textureOffset = 11;

var defaultStreamOpts = {
  bufferSize: bufSize,
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
    var b = bufSize * 4;  // RGBA
    var data   = new Float32Array(b);
    
    for (var i = 0; i < b; i+=4) {
      var datum = (buffer[i/4] + 1) / 2;
      data[i] = datum;
      data[i+1] = 0.0;
      data[i+2] = 0.0;
      data[i+3] = 1.0;
    }

    updateAudioTexture(data);

  }

};

function setupAudioStream(opts, audioDataProcessor) {

  if (!opts) {
    opts = defaultStreamOpts;
  } else {
    bufSize = opts.bufferSize;
    side    = Math.sqrt(bufSize);
  }

  if (!audioDataProcessor) 
    audioDataProcessor = processors.defaultProcessor;

  var context = new webkitAudioContext();  

  navigator.webkitGetUserMedia({audio: true}, function(stream) {

    microphone = context.createMediaStreamSource(stream);
    microphone.connect(context.destination);

    var analyser = context.createScriptProcessor(opts.bufferSize, opts.inputChannels, opts.outputChannels);
    microphone.connect(analyser);

    analyser.connect(context.destination);

    // define audioDataProcessor outside onaudioprocess bc onaudioprocess is like a render loop
    analyser.onaudioprocess = window.audioProcess = audioDataProcessor;

    console.log('finished setting up audio');

  });
}

// we're doing it live

// https://github.com/streunerlein/jsz-threejs
var renderhooks = [],
    magnitudes = [],
    count = 256,
    audioDataForShader = new Float32Array(1024);

function setupAudioStreamLazy() {

  navigator.webkitGetUserMedia({audio: true}, startaudio, function() {});

  var context = new webkitAudioContext();
  var analyser = context.createAnalyser();

  function startaudio(stream) {
    var mic = context.createMediaStreamSource(stream);
    mic.connect(analyser);

    // renderhooks.push(function() {
      var data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      var bin_size = Math.floor(data.length / count);

      for (var i = 0; i < count; i++) {
        var sum = 0;

        for (var j =0; j < bin_size; j++) {
          sum += data[(i * bin_size) + j];
        }
        var average = sum / bin_size;
        var magnitude = average / 256;
        magnitudes[i] = magnitude; // emit magnitude

        audioDataForShader[i] = magnitude;
        audioDataForShader[i+1] = 0.0;
        audioDataForShader[i+2] = 0.0;
        audioDataForShader[i+3] = 1.0;

        // var data   = new Float32Array(1024);
        //   for (var i = 0; i < 1024; i+=4) {
        //     var datum = (magnitudes[i/4] + 1) / 2;
        //     data[i] = datum;
        //     data[i+1] = 0.0;
        //     data[i+2] = 0.0;
        //     data[i+3] = 1.0;
        //   }
      }
      updateAudioTexture(audioDataForShader);
      console.log('hi');
    // });
  }
}



/* do textures since they're more accessible than buffers (glsl array indexing limitations)
 *
 */

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





