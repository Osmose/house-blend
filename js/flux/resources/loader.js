define(function(require) {
    var $ = require('jquery');
    var handlers = require('./handlers');

    function Loader(path) {
        this.path = path || '';
        this.resources = {};
        this.handlers = {};

        // Add default handlers.
        this.add_handler(handlers.ImageHandler, 'image');
        this.add_handler(handlers.JSONHandler, 'json');
        this.add_handler(handlers.AudioHandler, 'audio');
    }

    Loader.prototype = {
        // Register a resource to be loaded.
        register: function(id, path, type) {
            this.resources[id] = {
                value: null,
                path: path,
                type: type,
                complete: false
            };
        },

        // Return the value of a resource.
        get: function(id) {
            return this.resources[id].value;
        },

        // Initiate loading for all registered resources.
        // Returns a jQuery Promise that resolves when loading is complete.
        loadAll: function(callback) {
            var self = this;
            var deferred = $.Deferred();

            this.each(function(resource, id) {
                var promise = this.load(resource.path, resource.type);
                promise.done(function(value) {
                    resource.value = value;
                    resource.complete = true;
                    if (self.isLoadingComplete()) {
                        deferred.resolve();
                    }
                });
            });

            return deferred;
        },

        // Load a single resource.
        // Returns a jQuery Promise that resolves when loading is complete.
        load: function(path, type) {
            var self = this;
            var handler = this.handlers[type];
            if (handler === undefined) {
                throw new Error('No handler for type ' + type);
            }

            return handler.load(this._path(path));
        },

        // Check if all resources are loaded.
        isLoadingComplete: function() {
            var loadingComplete = true;
            this.each(function(resource) {
                loadingComplete = loadingComplete && resource.complete;
            });

            return loadingComplete;
        },

        // Return a float representing the percentage of resources that have
        // finished loading.
        progress: function() {
            var total = 0;
            var complete = 0;
            this.each(function(resource) {
                total++;
                if (resource.complete) complete++;
            });

            return complete / total;
        },

        // Add a handler for the given resource type.
        add_handler: function(handler, type) {
            this.handlers[type] = handler;
        },

        // Executes callback for each registered resource, passing in the
        // resource and id as arguments.
        each: function(callback) {
            for (var id in this.resources) {
                if (!this.resources.hasOwnProperty(id)) continue;
                callback.call(this, this.resources[id], id);
            }
        },

        // Generate a path based on the prefix passed into the constructor.
        _path: function(url) {
            return this.path + url;
        }
    };

    return Loader;
});
