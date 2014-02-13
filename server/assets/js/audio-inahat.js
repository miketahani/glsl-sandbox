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
    // var data   = new Uint8Array(b);  // r,g,b,a for each data point
    var data   = new Float32Array(b);
    for (var i = 0; i < b; i+=4) {
      data[i] = 0; //(buffer[i] + 1) / 2;
      data[i+1] = 0;
      data[i+2] = 0;
      data[i+3] = 0; 
    }
    // textureFromFloats(data);
    // var t = textureFromPixelArray(gl, data, 256, 1, true);
    var t = tff(data);

    // parameters.audioTex = t;

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