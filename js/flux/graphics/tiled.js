define(function(require) {
    function TiledGraphic(image, tileWidth, tileHeight, xGap, yGap) {
        this.image = image;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.xGap = xGap || 0;
        this.yGap = yGap || 0;

        this.currentTile = null;

        this.tileColumns = Math.floor(image.width / (tileWidth + this.xGap));
        this.tileRows = Math.floor(image.height / (tileHeight + this.yGap));

        this.names = {};
        this.animated_names = {};
        this.animated_state = {};
    }

    TiledGraphic.prototype = {
        // Add an alias for a specific tile.
        addTileName: function(name, tile) {
            this.names[name] = tile;
        },

        // Add an alias for an animation sequence.
        addAnimationName: function(name, animation) {
            this.animated_names[name] = animation;
            this.animated_state[name] = {
                frame: 0,
                delay: 0
            };
        },

        // Advance the current animation by one frame, if applicable.
        tick: function() {
            if (this.currentTile !== null) {
                this.incFrame(this.currentTile);
            }
        },

        // Advance one frame in the specified animation tile.
        incFrame: function(anim_name) {
            if (anim_name in this.animated_names) {
                var animation = this.animated_names[anim_name];
                var state = this.animated_state[anim_name];

                if (state.delay <= 0) {
                    state.frame += 2;
                    if (state.frame >= animation.length) {
                        state.frame = 0;
                    }
                    state.delay = animation[state.frame + 1];
                }

                state.delay--;
            }
        },

        // Advance one frame in all animation tiles.
        incAllFrames: function() {
            for (var anim_name in this.animated_names) {
                this.incFrame(anim_name);
            }
        },

        // Get the tile number corresponding to the given tile. If the
        // given tile is a name, will return the corresponding tile number.
        // If the given tile is an animation, will return the current frame.
        getTileNumber: function(tile) {
            if (tile in this.animated_state) {
                var state = this.animated_state[tile];
                var animation = this.animated_names[tile];
                return animation[state.frame];
            } else if (typeof tile === 'number') {
                return tile;
            }

            return this.names[tile];
        },

        // Render the currently selected tile.
        render: function(ctx, x, y) {
            if (this.currentTile !== null) {
                this.renderTile(ctx, this.currentTile, x, y);
            }
        },

        // Render a single tile for this graphic with the given tile number.
        renderTile: function(ctx, tile, x, y) {
            tile = this.getTileNumber(tile);

            // If tile is negative (probably an empty tile), drop out.
            if (tile < 0) {
                return;
            }

            var ty = Math.floor(tile / this.tileColumns);
            var tx = tile % this.tileColumns;
            var sourceX = (tx * this.tileWidth) + (tx * this.xGap);
            var sourceY = (ty * this.tileHeight) + (ty * this.yGap);

            ctx.drawImage(this.image, sourceX, sourceY,
                          this.tileWidth, this.tileHeight,
                          x, y, this.tileWidth, this.tileHeight);
        }
    };

    return TiledGraphic;
});
