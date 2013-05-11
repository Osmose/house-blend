define(function(require) {
    var $ = require('jquery');

    var Util = require('flux/util');

    /**
     * Encapsulates a single audio file.
     */
    function Sound(audio) {
        this.audio = audio;
    }

    Sound.prototype = Object.create({
        play: function() {
            this.audio.play();
        },

        pause: function() {
            this.audio.pause();
        },

        stop: function() {
            this.audio.pause();
            this.audio.currentTime = 0;
        },

        loop: function() {
            this.audio.loop = true;
            this.audio.play();
        },

        mute: function() {
            this.audio.muted = true;
        },

        unmute: function() {
            this.audio.muted = false;
        },

        /**
         * Fade the volume of this sound to a new value.
         *
         * Duration is the length of the fade, tick is the delay between each
         * volume increase over the duration.
         */
        fade: function(final_volume, duration, tick) {
            var self = this;
            var deferred = $.Deferred();

            tick = tick || 50;
            var current_volume = this.audio.volume;
            var dv = (final_volume - current_volume) / (duration / tick);

            var start = Date.now();
            var ramp = function() {
                self.audio.volume = Util.restrict(self.audio.volume + dv, 1, 0);
                var elapsed = Date.now() - start;

                if (elapsed > duration) {
                    self.audio.volume = final_volume;
                    deferred.resolveWith(self);
                } else {
                    setTimeout(ramp, tick);
                }
            };
            this.play(); // Why fade if you're not playing?
            setTimeout(ramp, tick);

            return deferred;
        }
    });

    return Sound;
});
