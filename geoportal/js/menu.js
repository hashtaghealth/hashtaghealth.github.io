//-------------------MENU CONTEXT TO DELETE SHAPE---------------------
// Defining the context menu class.
function ContextMenuDrawing(map) {
    this.setMap(map);
    this.map = map;
    this.mapDiv = map.getDiv();
    this.menuDiv = null;
};
// set up function for this menu
function DrawnMenuSetUp() {
    ContextMenuDrawing.prototype = new google.maps.OverlayView();
    ContextMenuDrawing.prototype.draw = function () { };
    ContextMenuDrawing.prototype.onAdd = function () {
        var that = this;
        this.menuDiv = document.createElement('div');
        this.menuDiv.className = 'contextmenu';
        this.menuDiv.innerHTML = '<a id="rm">Remove Shape</a>';
        //this.menuDiv.innerHTML = '<a href="javascript:remove()">Remove Shape</a>';
        this.getPanes().floatPane.appendChild(this.menuDiv);
        //This event listener below will close the context menu
        //on map click
        google.maps.event.addListener(this.map, 'click', function (mouseEvent) {
            that.hide();
        });
    };
    ContextMenuDrawing.prototype.onRemove = function () {
        this.menuDiv.parentNode.removeChild(this.menuDiv);
    };
    ContextMenuDrawing.prototype.show = function (coord) {
        var proj = this.getProjection();
        var mouseCoords = proj.fromLatLngToDivPixel(coord);
        var left = Math.floor(mouseCoords.x);
        var top = Math.floor(mouseCoords.y);
        this.menuDiv.style.display = 'block';
        this.menuDiv.style.left = left + 'px';
        this.menuDiv.style.top = top + 'px';
        this.menuDiv.style.visibility = 'visible';
    };
    ContextMenuDrawing.prototype.hide = function (x, y) {
        this.menuDiv.style.visibility = 'hidden';
    }
}

//----------------------MAP CONTEXT MENU-------------------------------
//-------------------MENU CONTEXT TO DELETE SHAPE---------------------
// Defining the context menu class.
function ContextMenuMap(map) {
    this.setMap(map);
    this.map = map;
    this.mapDiv = map.getDiv();
    this.menuDiv = null;
};
// set up function for this menu
function MapMenuSetUp() {
    ContextMenuMap.prototype = new google.maps.OverlayView();
    ContextMenuMap.prototype.draw = function () { };
    ContextMenuMap.prototype.onAdd = function () {
        var that = this;
        this.menuDiv = document.createElement('div');
        this.menuDiv.className = 'contextmenuMap';
        this.menuDiv.innerHTML = '<a id="add">Add</a><br><a id="not add">Remove</a>';
        //this.menuDiv.innerHTML = '<a href="javascript:remove()">Remove Shape</a>';
        this.getPanes().floatPane.appendChild(this.menuDiv);
        //This event listener below will close the context menu
        //on map click
        google.maps.event.addListener(this.map, 'click', function (mouseEvent) {
            that.hide();
        });
    };
    ContextMenuMap.prototype.onRemove = function () {
        this.menuDiv.parentNode.removeChild(this.menuDiv);
    };
    ContextMenuMap.prototype.show = function (coord) {
        var proj = this.getProjection();
        var mouseCoords = proj.fromLatLngToDivPixel(coord);
        var left = Math.floor(mouseCoords.x);
        var top = Math.floor(mouseCoords.y);
        this.menuDiv.style.display = 'block';
        this.menuDiv.style.left = left + 'px';
        this.menuDiv.style.top = top + 'px';
        this.menuDiv.style.visibility = 'visible';
    };
    ContextMenuMap.prototype.hide = function (x, y) {
        this.menuDiv.style.visibility = 'hidden';
    }
}