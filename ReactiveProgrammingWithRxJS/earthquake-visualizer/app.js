const quakes = Rx.Observable
    .interval(5000)
    .flatMap(() => {
        return Rx.DOM.jsonpRequest({
            url: QUAKE_URL,
            jsonpCallback: 'eqfeed_callback'
        }).retry(3);
    })
    .flatMap(result => {
        return Rx.Observable.from(result.response.features);
    })
    .distinct(quake => {
        console.log('dedwede');
        return quake.properties.code;
    });

quakes.subscribe(quake => {
    const coords = quake.geometry.coordinates
    const size = quake.properties.mag * 10000;

    L.circle([coords[1], coords[0]], size).addTo(map);
});