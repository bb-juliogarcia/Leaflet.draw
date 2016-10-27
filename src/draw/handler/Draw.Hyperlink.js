L.Draw.Hyperlink = L.Draw.HyperlinkHandler.extend({
	statics: {
		TYPE: 'hyperlink'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		metric: true // Whether to use the metric measurement system or imperial
	},

	getShapeOptions: function () {
		var destinationOptions = {
			stroke: true,
			color: '#f06eaa',
			weight: 1,
			opacity: 1,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0,
			clickable: false
		};
		if (!this.sourceRectangle) {
			return this.options.shapeOptions;
		}
		else if (!this.destinationRectangle) {
			destinationOptions.dashArray = '5, 5';
			return destinationOptions;
		} else {
			destinationOptions.opacity = 0;
			return destinationOptions;
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Hyperlink.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.hyperlink.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.getShapeOptions());
			this._map.addLayer(this._shape);
		} else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}
	},

	_fireCreatedEvent: function (rectangle) {
		L.Draw.HyperlinkHandler.prototype._fireCreatedEvent.call(this, rectangle);
	},

	_getTooltipText: function () {
		var tooltipText = L.Draw.HyperlinkHandler.prototype._getTooltipText.call(this),
			shape = this._shape,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape.getLatLngs();
			area = L.GeometryUtil.geodesicArea(latLngs);
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}
});