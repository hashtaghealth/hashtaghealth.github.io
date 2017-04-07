var adUnit, directionsDisplay, geocoder, map, drawingManager;
var directionsService = new google.maps.DirectionsService();
var latlng = new google.maps.LatLng(40.456389, -100.773611);

var polygonArray = new Array();
var circle = new Array();
var rectangle = new Array();
var polygon = new Array();

// these are PostGreSql. Functions such as ST_SetSRID, ST_Makepoint,etc. are from POSTGIS
var withinRect = "SELECT AVG(calories) as a, AVG(percentalc) as b, AVG(percentexe) as c,AVG(percentfas) as d,AVG(percentfoo) as e,AVG(percenthap) as f,AVG(percenthea) as g,AVG(sentalc) as h,AVG(sentex) as i,AVG(sentfastfo) as j,AVG(sentfood) as k,AVG(senthealth) as l FROM public.{{table}} WHERE the_geom && ST_MakeEnvelope({{left}}, {{bottom}}, {{right}}, {{top}}, 4326)";
var withinCircle = "SELECT AVG(calories) as a, AVG(percentalc) as b, AVG(percentexe) as c,AVG(percentfas) as d,AVG(percentfoo) as e,AVG(percenthap) as f,AVG(percenthea) as g,AVG(sentalc) as h,AVG(sentex) as i,AVG(sentfastfo) as j,AVG(sentfood) as k,AVG(senthealth) as l FROM public.{{table}} WHERE ST_DWITHIN(the_geom, ST_SetSRID(ST_MakePoint({{lon}}, {{lat}}),4326)::geography,{{radius}})";
var withinPol = "SELECT AVG(calories) as a, AVG(percentalc) as b, AVG(percentexe) as c,AVG(percentfas) as d,AVG(percentfoo) as e,AVG(percenthap) as f,AVG(percenthea) as g,AVG(sentalc) as h,AVG(sentex) as i,AVG(sentfastfo) as j,AVG(sentfood) as k,AVG(senthealth) as l FROM public.{{table}} WHERE the_geom && ST_Transform(ST_GeomFromText('POLYGON(({{coordinates}}))',4326),4326)";

var myOptions = {
    zoom: 4,
    center: latlng,
    scaleControl: true,
    overviewMapControl: true,
    maxZoom: 24,
    minZoom: 0,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },
    streetViewControl: true,
    streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    },
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    },
    rotateControl: true,
    rotateControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    }


};

map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

var drawnOptions = {
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['circle', 'polygon', 'rectangle']
    },
    polygonOptions: {
        editable: true,
        clickable: true
    },
    circleOptions: {
        fillColor: '#ffff00',
        fillOpacity: .5,
        strokeWeight: 2,
        clickable: true,// available for click event
        editable: true,
        zIndex: 1
    },
    rectangleOptions: {
        fillColor: '#ffff00',
        fillOpacity: .5,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        zIndex: 1
    }
};

var layers = new Array();
var cb_i = 0;

//CartoDB Layer
var CartoDBLayer = function (table_name,href, u, c) {
    this.category = c;
    this.name = table_name;
    this.link = href;
    var l;

    cb_i++;
    var l_in = cb_i;

    this.putOnMap = function () {
        cartodb.createLayer(map, u).addTo(map, l_in).on('done', function (layer) {
            l = layer;
            layer.setInteraction(true);
            //#search means id = search
            //.search means class = search
            $('#search').on('click', function () {
                var loc = [];
                var address = document.getElementById("address").value;

                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        loc[0] = results[0].geometry.location.lat();
                        loc[1] = results[0].geometry.location.lng();
                    } else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
                // You can use sql anywhere in map.js, not necessarily inside var CartoDBLayer
                // Must set user before executing the sql
                // format: var sql = new cartodb.SQL({ user: 'USERNAME' }); where USERNAME is found at USERNAME.carto.com
                var sql = new cartodb.SQL({ user: 'hashtaghealth' });
                // useful format: sql.execute(query,variables to replace in the query).done({//do something}).error({//do something});
                sql.execute("SELECT * FROM public.{{table}} WHERE name10 ILIKE '%{{name}}%' ", { table: table_name, name: address })
                    .done(function (data) {
                        var id = data.rows[0].cartodb_id;
                        // fake a click at the above location. Must obtain cartodb_id first
                        layer.trigger('featureClick', null, [loc[0], loc[1]], null, { cartodb_id: id }, 0);
                    }).error(function (errors) {
                        alert(errors[0]);
                    });

            });
        });
    };
    this.clearFromMap = function () {
        l.getSubLayer(0).hide();
        l.remove();
        l.clear();

    };
    this.isOnMap = function () {
        return false;
    };

 


};

//layers.push(	new LayerContainer('Subdivisions', 'https://www.cartedesign.com/farmington/subdivisions2.kmz', 'City Layers'));
// TIP ON ADDING HREF:
// The loadLayers() in map.html creates buttons corresponding to layers. 
// The text of the button is set in itemtd2.innerHTML = "SOMETHING". 
// in the CartoDBLayer, I called the text containing href : link
// so I will set   itemtd2.innerHTML = layers[i].link;
layers.push(new CartoDBLayer('states','State <a href="https://hashtaghealth.github.io/geoportal/state.txt" target="_blank">(.txt /</a><a href="https://hashtaghealth.github.io/geoportal/state.xls" target="_blank">.xls)</a>', 'https://hashtaghealth.carto.com/api/v2/viz/a88b82ca-0900-11e7-b06b-0e3ff518bd15/viz.json', 'Map Layers'));
layers.push(new CartoDBLayer('counties','County <a href="https://hashtaghealth.github.io/geoportal/county.txt" target="_blank">(.txt /</a><a href="https://hashtaghealth.github.io/geoportal/county.xls" target="_blank">.xls)</a>', 'https://hashtaghealth.carto.com/api/v2/viz/d61716ee-0e4d-11e7-9c2f-0ee66e2c9693/viz.json', 'Map Layers'));
layers.push(new CartoDBLayer('Census Tract','Census Tract <a href="https://hashtaghealth.github.io/geoportal/tract.txt" target="_blank">(.txt /</a><a href="https://hashtaghealth.github.io/geoportal/tract.xlsx" target="_blank">.xlsx)</a>', '', 'Map Layers'));
layers.push(new CartoDBLayer('ZIP code','Zip code <a href="https://hashtaghealth.github.io/geoportal/zipcode.txt" target="_blank">(.txt /</a><a href="https://hashtaghealth.github.io/geoportal/zipcode.xls" target="_blank">.xls)</a>', '', 'Map Layers'));

function initialize() {
    // I use geocoder only for "Search" button
    geocoder = new google.maps.Geocoder();

    drawingManager = new google.maps.drawing.DrawingManager(drawnOptions);
    drawingManager.setMap(map);
    drawingManager.setDrawingMode(null);

    // Must set a layer on map. Else, you always need to click on first layer (State) 
    // before being able to choose on other layers
    startVisible('counties');
    // Add a listener to show coordinate when right click
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (shape) {
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;
        // circle is an array that is used when you click "Aggregate"
        circle.push(shape);
    });
    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (shape) {
        var vertices = shape.getPath();
        polygon.push(vertices);

    });
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event1) {
        // this array contains all kind of overlay. Use when you need to remove all shapes
        polygonArray.push(event1.overlay);
        drawingManager.setDrawingMode(null);
        if (event1.type === google.maps.drawing.OverlayType.RECTANGLE) {
            // rectangle is an array that is used when you click "Aggregate"
            rectangle.push(event1.overlay.getBounds());
        }
    });


    //geocoder = new google.maps.Geocoder();
    //directionsDisplay = new google.maps.DirectionsRenderer();

    //directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById('panel'));
    /*     .on('done', function(layer) {
        var subLayer = layer.getSubLayer(0);
        subLayer.infowindow.set('template', $('#infowindow_template').html());
       }
       )*/
    
}

google.maps.event.addDomListener(window, 'load', initialize);
//-------------------GET TABLE NAME------------------------------------
function getTableName() {
    var $radio = $('input[name=other]:checked');
    var id = $radio.attr('id');
    return id;
}
//-------------------HELPER METHODS TO AGGREGATE DATA----------------------------
function getResults() {
    var table_name = getTableName();
    if (circle.length > 0) {
        for (var c = 0; c < circle.length; c++) {
            // helper method was written below
            openInfoWindowCircle(table_name, circle, c);
        }
    }
    if (rectangle.length > 0) {
        for (var r = 0; r < rectangle.length; r++) {
            openInfoWindowRectangle(table_name, rectangle, r);
        }
    }
    if (polygon.length > 0) {
        for (var r = 0; r < polygon.length; r++) {
            openInfoWindowPolygon(table_name, polygon, r);
        }
    }
}
//----------------HELPER METHOD TO OPEN INFOWINDOW FOR EACH SHAPE---------------------
//you can call infowindow of carto db, but I couldn't do it so I used infowindow of Google Maps 
function openInfoWindowCircle(table_name, circle, c) {

    var infoWindow = new google.maps.InfoWindow({
        position: circle[c].getCenter(),
        pixelOffset: new google.maps.Size(-30, -30)
    });
    var number = c + 1;
    var contentString = '<div class="infobox"><h3>AVERAGE DATA IN CIRCLE #' + number;
    var sql = new cartodb.SQL({ user: 'hashtaghealth' });
    sql.execute(withinCircle, { table: table_name, lon: circle[c].getCenter().lng(), lat: circle[c].getCenter().lat(), radius: circle[c].getRadius() })
        .done(function (data) {

            contentString += '</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a.toFixed(4)
                + '</p><h4>PROPORTION ABOUT ALCOHOL</h4><p>' + data.rows[0].b.toFixed(4)
                + '</p><h4>PROPORTION ABOUT EXERCISE</h4><p>' + data.rows[0].c.toFixed(4)
                + '</p><h4>PROPORTION ABOUT FAST FOOD</h4><p>' + data.rows[0].d.toFixed(4)
                + '</p><h4> PROPORTION ABOUT FOOD</h4><p>' + data.rows[0].e.toFixed(4)
                + '</p><h4>PROPORTION THAT ARE HAPPY</h4><p>' + data.rows[0].f.toFixed(4)
                + '</p><h4>PROPORTION ABOUT HEALTHY FOOD</h4><p>' + data.rows[0].g.toFixed(4)
                + '</p><h4>PROPORTION ABOUT ALCOHOL THAT ARE HAPPY</h4><p>' + data.rows[0].h.toFixed(4)
                + '</p><h4>PROPORTION OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].i.toFixed(4)
                + '</p><h4>PROPORTION ABOUT FAST FOOD THAT ARE HAPPY</h4><p>' + data.rows[0].j.toFixed(4)
                + '</p><h4>PROPORTION OF FOOD TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].k.toFixed(4)
                + '</p><h4>PROPORTION ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>' + data.rows[0].l.toFixed(4) + '</p></div>';

            infoWindow.setContent(contentString);
            infoWindow.open(map);

        }).error(function (errors) {
            alert(errors[0]);
        });
}
function openInfoWindowRectangle(table_name, rectangle, r) {
    var ne = rectangle[r].getNorthEast();
    var sw = rectangle[r].getSouthWest();

    var infoWindow = new google.maps.InfoWindow({
        position: ne,
    });
    var number = r + 1;
    var contentString = '<div class="infobox"><h3>AVERAGE DATA IN RECTANGLE #' + number;

    var sql = new cartodb.SQL({ user: 'hashtaghealth' });

    sql.execute(withinRect, { table: table_name, left: sw.lng(), bottom: sw.lat(), right: ne.lng(), top: ne.lat() })
        .done(function (data) {
            contentString += '</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a.toFixed(4)
               + '</p><h4>PROPORTION ABOUT ALCOHOL</h4><p>' + data.rows[0].b.toFixed(4)
               + '</p><h4>PROPORTION ABOUT EXERCISE</h4><p>' + data.rows[0].c.toFixed(4)
               + '</p><h4>PROPORTION ABOUT FAST FOOD</h4><p>' + data.rows[0].d.toFixed(4)
               + '</p><h4> PROPORTION ABOUT FOOD</h4><p>' + data.rows[0].e.toFixed(4)
               + '</p><h4>PROPORTION THAT ARE HAPPY</h4><p>' + data.rows[0].f.toFixed(4)
               + '</p><h4>PROPORTION ABOUT HEALTHY FOOD</h4><p>' + data.rows[0].g.toFixed(4)
               + '</p><h4>PROPORTION ABOUT ALCOHOL THAT ARE HAPPY</h4><p>' + data.rows[0].h.toFixed(4)
               + '</p><h4>PROPORTION OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].i.toFixed(4)
               + '</p><h4>PROPORTION ABOUT FAST FOOD THAT ARE HAPPY</h4><p>' + data.rows[0].j.toFixed(4)
               + '</p><h4>PROPORTION OF FOOD TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].k.toFixed(4)
               + '</p><h4>PROPORTION ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>' + data.rows[0].l.toFixed(4) + '</p></div>';

            // Replace the info window's content and position.
            infoWindow.setContent(contentString);
            infoWindow.open(map);
        }).error(function (errors) {
            alert(errors[0]);
        });
}
function openInfoWindowPolygon(table_name, polygon, r) {

    var vertices = polygon[r];
    var content = '';

    for (var i = 0 ; i < vertices.getLength() ; i++) {
        var xy = vertices.getAt(i);
        content += xy.lng() + ' ' + xy.lat() + ',';
    }
    var xy = vertices.getAt(0);
    content += xy.lng() + ' ' + xy.lat() + ' ';
    var infoWindow = new google.maps.InfoWindow({
        position: xy
    });

    var number = r + 1;
    var contentString = '<div class="infobox"><h3>AVERAGE DATA IN POLYGON #' + number;
    var sql = new cartodb.SQL({ user: 'hashtaghealth' });
    sql.execute(withinPol, { table: table_name, coordinates: content })
        .done(function (data) {
            contentString += '</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a.toFixed(4)
               + '</p><h4>PROPORTION ABOUT ALCOHOL</h4><p>' + data.rows[0].b.toFixed(4)
               + '</p><h4>PROPORTION ABOUT EXERCISE</h4><p>' + data.rows[0].c.toFixed(4)
               + '</p><h4>PROPORTION ABOUT FAST FOOD</h4><p>' + data.rows[0].d.toFixed(4)
               + '</p><h4>PROPORTION ABOUT FOOD</h4><p>' + data.rows[0].e.toFixed(4)
               + '</p><h4>PROPORTION THAT ARE HAPPY</h4><p>' + data.rows[0].f.toFixed(4)
               + '</p><h4>PROPORTION ABOUT HEALTHY FOOD</h4><p>' + data.rows[0].g.toFixed(4)
               + '</p><h4>PROPORTION ABOUT ALCOHOL THAT ARE HAPPY</h4><p>' + data.rows[0].h.toFixed(4)
               + '</p><h4>PROPORTION OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].i.toFixed(4)
               + '</p><h4>PROPORTION ABOUT FAST FOOD THAT ARE HAPPY</h4><p>' + data.rows[0].j.toFixed(4)
               + '</p><h4>PROPORTION OF FOOD TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].k.toFixed(4)
               + '</p><h4>PROPORTION ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>' + data.rows[0].l.toFixed(4) + '</p></div>';

            // Replace the info window's content and position.
            infoWindow.setContent(contentString);
            infoWindow.open(map);
        }).error(function (errors) {
            alert(errors[0]);
        });
}
//-------------------HELPER METHODS FOR DRAWING MANAGER----------------
function removeAll() {
    for (var i = 0; i < polygonArray.length; i++) {
        polygonArray[i].setMap(null);
    }
    // clear all arrays that contain any drawn objects
    polygonArray = [];
    circle = [];
    rectangle = [];
    polygon = [];
}
//-------------------HELPER METHOD TO SET ONE CARTO LAYER ON MAP----------------
function startVisible(name) {
    for (i = 0; i < layers.length; i++) {
        if (layers[i].name == name) {
            layers[i].putOnMap();
            var checkbox = document.getElementById(name);
            checkbox.checked = true;
        }
    }
};

// Google geocoding code. USE WHEN YOU SEARCH FOR AN ADDRESS 
// THIS CODE HELPS YOU FIND THE COORDINATES AND ADD MARKER 
function codeAddress() {
    geocoder = new google.maps.Geocoder();
    var address = document.getElementById("address").value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(6);
            var marker = new google.maps.Marker({
                map: map,
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: results[0].geometry.location
            });
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

// End of geocoding code
