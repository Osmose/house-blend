define(function(require) {
    function BaseGameMode(blockTick, blockRender) {
        // Controls if worlds below this tick.
        this.blockTick = blockTick || false;

        // Controls if worlds below this render.
        this.blockRender = blockRender || false;

        // Entity management.
        this.entities = [];
        this.removes = [];
        this.entitiesForType = {};
    }

    function _removeFromType(type) {
        var entityList = this.entitiesForType[type];
        entityList.splice(entityList.indexOf(idToRemove), 1);
    }

    BaseGameMode.prototype = {
        tick: function(engine) {
            this.entities.forEach(function(entity) {
                entity.tick(engine, this);
            }, this);

            // Remove entities that have been marked for removal.
            for (var k = 0; k < this.removes.length; k++) {
                var idToRemove = this.removes[k];
                var entityIndex = this.entities.indexOf(idToRemove);
                if (entityIndex !== -1) {
                    // Remove from the main entity list.
                    this.entities.splice(entityIndex, 1);

                    // Remove from the type->entity mapping.
                    var entity = Entity.getEntity(idToRemove);
                    entity.types.forEach(_removeFromType, this);
                }
            }
            this.entities = this.entities.filter(function(entityId) {
                if (this.removes.indexOf(entityId) !== false) {
                    // Remove from entity-type map.
                    entitiesForType[entity.type] = types[entity.type].filter(function(e) {
                        return e.id !== entity.id;
                    });

                    return false;
                } else {
                    return true;
                }
            }, this);
            this.removes.length = 0;
        },

        render: function(ctx) {
            this.entities.forEach(function(entity) {
                entity.render(ctx);
            });
        },

        addEntity: function(entity) {
            this.entities.push(entity.id);

            entity.types.forEach(function(type) {
                if (!this.entitiesForType.hasOwnProperty(type)) {
                    this.entitiesForType[type] = [];
                }
                this.entitiesForType[type].push(entity.id);
            });
        },

        removeEntity: function(entity) {
            this.removes.push(entity.id);
        }
    };

    return BaseGameMode;
});
