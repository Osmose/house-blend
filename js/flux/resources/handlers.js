define(function(require, exports) {
    var $ = require('jquery');

    // Base handler class.
    exports.BaseHandler = {
        // Used to load a resource. Once the resource is loaded, callback
        // should be executed with the complete resource as an argument.
        load: function(url) {
            var self = this;
            var deferred = $.Deferred();

            // By default, download as text and pass to process.
            $.ajax({
                url: url,
                dataType: 'text'
            }).done(function(data) {
                var result = self.process(url, data);
                deferred.resolve(result);
            }).fail(function() {
                throw 'Error loading resource: ' + url;
            });

            return deferred;
        },

        // Processes a loaded resource. Used for simple handlers that don't
        // need complex loading logic. May not be called if load is overridden.
        process: function(url, data) {
            return data;
        }
    };

    // Loads images.
    exports.ImageHandler = Object.create(exports.BaseHandler);
    exports.ImageHandler.load = function(url) {
        var self = this;
        var deferred = $.Deferred();
        var img = new Image();

        img.onload = function() {
            var resource = self.process(url, img);
            deferred.resolve(resource);
        };
        img.flipped = this.flipped;
        img.src = url;

        return deferred;
    };

    // Loads JSON files
    exports.JSONHandler = Object.create(exports.BaseHandler);
    exports.JSONHandler.process = function(url, data) {
        return JSON.parse(data);
    };

    // Loads audio into <audio> tags.
    exports.AudioHandler = Object.create(exports.BaseHandler);
    exports.AudioHandler.load = function(url) {
        var self = this;
        var deferred = $.Deferred();
        var audio = new Audio();

        audio.addEventListener('canplaythrough', function() {
            var resource = self.process(url, audio);
            deferred.resolve(resource);
        }, true);
        audio.src = url;

        return deferred;
    };
});
