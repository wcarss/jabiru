(function () {
  let scripts = game_manager.get_scripts();
  let throttled_change_to_game = throttle(
    function (map_manager) {
      map_manager.change_maps('game');
      console.log("changing maps");
    },
    150
  );

  scripts['intro'].data = {
    "map": {
      "height": 2000,
      "width": 600,
      "id": "intro",
      "player_layer": 2,
      "needs_bg": true,
      "init": function (manager) {
        console.log("map " + this.id + ": initialized");
        let entity_manager = manager.get('entity');
        let map_manager = manager.get('map');

        entity_manager.add_text({
          id: "game_start",
          text: "map: " + map_manager.get_current_map_id,
          x: 10,
          y: 38,
          offset_type: "camera",
          font: "14px sans",
          color: "white",
          update: function (delta, manager) {
            this.text = "map: " + manager.get('map').get_current_map_id();
          },
        });
      },
      "deinit": function (manager) {
        console.log("map " + this.id + ": de-initialized");
        let entity_manager = manager.get('entity');

        entity_manager.remove_text('game_start');
      },
      "update": function (delta, manager) {
        let control_manager = manager.get('control'),
          map_manager = manager.get('map');

        if (control_manager.keys('Enter')) {
          console.log("enter pressed!");
          throttled_change_to_game(map_manager);
        }

        // code that's particular to this map that should happen
        // continuously should go here; use managet.get('manager name')
        // to get access to the other managers
      },
      "layers": [
        [
        ]
      ]
    }
  }
})();
