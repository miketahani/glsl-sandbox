function Audio(params) {

  this.params = params;

  this.FFTSIZE       = params.fftsize || 512;
  this.BINSIZE       = params.binsize || 4;  // for averaging audio data
  this.FFTBINCOUNT   = ~~(this.FFTSIZE/2);
  this.BINCOUNT      = ~~(this.FFTBINCOUNT/this.BINSIZE);

  this.bins = params.avgAudioData ? this.BINCOUNT : this.FFTBINCOUNT;
  this.PIXELCOUNT    = this.bins * 4;
  this.SIDE          = ~~(Math.sqrt(this.bins));

  this.analyser = null;
  this.micReady = false;
  this.texReady = false;

  this.audioTexture = null;
  this.textureOffset = params.textureOffset || 11;

  // init microphone

  var audioContext = new webkitAudioContext();
  this.analyser = audioContext.createAnalyser();
  this.analyser.fftSize = this.FFTSIZE;

  var that = this;

  navigator.webkitGetUserMedia({audio: true}, function(stream) {
    
    var microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(that.analyser);

    that.micReady = true;

  });

}

Audio.prototype.processAudioData = function() {

  var audioData = new Uint8Array(this.analyser.frequencyBinCount);
  // this.analyser.getByteTimeDomainData(audioData);
  this.analyser.getByteFrequencyData(audioData);

  audioTextureData = new Float32Array(this.PIXELCOUNT);
  for (var i = 0; i < this.PIXELCOUNT; i+=4) {
    audioTextureData[i]   = audioData[i/4]/256;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }
  this.updateAudioTexture(audioTextureData);

};

Audio.prototype.processAudioDataMags = function() {

  var audioData = new Uint8Array(this.analyser.frequencyBinCount);
  // this.analyser.getByteTimeDomainData(audioData);  // raw
  this.analyser.getByteFrequencyData(audioData);   // smooth

  audioTextureData = new Float32Array(this.PIXELCOUNT);

  var bs = this.BINSIZE;

  for (var i = 0; i < this.PIXELCOUNT; i+=4) {

    var sum = 0;
    for (var j = 0; j < bs; j++) {
      sum += audioData[((i/4) * bs) + j];
    }
    var mag = (sum / bs) / 256;

    audioTextureData[i]   = mag;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }

  this.updateAudioTexture(audioTextureData);

};

// XXX i feel like this might smell really bad
Audio.prototype.go = function() {
  if (this.micReady && this.texReady) 
    Audio.prototype.go = this.params.avgAudioData
                       ? Audio.prototype.processAudioDataMags 
                       : Audio.prototype.processAudioData;
};

Audio.prototype.initAudioTexture = function() {

  this.audioTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.audioTexture);

  // NEAREST req'd for floating-point texture TEXTURE_{MIN/MAG}_FILTER
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.bindTexture(gl.TEXTURE_2D, null);

  this.texReady = true;

};

Audio.prototype.updateAudioTexture = function(data) {

  var tOffset  = this.textureOffset;
      side     = this.SIDE;

  gl.useProgram(currentProgram);
  gl.activeTexture(gl.TEXTURE0 + tOffset);
  gl.bindTexture(gl.TEXTURE_2D, this.audioTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 2d coordinates to 3d coordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, side, side, 0, gl.RGBA, gl.FLOAT, data);

  // gl.getUniformLocation(currentProgram, 'audioTex')
  gl.uniform1i(currentProgram.uniformsCache['audioTex'], tOffset);  // to the shader

};




