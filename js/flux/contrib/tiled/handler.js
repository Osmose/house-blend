define(function(require) {
    var $ = require('jquery');
    var BaseHandler = require('../../resources/handlers').BaseHandler;

    // Loads map xml saved by Tiled map editor.
    var TMXHandler = Object.create(BaseHandler);
    TMXHandler.process = function(url, data) {
        var $data = $($.parseXML(data)),
            $map = $data.find('map');

        if ($map.attr('version') !== '1.0') {
            throw 'Map loader only supports TMX 1.0 files.';
        }

        var map = {
            width_tiles: parseInt($map.attr('width')),
            height_tiles: parseInt($map.attr('height')),
            tile_width: parseInt($map.attr('tilewidth')),
            tile_height: parseInt($map.attr('tileheight')),
            tilesets: {},
            layers: {},
            objectGroups: {}
        };

        map.width_pixels = map.width_tiles * map.tile_width;
        map.height_pixels = map.height_tiles * map.tile_height;

        // Load tilesets
        $map.find('tileset').each(function() {
            // TODO: Support multiple images.
            var $tileset = $(this);
            var $image = $tileset.find('image');

            var tileset = {
                name: $tileset.attr('name'),
                tileWidth: $tileset.attr('tilewidth'),
                tileHeight: $tileset.attr('tileheight'),
                image: $image.attr('source')
            };

            map.tilesets[tileset.name] = tileset;
        });

        // Load layers
        $map.find('layer').each(function() {
            var $layer = $(this);
            var layer = {
                name: $layer.attr('name'),
                width: $layer.attr('width'),
                height: $layer.attr('height'),
                grid: []
            };

            if ($layer.find('data').attr('encoding') !== 'csv') {
                throw 'Unsupported layer encoding, please use csv.';
            }

            var row_string = $.trim($layer.find('data').text());
            var rows = row_string.split(/[\r\n]+/);
            rows.forEach(function(row) {
                var cols = row.split(',');
                layer.grid.push(cols.map(function(str) {
                    return parseInt(str, 10) - 1;
                }));
            });


            map.layers[layer.name] = layer;
        });

        // Load objects
        $map.find('objectgroup').each(function() {
            var $object_group = $(this);
            var object_group = {
                name: $object_group.attr('name'),
                objects: []
            };

            $object_group.find('object').each(function() {
                var $object = $(this);
                var object = {
                    type: $object.attr('type'),
                    x: parseInt($object.attr('x')),
                    y: parseInt($object.attr('y')),
                    width: parseInt($object.attr('width')),
                    height: parseInt($object.attr('height')),
                    properties: {}
                };

                $object.find('properties').find('property').each(function() {
                    var $property = $(this);
                    object.properties[$property.attr('name')] = $property.attr('value');
                });

                object_group.objects.push(object);
            });

            map.objectGroups[object_group.name] = object_group;
        });

        return map;
    };

    return TMXHandler;
});
