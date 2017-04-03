var adUnit, infowindow, directionsDisplay, geocoder, map,drawingManager,geocoder;
var directionsService = new google.maps.DirectionsService();
var latlng = new google.maps.LatLng(40.456389, -100.773611);

var polygonArray = new Array();
var circle = new Array();
var rectangle = new Array();

var regions = [];
var myOptions = {
    zoom: 4,
    center: latlng,
    scaleControl: true,
    overviewMapControl: true,
    maxZoom: 24,
    minZoom:0,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
	mapTypeControl: true,
		  mapTypeControlOptions : {
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

//var kmzContainers = new Array();

var cb_i = 0;

var LayerContainer = function(n, u, c)
{
	this.name = n;
	this.kmzURL = u;
	this.category = c;
	this.layer = new google.maps.KmlLayer(this.kmzURL, {preserveViewport: true});

	this.putOnMap = function()
	{
		this.layer.setMap(map);
	};
	this.clearFromMap = function()
	{
		this.layer.setMap(null);
	};

  this.isOnMap = function()
  {
    return false;
  };
};

//Special Layer includes Traffic, Weather and Pictures and Bicycle
var SpecialLayer = function(n, t, c)
{
	this.name = n;

	this.category = c;

	if(t == 'photo')
	{
		this.layer = new google.maps.panoramio.PanoramioLayer();
	}
	else if(t == 'traffic')
	{
		this.layer = new google.maps.TrafficLayer();
	}
	else if(t == 'weather')
	{
		this.layer = new google.maps.weather.WeatherLayer({
			temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT});
	}
	else if(t == 'bike')
	{
		this.layer = new google.maps.BicyclingLayer();
	}

	this.putOnMap = function()
	{
		this.layer.setMap(map);
	};
	this.clearFromMap = function()
	{
		this.layer.setMap(null);
	};
};

//CartoDB Layer
var CartoDBLayer = function (n, u, c)
{
	this.category = c;
	this.name = n;
  var l;



   cb_i++;
   var l_in = cb_i;

  this.putOnMap = function () {
        cartodb.createLayer(map, u).addTo(map, l_in).on('done', function (layer) {
            l = layer;
            layer.setInteraction(true);

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

                var sql = new cartodb.SQL({ user: 'hashtaghealth' });
                sql.execute("SELECT * FROM public.{{table}} WHERE name10 ILIKE '%{{name}}%' ", { table: table_name, name: address })
                    .done(function (data) {
                        var id = data.rows[0].cartodb_id;
                        layer.trigger('featureClick', null, [loc[0], loc[1]], null, { cartodb_id: id }, 0);
                    }).error(function (errors) {
                        alert(errors[0]);
                    });

            });
            $('#aggregate').on('click', function () {
                var sql = new cartodb.SQL({ user: 'hashtaghealth' });
                for (var c = 0; c < circle.length; c++) {
                    sql.execute(withinCircle, { table: table_name, lon: circle[c][1], lat: circle[c][0], radius: circle[c][2] })
                        .done(function (data) {
                            var contentString = '<div class="infobox"><h3>AVERAGE DATA IN THAT REGION</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a
                                + "</p><h4>PERCENT ABOUT ALCOHOL</h4><p>" + data.rows[0].b
                                + "</p><h4>PERCENT ABOUT EXERCISE</h4><p>" + data.rows[0].c
                                + "</p><h4>PERCENT ABOUT FAST FOOD</h4><p>" + data.rows[0].d
                                + "</p><h4> PERCENT ABOUT FOOD</h4><p>" + data.rows[0].e
                                + "</p><h4>PERCENT THAT ARE HAPPY</h4><p>" + data.rows[0].f
                                + "</p><h4>PERCENT ABOUT HEALTHY FOOD</h4><p>" + data.rows[0].g
                                + "</p><h4>PERCENT ABOUT ALCOHOL THAT ARE HAPPY</h4><p>" + data.rows[0].h
                                + "</p><h4>PERCENT OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>" + data.rows[0].i
                                + "</p><h4>PERCENT ABOUT FAST FOOD THAT ARE HAPPY</h4><p>" + data.rows[0].j
                                + "</p><h4>PERCENT OF FOOD TWEETS THAT ARE HAPPY</h4><p>" + data.rows[0].k
                                + "</p><h4>PERCENT ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>" + data.rows[0].l + "</p></div>";

                            // Replace the info window's content and position.
                            var infoWindow = new google.maps.InfoWindow();
                            infoWindow.setContent(contentString);
                            infoWindow.setPosition(google.maps.ControlPosition.TOP_CENTER);
                            infoWindow.open(map);
                        }).error(function (errors) {
                            alert(errors[0]);
                        });
                }

                for (var r = 0; r < rectangle.length; r++) {
                    alert("EXECUTE");
                    sql.execute(withinRect, { table: table_name, left: rectangle[r][0], bottom: rectangle[r][1], right: rectangle[r][2], top: rectangle[r][3] })
                        .done(function (data) {
                            alert(data.rows[0].b);
                            var contentString = '<div class="infobox"><h3>AVERAGE DATA IN THAT REGION</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a
                               + "</p><h4>PERCENT ABOUT ALCOHOL</h4><p>" + data.rows[0].b
                               + "</p><h4>PERCENT ABOUT EXERCISE</h4><p>" + data.rows[0].c
                               + "</p><h4>PERCENT ABOUT FAST FOOD</h4><p>" + data.rows[0].d
                               + "</p><h4> PERCENT ABOUT FOOD</h4><p>" + data.rows[0].e
                               + "</p><h4>PERCENT THAT ARE HAPPY</h4><p>" + data.rows[0].f
                               + "</p><h4>PERCENT ABOUT HEALTHY FOOD</h4><p>" + data.rows[0].g
                               + "</p><h4>PERCENT ABOUT ALCOHOL THAT ARE HAPPY</h4><p>" + data.rows[0].h
                               + "</p><h4>PERCENT OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>" + data.rows[0].i
                               + "</p><h4>PERCENT ABOUT FAST FOOD THAT ARE HAPPY</h4><p>" + data.rows[0].j
                               + "</p><h4>PERCENT OF FOOD TWEETS THAT ARE HAPPY</h4><p>" + data.rows[0].k
                               + "</p><h4>PERCENT ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>" + data.rows[0].l + "</p></div>";

                            // Replace the info window's content and position.
                            var infoWindow = new google.maps.InfoWindow();
                            infoWindow.setContent(contentString);

                            infoWindow.setPosition(google.maps.ControlPosition.TOP_CENTER);
                            infoWindow.open(map);
                        }).error(function (errors) {
                            alert(errors[0]);
                        });
                }
            });

        });
    };
	this.clearFromMap = function()
	{
		l.getSubLayer(0).hide();
		l.remove();
		l.clear();

	};
  this.isOnMap = function()
  {
    return false;
  };
};


//layers.push(	new LayerContainer('Subdivisions', 'https://www.cartedesign.com/farmington/subdivisions2.kmz', 'City Layers'));

layers.push(	new CartoDBLayer('State', 'https://hashtaghealth.carto.com/api/v2/viz/a88b82ca-0900-11e7-b06b-0e3ff518bd15/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('County', 'https://hashtaghealth.carto.com/api/v2/viz/d61716ee-0e4d-11e7-9c2f-0ee66e2c9693/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Census Tract', '', 'Map Layers'));
layers.push(	new CartoDBLayer('ZIP code', '', 'Map Layers'));








function initialize() {
    geocoder = new google.maps.Geocoder();
    DrawnMenuSetUp();
    contextMenu = new ContextMenuDrawing(map);

    drawingManager = new google.maps.drawing.DrawingManager(drawnOptions);
    drawingManager.setMap(map);
    drawingManager.setDrawingMode(null);
	
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (shape) {
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;

        var c = new Array();
        c.push(shape.getCenter().lat());
        c.push(shape.getCenter().lng());
        c.push(shape.getRadius());
        circle.push(c);
    });

    google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (shape) {
        if (shape == null || (!(shape instanceof google.maps.RECTANGLE))) return;
        var ne = shape.getBounds().getNorthEast();
        var sw = shape.getBounds().getSouthWest();

        var r = new Array();
        r.push(sw.lng());
        r.push(sw.lat());
        r.push(ne.lng());
        r.push(ne.lat());

        rectangle.push(r);

    });
    // Add a listener to show coordinate when right click
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event1) {
        polygonArray.push(event1);
        drawingManager.setDrawingMode(null);
        google.maps.event.addListener(event1.overlay, 'rightclick', function (event) {
            contextMenu.show(event.latLng);
            document.getElementById('rm').addEventListener('click', function () {
                event1.overlay.setMap(null);
            });
        });
    });

    MapMenuSetUp();
    mapMenu = new ContextMenuMap(map);
    google.maps.event.addListener(map, 'rightclick', function (e) {
        mapMenu.show(e.latLng);
        document.getElementById('add').addEventListener('click', function () {
            addToRegions(e.latLng);
        });
        document.getElementById('not add').addEventListener('click', function () {
            removeFromRegions(e.latLng);
        });
    });
  //geocoder = new google.maps.Geocoder();
  //directionsDisplay = new google.maps.DirectionsRenderer();

  //directionsDisplay.setMap(map);
  //directionsDisplay.setPanel(document.getElementById('panel'));
  /*     .on('done', function(layer) {
      var subLayer = layer.getSubLayer(0);
      subLayer.infowindow.set('template', $('#infowindow_template').html());
	 }
	 )*/;
  startVisible('City Boundary');
}

google.maps.event.addDomListener(window, 'load', initialize);


function removeAll() {
    for (var i = 0; i < polygonArray.length; i++) {
        polygonArray[i].overlay.setMap(null);
    }
    polygonArray = [];
    circle = [];
    rectangle = [];
}



// Google geocoding code

function codeAddress() {
  geocoder = new google.maps.Geocoder();
  var address = document.getElementById("address").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      map.setZoom(6);
      var marker = new google.maps.Marker({
        map: map,
          draggable:true,
          animation: google.maps.Animation.DROP,
          position: results[0].geometry.location
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

// End of geocoding code