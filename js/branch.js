let map;

// Create a new blank array for all the listing markers.
// let customStyles = "./css/mapstyles/unsaturatedbrown.json";
let markers = [];
let styles = [];
let polygon = null;

// function WIPstyleLoader(input) {
//   if (JSselected) {
//     input file name into local var "name"
//     styles = "./css/mapstyles/" + name + ".js";
//   } else if (JSONselected) {
//     type_file_name
//     $.getJSON("./css/mapstyles/" + name + ".json").done(function(returnData) {
//       for (i in returnData) {
//         styles.push(returnData[i]);
//       }
//     });
//   } else {
//     NO STYLE SELECTED
//     input again please
//   }
// }

function initMap() {
  // WIPstyleLoader();
  // Populates the styles array to use with the map.
  $.getJSON("./css/mapstyles/unsaturatedbrown.json").done(function(returnData) {
      for (i in returnData) {
        styles.push(returnData[i]);
      }
  });

  // Constructor creates new map - only center and zoom are req'd
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.4299578, lng: 26.0984628},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  // These are the listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  let locations = [
    {title: 'Mural Home', location: {lat: 44.442570, lng: 26.101725}},
    {title: 'Secret Gardens of Deli', location: {lat: 44.522343, lng: 26.089522}}
  ];
    // {title:"", location:{lat:, lng:}},
    // {title:"", location:{lat:, lng:}}
  let largeInfoWindow = new google.maps.InfoWindow();
  let drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  // Style the markers a bit. This will be our listing marker icon.
  let defaultIcon = makeMarkerIcon('0091ff');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  let highlightedIcon = makeMarkerIcon('FFFF24');
  // The following group uses the location array to create an array of markers on init.
  for (let i = 0; i < locations.length; i++){
    // Get the position from the location array.
    let position = locations[i].location;
    let title = locations[i].title;
    // Create a marker per location, and put into markers array.
    let marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener("click", function(){
      populateInfoWindow(this, largeInfoWindow);
    });
    // Two event listeners - one for mouseover,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }

  document.getElementById('show-areas').addEventListener('click', showAreas);
  document.getElementById('hide-areas').addEventListener('click', hideAreas);

  document.getElementById('toggle-drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  // Add an event listener so that the polygon is captured, call the
  // searchWithinPolygon function. This will show the markers in the polygon,
  // and hide any outside of it.
  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon.
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideAreas();
    }
    // Switching the drawing mode to the HAND (i.e., no longer drawing).
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching within the polygon.
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });
}
  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker){
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    let streetViewService = new google.maps.StreetViewService();
    let radius = 50;
    // In case the status is OK, which means the pano was found, compute the
    // position of the streetview image, then calculate the heading, then get a
    // panorama from that and set the options.
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        let nearStreetViewLocation = data.location.latLng;
        let heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        let panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        let panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
        '<div>No Street View Found</div>');
      }
    }

    // Use streetview service to get the closest streetview image within
    // 50 meters of the markers' position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}
  // This function will loop through the markers array and display them all.
function showAreas() {
  let bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
  // This function will loop through the listings and hide them all.
function hideAreas() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
  // This function takes in a COLOR, and then creates a new marker
  // icon of that color. The icon will be 21px wide by 34px high, have an origin
  // of (0,0) and be anchored at (10,34).
function makeMarkerIcon(markerColor) {
  let markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21,34),
    new google.maps.Point(0,0),
    new google.maps.Point(10,34),
    new google.maps.Size(21,34)
  );
  return markerImage;
}
// This shows and hides (respectively) tje drawing options.
function toggleDrawing(drawingManager) {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    // In case the user drew anything, get rid of the polygon
    if (polygon) {
      polygon.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}
// This function hides all markers outside the polygon,
// and shows only the ones within it. This is so that the
// user can specify an exact area of search.
function searchWithinPolygon() {
  for (let i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}
