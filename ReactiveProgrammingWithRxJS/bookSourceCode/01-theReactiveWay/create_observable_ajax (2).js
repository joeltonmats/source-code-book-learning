console.log('============================ BEGIN CREATE OBSERVABLE VIA AJAX ==============================');

/* =====>>> This example require a simple http server !!!!!!!!!!! <<<======= */

function get(url) {
  return Rx.Observable.create(function (observer) {
    // Make a traditional Ajax request
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function () {
      if (req.status == 200) {
        observer.onNext(req.response);
        observer.onCompleted();
      }
      else {
        observer.onError(new Error(req.statusText));
      }
    };

    req.onerror = function () {
      observer.onError(new Error("Unknown Error"));
    };

    req.send();
  });
}

// Create an Ajax Observable
var test = get('./test.json');
// Subscribe an Observer to it
test.subscribe(
  function onNext(x) { console.log('Result: ' + x); },
  function onError(err) { console.log('Error: ' + err); },
  function onCompleted() { console.log('Completed'); }
);
