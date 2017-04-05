var LayerContainer = function (n, u, c) {
    this.name = n;
    this.kmzURL = u;
    this.category = c;
    this.layer = new google.maps.KmlLayer(this.kmzURL, { preserveViewport: true });

    this.putOnMap = function () {
        this.layer.setMap(map);
    };
    this.clearFromMap = function () {
        this.layer.setMap(null);
    };

    this.isOnMap = function () {
        return false;
    };
};
//Special Layer includes Traffic, Weather and Pictures and Bicycle
var SpecialLayer = function (n, t, c) {
    this.name = n;

    this.category = c;

    if (t == 'photo') {
        this.layer = new google.maps.panoramio.PanoramioLayer();
    }
    else if (t == 'traffic') {
        this.layer = new google.maps.TrafficLayer();
    }
    else if (t == 'weather') {
        this.layer = new google.maps.weather.WeatherLayer({
            temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
        });
    }
    else if (t == 'bike') {
        this.layer = new google.maps.BicyclingLayer();
    }

    this.putOnMap = function () {
        this.layer.setMap(map);
    };
    this.clearFromMap = function () {
        this.layer.setMap(null);
    };
};

