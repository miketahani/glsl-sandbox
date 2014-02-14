// for transitioning between shaders and displaying stuff between songs

var Transitions = (function() {

  var keys = {
    
  };

  var init = function() {
    
    window.addEventListener('keypress', function(e) {

      if (isCodeVisible()) return;

      console.log(e.keyCode);

      if (var key = keys[e.keyCode]) key();

    });
  
  };

  return {
    init: init
  };

})();