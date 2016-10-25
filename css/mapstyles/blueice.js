// Create a styles array to use with the map.
let styles = [
  {
    stylers: [
      { hue: '#00ffe6' },
      { saturation: -20 }
    ]
  },{
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { lightness: 100 },
      { visibility: 'simplified' }
    ]
  },{
    featureType: 'road',
    elementType: 'labels',
    stylers: [
      { visibility: 'off' }
    ]
  }
]
