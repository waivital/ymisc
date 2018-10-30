function forEachExcept(exception, procedure, list) {
  function loop(items) {
    if (!items || items.length === 0) {
      return null
    } else if (items[0] === exception) {
      return loop(items.slice(1))
    } else {
      procedure(items[0])
      return loop(items.slice(1))
    }
  }

  return loop(list)
}

function informAboutValue(constraint) {
  return constraint('I-have-a-value')
}

function informAboutNoValue(constraint) {
  return constraint('I-lost-my-value')
}

function makeConnector() {
  let value = false
  let informant = false
  let constraints = []

  function setMyValue(newVal, setter) {
    if (!hasValue(selfConnector)) {
      value = newVal
      informant = setter
      forEachExcept(setter, informAboutValue, constraints)
    } else if (value !== newVal) {
      throw new Error(`Contradiction (oldVal: ${value} newVal: ${newVal})`)
    }
  }

  function forgetMyValue(retractor) {
    if (retractor === informant) {
      informant = false
      forEachExcept(retractor, informAboutNoValue, constraints)
    }
  }

  function connect(newConstraint) {
    if (!constraints.includes(newConstraint)) {
      constraints = [].concat(newConstraint, constraints)
    }

    if (hasValue(selfConnector)) {
      informAboutValue(newConstraint)
    }
  }

  function selfConnector(request) {
    switch(request) {
      case 'has-value?':
        return informant ? true : false
      case 'value':
        return value
      case 'set-value!':
        return setMyValue
      case 'forget':
        return forgetMyValue
      case 'connect':
        return connect
      default:
        return new Error('Unknow operation -- CONNECTOR ' + request)
    }
  }

  return selfConnector
}

function makeConstraint(processNewValue) {
  return function constraint(a1, a2, r1) {
    function processForgetValue() {
      forgetValue(r1, constraintInstance)
      forgetValue(a1, constraintInstance)
      forgetValue(a2, constraintInstance)
      processNewValue(a1, a2, r1, constraintInstance)
    }

    connect(a1, constraintInstance)
    connect(a2, constraintInstance)
    connect(r1, constraintInstance)

    function constraintInstance(request) {
      switch(request) {
        case 'I-have-a-value':
          return processNewValue(a1, a2, r1, constraintInstance)
        case 'I-lost-my-value':
          return processForgetValue()
      }
    }

    return constraintInstance
  }
}

function hasValue(connector) {
  return connector('has-value?')
}

function getValue(connector) {
  return connector('value')
}

function setValue(connector, newValue, informant) {
  if (!informant) {
    throw new Error('informant is required')
  }
  return connector('set-value!')(newValue, informant)
}

function forgetValue(connector, retractor) {
  return connector('forget')(retractor)
}

function connect(connector, newConstraint) {
  return connector('connect')(newConstraint)
}

function constant(value, connector) {
  connect(connector, me)
  setValue(connector, value, me)

  function me(request) {
    throw new Error('Unknoew requre -- CONSTANT')
  }

  return me
}

function probe(name, connector) {
  function printProbe(value) {
    console.log(`Probe: ${name} = ${value}`)
  }

  function processNewValue() {
    printProbe(getValue(connector))
  }

  function processForgetValue() {
    printProbe('?')
  }

  connect(connector, constraintInstance)

  function constraintInstance(request) {
    switch(request) {
      case 'I-have-a-value':
        return processNewValue()
      case 'I-lost-my-value':
        return processForgetValue()
    }
  }

  return constraintInstance
}

const adder = makeConstraint(function adderNewValue(a1, a2, sum, me) {
  if (hasValue(a1) && hasValue(a2)) {
    setValue(sum, getValue(a1) + getValue(a2), me)
  } else if (hasValue(a1) && hasValue(sum)) {
    setValue(a2, getValue(sum) - getValue(a1), me)
  } else if (hasValue(a2) && hasValue(sum)) {
    setValue(a1, getValue(sum) - getValue(a2), me)
  }
})

const multiplier = makeConstraint(function multiplierNewValue(m1, m2, product, me) {
  if ((hasValue(m1) && getValue(m1) === 0) || (hasValue(m2) && getValue(m2) === 0)) {
    setValue(product, 0, me)
  } else if (hasValue(m1) && hasValue(m2)) {
    setValue(product, getValue(m1) * getValue(m2), me)
  } else if (hasValue(m1) && hasValue(product)) {
    setValue(m2, getValue(product) / getValue(m1), me)
  } else if (hasValue(m2) && hasValue(product)) {
    setValue(m1, getValue(product) / getValue(m2), me)
  }
})

// 9C = 5(F-32)
function celsiusFahrenheitConverter(c, f) {
  let u = makeConnector(),
    v = makeConnector(),
    w = makeConnector(),
    x = makeConnector(),
    y = makeConnector();

  multiplier(c, w, u)
  multiplier(v, x, u)
  adder(v, y, f)
  constant(9, w)
  constant(5, x)
  constant(32, y)
}

// a + b = 2c
function averager(a, b, c) {
  let u = makeConnector()
  let x = makeConnector()

  multiplier(c, x, u)
  adder(a, b, u)

  constant(2, x)
}

let C = makeConnector()
let F = makeConnector()

celsiusFahrenheitConverter(C, F)

function testCelsiusFahrenheit(C, F) {
  probe('Celsius temp', C)
  probe('Fahrenheit temp', F)

  setValue(C, 25, 'user')

  forgetValue(C, 'user')
  setValue(F, 212, 'user')
}

testCelsiusFahrenheit(C, F)

let A = makeConnector()
let B = makeConnector()
let AVG = makeConnector()

averager(A, B, AVG)

probe('A value', A)
probe('B value', B)
probe('AVG value', AVG)

setValue(A, 4, 'user')
setValue(B, 8, 'user')


const co = {
  '+'(x, y) {
    const z = makeConnector()

    adder(x, y, z)

    return z
  },
  '*'(x, y) {
    const z = makeConnector()

    multiplier(x, y, z)

    return z
  },
  '/'(x, y) {
    const z = makeConnector()

    multiplier(y, z, x)

    return z
  },
  'v'(x) {
    const z = makeConnector()

    constant(x, z)

    return z
  }
}

function celsiusFahrenheitConverterV2(x) {
  return co['+'](
    co['*'](
      co['/'](co['v'](9), co['v'](5)), x), co['v'](32))
}

let NC = makeConnector()
let NF = celsiusFahrenheitConverterV2(NC)

testCelsiusFahrenheit(NC, NF)