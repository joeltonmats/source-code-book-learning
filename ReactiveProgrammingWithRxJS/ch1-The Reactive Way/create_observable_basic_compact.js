console.log('============================ BEGIN CREATE BASIC OBSERVABLE COMPACT ==============================');

Rx.Observable
  .from(['Adrià', 'Jen', 'Sergi'])
  .subscribe(
  function (x) { console.log('Next: ' + x); },
  function (err) { console.log('Error:', err); },
  function () { console.log('Completed'); }
  );

var names = Rx.Observable.from(['Adrià', 'Jen', 'Sergi']);

names.subscribe(function (x) {
  console.log('Next: ' + x);
});
