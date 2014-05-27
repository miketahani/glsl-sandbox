audio-reactive glsl sandbox forked from doob's glsl-sandbox for rapid prototyping of concert visuals

my audio additions are [here](https://github.com/miketahani/glsl-sandbox/blob/master/server/assets/js/glsl-audio.js).

NOTE: my additions were written under hackathon-style conditions, so please
excuse the mess (for now)

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

so you don't have to deal with GLSL's const-only array indexing, there's a data-to-texture
pipeline included. declare `uniform sampler2D audioTex` in the frag shader, then access
the data anywhere in the shader with `vec4 datum = texture2D(audioTex, gl_FragCoord.xy);`.
you can replace `gl_FragCoord.xy` with any vec2 with normalized coordinates.

### todo

1. controls for fading/transitioning
2. should rewrite this with a less bulky interface & less overhead ("presentation mode"?)
3. audio smoothing
4. a lot more
