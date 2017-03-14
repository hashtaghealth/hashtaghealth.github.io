var adUnit, infowindow, directionsDisplay, geocoder, map;
var directionsService = new google.maps.DirectionsService();
var latlng = new google.maps.LatLng(40.456389, -100.773611);

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

  this.putOnMap = function()
	{
		cartodb.createLayer(map, u).addTo(map, l_in).on('done', function(layer) {
    		l = layer;
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
layers.push(	new CartoDBLayer('County', '', 'Map Layers'));
layers.push(	new CartoDBLayer('Census Tract', '', 'Map Layers'));
layers.push(	new CartoDBLayer('ZIP code', '', 'Map Layers'));








function initialize() {
  geocoder = new google.maps.Geocoder();
  directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('panel'));
  /*     .on('done', function(layer) {
      var subLayer = layer.getSubLayer(0);
      subLayer.infowindow.set('template', $('#infowindow_template').html());
	 }
	 )*/;
  startVisible('City Boundary');
}

google.maps.event.addDomListener(window, 'load', initialize);






// Google geocoding code

function codeAddress() {
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
