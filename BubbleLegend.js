/**
 * (c) 2010-2017 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
import H from '../parts/Globals.js';
var Series = H.Series,
    Legend = H.Legend,
    Chart = H.Chart,

    addEvent = H.addEvent,
    each = H.each,
    objectEach = H.objectEach,
    isNumber = H.isNumber,
    merge = H.merge,
    noop = H.noop,
    pick = H.pick,
    stableSort = H.stableSort,
    setOptions = H.setOptions,
    arrayMin = H.arrayMin,
    arrayMax = H.arrayMax;

setOptions({  // Set default bubble legend options
    legend: {
      /**
       * The bubble legend is an additional element in legend which presents
       * the scale of the bubble series. Individual bubble ranges can be
       * defined by user or calculated from series. In the case of
       * automatically calculated ranges, a 1px margin of error is permitted.
       * Requires `highcharts-more.js`.
       *
       * @product      highcharts highstock highmaps
       * @optionparent legend.bubbleLegend
       * @since 7.0.0
       */
        bubbleLegend: {
            /**
             * The color of the ranges borders, can be also defined for an
             * individual range.
             * @type {Color}
             * @sample highcharts/bubblelegend/similartoseries/
             *         Similat look to the bubble series
             * @sample highcharts/bubblelegend/bordercolor/
             *         Individual bubble border color
             */
            borderColor: '#058DC7',
            /**
             * The width of the ranges borders in pixels, can be also defined
             * for an individual range.
             */
            borderWidth: 2,
            /**
             * An additional class name to apply to the bubble legend' circle
             * graphical elements. This option does not replace default class
             * names of the graphical element.
             */
            className: undefined,
            /**
             * The main color of the bubble legend. Applies to ranges, if
             * individual color is not defined.
             * @type {Color}
             * @sample highcharts/bubblelegend/similartoseries/
             *         Similat look to the bubble series
             * @sample highcharts/bubblelegend/color/
             *         Individual bubble color
             */
            color: 'rgba(124, 181, 236, 0.5)',
            /**
             * An additional class name to apply to the bubble legend'
             * connector graphical elements. This option does not replace
             * default class names of the graphical element.
             */
            connectorClassName: undefined,
            /**
             * The color of the connector, can be also defined
             * for an individual range.
             */
            connectorColor: '#058DC7',
            /**
             * The length of the connectors in pixels. If labels are centered,
             * the distance is reduced to 0.
             * @type {Color}
             * @sample highcharts/bubblelegend/connectorandlabels/
             *         Increased connector length
             */
            connectorDistance: 60,
            /**
             * The width of the connectors in pixels.
             * @sample highcharts/bubblelegend/connectorandlabels/
             *         Increased connector width
             */
            connectorWidth: 1,
            /**
             * Enable or disable the bubble legend.
             */
            enabled: false,
            /**
             * Options for the bubble legend labels.
             */
            labels: {
                /**
                 * An additional class name to apply to the bubble legend'
                 * label graphical elements. This option does not replace
                 * default class names of the graphical element.
                 */
                className: undefined,
                /**
                 * Whether to allow data labels to overlap.
                 */
                allowOverlap: false,
                /**
                 * The alignment of the labels compared to the bubble legend.
                 * Can be one of `left`, `center` or `right`.
                 * @validvalue ["left", "center", "right"]
                 * @sample highcharts/bubblelegend/connectorandlabels/
                 *         Labels on left
                 */
                align: 'right',
                /**
                 * CSS styles for the labels.
                 * @type {CSSObject}
                 */
                style: {
                    fontSize: 10,
                    /**
                     * @type {Color}
                     */
                    color: '#000000'
                },
                /**
                 * The x position offset of the label relative to the
                 * connector.
                 */
                x: 0,
                /**
                 * The y position offset of the label relative to the
                 * connector.
                 */
                y: 0
            },
            /**
             * Miximum bubble legend range size. If values for ranges are not
             * specified, the `minSize` and the `maxSize` are calculated from
             * bubble series.
             */
            maxSize: 60,  // Number
            /**
             * Minimum bubble legend range size. If values for ranges are not
             * specified, the `minSize` and the `maxSize` are calculated from
             * bubble series.
             */
            minSize: 10,  // Number
            /**
             * The position of the bubble legend in the legend.
             * @sample highcharts/bubblelegend/connectorandlabels/
             *         Bubble legend as last item in legend
             */
            position: 0, // Number
            /**
             * Options for specific range. One range consists of bubble, label
             * and connector.
             * @sample highcharts/bubblelegend/ranges/
             *         Manually defined ranges
             * @sample highcharts/bubblelegend/autoranges/
             *         Auto calculated ranges
             * @type {Array<Object>}
             */
            ranges: {
               /**
                * Range size value, similar to bubble Z data.
                */
                value: undefined,
                /**
                 * The color of the border for individual range.
                 * @type {Color}
                 */
                borderColor: undefined,
                /**
                 * The color of the bubble for individual range.
                 * @type {Color}
                 */
                color: undefined,
                /**
                 * The color of the connector for individual range.
                 * @type {Color}
                 */
                connectorColor: undefined
            },
            /**
             * Whether the bubble legend range value should be represented by
             * the area or the width of the bubble. The default, area,
             * corresponds best to the human perception of the size of each
             * bubble.
             * @validvalue ["area", "width"]
             * @sample highcharts/bubblelegend/ranges/
             *         Size by width
             */
            sizeBy: 'area',
            /**
             * When this is true, the absolute value of z determines the size
             * of the bubble. This means that with the default zThreshold of 0,
             * a bubble of value -1 will have the same size as a bubble of
             * value 1, while a bubble of value 0 will have a smaller size
             * according to minSize.
             */
            sizeByAbsoluteValue: false,
            /**
             * Define the visual z index of the bubble legend.
             */
            zIndex: 1,
            /**
             * Ranges with with lower value than zThreshold, are skipped.
             */
            zThreshold: 0
        }
    }
});

/**
 * BubbleLegend class.
 *
 * @param {Object} config - Bubble legend options
 * @param {Object} config - Legend options
 */
H.BubbleLegend = function (options, legend) {
    this.init(options, legend);
};

H.BubbleLegend.prototype = {
    /**
     * Create basic bubbleLegend properties similar to item in legend.
     *
     * @param {Object} config - Bubble legend options
     * @param {Object} config - Legend options
     *
     * @private
     */
    init: function (options, legend) {
        this.options = options;
        this.visible = true;
        this.chart = legend.chart;
        this.legend = legend;
        this.setState = noop;
        this.drawLegendSymbol = this.drawLegendSymbol;
    },

    /**
     * Depending on the position option, add bubbleLegend to legend items.
     *
     * @param {Array} - All legend items
     *
     * @private
     */
    addToLegend: function (items) {
        // Insert bubbleLegend into legend items
        items.splice(this.options.position, 0, this);
    },

    /**
     * Calculate ranges, sizes and call the next steps of bubbleLegend
     * creation.
     *
     * @param {Object} config - Legend options
     *
     * @private
     */
    drawLegendSymbol: function (legend) {
        var bubbleLegend = this,
            chart = bubbleLegend.chart,
            options = bubbleLegend.options,
            size,
            itemDistance = pick(legend.options.itemDistance, 20),
            connectorSpace,
            ranges = options.ranges,
            radius,
            maxLabel,
            connectorDistance = options.connectorDistance;

        // Predict label dimensions
        bubbleLegend.fontMetrics = chart.renderer.fontMetrics(
            options.labels.style.fontSize.toString() + 'px'
        );

        // Reserve space for bubbleLegend and do not create bubbleLegend if
        // ranges or ranges valeus are not specified or if are empty array.
        if (!ranges || !ranges.length || !ranges[0].value) {
            bubbleLegend.autoRanges = true;
            return false;
        }

        // Sort ranges to right render order
        stableSort(ranges, function (a, b) {
            return Math.abs(b.value) - Math.abs(a.value);
        });

        bubbleLegend.ranges = ranges;

        bubbleLegend.setOptions();
        bubbleLegend.render();

        // Get max label size
        maxLabel = bubbleLegend.getMaxLabelSize();
        radius = bubbleLegend.ranges[0].radius;
        size = radius * 2;

        // Space for connectors and labels.
        connectorSpace = connectorDistance - radius + maxLabel.width;
        connectorSpace = connectorSpace > 0 ? connectorSpace : 0;

        bubbleLegend.maxLabel = maxLabel;
        bubbleLegend.movementX = options.labels.align === 'left' ?
            connectorSpace : 0;

        bubbleLegend.legendItemWidth = size + connectorSpace + itemDistance;
        bubbleLegend.legendItemHeight = size + bubbleLegend.fontMetrics.h / 2;

    },

    /**
     * Set style options for each bubbleLegend range.
     *
     * @private
     */
    setOptions: function () {
        var bubbleLegend = this,
            ranges = bubbleLegend.ranges,
            legend = bubbleLegend.legend,
            options = bubbleLegend.options,
            baseline = legend.baseline,
            bubbleStyle = {
                'z-index': options.zIndex,
                'stroke-width': options.borderWidth
            },
            connectorStyle = {
                'z-index': options.zIndex,
                'stroke-width': options.connectorWidth
            },
            labelStyle = bubbleLegend.getLabelStyles();

        // Allow to parts of styles be used individually for range
        each(ranges, function (range, i) {
            bubbleStyle.stroke = pick(
                range.borderColor,
                options.borderColor
            );
            bubbleStyle.fill = pick(range.color, options.color);
            connectorStyle.stroke = pick(
                range.connectorColor,
                options.connectorColor
            );

            // Set options needed for rendering each range
            ranges[i].radius = bubbleLegend.getRangeRadius(range.value);
            ranges[i] = merge(ranges[i], {
                center: ranges[0].radius - ranges[i].radius + baseline,
                bubbleStyle: merge(false, bubbleStyle),
                connectorStyle: merge(false, connectorStyle),
                labelStyle: labelStyle
            });
        });
    },

    /**
     * Merge options for bubbleLegend labels.
     *
     * @private
     */
    getLabelStyles: function () {
        var options = this.options,
            additionalLabelsStyle = {},
            labelsOnLeft = options.labels.align === 'left',
            rtl = this.legend.options.rtl;

        // To separate additional style options
        objectEach(options.labels.style, function (value, key) {
            if (key !== 'color' && key !== 'fontSize' && key !== 'z-index') {
                additionalLabelsStyle[key] = value;
            }
        });

        return merge(false, additionalLabelsStyle, {
            'font-size': options.labels.style.fontSize,
            fill: options.labels.style.color,
            'z-index': options.zIndex,
            align: rtl || labelsOnLeft ? 'right' : 'left'
        });
    },

    /**
     * Calculate radius for each bubble range,
     * used code from BubbleSeries.js 'getRadius' method.
     *
     * @param {Number} - Range value
     *
     * @return {Number} - Radius for one range
     *
     * @private
     */
    getRangeRadius: function (value) {
        var bubbleLegend = this,
            options = bubbleLegend.options,
            seriesIndex = bubbleLegend.options.seriesIndex,
            bubbleSeries = bubbleLegend.chart.series[seriesIndex],
            zMax = options.ranges[0].value,
            zMin = options.ranges[options.ranges.length - 1].value,
            minSize = options.minSize,
            maxSize = options.maxSize;

        return bubbleSeries.getRadius.call(
            this,
            zMin,
            zMax,
            minSize,
            maxSize,
            value
        );
    },

    /**
     * Render the legendSymbol group.
     *
     * @private
     */
    render: function () {
        var bubbleLegend = this,
            renderer = bubbleLegend.chart.renderer,
            zThreshold = bubbleLegend.options.zThreshold;


        if (!bubbleLegend.symbols) {
            bubbleLegend.symbols = {
                connectors: [],
                bubbleItems: [],
                labels: []
            };
        }

        bubbleLegend.legendSymbol = renderer.g(
            'bubble-scale-legend-' + bubbleLegend.index
        );

        // To enable default 'hideOverlappingLabels' method
        bubbleLegend.legendSymbol.translateX = 0;
        bubbleLegend.legendSymbol.translateY = 0;

        each(bubbleLegend.ranges, function (range) {
            if (range.value > zThreshold) {
                bubbleLegend.renderRange(range);
            }
        });

        bubbleLegend.legendSymbol.add(bubbleLegend.legendGroup);
        bubbleLegend.hideOverlappingLabels();
    },

    /**
     * Render one range, consisting of bubble symbol, connector and label.
     *
     * @param {Object} config - Range options
     *
     * @private
     */
    renderRange: function (range) {
        var bubbleLegend = this,
            mainRange = bubbleLegend.ranges[0],
            legend = bubbleLegend.legend,
            options = bubbleLegend.options,
            labelsOptions = options.labels,
            chart = bubbleLegend.chart,
            renderer = chart.renderer,
            symbols = bubbleLegend.symbols,
            labels = symbols.labels,
            labelVar,
            elementCenter = range.center,
            absoluteRadius = Math.abs(range.radius),
            connectorDistance = options.connectorDistance,
            labelsAlign = labelsOptions.align,
            rtl = legend.options.rtl,
            fontSize = labelsOptions.style.fontSize,
            connectorLength = rtl || labelsAlign === 'left' ?
                -connectorDistance : connectorDistance,
            borderWidth = options.borderWidth,
            connectorWidth = options.connectorWidth,
            posX = mainRange.radius,
            posY = elementCenter - absoluteRadius - borderWidth / 2 +
                connectorWidth / 2,
            labelY,
            labelX,
            fontMetrics = bubbleLegend.fontMetrics,
            labelMovement = fontSize / 2 - (fontMetrics.h - fontSize) / 2,
            crispMovement = (posY % 1 ? 1 : 0.5) -
                (connectorWidth % 2 ? 0 : 0.5);

        // Set options for centered labels
        if (labelsAlign === 'center') {
            connectorLength = 0;  // do not use connector
            options.connectorDistance = 0;
            range.labelStyle.align = 'center';
        }

        labelY = posY + options.labels.y;
        labelX = posX + connectorLength + options.labels.x;

        // Render bubble symbol
        symbols.bubbleItems.push(
            renderer
                .circle(
                    posX,
                    elementCenter + crispMovement,
                    absoluteRadius
                ).attr(
                    range.bubbleStyle
                ).addClass(
                    'highcharts-bubble-scale-connectors ' +
                    (options.className || '')
                ).add(
                    bubbleLegend.legendSymbol
                )
        );

        // Render connector
        symbols.connectors.push(
            renderer
                .path(renderer.crispLine(
                    ['M', posX, posY, 'L', posX + connectorLength, posY],
                     options.connectorWidth)
                ).attr(
                    range.connectorStyle
                ).addClass(
                    'highcharts-bubble-scale-connectors ' +
                    (options.connectorClassName || '')
                ).add(
                    bubbleLegend.legendSymbol
                )
        );

        // Render label
        labelVar = renderer
            .text(
                bubbleLegend.formatLabel(range),
                labelX,
                labelY + labelMovement
            ).attr(
                range.labelStyle
            ).addClass(
                'highcharts-bubble-scale-labels ' +
                (options.labels.className || '')
            ).add(
                bubbleLegend.legendSymbol
            );

        labels.push(labelVar);
        // To enable default 'hideOverlappingLabels' method
        labelVar.placed = true;
        labelVar.alignAttr = {
            x: labelX,
            y: labelY + labelMovement
        };
    },

    /**
     * Get the label which takes up the most space.
     *
     * @private
     */
    getMaxLabelSize: function () {
        var labels = this.symbols.labels,
            maxLabel,
            labelSize;

        each(labels, function (label) {
            labelSize = label.getBBox(true);

            if (maxLabel) {
                maxLabel = labelSize.width > maxLabel.width ?
                    labelSize : maxLabel;

            } else {
                maxLabel = labelSize;
            }
        });
        return maxLabel;
    },

    /**
     * Get formatted label for range.
     *
     * @param {Object} config - Range options
     *
     * @return {String} - Range label text
     *
     * @private
     */
    formatLabel: function (range) {
        var options = this.options,
            formatter = options.labels.formatter,
            format = options.labels.format;

        return format ? H.format(format, range) :
            formatter ? formatter.call(range) : Math.round(range.value);
    },

    /**
     * By using default chart 'hideOverlappingLabels' method, hide or show
     * labels and connectors.
     *
     * @private
     */
    hideOverlappingLabels: function () {
        var bubbleLegend = this,
            chart = this.chart,
            allowOverlap = bubbleLegend.options.labels.allowOverlap,
            symbols = bubbleLegend.symbols;

        if (!allowOverlap && symbols) {
            chart.hideOverlappingLabels(symbols.labels);

            // Hide or show connectors
            each(symbols.labels, function (label, index) {
                if (!label.newOpacity) {
                    symbols.connectors[index].hide();
                } else if (label.newOpacity !== label.oldOpacity) {
                    symbols.connectors[index].show();
                }
            });
        }
    },

    /**
     * Calculate ranges from created series.
     *
     * @return {Array} - Array of range objects
     *
     * @private
     */
    getRanges: function () {
        var bubbleLegend = this.legend.bubbleLegend,
            series = bubbleLegend.chart.series,
            ranges,
            rangesOptions = bubbleLegend.options.ranges,
            minZ,
            maxZ;

        each(series, function (s) {
            if (s.isBubble && !s.ignoreSeries) {
                minZ = minZ ? Math.min(minZ, arrayMin(s.zData)) :
                    arrayMin(s.zData);

                maxZ = maxZ ? Math.max(maxZ, arrayMax(s.zData)) :
                    arrayMax(s.zData);
            }
        });

        // Set values for ranges
        if (minZ === maxZ) {
            // Only one range if min and max values are the same.
            ranges = [{ value: maxZ }];
        } else {
            ranges = [
                { value: minZ },
                { value: (minZ + maxZ) / 2 },
                { value: maxZ }
            ];
        }

        // Merge ranges values with user options
        each(ranges, function (range, i) {
            if (rangesOptions && rangesOptions[i]) {
                range = merge(false, rangesOptions[i], range);
            }
        });

        return ranges;
    },

    /**
     * Calculate legend bubble sizes from rendered series.
     *
     * @return {Array} - Calculated min and max bubble sizes
     *
     * @private
     */
    getBubbleSizes: function () {
        var plotSize,
            chart = this.chart,
            series = chart.series,
            fontMetrics = this.fontMetrics,
            legendOptions = chart.legend.options,
            floating = legendOptions.floating,
            horizontal = legendOptions.layout === 'horizontal',
            lastLineHeight = horizontal ? chart.legend.lastLineHeight : 0,
            plotSizeX = chart.plotSizeX,
            plotSizeY = chart.plotSizeY,
            i,
            minSize,
            maxSize,
            maxPxSize,
            calculatedSize;

        // minSize and maxSize are common for all bubble series
        for (i = 0; i < series.length; i++) {
            if (series[i].isBubble) {
                minSize = Math.ceil(series[i].minPxSize);
                maxPxSize = Math.ceil(series[i].maxPxSize);
                maxSize = series[i].options.maxSize;
                plotSize = Math.min(
                    series[i].chart.plotSizeY,
                    series[i].chart.plotSizeX
                );
                i = series.length;
            }
        }
        // Calculate prediceted max size of bubble
        if (floating || !(/%$/.test(maxSize))) {
            calculatedSize = maxPxSize;

        } else {
            maxSize = parseFloat(maxSize);
            calculatedSize = ((plotSize + lastLineHeight - fontMetrics.h / 2) *
                maxSize / 100) / (maxSize / 100 + 1);

            // Get maxPxSize from bubble series if calculated bubble legend
            // size will not affect to bubbles series.
            if (
                (horizontal && plotSizeY - calculatedSize >=
                plotSizeX) || (!horizontal && plotSizeX -
                calculatedSize >= plotSizeY)
            ) {
                calculatedSize = maxPxSize;
            }
        }

        return [minSize, Math.ceil(calculatedSize)];
    }
};

/**
 * Start the bubble legend creation process.
 */
addEvent(H.Legend, 'afterGetAllItems', function (e) {
    var legend = this,
        bubbleLegend = legend.bubbleLegend,
        legendOptions = legend.options,
        bubbleLegendOptions = legendOptions.bubbleLegend,
        bubbleSeriesIndex = legend.chart.hasVisibleBubbleSeries();

    // Remove unnecessary element
    if (bubbleLegend && bubbleLegend.ranges) {
        // Update bubbleLegend dimensions in each redraw
        if (
            bubbleLegend.autoRanges &&
            bubbleLegendOptions.ranges &&
            bubbleLegendOptions.ranges[0].radius
        ) {
            legend.options.bubbleLegend.ranges = null;  // Reset ranges
        }
        legend.destroyItem(bubbleLegend);
    }
    // Create bubble legend
    if (isNumber(bubbleSeriesIndex) &&
            legendOptions.enabled &&
            bubbleLegendOptions.enabled
    ) {
        bubbleLegendOptions.seriesIndex = bubbleSeriesIndex;
        legend.bubbleLegend = new H.BubbleLegend(bubbleLegendOptions, legend);
        legend.bubbleLegend.addToLegend(e.allItems);
    }
});

/**
 * Check if there is at least one visible bubble series.
 *
 * @return {Number || Boolean} - First visible bubble series index
 *
 * @private
 */
Chart.prototype.hasVisibleBubbleSeries = function () {
    var series = this.series,
        i = series.length;

    while (i--) {
        if (series[i].isBubble && series[i].visible) {
            return i;
        }
    }
    return false;
};

/**
 * Calculate height for each row in legend.
 *
 * @return {Array} - Informations about line height and items amount
 *
 * @private
 */
Legend.prototype.getLinesHeights = function () {
    var items = this.allItems,
        lines = [],
        lastLine,
        length = items.length,
        i = 0,
        j = 0;

    for (i; i < length; i++) {
        if (items[i].legendItemHeight) {
            // for bubbleLegend
            items[i].itemHeight = items[i].legendItemHeight;
        }
        if (  // Line break
            items[i] === items[length - 1] ||
            items[i + 1] &&
            items[i].legendGroup.translateY !==
            items[i + 1].legendGroup.translateY
        ) {
            lines.push({ height: 0 });
            lastLine = lines[lines.length - 1];
            // Find the highest item in line
            for (j; j <= i; j++) {
                if (items[j].itemHeight > lastLine.height) {
                    lastLine.height = items[j].itemHeight;
                }
            }
            lastLine.step = i;
        }
    }
    return lines;
};

/**
 * Correct legend items translation in case of different elements heights.
 *
 * @param {Array} - Informations about line height and items amount
 *
 * @private
 */
Legend.prototype.retranslateItems = function (lines) {
    var items = this.allItems,
        orgTranslateX,
        orgTranslateY,
        movementX,
        rtl = this.options.rtl,
        sizeMovement,
        actualLine = 0;

    each(items, function (item, index) {
        orgTranslateX = item.legendGroup.translateX;
        orgTranslateY = item.legendGroup.translateY;
        movementX = item.movementX;
        sizeMovement = item.sizeMovement;

        if (movementX || (rtl && item.ranges) || sizeMovement) {
            sizeMovement = sizeMovement ? sizeMovement : 0;
            movementX = rtl ? orgTranslateX - item.size +
                this.symbolWidth + sizeMovement :
                orgTranslateX + movementX + sizeMovement;

            item.legendGroup.attr({ translateX: movementX });
        }
        if (index > lines[actualLine].step) {
            actualLine++;
        }

        item.legendGroup.attr({
            translateY: Math.round(
                orgTranslateY + lines[actualLine].height / 2
            )
        });
    });
};

/**
 * Event used to correct items positions with different dimensions in legend.
 */
addEvent(H.Legend, 'afterRender', function () {
    this.retranslateItems(this.getLinesHeights());
});

/**
 * Event used to separate chart render event coming from click in legend item.
 */
addEvent(Series, 'legendItemClick', function () {
    var series = this,
        chart = series.chart,
        visible = series.visible,
        legend = series.chart.legend,
        status;

    if (legend && legend.bubbleLegend) {
        // Visible property is not set correctly yet, so temporary correct it.
        series.visible = !visible;
        // Save future status
        series.ignoreSeries = visible ? true : false;

        // Check if at lest one bubble series is visible
        status = isNumber(chart.hasVisibleBubbleSeries());

        // Hide bubble legend if all bubble series are disabled
        if (legend.bubbleLegend.visible !== status) {
            // Show or hide bubble legend
            legend.update({
                bubbleLegend: { enabled: status }
            }, false);  // Redraw after render

            legend.bubbleLegend.visible = status; // Restore default status
        }
        legend.options.bubbleLegend.animation = true;
        series.visible = visible;
    }
});

/**
 * Determine ranges from rendered bubble series and update legend.
 */
addEvent(Chart, 'render', function () {
    var legend = this.legend,
        bubbleLegend = legend.bubbleLegend,
        animation = legend.options.bubbleLegend.animation || false,
        bubbleSizes;

    // Stop executing the function if ranges are defined
    if (!bubbleLegend || !bubbleLegend.autoRanges) {
        return false;
    }

    bubbleSizes = bubbleLegend.getBubbleSizes();
    bubbleLegend.autoRanges = false; // to not fall in to infinite loop

    // Update legend with calculated ranges and without animation
    this.update({
        legend: {
            bubbleLegend: {
                minSize: bubbleSizes[0],
                maxSize: bubbleSizes[1],
                ranges: bubbleLegend.getRanges()
            }
        }
    }, true, false, animation);

    // Update legend sizes
    this.legend.update();
    // Correct series bubbles dimensions
    this.reflow();
    this.legend.bubbleLegend.autoRanges = true;
    // Prevent animation on resize
    legend.options.bubbleLegend.animation = false;
});
