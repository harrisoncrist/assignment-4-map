

mapboxgl.accessToken = 'pk.eyJ1IjoiYWhjcmlzdCIsImEiOiJjbTkyMGNvYTkwMHM2MmxuM2ZveGE0cHMyIn0.cETUTrGOPhzETUiIkdsXdg';
const map_right = new mapboxgl.Map({
	container: 'map_right', // container ID
	style: 'mapbox://styles/mapbox/light-v11', // Light style
	maxBounds: [
		[-74.46117, 40.41636],
		[-73.54665, 40.96686]
	]// max bounds
});

//load the map
map_right.on('load', () => {

	//add geojson source
	map_right.addSource('ct_boundaries', {
		type: 'geojson',
		data: './A_hdma_acs_18_23.geojson',
	})

	//add 2023 layer source
	map_right.addLayer({
		id: 'layer_2023',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'],
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
		id: 'layer_2018',
		type: 'fill',
		source: 'ct_boundaries',
		paint: {
			'fill-color': ['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2018'],
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

	document.getElementById('btn-loan-2018').addEventListener('click', () => showLayer('layer_2018'));
	document.getElementById('btn-loan-2023').addEventListener('click', () => showLayer('layer_2023'));

	function showLayer(layer_to_show) {
		const layers = ['layer_2023', 'layer_2018'];
		layers.forEach(layer => {
			const visibility = (layer === layer_to_show) ? 'visible' : 'none';
			if (map_right.getLayer(layer)) {
				map_right.setLayoutProperty(layer, 'visibility', visibility);
			}
		});
	}
})

map_right.on('click', ['layer_2023', 'layer_2018'], (e) => {
	const features = map_right.queryRenderedFeatures(e.point, {
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
