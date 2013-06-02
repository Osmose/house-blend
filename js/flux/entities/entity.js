define(function(require) {
    var _ = require('flux/lib/lodash');

    function wrap(func, name) {
        return function() {
            this.__caller = name;
            return func.apply(this, arguments);
        };
    }

    function Entity(name, options) {
        function entityConstructor() {
            this.initialize.call(this, arguments);
        }

        entityConstructor.name = name;
        entityConstructor.prototype = _.clone(entityPrototype);
        _.forEach(options.components, function(component) {
            _.extend(entityConstructor.prototype, component);
        });
        _.forOwn(options, function(value, key) {
            if (_.isFunction(value)) {
                value = wrap(value, key);
            }

            entityConstructor.prototype[key] = value;
        });

        return entityConstructor;
    }

    Entity._entities = {};

    Entity.get = function(id) {
        return Entity._entities[id];
    };

    var entityPrototype = {
        components: [],
        types: [],

        parent: function parent() {
            if (this.__caller === undefined) {
                throw 'Cannot call parent outside of a method.';
            }

            var entityFunc = entityPrototype[this.__caller];
            if (_.isFunction(entityFunc)) {
                entityFunc.apply(this, arguments);
            }

            _.forEach(this.components, function(component) {
                var componentFunc = component[this.__caller];
                if (_.isFunction(componentFunc)) {
                    componentFunc.apply(this, arguments);
                }
            }, this);
        },

        initialize: function(options) {
            this.id = _.uniqueId();
            Entity._entities[this.id] = this;
        },

        tick: function(engine, gamemode) {

        },

        draw: function(engine, gamemode, ctx) {

        }
    };

    return Entity;
});
