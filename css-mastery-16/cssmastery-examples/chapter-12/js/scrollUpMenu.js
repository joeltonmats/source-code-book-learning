(function (win) {
  window.scrollUpMenu = (function () {
    var element;
    var klass;
    var handler;
    var minScroll = 300; // Arbitrary limit before the hider kicks in.
    var doc = win.document;
    var previousPos = win.pageYOffset;

    function init(elSelector, cls) {
      // Pass in element and class name.

      // Only run for slightly more capable browsers – short-circuit if
      // some properties are not available:
      // (See http://responsivenews.co.uk/post/18948466399/cutting-the-mustard)
      if(!(
            elSelector
            && cls
            && 'querySelector' in doc
            && 'addEventListener' in win
            && 'classList' in doc.createElement('_'))) {
           return;
      }

      element = doc.querySelector(elSelector);
      klass = cls;
      win.addEventListener('scroll', handler);
      win.addEventListener('hashchange', handler);
    }


    // Helper to "debounce" a function call, meaning it has to wait
    // at least a certain amount of time before being called again
    // so that the function is not run too often.
    // See https://remysharp.com/2010/07/21/throttling-function-calls
    function debounce(fn, delay) {
      var timer = null;
      return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    }

    
    function toggleMenu() {
      var top = win.pageYOffset;
      if ((top > minScroll) && top > previousPos) {
        element.classList.add(klass);
      }
      else {
        element.classList.remove(klass);
      }
      previousPos = top;
    }

    handler = debounce(toggleMenu, 200);

    // Public-facing API.
    return {
      init: init,
    };
  }());
}(window));