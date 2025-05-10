

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

let hoveredId = null;
let activeId = null;
//load the map
map_one_frame.on('load', () => {
	//assign unique IDs to each feature
	fetch('./A_hdma_acs_18_23.geojson')
		.then(response => response.json())
		.then(data => {
			// Assign unique IDs to each feature
			data.features.forEach((feature, index) => {
				feature.id = index
			});

			//add geojson source
			map_one_frame.addSource('ct_boundaries', {
				type: 'geojson',
				data: data
			});

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
						['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent',
						['boolean', ['feature-state', 'hover'], false], '#f7e0b6',
						['boolean', ['feature-state', 'active'], false], '#ff9900',
						['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'],
							281000, 'rgb(234,209,150)',     // 6 colors: beige
							411667, 'rgb(212,169,122)',    // 
							535000, 'rgb(190,129,94)',    // 
							725000, 'rgb(169,90,66)',    // 
							1165000, 'rgb(147,50,38)',  // 
							2005000, 'rgb(125,10,10)']],	//red
					'fill-outline-color': 'transparent'
				},
				layout: { visibility: 'none' }
			});

			//add 2018 layer 
			map_one_frame.addLayer({
				id: 'layer_2018',
				type: 'fill',
				source: 'ct_boundaries',
				paint: {
					'fill-color': [
						'case',
						['==', ['get', 'B_download_acs_hdma_2018_2023_average_loan_2023'], null], 'transparent',
						['boolean', ['feature-state', 'hover'], false], '#f7e0b6',
						['boolean', ['feature-state', 'active'], false], '#ff9900',
						['interpolate', ['linear'], ['get', 'B_download_acs_hdma_2018_2023_average_loan_2018'],
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

			//add delta layer
			//map_one_frame.on('load', () => {
			//modify geojson to add difference in loan value property
			fetch('./A_hdma_acs_18_23.geojson')
				.then(response => response.json())
				.then(modified_hdma_data => {
					modified_hdma_data.features.forEach((feature, index) => {
						feature.id = index; // Assign a unique ID to each feature
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

					//add the layer as a source to map_one_frame
					map_one_frame.addSource('loan_value_difference_source', {
						type: 'geojson',
						data: modified_hdma_data
					});


					//add extruded layer 
					map_one_frame.addLayer({
						id: 'loan_value_difference_layer',
						type: 'fill-extrusion',
						source: 'loan_value_difference_source',
						filter: ['has', 'difference'],
						paint: {
							'fill-extrusion-height': ['*', ['get', 'difference'], 0.005], // scaled height
							'fill-extrusion-base': 0,
							'fill-extrusion-color': [
								'case',
								['boolean', ['feature-state', 'hover'], false], '#ffcc99',
								['boolean', ['feature-state', 'active'], false], '#ff6600',
								'red'
							],
							'fill-extrusion-base': 0,
							'fill-extrusion-opacity': 0.6,
						},
						layout: { visibility: 'none' }
					});
					setupInteractivity('layer_2023');
					setupInteractivity('layer_2018');
					setupInteractivity('loan_value_difference_layer', 'loan_value_difference_source');
				});
		});



	function showLayer(layer_to_show) {
		const layers = ['layer_2023', 'layer_2018', 'loan_value_difference_layer'];
		layers.forEach(layers => {
			const visibility = (layers === layer_to_show) ? 'visible' : 'none';
			if (map_one_frame.getLayer(layers)) {
				map_one_frame.setLayoutProperty(layers, 'visibility', visibility);
			}
		});
	}

	function setupInteractivity(layerId, sourceId = 'ct_boundaries') {
		map_one_frame.on('mousemove', layerId, (e) => {
			if (e.features.length > 0) {
				const fid = e.features[0].id;
				if (hoveredId !== null && hoveredId !== fid) {
					map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
				}
				hoveredId = fid;
				map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: true });
			}
		});

		map_one_frame.on('mouseleave', layerId, () => {
			if (hoveredId !== null) {
				map_one_frame.setFeatureState({ source: sourceId, id: hoveredId }, { hover: false });
				hoveredId = null;
			}
		});

		map_one_frame.on('click', layerId, (e) => {
			if (activeId !== null) {
				map_one_frame.setFeatureState({ source: sourceId, id: activeId }, { active: false });
			}
			activeId = e.features[0].id;
			map_one_frame.setFeatureState({ source: sourceId, id: activeId }, { active: true });
		});
	}

	document.getElementById('btn-loan-2018').addEventListener('click', () => {
		showLayer('layer_2018');
		map_one_frame.setPitch(0);
	});
	document.getElementById('btn-loan-2023').addEventListener('click', () => {
		showLayer('layer_2023');
		map_one_frame.setPitch(0);
	});

	document.getElementById('btn-delta-2018-2023').addEventListener('click', () => {
		showLayer('loan_value_difference_layer');
		map_one_frame.setPitch(60);
	})
})

document.addEventListener('DOMContentLoaded', () => {
	const closeBtn = document.getElementById('close-btn');
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			document.getElementById('info-box').classList.add('hidden');
		});
	}

	map_one_frame.on('click', ['layer_2023', 'layer_2018', 'loan_value_difference_layer'], (e) => {
		const features = map_one_frame.queryRenderedFeatures(e.point, {
			layers: ['layer_2023', 'layer_2018', 'loan_value_difference_layer']
		});

		if (!features.length) return;
		const props = features[0].properties;

		const formatK = (num) => {
			if (!num) return 'Data not available';
			const rounded = Math.ceil(Number(num) / 1000); // Round up to nearest thousand
			return `$${rounded}K`;
		};
		document.getElementById('info-box').classList.remove('hidden');

		document.getElementById('boro-name').textContent = props.BoroName || 'N/A';
		document.getElementById('neighborhood-name').textContent = props.NTAName || 'N/A';
		document.getElementById('avg-loan-2018').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2018)
		document.getElementById('avg-loan-2023').textContent = formatK(props.B_download_acs_hdma_2018_2023_average_loan_2023)
		// ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2023).toLocaleString()}` : 'N/A';
		// ? `$${Number(props.B_download_acs_hdma_2018_2023_average_loan_2018).toLocaleString()}` : 'N/A';
		/*document.getElementById('avg-property').textContent = props.avg_property_value ? `$${Number(props.avg_property_value).toLocaleString()}` : 'N/A';*/


	});
});