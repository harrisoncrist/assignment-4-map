mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const map_left = new mapboxgl.Map({
	container: 'map_left', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: [-73.99530, 40.74676], // starting position [lng, lat]
	zoom: 8, // starting zoom
});

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const map_right = new mapboxgl.Map({
	container: 'map_right', // container ID
	style: 'mapbox://styles/mapbox/streets-v12', // style URL
	center: [-73.99530, 40.74676], // starting position [lng, lat]
	zoom: 8, // starting zoom
});

//load the map
map_right.on('load', () => {

	//add geojson source
	map_right.addSource('ct_boundaries', {
		type: 'geojson',
		data: './hdma_ct_boundaries_nyc.geojson'
	})

map_right.addLayer({
	id: 'ct_boundaries',
	type: 'fill',
	source: 'ct_boundaries',
	paint: {
		'fill-color': '#088'
	} 

})

})