"use strict";

let get_key = function (x, y) {
  return x + ":" + y;
};

let directions = [
  "above", "below", "left", "right"
];

let x_deltas = {
  "above": 0,
  "below": 0,
  "left": -1,
  "right": 1
};

let y_deltas = {
  "above": -1,
  "below": 1,
  "left": 0,
  "right": 0
};


// SelectionList
//
// effectively a segment-array sorted by node-constrained-ness
//
// when picking a node to observe, we want the most-constrained
// node, which is the node with the fewest "can be" options.
//
// Rather than iterate through all nodes every step to find the node
// with the lowest can_be.count, and rather than sort all the
// nodes every step (in something like NlogN time depending on the
// algorithm that gets used under the hood in the JS engine), in this
// structure the nodes are kept in buckets of how constrained they
// are, and we can easily pluck a random node from a bucket.
//
// How this works:
//
// After each node is observed, it triggers propagation, where new
// constraints are applied to all neighbour nodes of the node that
// was observed. Each neighbour is pulled out of the SelectionList
// structure* just before applying its new constraints, and is then
// re-inserted at its new constraint-level right after they are
// applied.
//
// Calling next() on this object will get a random element from among
// the most-constrained nodes, OR it will get you a value of false,
// which indicates that there are no further nodes to pull: the list
// is empty. Next simply requests the sorted keys of the object (there
// won't be more than the number of constraints as keys, so <50 for sure)
// and grabs the first key from that list. It then selects a random node
// from the list, or deletes that level's key and calls itself again if
// the list was somehow empty.
//
// * I'll have to think about/examine the real life time-complexity
// of the steps as this runs -- pulling a node from a bucket is O(N)
// using indexOf, which might motivate a move to hashes, but then we'd
// need to 'get a random hash key' which might require key-enumeration
// and therefore be O(N) anyway. The indexOf should only be called on
// a big node list at the very start when all nodes have equal levels,
// and then (I think) should be being called on <10 node lists almost
// always. We'll see how it goes / if it needs tuning.
let SelectionList = function () {
  return {
    list: {},
    add: function (node) {
      let level = 0;

      if (!node || !node.id || !node.can_be) {
        console.log("attempting to remove a bad node from global_selection_list");
        debugger
      }

      level = node.can_be.length;

      if (!this.list[level]) {
        this.list[level] = [];
      }

      this.list[level].push(node.id);
    },
    remove: function (node) {
      let level = 0;
      let index = 0;

      if (!node || !node.id || !node.can_be) {
        console.log("attempting to remove a bad node from global_selection_list");
        debugger
      }

      level = node.can_be.length;
      index = this.list[level].indexOf(node.id);
      this.list[level].splice(index, 1);

      if (this.list[level].length === 0) {
        delete this.list[level];
      }
    },
    next: function () {
      let keys = Object.keys(this.list).sort();
      let lowest_key = null;

      if (keys.length === 0) {
        console.log("next returning false, global selections list is empty!");
        return false;
      }

      lowest_key = keys[0];

      if (this.list[lowest_key].length === 0) {
        delete this.list[lowest_key];
        return this.next();
      }

      return array_random(this.list[lowest_key]);
    }
  };
};

// pick_by_distribution takes a dictionary with keys that correspond
// to potential choices and values that correspond to the weighted
// probabilities of those choices, expressed as fractions of 1, and
// which ought to sum to 1 overall.
//
// It uses a classic algorithm of generating a uniform random float
// on the line [0, 1) and then summing the probabilities of the
// distribution until they have exceeded that generated value -- the
// last key used is then the key chosen.
//
// This implementation allows for "holes" in the distribution where
// values have been removed/disallowed, and have had their weighted
// probability collected into a "cruft" number to distribute among
// the remaining choices -- the internal comment describes this fully.
let pick_by_distribution = function (distribution, cruft) {
  let i = 0;
  let sum = 0;
  let keys = Object.keys(distribution);
  let barrier = Math.random();
  cruft = cruft || 0;

  while (i < keys.length) {
    sum += distribution[keys[i]];

    if (distribution[keys[i]] !== 0) {
      sum += cruft;
      // 'cruft' is a strange thing, that I hope is suitably clever!
      //
      // if you have gaps in your probability distribution because
      // you have constrained certain values down to 0, to maintain
      // the sum of probabilities in the distribution at 1 you either
      // need to recalculate all of the probabilities with the amount
      // of the constrained element spread among them -- costly if you
      // do this a lot and have a lot of elements -- OR,
      //
      // you can keep a running tally of the probability allocated to
      // now-constrained items (here called "cruft"), such that it can
      // be added to each of these elements when pulling them according
      // to their weights.
      //
      // Obviously you wouldn't add the cruft on elements with a
      // probability of 0, since those are the constrained items,
      // so that's why we've got the condition.
      //
      // If you aren't using cruft (or don't have any yet), it will
      // essentially be ignored here, as it should always be 0.
    }

    if (sum > barrier) {
      break;
    }

    i += 1;
  }

  if (i >= keys.length) {
    console.log("pick_by_distribution integrity failure:");
    console.log("          keys: " + JSON.stringify(keys));
    console.log("             i: " + i);
    console.log("       barrier: " + barrier);
    console.log("           sum: " + sum);
    console.log("  distribution: " + JSON.stringify(distribution));
    debugger
  }

  return keys[i];
};

let Node = function (x, y, global_frequency_distribution, constraints, global_directional_frequency_distribution, selection_list, nodes) {
  let frequency_key = null;
  let frequency = null;
  let frequency_distribution = {};
  let can_be = null;
  let tile_index = null;
  let dir_index = null;
  let direction = null;
  let directional_frequency_distribution = {};

  for (frequency_key in global_frequency_distribution) {
    frequency = global_frequency_distribution[frequency_key];
    frequency_distribution[frequency_key] = frequency;
  }

  for (tile_index in global_directional_frequency_distribution) {
    directional_frequency_distribution[tile_index] = {};
    for (dir_index in directions) {
      direction = directions[dir_index];
      directional_frequency_distribution[tile_index][direction] = global_directional_frequency_distribution[tile_index][direction];
    }
  }

  can_be = Object.keys(frequency_distribution);

  return {
    value: null,
    observed: false,
    x: x,
    y: y,
    id: "node:" + get_key(x, y),
    cant_be: [],
    can_be: can_be,
    frequency_distribution: frequency_distribution,
    directional_frequency_distribution: directional_frequency_distribution,
    number_of_contributors: 0,
    frequency_cruft: 0,
    constraints: constraints,
    selection_list: selection_list,
    nodes: nodes,
    constrain: function (direction, value, incoming_frequencies) {
      let possibility = null, can_be_index = 0;
      let new_constraints = [], constraint = null, constraint_index = 0;
      let multiplier = 0;
      let freq_index = null;

      this.selection_list.remove(this);

      for (can_be_index in this.can_be) {
        possibility = this.can_be[can_be_index];
        if (this.constraints[possibility][direction][value]) {
          // possibility is direction to value, e.g. 
          // possibility = grass
          // direction = above
          // value = water
          // grass is the possibility being tested in this neighbour
          // water is the value of the node below this neighbour
          // grass above water is the constraint being tested.
          new_constraints.push(possibility);
        }
      }

      for (constraint_index in new_constraints) {
        constraint = new_constraints[constraint_index];
        if (this.can_be.length === 1) {
          continue;
        }
        this.frequency_cruft *= this.can_be.length;
        this.can_be.splice(this.can_be.indexOf(constraint), 1);
        this.cant_be.push(constraint);
        // e.g. were 4 things, now 3 things left
        // thing removed was worth 0.3
        // 0.3 / 3 = 0.1 is the additional cruft to be added to each
        this.frequency_cruft += this.frequency_distribution[constraint];
        this.frequency_cruft /= this.can_be.length;
        this.frequency_distribution[constraint] = 0;
      }

      this.number_of_contributors += 1;
//     - for each probability of dir_of_neighbour of just_observed_node:
//       - continue-skip loop step on 0-probabilities
//       - if number_of_contributors == 1:
//         - set multiplier to 1
//       - else:
//         - set multiplier to number_of_contributors - 1
//       - multiply probability by multiplier to get proportion
//       - add probability from dir_of_neighbour
//       - divide probability by number_of_contributors
      if (this.number_of_contributors === 1) {
        multiplier = 0;
      } else {
        multiplier = this.number_of_contributors - 1;
      }

      let old_freq = 0, mult_freq = 0, new_big_freq = 0, new_freq = 0, num_contributors = 0;
      //console.log("about to constraint node " + this.id);
      //debugger;
      let sum_constraint = 0;
      for (freq_index in incoming_frequencies) {
        // skip 0-frequencies (constraints), which were already handled above
        if (this.frequency_distribution[freq_index] === 0 || incoming_frequencies[freq_index] === 0) {
          continue;
        }

        // somehow we have a mismatch in basic tile types
        if (!this.frequency_distribution[freq_index]) {
          console.log("tile type " + freq_index + " found in incoming frequencies but not in node's own distribution");
          continue;
        }

        old_freq = this.frequency_distribution[freq_index];
        this.frequency_distribution[freq_index] *= multiplier;
        mult_freq = this.frequency_distribution[freq_index];
        this.frequency_distribution[freq_index] += incoming_frequencies[freq_index];
        new_big_freq = this.frequency_distribution[freq_index];
        this.frequency_distribution[freq_index] /= this.number_of_contributors;
        new_freq = this.frequency_distribution[freq_index];
        num_contributors = this.number_of_contributors;
        sum_constraint += this.frequency_distribution[freq_index];
        //debugger;
      }

      this.frequency_cruft = (1-sum_constraint)/this.can_be.length;

      if (sum_constraint+this.can_be.length*this.frequency_cruft !== 1) {
        console.log("sum_constraint is " + sum_constraint);
        debugger;
      }

      this.selection_list.add(this);
    },
    propagate: function () {
      let direction = null, dir_index = 0;
      let neighbour = null;
      let x_delta = 0, y_delta = 0;

      for (dir_index in directions) {
        direction = directions[dir_index];
        x_delta = x_deltas[direction];
        y_delta = y_deltas[direction];
        neighbour = this.nodes[get_key(this.x + x_delta, this.y + y_delta)];
        //console.log("about to constrain in propagate");
        //debugger;
        if (neighbour && neighbour.observed !== true) {
          neighbour.constrain(direction, this.value, this.directional_frequency_distribution[this.value][direction]);
        }
      }
    },
    observe: function () {
      this.value = pick_by_distribution(this.frequency_distribution, this.frequency_cruft);
      this.observed = true;
      this.propagate();
      this.selection_list.remove(this);
    }
  };
};

let build = function (tiles, x_size, y_size) {
  let x_index = 0, y_index = 0;
  let freq_count = 0, dir_freq_count = 0;
  let constraints = {};
  let tile = null, tile_types = null, tile_index_1 = null,
    tile_index_2 = null, tile_1 = null, tile_2 = null;
  let frequencies = {};
  let dir_freqs = {};
  let direction = null, dir_index = 0;
  let neighbour_x = 0, neighbour_y = 0, neighbour = null;
  let freq_key = null;

  for (x_index = 0; x_index < x_size; x_index++) {
    for (y_index = 0; y_index < y_size; y_index++) {
      tile = tiles[get_key(x_index, y_index)];

      // aggregate frequencies by type per tile
      if (!frequencies[tile.type]) {
        console.log("first sighting of type: " + tile.type);
        frequencies[tile.type] = 1;
      } else {
        frequencies[tile.type] += 1;
      }
      freq_count += 1;

      // aggregate frequencies by direction and type per tile-neighbour
      // dir_freqs['grass']['above']['water'] means freq of grass above water
      for (dir_index in directions) {
        direction = directions[dir_index];
        neighbour_x = x_index+x_deltas[direction];
        neighbour_y = y_index+y_deltas[direction];
        neighbour = tiles[get_key(neighbour_x, neighbour_y)];
        if (!neighbour) {
          // e.g. x or y out of bounds of map
          continue;
        }

        // in this case, we have e.g. neighbour above tile, because
        // we calculated the neighbour as "above" the tile in the
        // x_deltas and y_deltas lookups.
        if (!dir_freqs[neighbour.type]) {
          dir_freqs[neighbour.type] = {
            above: {},
            below: {},
            left: {},
            right: {}
          }
        }
        
        if (!dir_freqs[neighbour.type][direction][tile.type]) {
          dir_freqs[neighbour.type][direction][tile.type] = 1;
        } else {
          dir_freqs[neighbour.type][direction][tile.type] += 1;
        }

        if (!dir_freqs[neighbour.type][direction].frequency_count) {
          dir_freqs[neighbour.type][direction].frequency_count = 1;
        } else {
          dir_freqs[neighbour.type][direction].frequency_count += 1;
        }
      }
    }
  }

  // gather tile types found so far
  tile_types = Object.keys(frequencies);

  // map frequencies from aggregated integers onto [0,1)
  for (freq_key in frequencies) {
    frequencies[freq_key] /= freq_count;
  }

// for handling directional frequency:
//
// - each neighbour participates equally in contributing their frequency
// - constraints of a neighbour are vetos; neighbours have unlimited vetos
// - algo:
//   - for each neighbour of a just_observed_node:
//     - // cruft:
//     - for each constraint of dir_of_neighbour of just_observed_node:
//       - multiply cruft by number of constraints to get full cruft proportion
//       - add proportion of constraint being 0'd to cruft
//       - zero out the probability for new constraints from this neighbour
//       - move "can be's" and "can't be's" around
//       - divide by number of constraints to get practical cruft
//
//     - // directional probability:
//     - increase number_of_contributors by 1
//     - for each probability of dir_of_neighbour of just_observed_node:
//       - continue-skip loop step on 0-probabilities
//       - if number_of_contributors == 1:
//         - set multiplier to 1
//       - else:
//         - set multiplier to number_of_contributors - 1
//       - multiply probability by multiplier to get proportion
//       - add probability from dir_of_neighbour
//       - divide probability by number_of_contributors
//
//
// figuring probabilities out:
// - they need to be "per direction per tile" probabilities, so
//   "the probability that water is above grass" is a proportion of
//   how many of the tiles that were above grass were water, not of
//   how many tiles next to grass in general are water, or of how many
//   tiles next to other tiles are water. So I have to keep or
//   calculate a count per direction per tile of the number of tiles
//   seen in that direction, and then divide each count of each type
//   of tile seen in that direction from that tile by the calculated
//   or kept count of the total.
//
//   ._. cool
  console.log("entering dir freq set loop:");
  let pave_debug = false;
  for (tile_index_1 in tile_types) {
    tile_1 = tile_types[tile_index_1];
    //console.log("  tile_1: " + tile_1);
    for (dir_index in directions) {
      direction = directions[dir_index];
      if (tile_1 === "pave_stone" && (direction === "left" || direction === "right")) {
        pave_debug = true;
        console.log("    direction: " + direction);
      } else {
        pave_debug = false;
      }
      for (tile_2 in dir_freqs[tile_1][direction]) {
        // todo: ewww
        if (tile_2 === "frequency_count") {
          continue;
        }
        if (pave_debug){
          console.log("      tile_2: " + tile_2);
          //debugger;
        }
        dir_freqs[tile_1][direction][tile_2] /= dir_freqs[tile_1][direction].frequency_count;
      }
      delete dir_freqs[tile_1][direction]['frequency_count'];
    }
  }

  console.log("frequencies set!");
  console.log("frequency count: " + freq_count);
  console.log(frequencies);

  // setup constraints
  
  console.log("found the following tile types: " + JSON.stringify(tile_types));
  for (tile_index_1 = 0; tile_index_1 < tile_types.length; tile_index_1++) {
    tile_1 = tile_types[tile_index_1];
    constraints[tile_1] = {};

    for (dir_index = 0; dir_index < directions.length; dir_index++) {
      direction = directions[dir_index];
      constraints[tile_1][direction] = {};

      for (tile_index_2 = 0; tile_index_2 < tile_types.length; tile_index_2++) {
        tile_2 = tile_types[tile_index_2];
        if (!dir_freqs[tile_1][direction][tile_2]) {
          constraints[tile_1][direction][tile_2] = true;
        }
      }
    }
  }
  console.log("done the setup!");

  return {
    frequencies: frequencies,
    dir_freqs: dir_freqs,
    constraints: constraints
  }
};

let wavefunction_collapse = function (tiles, in_x_size, in_y_size, out_x_size, out_y_size) {
  let selection = null, selection_list = new SelectionList();
  let data = build(tiles, in_x_size, in_y_size);
  let i = 0, j = 0;
  let nodes = {}, node = null;
  let out_tiles = {};
  let coords = null;

  for (i = 0; i < out_x_size; i++) {
    for (j = 0; j < out_y_size; j++) {
      node = new Node(
        i,
        j,
        data.frequencies,
        data.constraints,
        data.dir_freqs,
        selection_list,
        nodes
      );
      selection_list.add(node);
      nodes[get_key(i, j)] = node;
    }
  }

  console.log("directional frequencies:");
  console.log(data.dir_freqs);
  selection = selection_list.next();
  
  while (selection !== false) {
    coords = selection.split(":");
    node = nodes[get_key(coords[1], coords[2])];
    node.observe();
    selection = selection_list.next();
  }

  for (i = 0; i < out_x_size; i++) {
    for (j = 0; j < out_y_size; j++) {
      out_tiles[get_key(i, j)] = nodes[get_key(i, j)].value;
    }
  }

  //debugger;
  return {
    tiles: out_tiles,
    x_size: out_x_size,
    y_size: out_y_size
  };
}
