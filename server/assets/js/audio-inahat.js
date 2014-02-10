var levels,
    liveSource;

var streamOptsDefaults = {
  bufferSize: 4096,
  inputChannels: 1,
  outputChannels: 1
};

function setupAudioStream(streamOpts, audioDataProcessor) {
  if (!streamOpts) streamOpts = streamOptsDefaults;
  if (!audioDataProcessor) {
    audioDataProcessor = function(e) {
      var buffer = e.inputBuffer.getChannelData(0);
      uniforms.audio = buffer;
    };
  }

  var context = new webkitAudioContext();  

  navigator.webkitGetUserMedia({audio: true}, function(stream) {

    liveSource = context.createMediaStreamSource(stream);
    liveSource.connect(context.destination);

    var levelChecker = context.createScriptProcessor(streamOpts.bufferSize, streamOpts.inputChannels, streamOpts.outputChannels);
    liveSource.connect(levelChecker);

    levelChecker.connect(context.destination);

    // defining these functions outside onaudioprocess because onaudioprocess is like a render loop
    // XXX how to do this?
    var processSingleChannel = function(e) {
      var buffer = e.inputBuffer.getChannelData(0);
    };
    var processTwoChannels = function(e) {
      var buffer = [e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1)];
    }

    levelChecker.onaudioprocess = window.audioProcess = audioDataProcessor;

    // levelChecker.onaudioprocess = window.audioProcess = function(e) {
    //   var buffer = e.inputBuffer.getChannelData(0);
    //   // var buffer = [e.inputBuffer.getChannelData(0), e.inputBuffer.getChannelData(1)];
    //   uniforms.audio = buffer;
    // };
  });
}