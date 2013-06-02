define(function(require) {
    var _ = require('flux/lib/lodash');

    var BaseGameMode = require('./gamemodes/base');
    var Keyboard = require('./input/keyboard');

    var requestFrame = (function() {
        return window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            function(callback) {
                setTimeout(callback, 30);
            };
    })();

    // Handles the game loop, timing, and dispatching processing and rendering
    // to the active entities.
    function Engine(width, height, scale, gameMode) {
        var self = this;

        // Graphics properties.
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.bgColor = null;

        // Input
        this.kb = new Keyboard();

        // Engine State
        this.running = false;
        this.gameModes = [];
        if (gameMode === undefined) {
            gameMode = new BaseGameMode();
        }
        this.gameModes.push(gameMode);

        // Bind the engine to the loop function used as a callback
        // in request frame.
        this.bound_loop = this.loop.bind(this);

        // Initialize canvas.
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.width * this.scale;
        this.canvas.height = this.height * this.scale;
        this.ctx.scale(this.scale, this.scale);
        this.ctx.mozImageSmoothingEnabled = false;

        // Bind focus and blur handlers to pause when not in focus.
        // TODO: Proper pausing.
        window.addEventListener('focus', function() {
            self.start();
        }, false);
        window.addEventListener('blur', function() {
            self.stop();
        }, false);
    }

    Engine.prototype = {
        // Process and render a single frame, and schedule another loop
        // for the next frame.
        loop: function() {
            var self = this;
            this.tick();
            this.draw();

            if (this.running) {
                requestFrame(this.bound_loop, this.canvas);
            }
        },

        // Process one frame of behavior.
        tick: function() {
            _.forEach(this.gameModes, function(gameMode) {
                gameMode.tick(this);

                if (gameMode.blockTick) {
                    return false;
                }
            }, this);

            this.kb.tick(this);
        },

        // Draw the screen.
        draw: function() {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.width, this.height);

            if (this.bgColor) {
                this.ctx.fillStyle = this.bgColor;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            this.ctx.restore();

            // Draw from the top of the stack to the last GameMode that blocks
            // rendering.
            var lastToRender = _.find(this.gameModes, 'blockDraw') || 0;
            for (var i = this.gameModes.length - 1; i >= lastToRender; i--) {
                this.gameModes[i].draw(this, this.ctx);
            }
        },

        addEntity: function(entity) {
            this.gameModes[this.gameModes.length - 1].addEntity(entity);
        },

        removeEntity: function(entity) {
            this.gameModes[this.gameModes.length - 1].removeEntity(entity);
        },

        // Start the game loop.
        start: function() {
            if (!this.running) {
                this.running = true;
                this.loop();
            }
        },

        // Stop the game.
        stop: function() {
            this.running = false;
        }
    };

    return Engine;
});
