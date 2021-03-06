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

        if (!enemy.isDead)
            drawTriangle(enemy.x, enemy.y, 20, '#00ff00', 'down');

        enemy.shots.forEach(shot => {
            shot.y += SHOOTING_SPEED;
            drawTriangle(shot.x, shot.y, 5, '#00ffff', 'down');
        })
    })
}

const ScoreSubject = new Rx.Subject();
const score = ScoreSubject.scan((prev, cur) => {
    return prev + cur;
}, 0).startWith(0);

const SHOOTING_SPEED = 15;
const SCORE_INCREASE = 10;

function paintHeroShots(heroShots, enemies) {
    heroShots.forEach((shot, i) => {
        for (let l = 0; l < enemies.length; l++) {
            const enemy = enemies[l];
            if (!enemy.isDead && collision(shot, enemy)) {
                ScoreSubject.onNext(SCORE_INCREASE);
                enemy.isDead = true;
                shot.x = shot.y = -100;
                break;
            }
        }
        shot.y -= SHOOTING_SPEED;
        drawTriangle(shot.x, shot.y, 5, '#ffff00', 'up');
    })
}

function collision(target1, target2) {
    return (target1.x > target2.x - 20 && target1.x < target2.x + 20) &&
        (target1.y > target2.y - 20 && target1.y < target2.y + 20);
}

function gameOver(ship, enemies) {
    return enemies.some(enemy => {
        if (collision(ship, enemy)) {
            return true;
        }

        return enemy.shots.some(shot => {
            return collision(ship, shot);
        })
    })
}

function paintScore(score) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Score: ' + score, 40, 43);
}

function renderScener(actors) {
    paintStar(actors.stars);
    paintSpaceShip(actors.spaceShip.x, actors.spaceShip.y);
    paintEnemies(actors.enemies);
    paintHeroShots(actors.heroShots, actors.enemies);
    paintScore(actors.score);
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


function isVisible(obj) {
    return obj.x > -40 && obj.x < canvas.width + 40 && obj.y > -40 && obj.y < canvas.height + 40;
}

const ENEMY_FREQ = 1500;
const ENEMY_SHOOTING_FREQ = 750;
const Enemies = Rx.Observable.interval(ENEMY_FREQ)
    .scan(enemyArray => {
        const enemy = {
            x: parseInt(Math.random() * canvas.width),
            y: -30,
            shots: []
        };

        Rx.Observable.interval(ENEMY_SHOOTING_FREQ)
            .subscribe(() => {
                if (!enemy.isDead) {
                    enemy.shots.push({ x: enemy.x, y: enemy.y });
                }
                enemy.shots = enemy.shots.filter(isVisible);
            })

        enemyArray.push(enemy);
        return enemyArray
            .filter(isVisible)
            .filter(enemy => {
                return !(enemy.isDead && enemy.shots.length === 0);
            });
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
    .combineLatest(StarStream, SpaceShip, Enemies, HeroShots, score, (stars, spaceShip, enemies, heroShots, score) => {
        return {
            stars: stars,
            spaceShip: spaceShip,
            enemies: enemies,
            heroShots: heroShots,
            score: score
        };
    })


Game
    .sample(SPEED)
    .takeWhile(actors => {
        return gameOver(actors.spaceShip, actors.enemies) === false;
    })
    .subscribe(renderScener);