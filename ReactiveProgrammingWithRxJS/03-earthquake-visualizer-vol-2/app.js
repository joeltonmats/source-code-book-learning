const table = document.getElementById('quakes_info');
const codeLayers = {};
const quakeLayer = L.layerGroup([]).addTo(map);
const identity = Rx.helpers.identity;


function isHovering(element) {
    const over = Rx.DOM.mouseover(element).map(identity(true));
    const out = Rx.DOM.mouseout(element).map(identity(false));

    return over.merge(out);
}

function makeRow(props) {
    const row = document.createElement('tr');
    row.id = props.net + props.code;

    const date = new Date(props.time);
    const time = date.toString();

    [props.place, props.mag, time].forEach(text => {
        const cell = document.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
    })

    return row;
}

function getRowFromEvent(event) {
    return Rx.Observable
        .fromEvent(table, event)
        .filter(event => {
            const el = event.target;
            return el.tagName === 'TD' && el.parentNode.id.length;
        })
        .pluck('target', 'parentNode')
        .distinctUntilChanged();
}

function initialize() {
    const socket = Rx.DOM.fromWebSocket('ws://127.0.0.1:8082');

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
            return quake.properties.code;
        })
        .share();

    quakes.subscribe(quake => {
        const coords = quake.geometry.coordinates
        const size = quake.properties.mag * 10000;

        const circle = L.circle([coords[1], coords[0]], size).addTo(map);
        quakeLayer.addLayer(circle);
        codeLayers[quake.id] = quakeLayer.getLayerId(circle);

    });

    quakes
        .bufferWithCount(100)
        .subscribe(quakes => {
            const quakesData = quakes.map(quake => {
                return {
                    id: quake.properties.net + quake.properties.code,
                    lat: quake.geometry.coordinates[1],
                    lng: quake.geometry.coordinates[0],
                    mag: quake.properties.mag
                }
            })
            socket.onNext(JSON.stringify({ quakes: quakesData }));
        })

    socket.subscribe(message => {
        console.log(JSON.parse(message.data));
    })

    getRowFromEvent('mouseover')
        .pairwise()
        .subscribe(rows => {
            const prevCircle = quakeLayer.getLayer(codeLayers[rows[0].id]);
            const currCircle = quakeLayer.getLayer(codeLayers[rows[1].id]);

            prevCircle.setStyle({ color: '#ff0000' });
            currCircle.setStyle({ color: '#0000ff' });
        })

    getRowFromEvent('click')
        .subscribe(row => {
            const circle = quakeLayer.getLayer(codeLayers[row.id]);
            map.panTo(circle.getLatLng());
        })

    quakes
        .pluck('properties')
        .map(makeRow)
        .subscribe(row => {
            table.appendChild(row)
        });
}

Rx.DOM.ready().subscribe(initialize);

