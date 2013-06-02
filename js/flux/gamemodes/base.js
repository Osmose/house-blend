define(function(require) {
    var _ = require('flux/lib/lodash');

    var Entity = require('flux/entities/entity');

    function BaseGameMode(blockTick, blockDraw) {
        // Controls if worlds below this tick.
        this.blockTick = blockTick || false;

        // Controls if worlds below this draw.
        this.blockDraw = blockDraw || false;

        // Entity management.
        this.entityIds = [];
        this.removes = [];
        this.entityIdsForType = {};
    }

    BaseGameMode.prototype = {
        tick: function(engine) {
            _.forEach(this.entityIds, function(id) {
                Entity.get(id).tick(engine, this);
            }, this);

            // Remove entities that have been marked for removal.
            if (this.removes.length > 0) {
                var wrapped = _(this.entityIds);
                this.entityIds = _.without.apply(wrapped, this.removes);

                _.invoke(this.entityIdsForType, function(gameMode) {
                    return _.without.apply(_(this), gameMode.removes);
                }, this);
            }
            this.removes.length = 0;
        },

        draw: function(engine, ctx) {
            _.forEach(this.entityIds, function(id) {
                Entity.get(id).draw(engine, this, ctx);
            }, this);
        },

        addEntity: function(entity) {
            this.entityIds.push(entity.id);

            _.forEach(entity.types, function(type) {
                if (!this.entityIdsForType.hasOwnProperty(type)) {
                    this.entityIdsForType[type] = [];
                }
                this.entityIdsForType[type].push(entity.id);
            }, this);
        },

        removeEntity: function(entity) {
            this.removes.push(entity.id);
        }
    };

    return BaseGameMode;
});
