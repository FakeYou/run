import * as d3 from 'd3';
import geotile from './lib/tile';
import './index.css';

window.d3 = d3;

const width = 1280;
const height = 720;

const layers = ['water', 'buildings', 'roads', 'landuse'];

const projection = d3.geoMercator()
	.center([6.570930, 53.219834])
	.scale((1 << 23) / 2 / Math.PI)
	.translate([width / 2, height / 2]);

const path = d3.geoPath()
	.projection(projection);

const tiler = geotile()
	.size([width, height])
	.scale(projection.scale() * 2 * Math.PI)
	.translate(projection([0, 0]));

const svg = d3.select('body')
  .append('svg')
		.attr('width', width)
		.attr('height', height);

const g = svg.append('g');

svg.selectAll('g')
	.data(tiler)
	.enter().append('g')
		.each(function(d) {
			const self = d3.select(this);
			const url = `https://vector.mapzen.com/osm/${layers.join(',')}/${d[2]}/${d[0]}/${d[1]}.json?api_key=vector-tiles-ZQsaRt5`;

			d3.json(url, (error, json) => {
				if (error) {
					console.error(error);
					return;
				}

				const features = [];

				layers.forEach(layer => {
					json[layer].features.forEach(feature => {
						if (feature.properties.label_placement === 'yes') {
							return;
						}

						feature.properties.layer = layer;
						features.push(feature);
					});
				});


        self.selectAll('path')
          .data(features.sort((a, b) => a.properties.sort_key - b.properties.sort_key))
        .enter().append('path')
					.attr('class', d => {
						let { kind = '', boundary } = d.properties;

						if(boundary === 'yes') {
							kind = `${kind}_boundary`;
						}

						return `${kind}`;
					})
					.attr('data-props', d => JSON.stringify(d.properties))
          .attr('d', path);
			});
		})
