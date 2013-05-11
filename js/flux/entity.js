define(function(require) {
    var id_counter = 0;

    function Entity(x, y, types) {
        this.id = id_counter++;
        Entity._entities[this.id] = this;

        this.x = x || 0;
        this.y = y || 0;
        this.graphic = null;

        // Collision
        this._type = 'entity';
        this.hitbox = {x: 0, y: 0, width: 0, height: 0};
    }

    // Mapping of all created entities using their unique IDs.
    Entity._entites = {};

    Entity.prototype = {
        tick: function() {
            if (this.graphic !== null) {
                this.graphic.tick();
            }
        },

        render: function(ctx) {
            var camera = this.engine.camera;
            if (this.graphic !== null) {
                this.graphic.render(ctx, this.x - camera.x, this.y - camera.y);
            }
        },

        // Set the hitbox of this entity relative to the top left corner of
        // it's graphic.
        setHitbox: function(x, y, width, height) {
            this.hitbox.x = x;
            this.hitbox.y = y;
            this.hitbox.width = width;
            this.hitbox.height = height;
        },

        get type() {
            return this._type;
        },

        // Set the type of this entity to a new type.
        set type(type) {
            var old_type = this._type;
            var world = this.world;
            this._type = type;

            // Update world's entity_types mapping.
            if (this.world !== undefined) {
                var entities = world.entity_types[old_type];
                world.entity_types[old_type] = entities.filter(function(e) {
                    return e.id !== this.id;
                });

                if (!world.entity_types.hasOwnProperty(type)) {
                    world.entity_types[type] = [];
                }
                world.entity_types[type].push(this);
            }
        },

        // Check for collision against an entity type.
        collide: function(type, dx, dy) {
            var self = this;
            var entities = this.world.entity_types[type];
            if (entities !== undefined) {
                return entities.some(function(entity) {
                    return self.collideEntity(entity, dx, dy);
                });
            }

            return false;
        },

        // Return the first entity of the given type that this entity collides
        // with.
        getCollideEntity: function(type, dx, dy) {
            var self = this;
            var entities = this.world.entity_types[type];
            if (entities !== undefined) {
                for (var i in entities) {
                    if (entities.hasOwnProperty(i)) {
                        var entity = entities[i];
                        if (this.collideEntity(entity, dx, dy)) {
                            return entity;
                        }
                    }
                }
            }

            return false;
        },

        // Check for collision against a specific entity.
        collideEntity: function(entity, dx, dy) {
            if (!entity.collidable) return false;

            var myLeft = this.x + dx + this.hitbox.x;
            var myTop = this.y + dy + this.hitbox.y;
            var myRight = myLeft + this.hitbox.width;
            var myBottom = myTop + this.hitbox.height;

            var theirLeft = entity.x + entity.hitbox.x;
            var theirTop = entity.y + entity.hitbox.y;
            var theirRight = theirLeft + entity.hitbox.width;
            var theirBottom = theirTop + entity.hitbox.height;

            if (myRight < theirLeft) return false;
            if (myLeft > theirRight) return false;
            if (myBottom < theirTop) return false;
            if (myTop > theirBottom) return false;

            return true;
        },

        collideTilemap: function(tilemap, type, dx, dy) {
            return tilemap.collideEntity(this, type, dx, dy);
        },

        // Check if the hitbox is within the camera range.
        withinCamera: function(dx, dy) {
            var camera = this.engine.camera;

            // TODO: Duplicated code! D:
            var myLeft = this.x + dx + this.hitbox.x;
            var myTop = this.y + dy + this.hitbox.y;
            var myRight = myLeft + this.hitbox.width;
            var myBottom = myTop + this.hitbox.height;

            var cameraLeft = camera.x;
            var cameraTop = camera.y;
            var cameraRight = cameraLeft + camera.width;
            var cameraBottom = cameraTop + camera.height;

            if (myLeft < cameraLeft) return 'left';
            if (myRight > cameraRight) return 'right';
            if (myTop < cameraTop) return 'up';
            if (myBottom > cameraBottom) return 'down';

            return true;
        }
    };

    return Entity;
});
