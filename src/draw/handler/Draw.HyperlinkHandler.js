L.HyperlinkHandler = {};

L.Draw.HyperlinkHandler = L.Draw.Feature.extend({
	options: {
		repeatMode: false,
	},

	initialize: function (map, options, source) {
		this._endLabelText = L.drawLocal.draw.handlers.hyperlink.tooltip.end;
		if (source) {
			this.sourceRectangle = source;
		}
		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._mapDraggable = this._map.dragging.enabled();

			if (this._mapDraggable) {
				this._map.dragging.disable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this)
				.on('touchstart', this._onMouseDown, this)
				.on('touchmove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			if (this._mapDraggable) {
				this._map.dragging.enable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this)
				.off('touchstart', this._onMouseDown, this)
				.off('touchmove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
			L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
		}
		this._isDrawing = false;
	},

	_getTooltipText: function () {
		return {
			text: !this.sourceRectangle ? L.drawLocal.draw.handlers.hyperlink.tooltip.start : L.drawLocal.draw.handlers.hyperlink.tooltip.end
		};
	},

	_onMouseDown: function (e) {
		this._isDrawing = true;
		this._startLatLng = e.latlng;

		L.DomEvent
			.on(document, 'mouseup', this._onMouseUp, this)
			.on(document, 'touchend', this._onMouseUp, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent(this._getTooltipText());
			this._drawShape(latlng);
		}
	},

	_onMouseUp: function () {
		if (!this.sourceRectangle) {
			this.sourceRectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
			this._fireHyperlinkSourceCreatedEvent(this.sourceRectangle);
			this._tooltip.updateContent(this._getTooltipText());
		} else if (!this.destinationRectangle) {
			this.destinationRectangle = new L.Rectangle(this._shape.getBounds(), this.getShapeOptions());
			this._fireHyperlinkCreatedEvent(this.sourceRectangle, this.destinationRectangle);
		}

		this.disable();
		if (this.options.repeatMode || !this.destinationRectangle) {
			this.enable();
		} else {
			this.sourceRectangle = {};
			this.destinationRectangle = {};
		}
	}
});