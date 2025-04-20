

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const map_right = new mapboxgl.Map({
	container: 'map_right', // container ID
	style: 'mapbox://styles/mapbox/light-v11', // Light style
	center: [-73.99530, 40.74676], // starting position [lng, lat]
	zoom: 8, // starting zoom
	maxBounds: [
		[-74.65801, 40.48017],
		[-73.46734, 41.08823]
	] // max bounds
});

//load the map
map_right.on('load', () => {

	//add geojson source
	map_right.addSource('ct_boundaries', {
		type: 'geojson',
		data: './hdma_ct_boundaries_nyc.geojson'
	})

	map_right.addLayer({
		id: 'loan_value_chloro',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'hmda_join_2018_2023_mean_loan_ct_2023']], //mean loan amount by ct for 2023
				0, '#ff0000',     // Red
				25, '#ff8000',    // Orange
				50, '#ffff00',    // Yellow
				75, '#80ff00',    // Yellow-Green
				100, '#00ff00'],  // Green
				'fill-opacity': 0.6,
				'fill-outline-color': '#000000'
		}

	})

})