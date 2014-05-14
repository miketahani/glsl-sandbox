function Audio(params) {
  
  this.FFTSIZE       = params.fftsize || 512;
  this.BINSIZE       = params.binsize || 4;  // for averaging audio data
  this.FFTBINCOUNT   = ~~(this.FFTSIZE/2);
  this.BINCOUNT      = ~~(this.FFTBINCOUNT/this.BINSIZE);

  this.bins = params.bin ? this.BINCOUNT : this.FFTBINCOUNT;
  this.PIXELCOUNT    = this.bins * 4;
  this.SIDE          = ~~(Math.sqrt(this.bins));

  this.analyser = null;

  this.audioTexture = null;
  this.textureOffset = params.textureOffset || 11;

  var that = this;

  // init microphone
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

  navigator.getUserMedia({audio: true}, function(stream) {
    
    var audioContext = new webkitAudioContext();
    that.analyser = audioContext.createAnalyser();
    that.analyser.fftSize = that.FFTSIZE;
    var microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(that.analyser);

  });

}

Audio.prototype.processAudioDataMagsTest = function() {

  var timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteTimeDomainData(timeDomain);

  audioTextureData = new Float32Array(this.PIXELCOUNT);

  var bs = this.BINSIZE;

  for (var i = 0; i < this.PIXELCOUNT; i+=4) {

    var sum = 0;
    for (var j = 0; j < bs; j++) {
      sum += timeDomain[(i * bs) + j];
    }
    var mag = (sum / bs) / 256;

    audioTextureData[i]   = mag;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }

  this.updateAudioTexture(audioTextureData);

};

// Audio.prototype.processAudioDataMags = function() {

//   var timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
//   this.analyser.getByteTimeDomainData(timeDomain);

//   audioTextureData = new Float32Array(this.PIXELCOUNT);

//   var bs = this.BINSIZE;

//   for (var i = 0; i < this.bins; i++) {
    
//     var sum = 0;

//     for (var j = 0; j < bs; j++) {
//       sum += timeDomain[(i * bs) + j];
//     }

//     var average = sum / bs,
//         magnitude = average / 256;

//     audioTextureData[i]   = magnitude;
//     audioTextureData[i+1] = 0.0;
//     audioTextureData[i+2] = 0.0;
//     audioTextureData[i+3] = 1.0;
//   }
//   this.updateAudioTexture(audioTextureData);

// };

Audio.prototype.processAudioData = function() {

  var timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
  this.analyser.getByteTimeDomainData(timeDomain);

  audioTextureData = new Float32Array(this.PIXELCOUNT);
  for (var i = 0; i < this.PIXELCOUNT; i+=4) {
    audioTextureData[i]   = timeDomain[i/4]/256;
    audioTextureData[i+1] = 0.0;
    audioTextureData[i+2] = 0.0;
    audioTextureData[i+3] = 1.0;
  }
  this.updateAudioTexture(audioTextureData);

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

};

Audio.prototype.updateAudioTexture = function(data) {

  gl.useProgram(currentProgram);
  gl.activeTexture(gl.TEXTURE0 + this.textureOffset);
  gl.bindTexture(gl.TEXTURE_2D, this.audioTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 2d coordinates to 3d coordinates
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.SIDE, this.SIDE, 0, gl.RGBA, gl.FLOAT, data);

  gl.uniform1i(gl.getUniformLocation(currentProgram, 'audioTex'), this.textureOffset);  // to the shader

};




