define(function(require) {
    function Graphic(image, width, height, scale) {
        this.image = image;
        this.width = width || image.width;
        this.height = height || image.height;
        this.scale = scale || 1;

        this._flipped = [image, null, null, null];
        this.flipped_horizontal = false;
        this.flipped_vertical = false;
    }

    Graphic.prototype = {
        tick: function() {

        },
        
        render: function(ctx, x, y) {
            ctx.drawImage(this.getImage(), x, y,
                          this.width * this.scale,
                          this.height * this.scale);
        },

        // Return this Graphic's image based on its settings.
        getImage: function() {
            return this.flipped(this.flipped_horizontal,
                                this.flipped_vertical);
        },

        // Generate a flipped version of this Graphic's image.
        flipped: function(horizontal, vertical) {
            var index = (horizontal ? 1 : 0) + (vertical ? 2 : 0);
            if (this._flipped[index] === null) {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');
                canvas.width = this.image.width;
                canvas.height = this.image.height;

                var tw = (horizontal ? this.image.width : 0),
                    th = (vertical ? this.image.height : 0),
                    sx = (horizontal ? -1 : 1),
                    sy = (vertical ? -1 : 1);
                ctx.translate(tw, th);
                ctx.scale(sx, sy);
                ctx.drawImage(this.image, 0, 0);

                this._flipped[index] = canvas;
            }

            return this._flipped[index];
        }
    };

    return Graphic;
});
