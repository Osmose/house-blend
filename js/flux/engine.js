define(function(require) {
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
            this.render();

            if (this.running) {
                requestFrame(this.bound_loop, this.canvas);
            }
        },

        // Process one frame of behavior.
        tick: function() {
            for (var k = this.gameModes.length - 1; k >= 0; k--) {
                var gameMode = this.gameModes[k];
                gameMode.tick(this);

                if (gameMode.blockTick) {
                    break;
                }
            }

            this.kb.tick(this);
        },

        // Render the screen.
        render: function() {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.width, this.height);

            if (this.bgColor) {
                this.ctx.fillStyle = this.bgColor;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            this.ctx.restore();

            // Find the last GameMode that blocks rendering.
            var lastToRender = 0;
            for (var k = 0; k < this.gameModes.length; k++) {
                if (this.gameModes[k].blockRender) {
                    lastToRender = k;
                    break;
                }
            }

            // Render from the top of the stack to the last GameMode that blocks
            // rendering.
            for (var k = this.gameModes.length - 1; k >= lastToRender; k--) {
                this.gameModes[k].render(this, this.ctx);
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
