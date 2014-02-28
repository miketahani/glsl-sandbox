audio-reactive glsl sandbox forked from doob's glsl-sandbox

for rapid prototyping of concert visuals

### setup

1. `bundle install`
2. `export MONGOHQ_URL="mongodb://[user]:[password]@127.0.0.1:27017/[database]"`

### run it

1. start mongo (`mongod`)
2. `bundle exec rackup config.ru`
3. hit `http://localhost:9292`
4. (optional) generate fake certs and use thin for SSL so you don't get a prompt for microphone access
every time you visit the shader page: `thin start -p 9292 --ssl --ssl-verify --ssl-key-file .ssl/server.key --ssl-cert-file .ssl/server.crt`

### shader uniforms

you can pass an array or a texture with audio data to the fragment shader.

if you want to pass an array, declare `uniform float audio[N];` in 
your shader, where N = your audio buffer size (make sure to assign the audio buffer 
to the global `parameters.audio` in your audio processor function first). 

if you don't want to deal with GLSL's const-only array indexing, there's a data-to-texture
pipeline included. declare `uniform sampler2D audioTex` in the frag shader, then access
the data anywhere in the shader with `vec4 data = texture2D(audioTex, gl_FragCoord.xy);`.
you can replace `gl_FragCoord.xy` with any vec2 with normalized coordinates.

### todo

1. controls for fading/transitioning
2. should rewrite this with a less bulky interface & less overhead ("presentation mode"?)
3. audio smoothing
4. a lot more
