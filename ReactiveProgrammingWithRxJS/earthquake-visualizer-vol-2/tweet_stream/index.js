var WebSocketServer = require('ws').Server;
var Twit = require('twit');
var Rx = require('rx');

var T = new Twit({
   
});

var stream = T.stream('statuses/filter', {
    track: 'earthquake',
    locations: []
});

function onConnect(ws) {

    Rx.Observable.fromEvent(stream, 'tweet').subscribe(function (tweetObject) {
        ws.send(JSON.stringify(tweetObject), function (err) {
            if (err) {
                console.log('There was an error sending the message');
            }
        });
    });

    Rx.Observable
        .fromEvent(ws, 'message')
        .flatMap(function (quakesObj) {
            quakesObj = JSON.parse(quakesObj);
            return Rx.Observable.from(quakesObj.quakes);
        })
        .scan([], function (boundsArray, quake) { //(1)
            var bounds = [ //(2)
                quake.lng - 0.3, quake.lat - 0.15,
                quake.lng + 0.3, quake.lat + 0.15
            ].map(function (coordinate) {
                coordinate = coordinate.toString();
                return coordinate.match(/\-?\d+(\.\-?\d{2})?/)[0];
            });

            boundsArray = boundsArray.concat(bounds);
            return boundsArray.slice(Math.max(boundsArray.length - 50, 0)); //(3)
        })
        .subscribe(function (boundsArray) { //(4)
            stream.stop();
            stream.params.locations = boundsArray.toString();
            stream.start();
        });
}

var Server = new WebSocketServer({ port: 8082 });

Rx.Observable.fromEvent(Server, 'connection').subscribe(onConnect);