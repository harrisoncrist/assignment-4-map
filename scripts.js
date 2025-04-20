

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

	//add 2023 layer source
	map_right.addLayer({
		id: 'loan_value_chloro_2023',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'hmda_join_2018_2023_mean_loan_ct_2023']], //convert mean loan amount to a number by ct for 2023
				0, '#ff0000',     // Red
				25, '#ff8000',    // Orange
				50, '#ffff00',    // Yellow
				75, '#80ff00',    // Yellow-Green
				100, '#00ff00'],  // Green
			'fill-opacity': 0.6,
			'fill-outline-color': '#000000'
		},
		layout: {
			visibility: 'none'
		}
	});

	//add 2018 layer 
	map_right.addLayer({
		id: 'loan_value_chloro_2018',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['to-number', ['get', 'hmda_join_2018_2023_mean_loan_ct_2018']], //convert mean loan amount to a number by ct for 2018
				0, '#ff0000',     // Red
				25, '#ff8000',    // Orange
				50, '#ffff00',    // Yellow
				75, '#80ff00',    // Yellow-Green
				100, '#00ff00'],  // Green
			'fill-opacity': 0.6,
			'fill-outline-color': '#000000'
		},
		layout: {
			visibility: 'none'
		}
	});

	document.getElementById('btn-loan-2018').addEventListener('click', () => showLayer('loan_value_chloro_2018'));
	document.getElementById('btn-loan-2023').addEventListener('click', () => showLayer('loan_value_chloro_2023'));

	function showLayer(layerShow) {
		const layers = ['loan_value_chloro_2023', 'loan_value_chloro_2018'];
		layers.forEach(layer => {
			const visibility = (layer === layerShow) ? 'visible' : 'none';
			if (map_right.getLayer(layer)) {
				map_right.setLayoutProperty(layer, 'visibility', visibility);
			}
		});
	}
})