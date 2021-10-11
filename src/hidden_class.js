// This file is based on https://mrale.ph/blog/2012/06/03/explaining-js-vms-in-js-inline-caches.html

class Transition {
  constructor(klass) {
    this.klass = klass
  }
}

class Property {
  constructor(index) {
    this.index = index
  }
}

class Klass {
  constructor(kind) {
    // Classes are "fast" if they are C-struct like and "slow" is they are Map-like.
    this.kind = kind
    this.descriptors = new Map()
    this.keys = []
  }

  // Create hidden class with a new property that does not exist on
  // the current hidden class.
  addProperty(key) {
    var klass = this.clone()
    klass.append(key)
    // Connect hidden classes with transition to enable sharing:
    //           this == add property key ==> klass
    this.descriptors.set(key, new Transition(klass))
    return klass
  }

  hasProperty(key) {
    return this.descriptors.has(key)
  }

  getDescriptor(key) {
    return this.descriptors.get(key)
  }

  getIndex(key) {
    return this.getDescriptor(key).index
  }

  // Create clone of this hidden class that has same properties
  // at same offsets (but does not have any transitions).
  clone() {
    var klass = new Klass(this.kind)
    klass.keys = this.keys.slice(0)
    for (var i = 0; i < this.keys.length; i++) {
      var key = this.keys[i]
      klass.descriptors.set(key, this.descriptors.get(key))
    }
    return klass
  }

  // Add real property to descriptors.
  append(key) {
    this.keys.push(key)
    this.descriptors.set(key, new Property(this.keys.length - 1))
  }
}

const ROOT_KLASS = new Klass('fast')

class Table {
  constructor() {
    // All tables start from the fast empty root hidden class and form
    // a single tree. In V8 hidden classes actually form a forest -
    // there are multiple root classes, e.g. one for each constructor.
    // This is partially due to the fact that hidden classes in V8
    // encapsulate constructor specific information, e.g. prototype
    // poiinter is actually stored in the hidden class and not in the
    // object itself so classes with different prototypes must have
    // different hidden classes even if they have the same structure.
    // However having multiple root classes also allows to evolve these
    // trees separately capturing class specific evolution independently.
    this.klass = ROOT_KLASS
    this.properties = [] // Array of named properties: 'x','y',...
    this.elements = [] // Array of indexed properties: 0, 1, ...
    // We will actually cheat a little bit and allow any int32 to go here,
    // we will also allow V8 to select appropriate representation for
    // the array's backing store. There are too many details to cover in
    // a single blog post :-)
  }

  load(key) {
    if (this.klass.kind === 'slow') {
      // Slow class => properties are represented as Map.
      return this.properties.get(key)
    }

    // This is fast table with indexed and named properties only.
    if (typeof key === 'number' && (key | 0) === key) {
      // Indexed property.
      return this.elements[key]
    } else if (typeof key === 'string') {
      // Named property.
      var idx = this.findPropertyForRead(key)
      return idx >= 0 ? this.properties[idx] : void 0
    }

    // There can be only string&number keys on fast table.
    return void 0
  }

  store(key, value) {
    if (this.klass.kind === 'slow') {
      // Slow class => properties are represented as Map.
      this.properties.set(key, value)
      return
    }

    // This is fast table with indexed and named properties only.
    if (typeof key === 'number' && (key | 0) === key) {
      // Indexed property.
      this.elements[key] = value
      return
    } else if (typeof key === 'string') {
      // Named property.
      var index = this.findPropertyForWrite(key)
      if (index >= 0) {
        this.properties[index] = value
        return
      }
    }

    this.convertToSlow()
    this.store(key, value)
  }

  // Find property or add one if possible, returns property index
  // or -1 if we have too many properties and should switch to slow.
  findPropertyForWrite(key) {
    if (!this.klass.hasProperty(key)) {
      // Try adding property if it does not exist.
      // To many properties! Achtung! Fast case kaput.
      if (this.klass.keys.length > 20) return -1

      // Switch class to the one that has this property.
      this.klass = this.klass.addProperty(key)
      return this.klass.getIndex(key)
    }

    var desc = this.klass.getDescriptor(key)
    if (desc instanceof Transition) {
      // Property does not exist yet but we have a transition to the class that has it.
      this.klass = desc.klass
      return this.klass.getIndex(key)
    }

    // Get index of existing property.
    return desc.index
  }

  // Find property index if property exists, return -1 otherwise.
  findPropertyForRead(key) {
    if (!this.klass.hasProperty(key)) return -1
    var desc = this.klass.getDescriptor(key)
    if (!(desc instanceof Property)) return -1 // Here we are not interested in transitions.
    return desc.index
  }

  // Copy all properties into the Map and switch to slow class.
  convertToSlow() {
    var map = new Map()
    for (var i = 0; i < this.klass.keys.length; i++) {
      var key = this.klass.keys[i]
      var val = this.properties[i]
      map.set(key, val)
    }

    Object.keys(this.elements).forEach(function (key) {
      var val = this.elements[key]
      map.set(key | 0, val) // Funky JS, force key back to int32.
    }, this)

    this.properties = map
    this.elements = null
    this.klass = new Klass('slow')
  }
}

// --------------- the code ---------------

function CHECK_TABLE(t) {
  if (!(t instanceof Table)) {
    throw new Error("table expected");
  }
}

// Unoptimized LOAD
function LOAD(t, k) {
  CHECK_TABLE(t);
  return t.load(k);
}

// Unoptimized STORE
function STORE(t, k, v) {
  CHECK_TABLE(t);
  t.store(k, v);
}

// Initially all ICs are in uninitialized state.
// They are not hitting the cache and always missing into runtime system.
var STORE$0 = NAMED_STORE_MISS
var STORE$1 = NAMED_STORE_MISS
var KEYED_STORE$2 = KEYED_STORE_MISS
var STORE$3 = NAMED_STORE_MISS
var LOAD$4 = NAMED_LOAD_MISS
var STORE$5 = NAMED_STORE_MISS
var LOAD$6 = NAMED_LOAD_MISS
var LOAD$7 = NAMED_LOAD_MISS
var KEYED_LOAD$8 = KEYED_LOAD_MISS
var STORE$9 = NAMED_STORE_MISS
var LOAD$10 = NAMED_LOAD_MISS
var LOAD$11 = NAMED_LOAD_MISS
var KEYED_LOAD$12 = KEYED_LOAD_MISS
var LOAD$13 = NAMED_LOAD_MISS
var LOAD$14 = NAMED_LOAD_MISS

function MakePoint(x, y) {
  var point = new Table()
  STORE$0(point, 'x', x, 0) // The last number is IC's id: STORE$0 &rArr; id is 0
  STORE$1(point, 'y', y, 1)
  return point
}

function MakeArrayOfPoints(N) {
  var array = new Table()
  var m = -1
  for (var i = 0; i <= N; i++) {
    m = m * -1
    // Now we are also distinguishing between expressions x[p] and x.p.
    // The fist one is called keyed load/store and the second one is called
    // named load/store.
    // The main difference is that named load/stores use a fixed known
    // constant string key and thus can be specialized for a fixed property
    // offset.
    KEYED_STORE$2(array, i, MakePoint(m * i, m * -i), 2)
  }
  STORE$3(array, 'n', N, 3)
  return array
}

function SumArrayOfPoints(array) {
  var sum = MakePoint(0, 0)
  for (var i = 0; i <= LOAD$4(array, 'n', 4); i++) {
    STORE$5(sum, 'x', LOAD$6(sum, 'x', 6) + LOAD$7(KEYED_LOAD$8(array, i, 8), 'x', 7), 5)
    STORE$9(sum, 'y', LOAD$10(sum, 'y', 10) + LOAD$11(KEYED_LOAD$12(array, i, 12), 'y', 11), 9)
  }
  return sum
}

function CheckResults(sum) {
  var x = LOAD$13(sum, 'x', 13)
  var y = LOAD$14(sum, 'y', 14)
  if (x !== 50000 || y !== -50000) throw new Error('failed x: ' + x + ', y:' + y)
}

function NAMED_LOAD_MISS(t, k, ic) {
  var v = LOAD(t, k)
  if (t.klass.kind === 'fast') {
    // Create a load stub that is specialized for a fixed class and key k and
    // loads property from a fixed offset.
    var stub = CompileNamedLoadFastProperty(t.klass, k)
    PatchIC('LOAD', ic, stub)
  }
  return v
}

function NAMED_STORE_MISS(t, k, v, ic) {
  var klass_before = t.klass
  STORE(t, k, v)
  var klass_after = t.klass
  if (klass_before.kind === 'fast' && klass_after.kind === 'fast') {
    // Create a store stub that is specialized for a fixed transition between classes
    // and a fixed key k that stores property into a fixed offset and replaces
    // object's hidden class if necessary.
    var stub = CompileNamedStoreFastProperty(klass_before, klass_after, k)
    PatchIC('STORE', ic, stub)
  }
}

function KEYED_LOAD_MISS(t, k, ic) {
  var v = LOAD(t, k)
  if (t.klass.kind === 'fast' && typeof k === 'number' && (k | 0) === k) {
    // Create a stub for the fast load from the elements array.
    // Does not actually depend on the class but could if we had more complicated
    // storage system.
    var stub = CompileKeyedLoadFastElement()
    PatchIC('KEYED_LOAD', ic, stub)
  }
  return v
}

function KEYED_STORE_MISS(t, k, v, ic) {
  STORE(t, k, v)
  if (t.klass.kind === 'fast' && typeof k === 'number' && (k | 0) === k) {
    // Create a stub for the fast store into the elements array.
    // Does not actually depend on the class but could if we had more complicated
    // storage system.
    var stub = CompileKeyedStoreFastElement()
    PatchIC('KEYED_STORE', ic, stub)
  }
}

function PatchIC(kind, id, stub) {
  this[kind + '$' + id] = stub // non-strict JS funkiness: this is global object.
}

function CompileNamedLoadFastProperty(klass, key) {
  // Key is known to be constant (named load). Specialize index.
  var index = klass.getIndex(key)

  function KeyedLoadFastProperty(t, k, ic) {
    if (t.klass !== klass) {
      // Expected klass does not match. Can't use cached index.
      // Fall through to the runtime system.
      return NAMED_LOAD_MISS(t, k, ic)
    }
    return t.properties[index] // Veni. Vidi. Vici.
  }

  return KeyedLoadFastProperty
}

function CompileNamedStoreFastProperty(klass_before, klass_after, key) {
  // Key is known to be constant (named load). Specialize index.
  var index = klass_after.getIndex(key)

  if (klass_before !== klass_after) {
    // Transition happens during the store.
    // Compile stub that updates hidden class.
    return function (t, k, v, ic) {
      if (t.klass !== klass_before) {
        // Expected klass does not match. Can't use cached index.
        // Fall through to the runtime system.
        return NAMED_STORE_MISS(t, k, v, ic)
      }
      t.properties[index] = v // Fast store.
      t.klass = klass_after // T-t-t-transition!
    }
  } else {
    // Write to an existing property. No transition.
    return function (t, k, v, ic) {
      if (t.klass !== klass_before) {
        // Expected klass does not match. Can't use cached index.
        // Fall through to the runtime system.
        return NAMED_STORE_MISS(t, k, v, ic)
      }
      t.properties[index] = v // Fast store.
    }
  }
}

function CompileKeyedLoadFastElement() {
  function KeyedLoadFastElement(t, k, ic) {
    if (t.klass.kind !== 'fast' || !(typeof k === 'number' && (k | 0) === k)) {
      // If table is slow or key is not a number we can't use fast-path.
      // Fall through to the runtime system, it can handle everything.
      return KEYED_LOAD_MISS(t, k, ic)
    }
    return t.elements[k]
  }

  return KeyedLoadFastElement
}

function CompileKeyedStoreFastElement() {
  function KeyedStoreFastElement(t, k, v, ic) {
    if (t.klass.kind !== 'fast' || !(typeof k === 'number' && (k | 0) === k)) {
      // If table is slow or key is not a number we can't use fast-path.
      // Fall through to the runtime system, it can handle everything.
      return KEYED_STORE_MISS(t, k, v, ic)
    }
    t.elements[k] = v
  }

  return KeyedStoreFastElement
}


// run it

const points = MakeArrayOfPoints(50000 * 2)
const sumResult = SumArrayOfPoints(points)

CheckResults(sumResult)
