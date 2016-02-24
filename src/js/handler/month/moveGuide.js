/**
 * @fileoverview Module for modification of guide element for move in month view
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';
var util = global.tui.util;

var config = require('../../config'),
    domutil = require('../../common/domutil'),
    domevent = require('../../common/domevent'),
    FloatingLayer = require('../../common/floatingLayer'),
    tmpl = require('./moveGuide.hbs');

/**
 * @constructor
 * @param {MonthMove} monthMove - month/move module instance
 */
function MonthMoveGuide(monthMove) {
    /**
     * @type {MonthMove}
     */
    this.monthMove = monthMove;

    /**
     * @type {HTMLElement[]}
     */
    this.elements = null;

    /**
     * @type {FloatingLayer}
     */
    this.layer = null;

    /**
     * @type {HTMLElement[]}
     */
    this.gridElements = null;

    monthMove.on({
        month_move_dragstart: this._onDragStart,
        month_move_drag: this._onDrag,
        month_move_dragend: this._onDragEnd
    }, this);
}

/**
 * Destructor
 */
MonthMoveGuide.prototype.destroy = function() {
    this.monthMove.off(this);
    this._clearGridBgColor();

    if (this.layer) {
        this.layer.destroy();
    }

    if (this.element) {
        domutil.remove(this.element);
    }

    this.monthMove = this.elements = this.layer
        this.gridElements = null;
};

/**
 * Hide element blocks for resize effect
 * @param {number} modelID - CalEvent model instance ID
 */
MonthMoveGuide.prototype._hideOriginEventBlocks = function(modelID) {
    this.elements = domutil.find(
        config.classname('.weekday-event-block-' + modelID),
        this.monthMove.monthView.container,
        true
    );

    util.forEach(this.elements, function(el) {
        el.style.display = 'none';
    });
};

/**
 * Show element blocks
 */
MonthMoveGuide.prototype._showOriginEventBlocks = function() {
    util.forEach(this.elements, function(el) {
        el.style.display = 'block';
    });
};

/**
 * Clear background color for filled grid element.
 */
MonthMoveGuide.prototype._clearGridBgColor = function() {
    var selector = config.classname('.weekday-filled'),
        className = config.classname('weekday-filled'),
        beforeGridElement = domutil.find(selector,
            this.monthMove.monthView.container);


    if (beforeGridElement) {
        domutil.removeClass(beforeGridElement, className);
    }
};

/**
 * Fill background color of date grids relatied with model updates.
 * @param {object} dragEvent - drag event data from MonthMoveGuide#_onDrag
 */
MonthMoveGuide.prototype._updateGridBgColor = function(dragEvent) {
    var gridElements = this.gridElements,
        className = config.classname('weekday-filled'),
        targetIndex = (dragEvent.x + (dragEvent.sizeX * dragEvent.y)),
        target = gridElements[targetIndex];

    this._clearGridBgColor();

    if (!target) {
        return;
    }

    domutil.addClass(target, className);
};

/**
 * Handler for MonthMove#dragStart
 * @param {object} dragStartEvent - dragStart event data object
 */
MonthMoveGuide.prototype._onDragStart = function(dragStartEvent) {
    var monthView = this.monthMove.monthView,
        firstWeekdayView = monthView.children.single(),
        weekdayOptions = firstWeekdayView.options,
        widthPercent = 100 / firstWeekdayView.getRenderDateRange().length,
        height = weekdayOptions.eventGutter + weekdayOptions.eventHeight,
        container = monthView.container,
        mousePos = domevent.getMousePosition(dragStartEvent.originEvent, container),
        model = dragStartEvent.model,
        layer = new FloatingLayer(null, container);

    this._hideOriginEventBlocks(model.cid());

    if (!this.gridElements) {
        this.gridElements = domutil.find(
            config.classname('.weekday-grid-line'),
            container,
            true
        );
    }

    this.layer = layer;
    layer.setSize(widthPercent + '%', height);
    layer.setPosition(mousePos[0], mousePos[1]);
    layer.setContent(tmpl(model));
    layer.show();

    if (!util.browser.msie) {
        domutil.addClass(global.document.body, config.classname('dragging'));
    }
};

/**
 * Handler for MonthMove#drag
 * @param {object} dragEvent - drag event data object
 */
MonthMoveGuide.prototype._onDrag = function(dragEvent) {
    var container = this.monthMove.monthView.container,
        mousePos = domevent.getMousePosition(
            dragEvent.originEvent,
            container
        );

    this._updateGridBgColor(dragEvent);

    if (!this.layer) {
        return;
    }

    this.layer.setPosition(mousePos[0], mousePos[1]);
};

/**
 * Handler for MonthMove#dragEnd
 * @param {object} dragEndEvent - dragEnd event data object
 */
MonthMoveGuide.prototype._onDragEnd = function(dragEndEvent) {
    this._showOriginEventBlocks();

    if (!util.browser.msie) {
        domutil.removeClass(global.document.body, config.classname('dragging'));
    }

    this._clearGridBgColor();
    this.layer.destroy();
    this.layer = null;
};

module.exports = MonthMoveGuide;

