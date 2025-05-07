

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const bounds = [
	[-74.67252, 40.45470],
	[-73.42330, 41.09414]
];

// Create map_one_frame, which is an option bw 2018 and 2023 average loan values

const map_one_frame = new mapboxgl.Map({
	container: 'map_one_frame', // container ID
	style: 'mapbox://styles/mapbox/light-v11', // dark style
	//cooperativeGestures: true,
	zoom: 9,
	center: [-74.17723, 40.70818],
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
	//map_one_frame.addControl(new mapboxgl.FullscreenControl());

	//add 2023 layer source
	map_one_frame.addLayer({
		id: 'layer_2023',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': [
				'case',
				['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent', ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'],
					281000, 'rgb(234,209,150)',     // 6 colors: beige
					411667, 'rgb(212,169,122)',    // 
					535000, 'rgb(190,129,94)',    // 
					725000, 'rgb(169,90,66)',    // 
					1165000, 'rgb(147,50,38)',  // 
					2005000, 'rgb(125,10,10)']],	//red
			'fill-outline-color': 'transparent'
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
			'fill-color': [
				'case',
				['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent', ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2018'],
					281000, 'rgb(234,209,150)',     // 6 colors: beige
					411667, 'rgb(212,169,122)',    // 
					535000, 'rgb(190,129,94)',    // 
					725000, 'rgb(169,90,66)',    // 
					1165000, 'rgb(147,50,38)',  // 
					2005000, 'rgb(125,10,10)']],	//red
			'fill-outline-color': 'transparent'
		}
		// ,
		// layout: {
		// 	visibility: 'none'
		// }
	});

	function showLayer(layer_to_show) {
		const layers = ['layer_2023', 'layer_2018'];
		layers.forEach(layer => {
			const visibility = (layer === layer_to_show) ? 'visible' : 'none';
			if (map_one_frame.getLayer(layer)) {
				map_one_frame.setLayoutProperty(layer, 'visibility', visibility);
			}
		});
	}

	document.getElementById('btn-loan-2018').addEventListener('click', () => showLayer('layer_2018'));
	document.getElementById('btn-loan-2023').addEventListener('click', () => showLayer('layer_2023'));


})

document.addEventListener('DOMContentLoaded', () => {
	const closeBtn = document.getElementById('close-btn');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			document.getElementById('info-box').classList.add('hidden');
		});
	}

	map_one_frame.on('click', ['layer_2023', 'layer_2018'], (e) => {
		const features = map_one_frame.queryRenderedFeatures(e.point, {
			layers: ['layer_2023', 'layer_2018']
		});

		if (!features.length) return;
		const props = features[0].properties;

		const formatK = (num) => {
			if (!num) return 'Data not available';
			const rounded = Math.ceil(Number(num) / 1000); // Round up to nearest thousand
			return `$${rounded}K`;
		};
		document.getElementById('info-box').classList.remove('hidden');

		document.getElementById('neighborhood-name').textContent = props.NTAName || 'N/A';
		document.getElementById('avg-loan-2018').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2018)
		document.getElementById('avg-loan-2023').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2023)
		// ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2023).toLocaleString()}` : 'N/A';
		// ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2018).toLocaleString()}` : 'N/A';
		/*document.getElementById('avg-property').textContent = props.avg_property_value ? `$${Number(props.avg_property_value).toLocaleString()}` : 'N/A';*/


	});
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