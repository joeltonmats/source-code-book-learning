const quakes = Rx.Observable.create(observer => {
    window.eqfeed_callback = response => {
        observer.onNext(response);
        observer.onCompleted();
    };

    loadJSONP(QUAKE_URL);
}).flatMap(dataset => {
    console.log('dataset', dataset);
    return Rx.Observable.from(dataset.features);
});

quakes.subscribe(quake => {
    const coords = quake.geometry.coordinates;
    const size = quake.properties.mag * 10000;

    L.circle([coords[1], coords[0]], size).addTo(map);
});