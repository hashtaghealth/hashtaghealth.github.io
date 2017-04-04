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
var CartoDBLayer = function (n, u, c) {
    this.category = c;
    this.name = n;
    var l;

    cb_i++;
    var l_in = cb_i;

    var table_name;
    if (n == 'State')
        table_name = 'states';
    else if (n == 'County')
        table_name = 'counties';
    else
        table_name = 'zipcode';

    var withinRect = "SELECT AVG(calories) as a, AVG(percentalc) as b, AVG(percentexe) as c,AVG(percentfas) as d,AVG(percentfoo) as e,AVG(percenthap) as f,AVG(percenthea) as g,AVG(sentalc) as h,AVG(sentex) as i,AVG(sentfastfo) as j,AVG(sentfood) as k,AVG(senthealth) as l FROM public.{{table}} WHERE public.{{table}}.the_geom && ST_MakeEnvelope({{left}}, {{bottom}}, {{right}}, {{top}}, 4326)";
    var withinCircle = "SELECT AVG(calories) as a, AVG(percentalc) as b, AVG(percentexe) as c,AVG(percentfas) as d,AVG(percentfoo) as e,AVG(percenthap) as f,AVG(percenthea) as g,AVG(sentalc) as h,AVG(sentex) as i,AVG(sentfastfo) as j,AVG(sentfood) as k,AVG(senthealth) as l FROM public.{{table}} WHERE ST_Distance_Sphere(the_geom, ST_MakePoint({{lon}}, {{lat}})) <= {{radius}}";

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
                if (circle.length > 0)
                {
                    for (var c = 0; c < circle.length; c++) {
                        openInfoWindow(table_name, circle,c);
                    }
                }
		if (rectangle.length > 0) {
                    for (var r = 0; r < rectangle.length; r++) {
                        openInfoWindowRectangle(table_name, rectangle, r);
                    }
                }
                
                
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
    function openInfoWindow(table_name, circle,c) {
        
        var infoWindow = new google.maps.InfoWindow({
            position: circle[c].getCenter(),
            pixelOffset: new google.maps.Size(-30, -30)
        });
        var number = c + 1;
        var contentString = '<div class="infobox"><h3>AVERAGE DATA IN REGION #' + number;
        var sql = new cartodb.SQL({ user: 'hashtaghealth' });
        sql.execute(withinCircle, { table: table_name, lon: circle[c].getCenter().lng(), lat: circle[c].getCenter().lat(), radius: circle[c].getRadius() })
            .done(function (data) {

                contentString += '</h3><br><h4>AVERAGE CALORIC DENSITY OF FOOD </h4><p>' + data.rows[0].a.toFixed(4)
                    + '</p><h4>PERCENT ABOUT ALCOHOL</h4><p>' + data.rows[0].b.toFixed(4)
                    + '</p><h4>PERCENT ABOUT EXERCISE</h4><p>' + data.rows[0].c.toFixed(4)
                    + '</p><h4>PERCENT ABOUT FAST FOOD</h4><p>' + data.rows[0].d.toFixed(4)
                    + '</p><h4> PERCENT ABOUT FOOD</h4><p>' + data.rows[0].e.toFixed(4)
                    + '</p><h4>PERCENT THAT ARE HAPPY</h4><p>' + data.rows[0].f.toFixed(4)
                    + '</p><h4>PERCENT ABOUT HEALTHY FOOD</h4><p>' + data.rows[0].g.toFixed(4)
                    + '</p><h4>PERCENT ABOUT ALCOHOL THAT ARE HAPPY</h4><p>' + data.rows[0].h.toFixed(4)
                    + '</p><h4>PERCENT OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].i.toFixed(4)
                    + '</p><h4>PERCENT ABOUT FAST FOOD THAT ARE HAPPY</h4><p>' + data.rows[0].j.toFixed(4)
                    + '</p><h4>PERCENT OF FOOD TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].k.toFixed(4)
                    + '</p><h4>PERCENT ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>' + data.rows[0].l.toFixed(4) + '</p></div>';

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
                   + '</p><h4>PERCENT ABOUT ALCOHOL</h4><p>' + data.rows[0].b.toFixed(4)
                   + '</p><h4>PERCENT ABOUT EXERCISE</h4><p>' + data.rows[0].c.toFixed(4)
                   + '</p><h4>PERCENT ABOUT FAST FOOD</h4><p>' + data.rows[0].d.toFixed(4)
                   + '</p><h4> PERCENT ABOUT FOOD</h4><p>' + data.rows[0].e.toFixed(4)
                   + '</p><h4>PERCENT THAT ARE HAPPY</h4><p>' + data.rows[0].f.toFixed(4)
                   + '</p><h4>PERCENT ABOUT HEALTHY FOOD</h4><p>' + data.rows[0].g.toFixed(4)
                   + '</p><h4>PERCENT ABOUT ALCOHOL THAT ARE HAPPY</h4><p>' + data.rows[0].h.toFixed(4)
                   + '</p><h4>PERCENT OF EXERCISE TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].i.toFixed(4)
                   + '</p><h4>PERCENT ABOUT FAST FOOD THAT ARE HAPPY</h4><p>' + data.rows[0].j.toFixed(4)
                   + '</p><h4>PERCENT OF FOOD TWEETS THAT ARE HAPPY</h4><p>' + data.rows[0].k.toFixed(4)
                   + '</p><h4>PERCENT ABOUT HEALTHY FOODS THAT ARE HAPPY</h4><p>' + data.rows[0].l.toFixed(4) + '</p></div>';

                // Replace the info window's content and position.
                infoWindow.setContent(contentString);
                infoWindow.open(map);
            }).error(function (errors) {
                alert(errors[0]);
            });
    }	
    	
	
};

//layers.push(	new LayerContainer('Subdivisions', 'https://www.cartedesign.com/farmington/subdivisions2.kmz', 'City Layers'));

layers.push(	new CartoDBLayer('State', 'https://hashtaghealth.carto.com/api/v2/viz/a88b82ca-0900-11e7-b06b-0e3ff518bd15/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('County', 'https://hashtaghealth.carto.com/api/v2/viz/d61716ee-0e4d-11e7-9c2f-0ee66e2c9693/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Census Tract', '', 'Map Layers'));
layers.push(	new CartoDBLayer('ZIP code', '', 'Map Layers'));








function initialize() {
   geocoder = new google.maps.Geocoder();
	
    drawingManager = new google.maps.drawing.DrawingManager(drawnOptions);
    drawingManager.setMap(map);
    drawingManager.setDrawingMode(null);
    // Add a listener to show coordinate when right click
    google.maps.event.addListener(drawingManager, 'circlecomplete', function (shape) {
        if (shape == null || (!(shape instanceof google.maps.Circle))) return;
        circle.push(shape);
    });   
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event1) {
        polygonArray.push(event1.overlay);
        drawingManager.setDrawingMode(null);
        if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
            rectangle.push(event.overlay.getBounds());
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
