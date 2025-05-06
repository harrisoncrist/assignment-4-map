

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const bounds = [

	[-75.39440, 40.12631],
	[-72.93263, 41.25213]
];

// Create map_one_frame, which is an option bw 2018 and 2023 average loan values

const map_one_frame = new mapboxgl.Map({
	container: 'map_one_frame', // container ID
	style: 'mapbox://styles/mapbox/dark-v11', // dark style
	cooperativeGestures: true,
	zoom: 9,
	center: [-73.99932, 40.71125],
	maxBounds: bounds
});

//load the map
map_one_frame.on('load', () => {

	//add geojson source
	map_one_frame.addSource('ct_boundaries', {
		type: 'geojson',
		data: './A_hdma_acs_18_23.geojson',
	})
	//disable scroll zoom on map_one_frame
	//map_one_frame.scrollZoom.disable();
	map_one_frame.addControl(new mapboxgl.FullscreenControl());

	//add 2023 layer source
	map_one_frame.addLayer({
		id: 'layer_2023',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'],
				281000, '#ff0000',     // Red
				411667, '#ff8000',    // Orange
				535000, '#ffff00',    // Yellow
				725000, '#80ff00',    // Yellow-Green
				1165000, '#00ff00',  // Green
				2005000, 'blue'],
			'fill-opacity': 0.6,
			'fill-outline-color': 'rgba(0, 0, 0, 0)'
		},
		layout: {
			visibility: 'none'
		}
	});

	//add 2018 layer 
	map_one_frame.addLayer({
		id: 'layer_2018',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2018'],
				281000, '#ff0000',     // Red
				411667, '#ff8000',    // Orange
				535000, '#ffff00',    // Yellow
				725000, '#80ff00',    // Yellow-Green
				1165000, '#00ff00',  // Green
				2005000, 'blue'],
			'fill-opacity': 0.6,
			'fill-outline-color': 'rgba(0, 0, 0, 0)'
		},
		layout: {
			visibility: 'none'
		}
	});

	document.getElementById('btn-loan-2018').addEventListener('click', () => {
		showLayer('layer_2018');
		document.getElementById('intro-overlay').style.display = 'none';
	});

	document.getElementById('btn-loan-2023').addEventListener('click', () => {
		showLayer('layer_2023');
		document.getElementById('intro-overlay').style.display = 'none';
	});


	document.getElementById('btn-loan-2018').addEventListener('click', () => showLayer('layer_2018'));
	document.getElementById('btn-loan-2023').addEventListener('click', () => showLayer('layer_2023'));

	function showLayer(layer_to_show) {
		const layers = ['layer_2023', 'layer_2018'];
		layers.forEach(layer => {
			const visibility = (layer === layer_to_show) ? 'visible' : 'none';
			if (map_one_frame.getLayer(layer)) {
				map_one_frame.setLayoutProperty(layer, 'visibility', visibility);
			}
		});
	}
})

map_one_frame.on('click', ['layer_2023', 'layer_2018'], (e) => {
	const features = map_one_frame.queryRenderedFeatures(e.point, {
		layers: ['layer_2023', 'layer_2018']
	});

	if (!features.length) return;
	const props = features[0].properties;

	document.getElementById('neighborhood-name').textContent = props.NTAName || 'N/A';
	document.getElementById('avg-loan-2018').textContent = props.B_download_acs_hdma_2018_2023_average_loan_2018 ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2018).toLocaleString()}` : 'N/A';
	document.getElementById('avg-loan-2023').textContent = props.B_download_acs_hdma_2018_2023_average_loan_2023 ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2023).toLocaleString()}` : 'N/A';
	/*document.getElementById('avg-property').textContent = props.avg_property_value ? `$${Number(props.avg_property_value).toLocaleString()}` : 'N/A';*/
	document.getElementById('info-box').classList.remove('hidden');
});


// Create map_two_frame, which is the difference between 2023 and 2018 average loan values
const map_two_frame = new mapboxgl.Map({
	container: 'map_two_frame', // container ID
	style: 'mapbox://styles/mapbox/dark-v11', // dark style
	cooperativeGestures: true,
	zoom: 9,
	pitch: 60,
	bearing: -40,
	center: [-73.99932, 40.71125],
	maxBounds: bounds
});

map_two_frame.on('load', () => {
	//modify geojson to add difference in loan value property
	fetch('./A_hdma_acs_18_23.geojson')
		.then(response => response.json())
		.then(modified_hdma_data => {
			modified_hdma_data.features.forEach(feature => {
				const avgLoan2018 = feature.properties.B_download_acs_hdma_2018_2023_average_loan_2018;
				const avgLoan2023 = feature.properties.B_download_acs_hdma_2018_2023_average_loan_2023;
				// Check if both properties exist before calculating the difference
				if (
					avgLoan2018 != null &&
					avgLoan2023 != null &&
					!isNaN(avgLoan2018) &&
					!isNaN(avgLoan2023)
				) {
					feature.properties.difference = avgLoan2023 - avgLoan2018;
				}
			});

			//add the layer as a source to map_two_frame
			map_two_frame.addSource('loan_value_difference_source', {
				type: 'geojson',
				data: modified_hdma_data
			});


			//add extruded layer 
			map_two_frame.addLayer({
				id: 'loan_value_difference_layer',
				type: 'fill-extrusion',
				source: 'loan_value_difference_source',
				filter: ['has', 'difference'],
				paint: {
					'fill-extrusion-height': ['*', ['get', 'difference'], 0.005], // scaled height
					'fill-extrusion-base': 0,
					'fill-extrusion-color': 'red',
					'fill-extrusion-opacity': 0.6,
				}
			});

		});
//add a info panel??
});