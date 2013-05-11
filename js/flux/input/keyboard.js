define(function(require) {
    function Keyboard() {
        var self = this;
        this._keys = {};
        this._pressed = {};
        this._released = {};
        this._controls = {};

        function setKey(code, status) {
            self._pressed[code] = status;
            self._released[code] = !status;
            self._keys[code] = status;
        }

        window.addEventListener('keydown', function(e) {
            setKey(e.keyCode, true);
        });

        window.addEventListener('keyup', function(e) {
            setKey(e.keyCode, false);
        });

        this.LEFT = 37;
        this.UP = 38;
        this.RIGHT = 39;
        this.DOWN = 40;
        this.SPACE = 32;

        // Letters and numbers.
        for (var k = 48; k < 91; k++) {
            this[String.fromCharCode(k).toUpperCase()] = k;
        }
    }

    Keyboard.prototype = {
        letter: function(l) {
            return self.keys[l.toUpperCase().charCodeAt(0)];
        },

        // Define a new control, which maps a name to keycodes.
        define: function(name) {
            if (arguments.length > 1) {
                if (!(name in this._controls)) {
                    this._controls[name] = [];
                }

                this._controls.concat(arguments.slice(1));
            }
        },

        check: function(code) {
            return this._test(code, function(code) {
                return this._keys[code];
            });
        },

        pressed: function(code) {
            return this._test(code, function(code) {
                return this._pressed[code];
            });
        },

        released: function(code) {
            return this._test(code, function(code) {
                return this._released[code];
            });
        },

        _test: function(code, test) {
            if (typeof code === 'string') {
                return this._controls[code].some(test);
            } else {
                return test.call(this, code);
            }
        },

        tick: function() {
            for (var k in this._pressed) {
                if (this._pressed.hasOwnProperty(k)) {
                    this._pressed[k] = false;
                }
            }

            for (var j in this._released) {
                if (this._released.hasOwnProperty(j)) {
                    this._released[j] = false;
                }
            }
        }
    };

    return Keyboard;
});
