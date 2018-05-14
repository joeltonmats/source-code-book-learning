console.log('============================ BEGIN CREATE BASIC OBSERVABLE==============================');
var observable = Rx.Observable.create(function (observer) {
  observer.onNext('JOÃO');
  observer.onNext('MARCOS');
  observer.onNext('ISABEL');
  observer.onCompleted(); // We are done
});

var observer = Rx.Observer.create(
  function onNext(x) { console.log('Next: ' + x); },
  function onError(err) { console.log('Error: ' + err); },
  function onCompleted() { console.log('Completed'); }
);

observable.subscribe(observer);
