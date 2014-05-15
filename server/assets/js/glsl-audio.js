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


  // for audio decay (data processing function)
  // create an array of zeroes (this will hold the previous buffer data for comparison)
  this.audioBuffer = Array.apply(null, Array(this.FFTBINCOUNT)).map(Number.prototype.valueOf,0);

  var that = this;

  navigator.webkitGetUserMedia({audio: true}, function(stream) {
    
    var microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(that.analyser);

    that.micReady = true;

  });

}

//  audio processing playground

Audio.prototype.processAudioBuffer = function() {

  var audioBuffer = new Uint8Array(this.FFTBINCOUNT);
  // this.analyser.getByteTimeDomainData(audioBuffer);
  this.analyser.getByteFrequencyData(audioBuffer);

  var audioTextureData = new Float32Array(this.PIXELCOUNT);
  for (var i = 0; i < this.PIXELCOUNT; i+=4) {
    audioTextureData[i]   = audioBuffer[i/4]/256;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }
  this._updateAudioTexture(audioTextureData);
};

Audio.prototype.processAudioBufferMags = function() {

  var audioBuffer = new Uint8Array(this.FFTBINCOUNT);
  // this.analyser.getByteTimeDomainData(audioBuffer);  // raw
  this.analyser.getByteFrequencyData(audioBuffer);   // smooth

  var audioTextureData = new Float32Array(this.PIXELCOUNT),
      bs = this.BINSIZE;

  for (var i = 0; i < this.PIXELCOUNT; i+=4) {

    var sum = 0;
    for (var j = 0; j < bs; j++) {
      sum += audioBuffer[((i/4) * bs) + j];
    }
    var mag = (sum / bs) / 256;

    audioTextureData[i]   = mag;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }
  this._updateAudioTexture(audioTextureData);
};

// thanks to Reza Ali for this method
Audio.prototype.processAudioBufferDecay = function() {

  var newAudioBuffer = new Uint8Array(this.FFTBINCOUNT),
      decay = 0.97;
  this.analyser.getByteTimeDomainData(newAudioBuffer);
  // this.analyser.getByteFrequencyData(newAudioBuffer);

  var audioTextureData = new Float32Array(this.PIXELCOUNT);
  for (var i = 0; i < this.PIXELCOUNT; i+=4) {

    var dataIdx = i/4;
    if (newAudioBuffer[dataIdx] > this.audioBuffer[dataIdx]) {
      this.audioBuffer[dataIdx] = newAudioBuffer[dataIdx];
    } else {
      this.audioBuffer[dataIdx] *= decay;
    }

    audioTextureData[i]   = this.audioBuffer[dataIdx]/256;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }
  this._updateAudioTexture(audioTextureData);

};

// XXX i feel like this might smell really bad
Audio.prototype.update = function() {
  if (this.micReady && this.texReady)
    Audio.prototype.update = Audio.prototype.processAudioBufferDecay; // choose wisely
};


Audio.prototype.init = function() {

  if (this.params.three) {

    this.audioTexture = new THREE.DataTexture(new Float32Array(this.PIXELCOUNT), this.SIDE, this.SIDE, THREE.RGBAFormat, THREE.FloatType, undefined, undefined, undefined, THREE.NearestFilter, THREE.NearestFilter);
    this.audioTexture.needsUpdate = true;

    Audio.prototype._updateAudioTexture = Audio.prototype._updateThreeTex;

  } else {

    this.audioTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.audioTexture);

    // NEAREST req'd for floating-point texture TEXTURE_{MIN/MAG}_FILTER
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);

    Audio.prototype._updateAudioTexture = Audio.prototype._updateRawTex;

  }

  this.texReady = true;

};

Audio.prototype._updateRawTex = function(data) {

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

Audio.prototype._updateThreeTex = function(data) {
  this.audioTexture.image = data;
  this.audioTexture.needsUpdate = true;
};




