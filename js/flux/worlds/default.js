define(function(require) {
    function DefaultWorld() {
        this.engine = null;
        this.block_tick = false; // Controls if worlds below this tick.
        this.block_render = false; // Controls if worlds below this render.

        // Entity management.
        this.entities = [];
        this.removes = [];
        this.entity_types = {};
    }

    DefaultWorld.prototype = {
        tick: function() {
            var self = this;
            this.entities.forEach(function(entity) {
                entity.tick();
            });

            // Remove entities that have been marked for removal.
            this.entities = this.entities.filter(function(entity) {
                if (self.removes.indexOf(entity.id) !== -1) {
                    entity.engine = null;
                    entity.world = null;

                    // Remove from entity-type map.
                    var types = self.entity_types;
                    types[entity.type] = types[entity.type].filter(function(e) {
                        return e.id !== entity.id;
                    });

                    return false;
                } else {
                    return true;
                }
            });
            this.removes = [];
        },

        render: function(ctx) {
            this.entities.forEach(function(entity) {
                entity.render(ctx);
            });
        },

        addEntity: function(entity) {
            entity.engine = this.engine;
            entity.world = this;
            this.entities.push(entity);

            if (!this.entity_types.hasOwnProperty(entity.type)) {
                this.entity_types[entity.type] = [];
            }
            this.entity_types[entity.type].push(entity);
        },

        removeEntity: function(entity) {
            this.removes.push(entity.id);
        }
    };

    return DefaultWorld;
});
