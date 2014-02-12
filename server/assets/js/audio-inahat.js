var levels,
    liveSource;

var streamOptsDefaults = {
  bufferSize: 4096,
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