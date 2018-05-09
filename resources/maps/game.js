(function () {
  let scripts = game_manager.get_scripts();
  let map_x_size = 80;
  let map_y_size = 80;
  let tile_x_size = 32;
  let tile_y_size = 32;
  let monster_count = 3;
  let throttled_change_to_intro = throttle(
    function (map_manager) {
      map_manager.change_maps('intro');
      console.log("changing maps");
    },
    150
  );
  let last_player_move = null;

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
        let player_manager = manager.get('player');
        let player = player_manager.get_player();
        let map = map_manager.get_map();
        let entity_manager = manager.get('entity');
        let camera_manager = manager.get('camera');
        let x = 0, y = 0;
        let random_tiles = null;
        let generated_tiles = null;
        let big_images = [
        ];
        let small_images = [
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k", "grass_rm2k",
          "dirt_rm2k",
          "dirt_rm2k",
          "pave_stone",
          "tree",
          "water",
          "brush",
          "barrel", "stump",
          "barrel", "stump"
        ];
        let image_names = big_images.concat(small_images);

//      image_names.splice(image_names.indexOf("pave_stone"), 1);
//      image_names.splice(image_names.indexOf("tree"), 1);
//      image_names.splice(image_names.indexOf("brush"), 1);
//      image_names.splice(image_names.indexOf("water"), 1);

        let image_name = null;
        let x_scale = 0, y_scale = 0;
        let hits = null, hit = null, hit_index = 0;
        let monster_x = 0, monster_y = 0, monster = null;

        let road_start = 10;
        random_tiles = {};
        for (i = 0; i < map.x_size; i++) {
          for (j = 0; j < map.y_size; j++) {
            x = i * map.tile_x_size;
            y = j * map.tile_y_size;
            image_name = array_random(image_names);
            if (small_images.includes(image_name)) {
              x_scale = 2;
              y_scale = 2;
            } else {
              x_scale = map.tile_x_size / 64;
              y_scale = map.tile_y_size / 64;
            }

            tile = {
              'x': x,
              'y': y,
              'tile_x': i,
              'tile_y': j,
              'x_scale': x_scale,
              'y_scale': y_scale,
              'x_size': map.tile_x_size,
              'y_size': map.tile_y_size,
              'x_velocity': 0,
              'y_velocity': 0,
              'layer': 1.5,
              'id': 'tile_' + i + "_" + j,
              'img': image_name,
              'type': image_name,
              'x_acceleration': 0,
              'y_acceleration': 0,
              'update': function (delta, manager) {
                let entity_manager = manager.get('entity');
              }
            };
            random_tiles[get_key(i, j)] = tile;

            if (["tree", "barrel", "bush", "dead_tree", "small_tree", "stump"].includes(image_name)) {
              tile = {
                'x': x,
                'y': y,
                'x_scale': x_scale,
                'y_scale': y_scale,
                'x_size': map.tile_x_size,
                'y_size': map.tile_y_size,
                'x_velocity': 0,
                'y_velocity': 0,
                'layer': 1.3,
                'id': 'tile_' + i + "_" + j + "_base",
                'img': "grass_rm2k",
                'type': "grass_rm2k",
                'x_acceleration': 0,
                'y_acceleration': 0,
                'update': function (delta, manager) {
                  let entity_manager = manager.get('entity');
                }
              };
              // step 1 of 3: uncomment this to show seed map instead
              //entity_manager.add_entity(tile);
            }
          }
        }

        let features = {
          "pave_stone": {
            x: 0,
            y: 25,
            width: map.x_size,
            height: 2,
            id: "pave_stone"
          },
          "water": {
            x: 0, y: 0,
            width: 20,
            height: 20,
            id: "water"
          },
          "brush": {
            x: 40, y: 30,
            width: 30,
            height: 30,
            id: "brush"
          },
          "tree": {
            x: 0, y: 30,
            width: 40,
            height: 15,
            id: "tree"
          }
        };
        let k = null;
        for (k in features) {
          feature = features[k];
          for (i = feature.x; i < feature.x+feature.width; i++) {
            for (j = feature.y; j < feature.y+feature.height; j++) {
              random_tiles[get_key(i, j)] = {
                'x': i*map.tile_x_size,
                'y': j*map.tile_y_size,
                'tile_x': i,
                'tile_y': j,
                'x_scale': x_scale,
                'y_scale': y_scale,
                'x_size': map.tile_x_size,
                'y_size': map.tile_y_size,
                'x_velocity': 0,
                'y_velocity': 0,
                'layer': 1.5,
                'id': 'tile_' + i + "_" + j,
                'img': feature.id,
                'type': feature.id,
                'x_acceleration': 0,
                'y_acceleration': 0,
                'update': function (delta, manager) {
                  let entity_manager = manager.get('entity');
                }
              };
              // step 2 of 3: uncomment this to show seed map instead
              //entity_manager.remove_entity(tile.id);
              //entity_manager.add_entity(random_tiles[get_key(i, j)]);
            }
          }
        }

        // random placement is distracting right now
        player.x = 5*map.tile_x_size // random_int(map_x_size) * map.tile_x_size;
        player.y = 5*map.tile_y_size // random_int(map_y_size) * map.tile_y_size;
        entity_manager.move_entity(player, player.x, player.y);
        camera_manager.center(player.x, player.y);

        // omitted for now: monsters
        // monsters
/*        for (i = 0; i < monster_count; i++) {
          monster_x = random_int(map_x_size)*map.tile_x_size,
          monster_y = random_int(map_y_size)*map.tile_y_size,

          monster = {
            'x': monster_x,
            'y': monster_y,
            'last_x': monster_x,
            'last_y': monster_y,
            'x_scale': 2,
            'y_scale': 2,
            'x_size': 32,
            'y_size': 32,
            'x_velocity': 0,
            'y_velocity': 0,
            'layer': 2,
            'id': 'monster_' + i,
            'img': "shards",
            'x_acceleration': 0,
            'y_acceleration': 0,
            'update': function (delta, manager) {
              let entity_manager = manager.get('entity');
              if (this.last_move && performance.now() - this.last_move < 550) {
                return;
              }

              last_move = performance.now();

              if (Math.random() > 0.95) {
                this.last_x = this.x;
                this.last_y = this.y;

                if (Math.random() > 0.75) {
                  this.attacking = true;
                } else {
                  this.attacking = false;
                }

                if (player.x < this.x) {
                  x_bias = - 0.1;
                } else {
                  x_bias = 0.1;
                }

                if (player.y < this.y) {
                  y_bias = -0.1;
                } else {
                  y_bias = 0.1;
                }

                if (Math.random()+x_bias > 0.5) {
                  this.x += map.tile_x_size;
                } else {
                  this.x -= map.tile_x_size;
                }

                if (Math.random()+y_bias > 0.5) {
                  this.y += map.tile_y_size;
                } else {
                  this.y -= map.tile_y_size;
                }

                hits = manager.get('entity').collide(this);
                for (hit_index = 0; hit_index < hits.length; hit_index++) {
                  hit = hits[hit_index];
                  if (hit.x !== this.x || hit.y !== this.y) {
                    continue;
                  }

                  if (hit.img === "tree" || hit.img === "water" || hit.img == "barrel" || hit.img === "stump" || hit.type === "bound") {
                    console.log("hit " + hit.img + ": " + hit.x + ", " + hit.y);
                    console.log("this: " + this.x + ", " + this.y + ", last: " + this.last_x + ", " + this.last_y);

                    this.x = this.last_x;
                    this.y = this.last_y;
                    break;
                  }
                  else if (hit.type === "monster") {
                    if (player.attacking === true) {
                      // roll for damage to monster
                    }
                    if (hit.attacking === true) {
                    // roll for damage to player
                    }
                    break;
                  }
                  else if (hit.type === "treasure") {
                    this.gold += 1;
                    // do something treasure-y
                    break;
                  }
                }
                entity_manager.move_entity(this, this.x, this.y);
              }
            }
          };
          entity_manager.add_entity(monster);
        }*/

        // step 3 of 3: comment from here to end of init function to see seed map instead
        results = wavefunction_collapse(random_tiles, map_x_size, map_y_size, 250, 100);
        for (i = 0; i < results.x_size; i++) {
          for (j = 0; j < results.y_size; j++) {
            if (small_images.includes(image_name)) {
              x_scale = 2;
              y_scale = 2;
            } else {
              x_scale = map.tile_x_size / 64;
              y_scale = map.tile_y_size / 64;
            }
            entity_manager.add_entity({
              'x': i*map.tile_x_size,
              'y': j*map.tile_y_size,
              'tile_x': i,
              'tile_y': j,
              'x_scale': x_scale,
              'y_scale': y_scale,
              'x_size': map.tile_x_size,
              'y_size': map.tile_y_size,
              'x_velocity': 0,
              'y_velocity': 0,
              'layer': 1.5,
              'id': 'tile_' + i + "_" + j,
              'img': results.tiles[get_key(i, j)],
              'type': results.tiles[get_key(i, j)],
              'x_acceleration': 0,
              'y_acceleration': 0,
              'update': function (delta, manager) {
                let entity_manager = manager.get('entity');
              }
            }); 
            if (["tree", "barrel", "bush", "dead_tree", "small_tree", "stump"].includes(results.tiles[get_key(i, j)])) {
              entity_manager.add_entity({
                'x': i*map.tile_x_size,
                'y': j*map.tile_y_size,
                'x_scale': x_scale,
                'y_scale': y_scale,
                'x_size': map.tile_x_size,
                'y_size': map.tile_y_size,
                'x_velocity': 0,
                'y_velocity': 0,
                'layer': 1.3,
                'id': 'tile_' + i + "_" + j + "_base",
                'img': "grass_rm2k",
                'type': "grass_rm2k",
                'x_acceleration': 0,
                'y_acceleration': 0,
                'update': function (delta, manager) {
                  let entity_manager = manager.get('entity');
                }
              });
            }
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
        let map = map_manager.get_map();
        let control_manager = manager.get('control');
        let entity_manager = manager.get('entity');
        let camera_manager = manager.get('camera');
        let player = manager.get('player').get_player();
        let hits = null, hit_index = 0, hit = null;
        let up = false, down = false, left = false, right = false;

        if (control_manager.keys('Escape')) {
          throttled_change_to_intro(map_manager);
        }

        if (control_manager.mouse()) {
          coords = control_manager.mouse_coords();
          player.x = Math.floor(coords.x / map.tile_x_size) * map.tile_x_size;
          player.y = Math.floor(coords.y / map.tile_y_size) * map.tile_y_size;
          entity_manager.move_entity(player, player.x, player.y);
          camera_manager.center(player.x, player.y);
          return;
        }

        if (last_player_move && ((performance.now() - last_player_move) < 64)) {
          return;
        }

        player.last_x = player.x;
        player.last_y = player.y;

        up = control_manager.keys('KeyW') || control_manager.keys('ArrowUp');
        down = control_manager.keys('KeyS') || control_manager.keys('ArrowDown');
        left = control_manager.keys('KeyA') || control_manager.keys('ArrowLeft');
        right = control_manager.keys('KeyD') || control_manager.keys('ArrowRight');

        if (up) {
          player.y -= map.tile_y_size;
        } else if (down) {
          player.y += map.tile_y_size;
        }

        if (left) {
          player.x -= map.tile_x_size;
        } else if (right) {
          player.x += map.tile_x_size;
        }

        if (player.x !== player.last_x || player.y !== player.last_y) {
          last_player_move = performance.now();
        }

        hits = manager.get('entity').collide(player);
        for (hit_index = 0; hit_index < hits.length; hit_index++) {
          hit = hits[hit_index];
          if (hit.x !== player.x || hit.y !== player.y) {
            continue;
          }

          if (hit.img === "tree" || hit.img == "barrel" || hit.img === "stump" || hit.type === "bound") {
            console.log("hit " + hit.img + ": " + hit.x + ", " + hit.y);
            console.log("player: " + player.x + ", " + player.y + ", last: " + player.last_x + ", " + player.last_y);
            player.x = player.last_x;
            player.y = player.last_y;
            break;
          }
          else if (hit.type === "monster") {
            if (player.attacking === true) {
              // roll for damage to monster
            }
            if (hit.attacking === true) {
              // roll for damage to player
            }
            break;
          }
          else if (hit.type === "treasure") {
            player.gold += 1;
            // do something treasure-y
            break;
          }
        }

        entity_manager.move_entity(player, player.x, player.y);
        camera_manager.center(player.x, player.y);
      },
      "layers": [
        [
        ]
      ]
    }
  }
})();
