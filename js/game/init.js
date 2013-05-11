define(function(require) {
    var $ = require('jquery');

    var Engine = require('flux/engine');

    var Player = require('game/entities/player');

    $(function() {
        var engine = new Engine(160, 144, 3);
        engine.bgColor = '#FFFF8B';
        engine.addEntity(new Player(10, 10));

        $('#game').append(engine.canvas);
        engine.start();
    });
});
