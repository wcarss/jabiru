"use strict";

(function () {
  let scripts = game_manager.get_scripts();
  let map_x_size = 43;
  let map_y_size = 21;
  let tile_x_size = 32;
  let tile_y_size = 32;
  let monster_count = 60;
  let monster_health = 5;
  let treasure_health = 10;
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
      "needs_bg": false,
      "monster_count": 0,
      "init": function (manager) {
        let i = 0;
        let j = 0;
        let map_manager = manager.get('map');
        let player_manager = manager.get('player');
        let player = player_manager.get_player();
        let map = map_manager.get_map();
        let entity_manager = manager.get('entity');
        let camera_manager = manager.get('camera');
        let context_manager = manager.get('context');
        let canvas_width = context_manager.get_width();
        let canvas_height = context_manager.get_height();
        let x = 0, y = 0;
        let use_random_tiles = false;
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
          "barrel", "stump", "treasure", "temple"
        ];
        let image_names = big_images.concat(small_images);

//      image_names.splice(image_names.indexOf("pave_stone"), 1);
//      image_names.splice(image_names.indexOf("tree"), 1);
//      image_names.splice(image_names.indexOf("brush"), 1);
//      image_names.splice(image_names.indexOf("water"), 1);

        let image_name = null;
        let x_scale = 0, y_scale = 0;
        let hits = null, hit = null, hit_index = 0;
        let monster_x = 0, monster_y = 0, monster_tile = null, monster_try_count = 0, monster = null, monster_full_health = null, monster_remaining_health = null;
        let treasure_full_health = null, treasure_remaining_health = null;
        let road_start = 10;
        let monster_taken = {};

        // some camera and map size adjustments
        this.x_size = Math.ceil(canvas_width / tile_x_size);
        this.y_size = Math.ceil(canvas_height / tile_y_size);
        canvas_width = this.x_size * tile_x_size;
        canvas_height = this.y_size * tile_y_size;
        context_manager.resize(null, 0, 0, canvas_width, canvas_height);
        camera_manager.resize(canvas_width, canvas_height);
        this.x_size *= 5;
        this.y_size *= 6;
        map_x_size = this.x_size;
        map_y_size = this.y_size;
        this.width = this.x_size * tile_x_size;
        this.height = this.y_size * tile_y_size;
        entity_manager.setup_entities();


        // some map specific player setup
        player.default_move_cooldown = 20;
        player.move_cooldown = 20;
        player.default_attack_cooldown = 300;
        player.attack_cooldown = 300;
        player.default_plant_cooldown = 300;
        player.plant_cooldown = 300;
        player.default_dig_cooldown = 300;
        player.dig_cooldown = 300;

        // not using pre-generated seeds
        if (use_random_tiles) {
          random_tiles = {};
          for (i = 0; i < map.x_size; i++) {
            for (j = 0; j < map.y_size; j++) {
              x = i * map.tile_x_size;
              y = j * map.tile_y_size;
              image_name = array_random(image_names);
              if (small_images.includes(image_name)) {
                x_scale = 1;
                y_scale = 1;
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
  
              if (["tree", "barrel", "bush", "dead_tree", "small_tree", "stump", "treasure"].includes(image_name)) {
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
        }

        let results = wavefunction_collapse(random_tiles, map_x_size, map_y_size, map_x_size, map_y_size, this.generation_seed);

        let this_map = manager.get('map').get_map();
        let tile = null;
        this_map.generated_seed = results;

        results.tiles[get_key(random_int(map_x_size), random_int(map_y_size))] = "temple";

        for (i = 0; i < results.x_size; i++) {
          for (j = 0; j < results.y_size; j++) {
            if (small_images.includes(results.tiles[get_key(i, j)])) {
              x_scale = 1;
              y_scale = 1;
            } else {
              x_scale = map.tile_x_size / 64;
              y_scale = map.tile_y_size / 64;
            }

            tile = {
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
            };
     
            if (tile.type === "treasure") {
              treasure_full_health = {
                'x': tile.x,
                'y': tile.y-1,
                'x_size': tile.x_size,
                'y_size': 3,
                'layer': 1.8,
                'id': tile.id + "_full_health",
                'type': "health",
                'img': "rgb(250, 10, 10)",
                'render_type': "fillRect"
              };

              treasure_remaining_health = {
                'x': tile.x,
                'y': tile.y-1,
                'x_size': tile.x_size,
                'y_size': 3,
                'health_left': treasure_health,
                'full_health': treasure_health,
                'layer': 1.9,
                'id': tile.id + "_health_left",
                'type': "health",
                'img': "rgb(10, 250, 10)",
                'render_type': "fillRect",
                'update': function (delta, manager) {
                  this.x_size = Math.floor(this.health_left / this.full_health * tile_x_size);
                }
              };

              tile.gold_count = 5+random_int(15);
              tile.hits = treasure_health;

              tile.health_bar = [
                treasure_full_health, treasure_remaining_health
              ];

              tile.update = function (delta, manager) {
                this.health_bar[1].health_left = this.hits;
              };

              entity_manager.add_entity(treasure_full_health);
              entity_manager.add_entity(treasure_remaining_health);
            }
            entity_manager.add_entity(tile);

            if (["tree", "barrel", "bush", "dead_tree", "small_tree", "stump", "treasure"].includes(results.tiles[get_key(i, j)])) {
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

        // monsters
        for (i = 0; i < monster_count; i++) {
          for (monster_try_count = 0; monster_try_count < 10; monster_try_count++) {
            monster_x = random_int(map_x_size);
            monster_y = random_int(map_y_size);
            
            monster_tile = results.tiles[get_key(monster_x, monster_y)];
            if (monster_tile === "grass_rm2k" || monster_tile === "brush" || monster_taken[get_key(monster_x, monster_y)]) {
              break;
            }
          }
          if (monster_try_count >= 10) {
            continue;
          }

          monster_taken[get_key(monster_x, monster_y)] = true;

          monster_x *= map.tile_x_size;
          monster_y *= map.tile_y_size;

          monster_full_health = {
            'x': monster_x,
            'y': monster_y-1,
            'x_size': map.tile_x_size,
            'y_size': 3,
            'layer': 1.8,
            'id': 'monster_' + i + "_full_health",
            'type': "health",
            'img': "rgb(250, 10, 10)",
            'render_type': "fillRect"
          };

          monster_remaining_health = {
            'x': monster_x,
            'y': monster_y-1,
            'x_size': map.tile_x_size,
            'y_size': 3,
            'health_left': monster_health,
            'full_health': monster_health,
            'layer': 1.9,
            'id': 'monster_' + i + "_health_left",
            'type': "health",
            'img': "rgb(10, 250, 10)",
            'render_type': "fillRect",
            'update': function (delta, manager) {
              this.x_size = Math.floor(this.health_left / this.full_health * map.tile_x_size);
            }
          };

          monster = {
            'x': monster_x,
            'y': monster_y,
            'last_x': monster_x,
            'last_y': monster_y,
            'x_scale': 1,// 32/24,
            'y_scale': 1,// 32/24,
            'x_size': 24,
            'y_size': 24,
            'x_velocity': 0,
            'y_velocity': 0,
            'health_bar': [
              monster_full_health, monster_remaining_health
            ],
            'hits': monster_health,
            'layer': 2,
            'gold_count': 1,
            'id': 'monster_' + i,
            'type': "monster",
            'img': "skeleton",
            'x_acceleration': 0,
            'y_acceleration': 0,
            'update': function (delta, manager) {
              let entity_manager = manager.get('entity');
              let sound_manager = manager.get('audio');
              let player = manager.get('player').get_player();
              let x_bias = 0, y_bias = 0, x_change = 0, y_change = 0;
              let distance_x = Math.abs(player.x/tile_x_size - this.x/tile_x_size);
              let distance_y = Math.abs(player.y/tile_y_size - this.y/tile_y_size);
              let taxicab_distance = distance_x + distance_y;
              let default_bias = 0.5, bias_factor = 0;
              let hits = null, hit = null, hit_index = 0;

              this.health_bar[0].x = this.x;
              this.health_bar[0].y = this.y-1;
              this.health_bar[1].x = this.x;
              this.health_bar[1].y = this.y-1;
              this.health_bar[1].health_left = this.hits;

              if (this.hits >= 0) {
                //entity_manager.move_entity(this.health_bar[0], this.health_bar[0].x, this.health_bar[0].y);
                //entity_manager.move_entity(this.health_bar[1], this.health_bar[1].x, this.health_bar[1].y);
              }

              if (this.last_move && (performance.now() - this.last_move < 400)) {
                return;
              }

              this.last_move = performance.now();

              if (Math.random() > 0.55) {
                this.last_x = this.x;
                this.last_y = this.y;

                if (Math.random() > 0.4) {
                  this.attacking = true;
                } else {
                  this.attacking = false;
                }

                x_bias = 0;
                y_bias = 0;

                if (taxicab_distance < 15) {
                  bias_factor = 2;
                } else if (taxicab_distance < 30) {
                  bias_factor = 1;
                } else if (taxicab_distance < 50) {
                  bias_factor = 0.8;
                } else if (taxicab_distance < 70) {
                  bias_factor = 0.5;
                } else {
                  bias_factor = 0.25;
                }

                if (player.x < this.x) {
                  x_bias = - default_bias * bias_factor;
                } else {
                  x_bias = default_bias * bias_factor;
                }

                if (player.y < this.y) {
                  y_bias = -default_bias * bias_factor;
                } else {
                  y_bias = default_bias * bias_factor;
                }

                let direction_chance = Math.random();
                let x_move_chance = 0.25 + Math.random()/2 + x_bias;
                let y_move_chance = 0.25 + Math.random()/2 + y_bias;

                if (x_move_chance > 0.5) {
                  x_change = map.tile_x_size;
                } else {
                  x_change = -map.tile_x_size;
                }

                if (y_move_chance > 0.5) {
                  y_change = map.tile_y_size;
                } else {
                  y_change = -map.tile_y_size;
                }

                if (direction_chance > 0.51) {
                  this.x += x_change;
                } else if (direction_chance > 0.02) {
                  this.y += y_change;
                } else {
                  this.x += x_change;
                  this.y += y_change;
                }

                if (this.x < 0 || this.y < 0 || this.x > map.width - map.tile_x_size || this.y > map.height - map.tile_y_size) {
                  this.x = this.last_x;
                  this.y = this.last_y;
                }

                hits = entity_manager.collide(this);
                for (hit_index = 0; hit_index < hits.length; hit_index++) {
                  hit = hits[hit_index];
                  if (hit.x !== this.x || hit.y !== this.y) {
                    continue;
                  }

                  if (hit.img === "tree" || hit.img === "water" || hit.img == "barrel" || hit.img === "stump" || hit.type === "bound") {
                    this.x = this.last_x;
                    this.y = this.last_y;
                  } else if (hit.id === "player1") {
                    this.x = this.last_x;
                    this.y = this.last_y;
                    if (this.attacking) {
                      sound_manager.play('hit2');
                      if (Math.random() > 0.55) {
                        hit.health -= 1;
                      }
                    }
                  } else if (hit.type === "monster") {
                    this.x = this.last_x;
                    this.y = this.last_y;
                    if (player.attacking === true) {
                      // roll for damage to monster
                    }
                    if (hit.attacking === true) {
                      // roll for damage to player
                    }
                    if (this.attacking === true) {
                      if (hit.hits === undefined) {
                        hit.hits = monster_health;
                      }
                      hit.hits -= 1;
                      if (hit.hits <= 0) {
                        this.gold_count += hit.gold_count;
                        hit.gold_count = 0;
                        entity_manager.remove_entity(hit.id);
                        entity_manager.remove_entity(hit.id+"_full_health");
                        entity_manager.remove_entity(hit.id+"_health_left");
                        manager.get('map').get_map().monster_count -= 1;
                        sound_manager.play('monster_dead');
                      } else if (Math.random() > 0.75) {
                        sound_manager.play('hit2');
                      } else {
                        sound_manager.play('monster');
                      }
                      this.attacking = false;
                    }
                  } else if (hit.type === "treasure") {
                    if (this.attacking === true) {
                      if (!hit.hits) {
                        hit.hits = 10;
                      }
                      hit.hits -= 1;
                      if (hit.hits <= 0) {
                        this.hits += 5;
                        this.gold_count += hit.gold_count;
                        entity_manager.remove_entity(hit.id);
                        entity_manager.remove_entity(hit.id+"_full_health");
                        entity_manager.remove_entity(hit.id+"_health_left");
                        sound_manager.play('pickup');
                      } else {
                        this.x = this.last_x;
                        this.y = this.last_y;
                        sound_manager.play('hit2');
                      }
                      this.attacking = false;
                    } else {
                      this.x = this.last_x;
                      this.y = this.last_y;
                    }
                  }
                }
                entity_manager.move_entity(this, this.x, this.y);
              }
            }
          };
          entity_manager.add_entity(monster);
          entity_manager.add_entity(monster_full_health);
          entity_manager.add_entity(monster_remaining_health);
          this.monster_count += 1;
        }

        // step 3 of 3: comment from here to end of init function to see seed map instead

        // random placement is distracting right now
        player.x = 5*map.tile_x_size // random_int(map_x_size) * map.tile_x_size;
        player.y = 5*map.tile_y_size // random_int(map_y_size) * map.tile_y_size;
        entity_manager.move_entity(player, player.x, player.y);
        camera_manager.center(player.x, player.y);

        // going to hard-code the seed for now
        //seed_distribution = manager.get('request').data

        entity_manager.add_entity({
          id: 'hud_text_backer',
          offset_type: "camera",
          x: 10,
          y: 15,
          ui_x: 10,
          ui_y: 15,
          x_size: 880,
          y_size: 30,
          x_scale: 1,
          y_scale: 1,
          img: "rgba(10, 10, 10, 0.6)",
          render_type: "fillRect",
          layer: 2.5,
          update: function (delta, manager) {
            let entity_manager = manager.get('entity');
            let offset = manager.get('camera').get_offset();
            entity_manager.move_entity(this, this.ui_x+offset.x, this.ui_y+offset.y);
          }
        });

        entity_manager.add_text({
          id: "health",
          text: "health: " + player.health,
          x: 20,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "health: " + player.health;
          },
        });

        entity_manager.add_text({
          id: "gold",
          text: "gold: " + player.gold_count,
          x: 150,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "gold: " + player.gold_count;
          },
        });

        entity_manager.add_text({
          id: "wood",
          text: "wood: " + player.wood_count,
          x: 250,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "wood: " + player.wood_count;
          },
        });

        entity_manager.add_text({
          id: "stone",
          text: "stone: " + player.stone_count,
          x: 350,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "stone: " + player.stone_count;
          },
        });

        entity_manager.add_text({
          id: "brush",
          text: "brush: " + player.brush_count,
          x: 450,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "brush: " + player.brush_count;
          },
        });

        entity_manager.add_text({
          id: "grass",
          text: "grass: " + player.grass_count,
          x: 550,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "grass: " + player.grass_count;
          },
        });

        entity_manager.add_text({
          id: "dirt",
          text: "dirt: " + player.dirt_count,
          x: 650,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let player = manager.get('player').get_player();
            this.text = "dirt: " + player.dirt_count;
          },
        });

        entity_manager.add_text({
          id: "monsters",
          text: "monsters: ",
          x: 750,
          y: 38,
          offset_type: "camera",
          font: "24px sans",
          color: "white",
          update: function (delta, manager) {
            let map = manager.get('map').get_map();
            this.text = "monsters: " + map.monster_count;
          },
        });

        let offset = manager.get('camera').get_offset();
        entity_manager.add_entity({
          id: "text_backer",
          offset_type: "camera",
          x: 200+offset.x,
          y: 185+offset.y,
          ui_x: 200,
          ui_y: 185,
          x_size: 375,
          y_size: 150,
          x_scale: 1,
          y_scale: 1,
          layer: 2.2,
          img: "rgba(0, 0, 0, 0)",
          render_type: "fillRect",
          update: function (delta, manager) {
            let entity_manager = manager.get('entity');
            let offset = manager.get('camera').get_offset();
            entity_manager.move_entity(this, this.ui_x+offset.x, this.ui_y+offset.y, true);
          }
        });

        player.showing_help = true;

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
        let sound_manager = manager.get('audio');
        let map = map_manager.get_map();
        let control_manager = manager.get('control');
        let entity_manager = manager.get('entity');
        let camera_manager = manager.get('camera');
        let player = manager.get('player').get_player();
        let hits = null, hit_index = 0, hit = null;
        let up = false, down = false, left = false, right = false,
          running = false, digging = false, planting = false;
        let text_out = null;
        let this_map = manager.get('map').get_map();
        let stage = null;
        let out_obj = null;
        let max_run_length = 3;
        let plant_time_length = 50;
        let dig_time_length = 50;
        let offset = null;
        let coords = null;
        let backer = null;
        let water_cooldown = 50;
        let info_id_index = null;
        let info_text = null;

        if (player.dead) {
          return;
        }

        if (player.health < 1) {
          player.dead = true;
          offset = manager.get('camera').get_offset();
          backer = entity_manager.get_entity("text_backer");
          if (backer) {
            backer.img = "rgba(10, 10, 10, 0.8)";
            backer.x = backer.ui_x + offset.x;
            backer.y = backer.ui_y + offset.y;
            backer.x_size = 375;
            backer.y_size = 150;
          }

          entity_manager.remove_text("text_dead");
          entity_manager.add_text({
            id: "text_dead",
            text: "You have died! The world will never be safe!",
            x: 210,
            y: 210,
            offset_type: "camera",
            font: "20px sans",
            color: "white",
          });
        }

        if (control_manager.keys('Escape')) {
          if (player.showing_info && (performance.now() - player.showing_info_at > 200)) {
            for (info_id_index in player.info_ids) {
              entity_manager.remove_text(player.info_ids[info_id_index]);
            }
            backer = entity_manager.get_entity("text_backer");
            if (backer) {
              backer.img = "rgba(0, 0, 0, 0)";
            }
            player.showing_info = false;
            player.showing_info_at = null;
            player.last_toggled_help = performance.now();
            return;
          }

          if (player.last_toggled_help && (performance.now() - player.last_toggled_help < 450)) {
            return;
          }
          player.last_toggled_help = performance.now();
          player.showing_help = !player.showing_help;
        }

        if (!player.showing_help && !player.showing_info) {
          backer = entity_manager.get_entity("text_backer");
          if (backer) {
            backer.img = "rgba(0, 0, 0, 0)";
          }
          if (!player.help_text_removed) {
            player.help_text_removed = true;
            player.help_text_added = false;
            entity_manager.remove_text("help_text_0");
            entity_manager.remove_text("help_text_1");
            entity_manager.remove_text("help_text_2");
            entity_manager.remove_text("help_text_3");
            entity_manager.remove_text("help_text_4");
          }
        } else if (player.showing_help) {
          offset = manager.get('camera').get_offset();
          backer = entity_manager.get_entity("text_backer");
          if (backer) {
            backer.img = "rgba(10, 10, 10, 0.8)";
            backer.x = backer.ui_x + offset.x;
            backer.y = backer.ui_y + offset.y;
            backer.x_size = 375;
            backer.y_size = 150;
          }

          if (!player.help_text_added) {
            player.help_text_removed = false;
            player.help_text_added = true;
            entity_manager.add_text({
              id: "help_text_0",
              text: "Controls: (show / hide with Escape)",
              x: 210,
              y: 210,
              offset_type: "camera",
              font: "20px sans",
              color: "white",
            });
            entity_manager.add_text({
              id: "help_text_1",
              text: "Move / Attack   -  WASD or Arrows",
              x: 210,
              y: 250,
              offset_type: "camera",
              font: "20px sans",
              color: "white",
            });
            entity_manager.add_text({
              id: "help_text_2",
              text: "Dash                  -  Hold Space and move",
              x: 210,
              y: 275,
              offset_type: "camera",
              font: "20px sans",
              color: "white",
            });
            entity_manager.add_text({
              id: "help_text_3",
              text: "Dig Tile             -  z",
              x: 210,
              y: 300,
              offset_type: "camera",
              font: "20px sans",
              color: "white",
            });
            entity_manager.add_text({
              id: "help_text_4",
              text: "Place Tile          -  x",
              x: 210,
              y: 325,
              offset_type: "camera",
              font: "20px sans",
              color: "white",
            });
          }
        }

        if (control_manager.keys('KeyM')) {
          if (player.last_toggled_text && (performance.now() - player.last_toggled_text < 200)) {
            return;
          }

          text_out = document.getElementById("text_out");
          stage = document.getElementById("stage");

          if (!text_out) {
            text_out = document.createElement("textarea");
            text_out.id = "text_out";
            text_out.rows = 15;
            text_out.cols = 80;
            document.body.appendChild(text_out);
          }

          if (player.showing_text) {
            text_out.hidden = true;
            stage.hidden = false;
            text_out.innerText = "";
            player.showing_text = false;
          } else {
            text_out.hidden = false;
            stage.hidden = true;
            out_obj = {
              dir_freqs: this_map.generated_seed.dir_freqs,
              constraints: this_map.generated_seed.constraints,
              frequencies: this_map.generated_seed.frequencies,
            };
            text_out.innerText = JSON.stringify(out_obj);
            player.showing_text = true;
          }

          player.last_toggled_text = performance.now();
        }

        if (control_manager.mouse()) {
          coords = control_manager.mouse_coords();
          offset = camera_manager.get_offset();
          player.x = Math.floor((offset.x + coords.x) / map.tile_x_size) * map.tile_x_size;
          player.y = Math.floor((offset.y + coords.y) / map.tile_y_size) * map.tile_y_size;
          entity_manager.move_entity(player, player.x, player.y);
          camera_manager.center(player.x, player.y);
          return;
        }

        if (player.hit_water && (performance.now() - player.hit_water) < water_cooldown) {
          return;
        } else if (player.hit_water && (performance.now() - player.hit_water) > water_cooldown) {
          player.hit_water = null;
        }

        player.last_x = player.x;
        player.last_y = player.y;

        up = control_manager.keys('KeyW') || control_manager.keys('ArrowUp');
        down = control_manager.keys('KeyS') || control_manager.keys('ArrowDown');
        left = control_manager.keys('KeyA') || control_manager.keys('ArrowLeft');
        right = control_manager.keys('KeyD') || control_manager.keys('ArrowRight');
        running = control_manager.keys('Space');
        digging = control_manager.keys('KeyZ');
        planting = control_manager.keys('KeyX');

        if (running && (up || down || left || right) && (player.run_length + 1 > max_run_length)) {
          return;
        } else if (running && (up || down || left || right)) {
          player.run_length += 1;
          player.running = true;
        } else {
          player.run_length = 0;
          player.running = false;
        }

        player.attacking = true;
        if (player.last_state && player.running && player.last_state.attacking) {
          player.attacking = false;
        }

        if (!player.running && up && player.last_state.up) return;
        if (!player.running && down && player.last_state.down) return;
        if (!player.running && left && player.last_state.left) return;
        if (!player.running && right && player.last_state.right) return;
        if (digging && player.last_state.digging) return;
        if (planting && player.last_state.planting) return;

        player.last_state = {
          up: up, down: down, left: left, right: right,
          running: running, planting: planting, digging: digging
        };

        player.planting = planting;
        player.digging = digging;

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

        if (player.x < 0 || player.y < 0 || player.x > map.width-map.tile_x_size || player.y > map.height-map.tile_y_size) {
          player.x = player.last_x;
          player.y = player.last_y;
          return;
        }

        hits = manager.get('entity').collide(player);
        for (hit_index = 0; hit_index < hits.length; hit_index++) {
          hit = hits[hit_index];
          if (hit.x !== player.x || hit.y !== player.y) {
            continue;
          }

          if (hit.img === "water") {
            player.hit_water = performance.now();
            player.run_length = 0;
          }

          if (hit.img === "temple") {
            if (!player.showing_info && (player.x !== player.last_x || player.y !== player.last_y)) {
              info_text = "Congratulations! The world is safe!";
              if (map.monster_count > 20) {
                info_text = "Keep playing! There's still " + map.monster_count + " monsters!";
              }
              player.showing_info_at = performance.now();
              player.showing_info = true;
              player.info_ids = ["info_keep_playing"];
              backer = false;
              while (!backer) {
                backer = entity_manager.get_entity("text_backer");
              }
              backer.img = "rgba(10, 10, 10, 0.8)";
              offset = manager.get('camera').get_offset();
              backer.x = backer.ui_x + offset.x;
              backer.y = backer.ui_y + offset.y;
              backer.x_size = 410;
              backer.y_size = 40;

              entity_manager.add_text({
                id: "info_keep_playing",
                text: info_text,
                x: 210,
                y: 212,
                offset_type: "camera",
                font: "24px sans",
                color: "white",
                update: function (delta, manager) {
                  let player = manager.get('player').get_player();
                  let map = manager.get('map').get_map();
                  let info_text = "Congratulations! The world is safe!";
                  if (map.monster_count > 20) {
                    info_text = "Keep playing! There's still " + map.monster_count + " monsters!";
                  }
                  this.text = info_text;
                }
              });
            }
          }

          if (player.x === player.last_x && player.y === player.last_y) {
            if (player.digging) {
              if (hit.img === "brush") {
                if (!player.brush_count) {
                  player.brush_count = 0;
                }
                player.brush_count += 1;
                hit.img = "grass_rm2k";
                player.digging = false;
              } else if (hit.img === "grass_rm2k") {
                if (!player.grass_count) {
                  player.grass_count = 0;
                }
                player.grass_count += 1;
                hit.img = "dirt_rm2k";
                player.digging = false;
              } else if (hit.img === "pave_stone") {
                if (!hit.hits) {
                  hit.hits = 0;
                }
                hit.hits += 1;

                if (hit.hits > 3) {
                  if (!player.stone) {
                    player.stone_count = 0;
                  }
                  player.stone_count += 1;
                  hit.img = "dirt_rm2k";
                }
                player.digging = false;
              } else if (hit.img === "dirt_rm2k") {
                if (!player.dirt_count) {
                  player.dirt_count = 0;
                }
                player.dirt_count += 1;
                hit.img = "water";
                player.digging = false;
              }
            } else if (player.planting) {
              if (hit.img === "dirt_rm2k") {
                if (player.grass_count > 0) {
                  player.grass_count -= 1;
                  hit.img = "grass_rm2k";
                }
                player.planting = false;
              } else if (hit.img === "grass_rm2k") {
                if (player.brush_count > 0) {
                  player.brush_count -= 1;
                  hit.img = "brush";
                }
                player.planting = false;
              } else if (hit.img === "water") {
                if (player.dirt_count > 0) {
                  player.dirt_count -= 1;
                  hit.img = "dirt_rm2k";
                }
                player.planting = false;
              }
            }
          }

          if (hit.img === "tree") {
            player.x = player.last_x;
            player.y = player.last_y;
            if (player.attacking && player.running) {
              sound_manager.play('explosion');
              entity_manager.remove_entity(hit.id);
              player.run_length = max_run_length;
            } else if (player.attacking) {
              sound_manager.play('hit3');
              if (Math.random() > 0.5) {
                hit.img = "stump";
              } else {
                hit.img = "dead_tree";
              }
              if (!player.wood_count) {
                player.wood_count = 0;
              }
              player.wood_count += 1;
              player.attacking = false;
            }
          } else if (hit.img === "barrel" || hit.img === "stump" || hit.img === "dead_tree") {
            player.x = player.last_x;
            player.y = player.last_y;
            if (player.attacking) {
              if (player.running) {
                player.run_length = max_run_length;
              }
              sound_manager.play('explosion');
              entity_manager.remove_entity(hit.id);
              if (!player.wood_count) {
                player.wood_count = 0;
              }
              player.wood_count += 1;
            }
          } else if (hit.type === "monster") {
            player.x = player.last_x;
            player.y = player.last_y;
            if (player.attacking === true) {
              if (hit.hits === undefined) {
                hit.hits = monster_health;
              }

              if (player.running) {
                hit.hits -= 4;
                player.run_length = max_run_length;
              } else {
                hit.hits -= 1;
              }

              if (hit.hits <= 0) {
                entity_manager.remove_entity(hit.id);
                entity_manager.remove_entity(hit.id+"_full_health");
                entity_manager.remove_entity(hit.id+"_health_left");
                player.gold_count += hit.gold_count;
                manager.get('map').get_map().monster_count -= 1;
                sound_manager.play('monster_dead');
              } else {
                sound_manager.play('hit3');
              }
              player.attacking = false;
            }
            if (hit.attacking === true) {
              // roll for damage to player
              if (Math.random() > 0.7) {
                player.health -= 1;
              }
            }
          } else if (hit.type === "treasure") {
            player.x = player.last_x;
            player.y = player.last_y;
            if (player.attacking) {
              player.move_cooldown = 150;
              if (!hit.hits) {
                hit.hits = 10;
              }

              if (player.running) {
                hit.hits -= 5;
                player.run_length = max_run_length;
              } else {
                hit.hits -= 1;
              }

              if (hit.hits <= 0) {
                player.health += 5;
                player.gold_count += hit.gold_count;
                entity_manager.remove_entity(hit.id);
                entity_manager.remove_entity(hit.id+"_full_health");
                entity_manager.remove_entity(hit.id+"_health_left");
                player.attacking = false;
                sound_manager.play('pickup');
              } else {
                sound_manager.play('hit3');
              }
            }
          }
        }

        entity_manager.move_entity(player, player.x, player.y);
        camera_manager.center(player.x, player.y);
      },
      "layers": [
        [
        ]
      ],
      "generation_seed": {
        "dir_freqs":{"treasure":{"above":{"water":0.01,"grass_rm2k":0.55,"stump":0.01,"brush":0.01,"dirt_rm2k":0.01,"barrel":0.01,"treasure":0,"tree":0.4},"below":{"water":0.01,"grass_rm2k":0.55,"stump":0.01,"brush":0.01,"dirt_rm2k":0.01,"barrel":0.01,"treasure":0,"tree":0.4},"left":{"water":0.01,"grass_rm2k":0.55,"stump":0.01,"brush":0.01,"dirt_rm2k":0.01,"barrel":0.01,"treasure":0,"tree":0.4},"right":{"water":0.01,"grass_rm2k":0.55,"stump":0.01,"brush":0.01,"dirt_rm2k":0.01,"barrel":0.01,"treasure":0,"tree":0.4}},"water":{"above":{"water":0.8463251670378619,"grass_rm2k":0.12694877505567928,"stump":0.008908685968819599,"brush":0.004454342984409799,"dirt_rm2k":0.0022271714922048997,"barrel":0.0066815144766146995,"pave_stone":0.004454342984409799},"below":{"water":0.8878504672897196,"grass_rm2k":0.09579439252336448,"dirt_rm2k":0.007009345794392523,"barrel":0.004672897196261682,"pave_stone":0.004672897196261682},"left":{"water":0.8542600896860987,"grass_rm2k":0.1210762331838565,"dirt_rm2k":0.006726457399103139,"pave_stone":0.002242152466367713,"stump":0.006726457399103139,"brush":0.004484304932735426,"barrel":0.004484304932735426},"right":{"water":0.8901869158878505,"grass_rm2k":0.10514018691588785,"pave_stone":0.002336448598130841,"brush":0.002336448598130841}},"grass_rm2k":{"above":{"grass_rm2k":0.8372219207813347,"brush":0.01465002712967987,"pave_stone":0.03581117742810635,"tree":0.02224633749321758,"water":0.01112316874660879,"stump":0.023060227889310905,"barrel":0.024959305480195332,"dirt_rm2k":0.030927835051546393},"below":{"water":0.015388768898488121,"grass_rm2k":0.8331533477321814,"brush":0.01700863930885529,"pave_stone":0.03536717062634989,"tree":0.02159827213822894,"barrel":0.02591792656587473,"stump":0.02294816414686825,"dirt_rm2k":0.028617710583153346},"left":{"grass_rm2k":0.8604336043360433,"pave_stone":0.01707317073170732,"barrel":0.028184281842818428,"stump":0.024119241192411923,"dirt_rm2k":0.032520325203252036,"water":0.012195121951219513,"brush":0.013821138211382113,"tree":0.011653116531165311},"right":{"grass_rm2k":0.8546433378196501,"brush":0.01641991924629879,"water":0.014535666218034994,"pave_stone":0.0180349932705249,"barrel":0.028532974427994618,"dirt_rm2k":0.03122476446837147,"stump":0.024764468371467025,"tree":0.011843876177658143}},"brush":{"above":{"grass_rm2k":0.06673728813559322,"tree":0.001059322033898305,"dirt_rm2k":0.0031779661016949155,"barrel":0.0031779661016949155,"brush":0.9247881355932204,"stump":0.001059322033898305},"below":{"grass_rm2k":0.05732484076433121,"dirt_rm2k":0.0031847133757961785,"stump":0.005307855626326964,"water":0.0021231422505307855,"pave_stone":0.0021231422505307855,"brush":0.9267515923566879,"barrel":0.0031847133757961785},"left":{"grass_rm2k":0.06468716861081654,"stump":0.003181336161187699,"pave_stone":0.003181336161187699,"brush":0.9236479321314952,"dirt_rm2k":0.0010604453870625664,"tree":0.0021208907741251328,"water":0.0010604453870625664,"barrel":0.0010604453870625664},"right":{"stump":0.0010604453870625664,"grass_rm2k":0.05408271474019088,"water":0.0021208907741251328,"dirt_rm2k":0.0021208907741251328,"tree":0.016967126193001062,"brush":0.9236479321314952}},"pave_stone":{"above":{"pave_stone":0.3617021276595745,"grass_rm2k":0.5574468085106383,"barrel":0.01702127659574468,"dirt_rm2k":0.02127659574468085,"stump":0.01702127659574468,"tree":0.00851063829787234,"water":0.00851063829787234,"brush":0.00851063829787234},"below":{"grass_rm2k":0.5569620253164557,"pave_stone":0.35864978902953587,"dirt_rm2k":0.016877637130801686,"barrel":0.02109704641350211,"tree":0.02109704641350211,"stump":0.016877637130801686,"water":0.008438818565400843},"left":{"pave_stone":0.6896551724137931,"grass_rm2k":0.28879310344827586,"tree":0.008620689655172414,"stump":0.004310344827586207,"dirt_rm2k":0.004310344827586207,"water":0.004310344827586207},"right":{"pave_stone":0.6808510638297872,"grass_rm2k":0.2680851063829787,"dirt_rm2k":0.01702127659574468,"stump":0.00851063829787234,"water":0.00425531914893617,"barrel":0.00425531914893617,"brush":0.01276595744680851,"tree":0.00425531914893617}},"barrel":{"above":{"grass_rm2k":0.8205128205128205,"dirt_rm2k":0.02564102564102564,"pave_stone":0.042735042735042736,"tree":0.017094017094017096,"water":0.017094017094017096,"stump":0.008547008547008548,"brush":0.02564102564102564,"barrel":0.042735042735042736},"below":{"pave_stone":0.03389830508474576,"grass_rm2k":0.7796610169491526,"tree":0.01694915254237288,"stump":0.03389830508474576,"dirt_rm2k":0.0423728813559322,"brush":0.025423728813559324,"barrel":0.0423728813559322,"water":0.025423728813559324},"left":{"grass_rm2k":0.8907563025210085,"dirt_rm2k":0.01680672268907563,"barrel":0.04201680672268908,"pave_stone":0.008403361344537815,"tree":0.008403361344537815,"stump":0.03361344537815126},"right":{"grass_rm2k":0.859504132231405,"barrel":0.04132231404958678,"dirt_rm2k":0.03305785123966942,"water":0.01652892561983471,"stump":0.024793388429752067,"tree":0.01652892561983471,"brush":0.008264462809917356}},"tree":{"above":{"tree":0.8617511520737328,"grass_rm2k":0.1228878648233487,"stump":0.0030721966205837174,"dirt_rm2k":0.0015360983102918587,"barrel":0.0030721966205837174,"pave_stone":0.007680491551459293},"below":{"grass_rm2k":0.12576687116564417,"tree":0.8604294478527608,"stump":0.004601226993865031,"pave_stone":0.003067484662576687,"brush":0.0015337423312883436,"barrel":0.003067484662576687,"dirt_rm2k":0.0015337423312883436},"left":{"tree":0.897239263803681,"grass_rm2k":0.06748466257668712,"barrel":0.003067484662576687,"dirt_rm2k":0.003067484662576687,"stump":0.003067484662576687,"brush":0.024539877300613498,"pave_stone":0.0015337423312883436},"right":{"tree":0.9183673469387755,"grass_rm2k":0.06750392464678179,"pave_stone":0.0031397174254317113,"dirt_rm2k":0.004709576138147566,"barrel":0.0015698587127158557,"stump":0.0015698587127158557,"brush":0.0031397174254317113}},"stump":{"above":{"grass_rm2k":0.8095238095238095,"tree":0.02857142857142857,"brush":0.047619047619047616,"barrel":0.0380952380952381,"stump":0.02857142857142857,"dirt_rm2k":0.009523809523809525,"pave_stone":0.0380952380952381},"below":{"grass_rm2k":0.8018867924528302,"dirt_rm2k":0.05660377358490566,"tree":0.018867924528301886,"pave_stone":0.03773584905660377,"water":0.03773584905660377,"stump":0.02830188679245283,"barrel":0.009433962264150943,"brush":0.009433962264150943},"left":{"brush":0.009615384615384616,"grass_rm2k":0.8846153846153846,"pave_stone":0.019230769230769232,"barrel":0.028846153846153848,"stump":0.028846153846153848,"tree":0.009615384615384616,"dirt_rm2k":0.019230769230769232},"right":{"grass_rm2k":0.839622641509434,"pave_stone":0.009433962264150943,"water":0.02830188679245283,"brush":0.02830188679245283,"dirt_rm2k":0.009433962264150943,"tree":0.018867924528301886,"stump":0.02830188679245283,"barrel":0.03773584905660377}},"dirt_rm2k":{"above":{"grass_rm2k":0.7969924812030075,"brush":0.022556390977443608,"stump":0.045112781954887216,"pave_stone":0.03007518796992481,"water":0.022556390977443608,"dirt_rm2k":0.03759398496240601,"barrel":0.03759398496240601,"tree":0.007518796992481203},"below":{"barrel":0.022556390977443608,"grass_rm2k":0.8571428571428571,"pave_stone":0.03759398496240601,"tree":0.007518796992481203,"dirt_rm2k":0.03759398496240601,"brush":0.022556390977443608,"stump":0.007518796992481203,"water":0.007518796992481203},"left":{"grass_rm2k":0.8656716417910447,"pave_stone":0.029850746268656716,"barrel":0.029850746268656716,"stump":0.007462686567164179,"tree":0.022388059701492536,"brush":0.014925373134328358,"dirt_rm2k":0.029850746268656716},"right":{"grass_rm2k":0.8888888888888888,"water":0.022222222222222223,"barrel":0.014814814814814815,"tree":0.014814814814814815,"pave_stone":0.007407407407407408,"dirt_rm2k":0.02962962962962963,"brush":0.007407407407407408,"stump":0.014814814814814815}}},"constraints":{"water":{"above":{"tree":true},"below":{"brush":true,"tree":true,"stump":true},"left":{"tree":true},"right":{"tree":true,"barrel":true,"stump":true,"dirt_rm2k":true}},"grass_rm2k":{"above":{},"below":{},"left":{},"right":{}},"brush":{"above":{"water":true,"pave_stone":true},"below":{"tree":true},"left":{},"right":{"pave_stone":true,"barrel":true}},"pave_stone":{"above":{},"below":{"brush":true},"left":{"brush":true,"barrel":true},"right":{}},"tree":{"above":{"water":true,"brush":true},"below":{"water":true},"left":{"water":true},"right":{"water":true}},"barrel":{"above":{},"below":{},"left":{"water":true,"brush":true},"right":{"pave_stone":true}},"stump":{"above":{"water":true},"below":{},"left":{"water":true},"right":{}},"dirt_rm2k":{"above":{},"below":{},"left":{"water":true},"right":{}},"treasure":{"above":{"treasure":true},"below":{"treasure":true},"left":{"treasure":true},"right":{"treasure":true}}},"frequencies":{"water":0.07015625,"grass_rm2k":0.586875,"brush":0.147,"treasure":0.0005,"pave_stone":0.03703125,"tree":0.101875,"barrel":0.01890625,"stump":0.0165625,"dirt_rm2k":0.02109375}
      }
    }
  }
})();
