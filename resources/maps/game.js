(function () {
  let scripts = game_manager.get_scripts();
  let map_x_size = 21;
  let map_y_size = 10;
  let tile_x_size = 64;
  let tile_y_size = 64;
  let throttled_change_to_intro = throttle(
    function (map_manager) {
      map_manager.change_maps('intro');
      console.log("changing maps");
    },
    150
  );

  scripts['game'].data = {
    "map": {
      "height": tile_y_size * map_y_size,
      "width": tile_x_size * map_x_size,
      "tile_x_size": tile_x_size,
      "tile_y_size": tile_y_size,
      "x_size": map_x_size,
      "y_size": map_y_size,
      "id": "game",
      "player_layer": 2,
      "needs_bg": true,
      "init": function (manager) {
        let i = 0;
        let j = 0;
        let map_manager = manager.get('map');
        let map = map_manager.get_map();
        let entity_manager = manager.get('entity');
        let x = 0, y = 0;
        let image_names = [
          "dirt", "grass", "grass", "grass", "grass", "water"
        ];

        for (i = 0; i < map.x_size; i++) {
          for (j = 0; j < map.y_size; j++) {
            x = i * map.tile_x_size;
            y = j * map.tile_y_size;
            console.log("adding tile_"+ i + "_" + j +" at (" + x + ", " + y + ")");
            tile = {
              'x': x,
              'y': y,
              'x_scale': 1,
              'y_scale': 1,
              'x_size': map.tile_x_size,
              'y_size': map.tile_y_size,
              'x_velocity': 0,
              'y_velocity': 0,
              'layer': 1.5,
              'id': 'tile_' + i + "_" + j,
              'img': array_random(image_names),
              'x_acceleration': 0,
              'y_acceleration': 0,
              'update': function (delta, manager) {
                let entity_manager = manager.get('entity');
              }
            };
            map.layers[0].push(tile);
          }
        }
        console.log("map " + this.id + ": initialized");
      },
      "deinit": function (manager) {
        console.log("map " + this.id + ": de-initialized");
        let i = 0;
        let j = 0;
        let entity_manager = manager.get('entity');
        let map_manager = manager.get('map');
        let map = map_manager.get_map();

        for (i = 0; i < map.x_size; i++) {
          for (j = 0; j < map.y_size; j++) {
            entity_manager.remove_entity("tile_" + i + "_" + j);
          }
        }
      },
      "update": function (delta, manager) {
        let map_manager = manager.get('map');
        let control_manager = manager.get('control');
        let entity_manager = manager.get('entity');
        let player = manager.get('player').get_player();
        let coords = null;

        if (control_manager.mouse()) {
          coords = control_manager.mouse_coords(); 
          player.x = coords.x;
          player.y = coords.y;
        }

        if (control_manager.keys('Escape')) {
          throttled_change_to_intro(map_manager);
        }

        entity_manager.move_entity(player, player.x, player.y);
      },
      "layers": [
        [
          {
            "id": "grass1",
            "img": "grass",
            "x": 0,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "grass2",
            "img": "grass",
            "x": 64,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "water1",
            "img": "water",
            "x": 128,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt1",
            "img": "dirt",
            "x": 0,
            "y": 64,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
        ]
      ]
    }
  }
})();
