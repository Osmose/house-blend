define(function(require) {
    var Entity = require('flux/entities/entity');
    var Collidable = require('flux/entities/components/collidable');
    var Graphical = require('flux/entities/components/graphical');
    var Positional = require('flux/entities/components/positional');

    return Entity('Player', {
        components: [Graphical, Positional, Collidable],

        // Graphical properties
        graphic: TiledGraphic('img/player.png', 16, 16, {
            up: 0,
            down: 2,
            left: 4,
            right: 6,
            move_up: [0, 8, 1, 8],
            move_down: [2, 8, 3, 8],
            move_left: [4, 8, 5, 8],
            move_right: [6, 8, 7, 8]
        }),

        // Collidable properties
        hitbox: {x: 2, y: 2, w: 12, h: 12},
        collisionType: 'player',
        collidesWith: ['solid'],

        initialize: function(x, y) {
            this.parent({
                x: x,
                y: y
            });

            this.direction = 'down';
            this.moving = false;
            this.speed = 1;
        },

        tick: function(engine, gamemode) {
            this.parent(engine, gamemode);
            var kb = engine.kb;
            var dx = 0;
            var dy = 0;

            this.walking = false;
            if (kb.check(kb.RIGHT)) {
                this.direction = 'right';
                dx += this.speed;
            }
            if (kb.check(kb.LEFT)) {
                this.direction = 'left';
                dx -= this.speed;
            }
            if (kb.check(kb.UP)) {
                this.direction = 'up';
                dy -= this.speed;
            }
            if (kb.check(kb.DOWN)) {
                this.direction = 'down';
                dy += this.speed;
            }


            if (dx !== 0 || dy !== 0) {
                this.walking = this.move(dx, dy);
            }

            var tile = (this.walking ? 'walk_' : '') + this.direction;
            this.currentTile = tile;
        }
    });
});
