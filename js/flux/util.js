define(function(require, exports) {
    /**
     * Collection of utility functions small enough to not warrant their own
     * file.
     */

    /**
     * Draws a string of text, using the given tiled graphic as the font.
     *
     * Tile numbers correspond to the char codes in the string.
     */
    exports.renderText = function(ctx, text, x, y, fontGraphic, maxWidth) {
        var left = x;
        for (var k = 0; k < text.length; k++) {
            var code = text.charCodeAt(k);
            fontGraphic.renderTile(ctx, code, x, y);

            x += fontGraphic.tileWidth;
            if (maxWidth !== undefined && (x - left) > maxWidth) {
                x = left;
                y += fontGraphic.tileHeight;
            }
        }
    };

    /**
     * Forces a number to be within a maximum and minimum value. Returns the
     * given number, or the max/min if it is out of bounds.
     */
    exports.restrict = function(number, max, min) {
        return Math.min(max, Math.max(min, number));
    };
});
