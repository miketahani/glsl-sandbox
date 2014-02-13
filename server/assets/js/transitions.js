// for transitioning between shaders and displaying stuff between songs

var Transitions = (function() {

  var init = function() {
    
    window.addEventListener('keypress', function(e) {

      if (isCodeVisible()) return;

      console.log(e.keyCode);

      // 

      // switch (e.keyCode) {
      // }

    });
  
  };

  return {
    init: init
  };

})();