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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function paintEnemies(enemies) {
    enemies.forEach(enemy => {
        enemy.y += 5;
        enemy.x += getRandomInt(-15, 15);

        drawTriangle(enemy.x, enemy.y, 20, '#00ff00', 'down');
    })
}

const SHOOTING_SPEED = 15;

function paintHeroShots(heroShots) {
    heroShots.forEach(shot => {
        shot.y -= SHOOTING_SPEED;
        drawTriangle(shot.x, shot.y, 5, '#ffff00', 'up');
    })
}

function renderScener(actors) {
    paintStar(actors.stars);
    paintSpaceShip(actors.spaceShip.x, actors.spaceShip.y);
    paintEnemies(actors.enemies);
    paintHeroShots(actors.heroShots);
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

// ENEMY

const ENEMY_FREQ = 1500;
const Enemies = Rx.Observable.interval(ENEMY_FREQ)
    .scan(enemyArray => {
        const enemy = {
            x: parseInt(Math.random() * canvas.width),
            y: -30
        };

        enemyArray.push(enemy);
        return enemyArray;
    }, [])

// Player firing
const playerFiring = Rx.Observable
    .merge(
    Rx.Observable.fromEvent(canvas, 'click'),
    Rx.Observable.fromEvent(canvas, 'keydown')
        .filter(evt => {
            return evt.keycode === 32;
        })
    )
    .sample(200)
    .timestamp();

const HeroShots = Rx.Observable
    .combineLatest(playerFiring, SpaceShip, (shotEvents, spaceShip) => {
        return {
            timestamp: shotEvents.timestamp,
            x: spaceShip.x
        };
    })
    .distinctUntilChanged(shot => {
        return shot.timestamp;
    })
    .scan((shortArray, shot) => {
        shortArray.push({ x: shot.x, y: HERO_Y });
        return shortArray;
    }, [])

//Game
const Game = Rx.Observable
    .combineLatest(StarStream, SpaceShip, Enemies, HeroShots, (stars, spaceShip, enemies, heroShots) => {
        return {
            stars: stars,
            spaceShip: spaceShip,
            enemies: enemies,
            heroShots: heroShots
        };
    })


Game
    .sample(SPEED)
    .subscribe(renderScener);