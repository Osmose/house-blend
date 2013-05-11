define(function(require) {
    function Tilemap(grid, x, y) {
        this.grid = grid;
        this._graphic = null;

        this.x = x || 0;
        this.y = y || 0;
        this.heightTiles = grid.length;
        this.widthTiles = grid[0].length;

        // Format: Type => Array of tile numbers
        this.solid = {};

        this.cacheCanvas = document.createElement('canvas');
        this.cacheCtx = this.cacheCanvas.getContext('2d');
        this._invalidateCache = true;
    }

    Tilemap.prototype = {
        render: function(ctx, x, y) {
            if (this.graphic === null) return;

            if (this._invalidateCache) {
                this._updateCache();
                this._invalidateCache = false;
            }

            x = x || this.x;
            y = y || this.y;

            // Adjust for camera.
            if (this.engine) {
                x -= this.engine.camera.x;
                y -= this.engine.camera.y;
            }

            ctx.drawImage(this.cacheCanvas, x, y);
        },

        _updateCache: function() {
            this.cacheCanvas.width = this.widthTiles * this.graphic.tileWidth;
            this.cacheCanvas.height = this.heightTiles * this.graphic.tileWidth;
            this.cacheCtx.clearRect(0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
            for (var ty = 0; ty < this.grid.length; ty++) {
                for (var tx = 0; tx < this.grid[ty].length; tx++) {
                    this.graphic.renderTile(
                        this.cacheCtx,
                        this.grid[ty][tx],
                        tx * this.graphic.tileWidth,
                        ty * this.graphic.tileHeight
                    );
                }
            }
        },

        get graphic() {
            return this._graphic;
        },

        set graphic(g) {
            this._graphic = g;
            this._invalidateCache = true;
        },

        collideEntity: function(entity, type, dx, dy) {
            if (!this.solid.hasOwnProperty(type)) return false;

            // TODO: Cache this per frame
            var tileWidth = this.graphic.tileWidth;
            var tileHeight = this.graphic.tileHeight;

            // Entity's hitbox relative to this tilemap;
            var entityLeft = entity.x + entity.hitbox.x + dx - this.x;
            var entityTop = entity.y + entity.hitbox.y + dy - this.y;
            var entityRight = entityLeft + entity.hitbox.width;
            var entityBottom = entityTop + entity.hitbox.height;

            // Bounds for tiles that are colliding with the entity.
            var tilesLeft = Math.max(0, Math.floor(entityLeft / tileWidth));
            var tilesTop = Math.max(0, Math.floor(entityTop / tileHeight));
            var tilesRight = Math.min(this.widthTiles - 1,
                                      Math.floor(entityRight / tileWidth));
            var tilesBottom = Math.min(this.heightTiles - 1,
                                       Math.floor(entityBottom / tileHeight));

            for (var ty = tilesTop; ty <= tilesBottom; ty++) {
                for (var tx = tilesLeft; tx <= tilesRight; tx++) {
                    var t = this.grid[ty][tx] + 1;
                    if (this.solid[type].indexOf(t) !== -1) return true;
                }
            }

            return false;
        }
    };

    return Tilemap;
});
