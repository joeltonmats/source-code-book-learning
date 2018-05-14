console.log('============================ THINK IN SEQUENCE ==============================');

document.body.addEventListener('click', function (e) {
  console.log('FROM HERE', e.clientX, e.clientY);
});

var clicks = 0;
document.addEventListener('click', function registerClicks(e) {
  if (clicks < 10) {
    if (e.clientX > window.innerWidth / 2) {
      console.log(e.clientX, e.clientY);
      clicks += 1;
    }
  } else {
    document.removeEventListener('click', registerClicks);
  }
});


Rx.Observable.fromEvent(document, 'click')
  .filter(function (c) { return c.clientX > window.innerWidth / 2; })
  .take(10)
  .subscribe(function (c) { console.log(c.clientX, c.clientY) })
