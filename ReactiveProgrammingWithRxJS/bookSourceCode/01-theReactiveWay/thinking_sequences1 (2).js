console.log('============================ THINK IN SEQUENCE 2 ==============================');

document.body.addEventListener('mousemove', function (e) {
  console.log(e.clientX, e.clientY);
});

var halfWidth = innerWidth / 2;
var halfHeight = innerHeight / 2;

document.addEventListener('mousemove', function mouseCoords(e) {
  var x = e.clientX, y = e.clientY;
  if (x > halfWidth) {
    console.log('Mouse pointer on the right');
  } else {
    console.log('Mouse pointer on the left');
  }
});
var allMoves = Rx.Observable.fromEvent(document, 'mousemove')
  .map(function (e) {
    return { x: e.clientX, y: e.clientY };
  });

var rightSide = allMoves.filter(function (c) { return c.x > halfWidth });
var leftSide = allMoves.filter(function (c) { return c.x < halfWidth });

rightSide.subscribe(function () {
  console.log('Mouse pointer on the right');
});

leftSide.subscribe(function () {
  console.log('Mouse pointer on the left');
});
function isOnUpperSide(coord) {
  return coord.y < halfHeight;
}

var upperLeft = leftSide.filter(isOnUpperSide);
var upperRight = rightSide.filter(isOnUpperSide);

upperLeft.subscribe(function () {
  console.log('Mouse pointer on the upper left');
});

upperRight.subscribe(function () {
  console.log('Mouse pointer on the upper right');
});
upperLeft.merge(upperRight).subscribe(function () {
  console.log('Mouse pointer on the upper side');
});
