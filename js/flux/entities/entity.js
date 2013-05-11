define(function(require) {
    var _ = require('flux/lib/lodash');

    /**
     * Execute any functions with the same name as the last function called on
     * the entity, starting with
     */
    function parent() {
        if (this.__caller === undefined) {
            throw 'Cannot call parent outside of a method.';
        }

        var entityFunc = Entity.prototype[this.__caller];
        if (_.isFunction(entityFunc)) {
            entityFunc.apply(this, arguments);
        }

        _(this.__components).forEach(function(component) {
            var componentFunc = component[this._caller];
            if (_.isFunction(componentFunc)) {
                componentFunc.apply(this, arguments);
            }
        }, this);
    }

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

        options = _(options).invoke(function(option) {
            if (_.isFunction(option)) {
                return wrap(option);
            } else {
                return option;
            }
        }, this);

        // Store components in a "hidden" variable.
        options.__components = options.components || [];
        delete options.components;

        //
        _.extend(options, entityPrototype);
        entityConstructor.prototype = options;

        return entityConstructor;
    }

    Entity._entities = {};

    var entityPrototype = {
        initialize: function(options) {
            this.id = _.uniqueId();
            Entity._entities[this.id] = this;
        }
    };

    return Entity;
});
