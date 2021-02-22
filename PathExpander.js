/// <reference path="../bin/openrct2.d.ts" />

var downCoord;
var currentCoord;

function selectTheMap() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function getTileSurfaceZ(x, y) {
    var tile = map.getTile(x / 32, y / 32);
    if (tile) {
        for (var i = 0; i < tile.numElements; i++) {
            var element = tile.getElement(i);
            if (element && element.type == "surface") {
                return element.baseHeight * 8;
            }
        }
    }
    return null;
}

function expandPathElements(x, y) {
    var tile = map.getTile(x / 32, y / 32);
    if (tile) {
        for (var i = 0; i < tile.numElements; i++) {
            var element = tile.getElement(i);
            if (element && element.type == "footpath") {
                if (element.isQueue)
                    continue;
                if (element.slopeDirection == null) {
                    element.edges = 1 | 2 | 4 | 8;
                    element.corners = 1 | 2 | 4 | 8;
                }
            }
        }
    }
}

function expandSelection() {
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    for (var x = left; x <= right; x += 32) {
        for (var y = top; y <= bottom; y += 32) {
            expandPathElements(x, y);
        }
    }
}

var main = function () {
    if (typeof ui === 'undefined') {
        return;
    }
    var window = null;
    ui.registerMenuItem("Footpath Expander", function () {
        if (ui.tool && ui.tool.id == "expand-footpath-tool") {
            ui.tool.cancel();
        } else {
            ui.activateTool({
                id: "expand-footpath-tool",
                cursor: "cross_hair",
                onStart: function (e) {
                    ui.mainViewport.visibilityFlags |= (1 << 7);
                },
                onDown: function (e) {
                    downCoord = e.mapCoords;
                    currentCoord = e.mapCoords;
                },
                onMove: function (e) {
                    if (e.isDown) {
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    } else {
                        downCoord = e.mapCoords;
                        currentCoord = e.mapCoords;
                        selectTheMap();
                    }
                },
                onUp: function (e) {
                    expandSelection();
                    ui.tileSelection.range = null;
                },
                onFinish: function () {
                    ui.tileSelection.range = null;
                    ui.mainViewport.visibilityFlags &= ~(1 << 7);
                    if (window != null)
                        window.close();
                },
            });

            if (window == null) {
                var width = 220;
                var buttonWidth = 50;
                window = ui.openWindow({
                    classification: 'park',
                    title: "Footpath Expander",
                    width: width,
                    height: 60,
                    widgets: [
                        {
                            type: 'label',
                            name: 'label-description',
                            x: 3,
                            y: 23,
                            width: width - 6,
                            height: 26,
                            text: "Drag to make path elements full width."
                        },
                        {
                            type: 'button',
                            name: "button-cancel",
                            x: width - buttonWidth - 3,
                            y: 40,
                            width: buttonWidth,
                            height: 16,
                            text: "Cancel",
                            onClick: function () {
                                if (window != null)
                                    window.close();
                            }
                        }
                    ],
                    onClose: function () {
                        window = null;
                        if (ui.tool && ui.tool.id == "expand-footpath-tool") {
                            ui.tool.cancel();
                        }
                    }
                });
            }
            else {
                window.bringToFront();
            }
        }
    });
};

registerPlugin({
    name: 'Footpath Expander',
    version: '1.0',
    authors: ['Oli414'],
    type: 'local',
    main: main
});
