// Create a styles array to use with the map.
let styles = [
  {
    featureType: 'all',
    stylers: [
      { saturation: -80 }
    ]
  },{
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { hue: '#00ffee' },
      { saturation: 50 }
    ]
  },{
    featureType: 'poi.business',
    elementType: 'labels',
    stylers: [
      { visibility: 'off' }
    ]
  }
]
