"use strict";

let config_spec = {
  "game": {
    "init": function (manager) {
    },
    "update": function (delta, manager) {
      let control_manager = manager.get('control'),
        map_manager = manager.get('map'),
        player_manager = manager.get('player'),
        keys = control_manager.get_controls();

        // use managers and keys[] dictionaries for global game controls that
        // don't necessarily interact with the player or the map
    }
  },
  "canvas_id": "canvas",
  "frames_per_second": 40,
  "resource_url": "resources.json",
  "controls": null,
  "base_url": "",
  "player": {
    "id": "player1",
    "img": "player",
    "dirt_count": 0,
    "grass_count": 0,
    "brush_count": 0,
    "wood_count": 0,
    "stone_count": 0,
    "gold_count": 0,
    "x": 10,
    "y": 10,
    "layer": 2,
    "x_scale": 1,
    "y_scale": 1,
    "x_size": 26,
    "y_size": 32,
    "x_velocity": 0,
    "y_velocity": 0,
    "max_x_velocity": 12,
    "max_y_velocity": 12,
    "x_acceleration": 1.8,
    "y_acceleration": 1.8,
    "update": function (delta, manager) {
    },
    "health": 10,
    "score": 0,
  },
  "camera": {
    "x": 0,
    "y": 0,
    "width": 1344,
    "height": 768,
    "left_margin": 100,
    "right_margin": 100,
    "top_margin": 100,
    "bottom_margin": 100,
  },
  "initial_map_id": "game",
  "maps": {
    "to_load": [
      "game",
    ]
  },  // maps object
  "resources": [
    {
      "type": "sound",
      "url": "resources/sounds/hit.wav",
      "id": "hit",
      "muted": false,
      "volume": 0.4,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/hit_2.wav",
      "id": "hit2",
      "muted": false,
      "volume": 0.4,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/hit_3.wav",
      "id": "hit3",
      "muted": false,
      "volume": 0.6,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/explosion.wav",
      "id": "explosion",
      "muted": false,
      "volume": 0.4,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/monster.wav",
      "id": "monster",
      "muted": false,
      "volume": 0.4,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/monster_dead.wav",
      "id": "monster_dead",
      "muted": false,
      "volume": 0.4,
      "looping": false,
    },
    {
      "type": "sound",
      "url": "resources/sounds/pickup.wav",
      "id": "pickup",
      "muted": false,
      "volume": 0.6,
      "looping": false,
    },
    {
      "type": "image",
      "url": "resources/images/player.png",
      "id": "player",
      "source_x": 0,
      "source_y": 5,
      "source_width": 26,
      "source_height": 26,
    },
    {
      "type": "image",
      "url": "resources/images/dirt.png",
      "id": "dirt",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/grass.png",
      "id": "grass",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/coin.png",
      "id": "coin",
      "source_x": 0,
      "source_y": 0,
      "source_width": 48,
      "source_height": 48,
    },
    {
      "type": "image",
      "url": "resources/images/water.png",
      "id": "water",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/bg.png",
      "id": "bg",
      "source_x": 0,
      "source_y": 0,
      "source_width": 500,
      "source_height": 500,
    },
    {
      "type": "image",
      "url": "resources/images/reticle_black.png",
      "id": "reticle_black",
      "source_x": 0,
      "source_y": 0,
      "source_width": 32,
      "source_height": 32,
    },
    {
      "type": "image",
      "url": "resources/images/reticle_red.png",
      "id": "reticle_red",
      "source_x": 0,
      "source_y": 0,
      "source_width": 32,
      "source_height": 32,
    },
    {
      "type": "image",
      "url": "resources/images/reticle_green.png",
      "id": "reticle_green",
      "source_x": 0,
      "source_y": 0,
      "source_width": 32,
      "source_height": 32,
    },
    {
      "type": "image",
      "url": "resources/images/tileset.png",
      "id":"grass_rm2k",
      "source_x": 303,
      "source_y": 48,
      "source_width": 16,
      "source_height": 16,
    },
    {
      "id": "brush",
      "source_height": 16,
      "source_width": 16,
      "source_x": 64,
      "source_y": 159,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "dirt_rm2k",
      "source_height": 16,
      "source_width": 16,
      "source_x": 352,
      "source_y": 48,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "mountains",
      "source_height": 16,
      "source_width": 16,
      "source_x": 64,
      "source_y": 224,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "pave_stone",
      "source_height": 16,
      "source_width": 16,
      "source_x": 208,
      "source_y": 80,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "purple_walk_1",
      "source_height": 16,
      "source_width": 16,
      "source_x": 192,
      "source_y": 0,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "purple_walk_2",
      "source_height": 16,
      "source_width": 16,
      "source_x": 192,
      "source_y": 16,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "purple_walk_3",
      "source_height": 16,
      "source_width": 16,
      "source_x": 208,
      "source_y": 0,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "purple_walk_4",
      "source_height": 16,
      "source_width": 16,
      "source_x": 208,
      "source_y": 16,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "sand",
      "source_height": 16,
      "source_width": 16,
      "source_x": 160,
      "source_y": 32,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "snow",
      "source_height": 16,
      "source_width": 16,
      "source_x": 304,
      "source_y": 96,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "tree",
      "source_height": 16,
      "source_width": 16,
      "source_x": 304,
      "source_y": 128,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "trees",
      "source_height": 16,
      "source_width": 16,
      "source_x": 16,
      "source_y": 224,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
      "id": "water",
      "source_height": 16,
      "source_width": 16,
      "source_x": 16,
      "source_y": 64,
      "type": "image",
      "url": "resources/images/tileset.png"
    },
    {
        "id": "barrel",
        "source_height": 16,
        "source_width": 16,
        "source_x": 400,
        "source_y": 144,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "bush",
        "source_height": 16,
        "source_width": 16,
        "source_x": 288,
        "source_y": 144,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "dead_tree",
        "source_height": 16,
        "source_width": 16,
        "source_x": 320,
        "source_y": 128,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "treasure",
        "source_height": 16,
        "source_width": 16,
        "source_x": 448,
        "source_y": 16,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "gravel",
        "source_height": 16,
        "source_width": 16,
        "source_x": 192,
        "source_y": 128,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "hill",
        "source_height": 16,
        "source_width": 16,
        "source_x": 48,
        "source_y": 192,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "shards",
        "source_height": 16,
        "source_width": 16,
        "source_x": 432,
        "source_y": 48,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "small_tree",
        "source_height": 16,
        "source_width": 16,
        "source_x": 0,
        "source_y": 192,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id": "stump",
        "source_height": 16,
        "source_width": 16,
        "source_x": 336,
        "source_y": 128,
        "type": "image",
        "url": "resources/images/tileset.png"
    },
    {
        "id":"skeleton",
        "source_height": 24,
        "source_width": 24,
        "source_x": 24,
        "source_y": 202,
        "type": "image",
        "url":"resources/images/dragon_warrior_monsters.png"
    }
  ],  // resources array
};    // config object
