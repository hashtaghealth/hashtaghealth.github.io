var adUnit, infowindow, directionsDisplay, geocoder, map;
var directionsService = new google.maps.DirectionsService();
var latlng = new google.maps.LatLng(40.456389, -100.773611);

var myOptions = {
    zoom: 5,
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




layers.push(	new CartoDBLayer('Average Calories', 'https://hashtaghealth.carto.com/api/v2/viz/1038ed85-581a-4132-ae97-1d634b2c8993/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Age Adjusted Mortality', 'https://hashtaghealth.carto.com/api/v2/viz/4fec2e9a-923f-11e6-9aca-0e3ebc282e83/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Premature Mortality Rate', 'https://hashtaghealth.carto.com/api/v2/viz/316ace20-a1c1-498d-ad60-ca2e20466449/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Happy', 'https://hashtaghealth.carto.com/api/v2/viz/6e48b8dc-924d-11e6-a66d-0e05a8b3e3d7/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Diabetes', 'https://hashtaghealth.carto.com/api/v2/viz/e3bb2ea8-055d-4214-8479-187ffca6622a/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Exercise', 'https://hashtaghealth.carto.com/api/v2/viz/69654092-c3bc-4415-bfbe-3496d762925a/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Fast Food', 'https://hashtaghealth.carto.com/api/v2/viz/9838aa41-3958-4163-b031-0b713053d508/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Fair/Poor Health', 'https://hashtaghealth.carto.com/api/v2/viz/54fbfc8d-3125-481b-8d24-e5359c972d86/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Food', 'https://hashtaghealth.carto.com/api/v2/viz/8eb1d1f8-cc61-45fb-b6af-eed834c43678/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Healthy Food', 'https://hashtaghealth.carto.com/api/v2/viz/66c6bcac-4a9e-4380-af84-807bb92a69fe/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Obesity', 'https://hashtaghealth.carto.com/api/v2/viz/73fd643d-f500-48c5-9e3a-99387051b871/viz.json', 'Map Layers'));
layers.push(	new CartoDBLayer('Physically Inactive', 'https://hashtaghealth.carto.com/api/v2/viz/5b503f86-c3b5-4d28-ae69-fe082e795200/viz.json', 'Map Layers'));







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
      map.setZoom(10);
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




