const canvas = document.createElement('canvas');
const ctx = canvas.getContext("2d");

document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//starry background
function paintStar(stars) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

// Helpers
function drawTriangle(x, y, width, color, direction) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.lineTo(x, direction === 'up' ? y - width : y + width);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x - width, y);
    ctx.fill();
}

function paintSpaceShip(x, y) {
    drawTriangle(x, y, 20, '#ff0000', 'up');
}

function renderScener(actors) {
    paintStar(actors.stars);
    paintSpaceShip(actors.spaceShip.x, actors.spaceShip.y);
}

// Background
const SPEED = 40;
const STAR_NUMBER = 250;
const StarStream = Rx.Observable.range(1, STAR_NUMBER)
    .map(() => {
        return {
            x: parseInt(Math.random() * canvas.width),
            y: parseInt(Math.random() * canvas.height),
            size: Math.random() * 3 + 1
        };
    })
    .toArray()
    .flatMap(starArray => {
        return Rx.Observable.interval(SPEED).map(() => {
            starArray.forEach(star => {
                if (star.y >= canvas.height) {
                    star.y = 0;
                }
                star.y += 3;
            });
            return starArray;
        });
    })

//HERO
const HERO_Y = canvas.height - 30;
const mouseMove = Rx.Observable.fromEvent(canvas, 'mousemove');
const SpaceShip = mouseMove
    .map(event => {
        return {
            x: event.clientX,
            y: HERO_Y
        }
    })
    .startWith({
        x: canvas.width / 2,
        y: HERO_Y
    });

//Game
const Game = Rx.Observable
    .combineLatest(StarStream, SpaceShip, (stars, spaceShip) => {
        return {
            stars: stars,
            spaceShip: spaceShip
        }
    });

Game.subscribe(renderScener);