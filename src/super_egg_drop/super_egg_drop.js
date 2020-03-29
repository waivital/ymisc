/**
 * 887. Super Egg Drop
 *
 * https://leetcode.com/problems/super-egg-drop/
 */

/**
 * @param {number} K - K eggs
 * @param {number} N - N floors from 1 to N
 * @return {number}
 */

 /** worst implementation */
function superEggDrop0(K, N, debug = false) {
  const rowSize = N + 1
  const columnSize = K + 1
  const sharedMemory = new SharedArrayBuffer(columnSize * rowSize * 4)
  const solvedMap = new Int32Array(sharedMemory)

  function getIndex(k, n) {
    return n + k * rowSize
  }

  function solve(K, N) {
    const solvedMap = new Int32Array(sharedMemory)

    if (K === 0 || N === 0) {
      return 0
    }
    if (N === 1) {
      return 1
    }
    if (K === 1) {
      return N
    }

    const hash = N + K * rowSize

    if (!solvedMap[hash]) {
      if (debug) {
        console.log(`K: ${K}, N: ${N}`)
      }
      let attemps = 0

      for(let x = 1; x <= N; x++) {
        const crashed = solve(K - 1, x - 1)
        const notcrashed = solve(K, N - x)
        const best = Math.max(crashed, notcrashed)
        attemps = attemps === 0 ? best : Math.min(attemps, best)
      }

      solvedMap[hash] = attemps + 1
    }

    return solvedMap[hash]
  }

  function multiThreadResolve() {
    const {PureFunctionFarm} = require('../code_farm/pure_function_farm')
    const farm = new PureFunctionFarm(`${solve.toString()}\nreturn solve(K, N)`, ['K', 'N'], {sharedMemory, rowSize, debug})
    const isKBigger = K > N

    function calc(k, n) {
      // console.log(`K: ${k}, N: ${n}`)
      return farm.run([k, n])
      // return Promise.resolve(solve(k, n))
    }

    function getMinKByN(n) {
      if (isKBigger) {
        return K - N + n
      } else {
        const rectPart = N - K + 2
        return n <= rectPart ? 2 : n - rectPart + 2
      }
    }

    // fill solvedMap
    function loop(k, n) {
      // console.log('loop', k, n)
      const parallelTasks = []

      let ki = isKBigger ? k - 2 : n > K ? k - 1 : k - 2

      const minK = getMinKByN(n - 1)
      while(ki >= minK && n - 1 > 1) {
        // console.log('parallel', ki, minK, n)
        parallelTasks.push(calc(ki, n - 1))
        ki--
      }

      const decreaseK = Promise.all(parallelTasks)

      function itor(k, ni) {
        if (ni <= n) {
          // console.log('waterfall', k, i, `n: ${n}`)

          let dep = Promise.resolve()

          if (ni === n) {
            dep = decreaseK
          }

          return dep
            .then(() => calc(k, ni))
            .then(() => itor(k, ni + 1))
        }
      }

      const increaseN = itor(k, k >= n ? 2 : n)

      return Promise.all([decreaseK, increaseN])
        .then(() => {
          if (k <= K) {
            k++
          }
          if (n <= N) {
            n++
          }

          if (k <= K || n <= N) {
            k = k > K ? K : k
            n = n > N ? N : n

            return loop(k, n)
          }
        })
    }

    function validSolvedMap() {
      for(let i = 2; i <= K; i++) {
        for(let j = 2; j <= N; j++) {
          const solved = solvedMap[getIndex(i, j)]
          const expect = superEggDrop3(i, j)
          if (solved !== expect) {
            console.log(`K: ${i}, N: ${j} miss match, solved: ${solved}, expect: ${expect}`)
            return
          }
        }
      }
    }

    let startPoint = {k: 2, n: 2}

    if (K > N) {
      startPoint.k = K - N + startPoint.n
    }

    return loop(startPoint.k, startPoint.n)
      .then(() => solvedMap[solvedMap.length - 1])
      // .finally(validSolvedMap)
      .finally(() => farm.stop())
  }

  function recursiveResolve() {
    return Promise.resolve(solve(K, N))
  }

  // return recursiveResolve()
  return multiThreadResolve()
}

function test0(k, n, debug = false) {
  const {
    performance,
  } = require('perf_hooks');

  const now = () => performance.now()

  const startTime = now()
  superEggDrop0(k, n, debug)
    .then(val => console.log(`superEggDrop0 result: ${val}, spent: ${now() - startTime}, expect: ${superEggDrop3(k, n)}`))
}

test0(30, 100, false)

function superEggDrop1(K, N) {
  const solvedTable = new Map()

  /**
   * getSolvedVal(K, N) = 1 + min(max(getSolvedVal(K - 1, X - 1), getSolvedVal(K, N - X)))
   *                      1 <= X <= N
   */
  function getSolvedVal(K, N) {
    if (K === 0 || N === 0) {
      return 0
    }
    if (N === 1) {
      return 1
    }
    if (K === 1) {
      return N
    }

    const hash = `${K}:${N}`

    if (!solvedTable.has(hash)) {
      let lo = 1
      let hi = N

      while (lo + 1 < hi) {
        const mid = Math.floor((lo + hi) / 2)
        const t1 = getSolvedVal(K - 1, mid - 1)
        const t2 = getSolvedVal(K, N - mid)

        if (t1 > t2) {
          hi = mid
        } else if (t1 < t2) {
          lo = mid
        } else {
          lo = hi = mid
        }
      }

      const attemps = Math.min(
        Math.max(getSolvedVal(K - 1, lo - 1), getSolvedVal(K, N - lo)),
        Math.max(getSolvedVal(K - 1, hi - 1), getSolvedVal(K, N - hi)),
      )

      solvedTable.set(hash, attemps + 1)
    }

    return solvedTable.get(hash)
  }

  return getSolvedVal(K, N)
}


/**
 * getSolvedVal(K, N) = 1 + min(max(getSolvedVal(K - 1, X - 1), getSolvedVal(K, N - X)))
 *                      1 <= X <= N
 *
 * getSolvedVal(K, N) = max(getSolvedVal(K - 1, X0 - 1), getSolvedVal(K, N - X0))  X0 -> last best X
 */

function superEggDrop2(K, N) {
  let prevK = [0]
  // dp(1, N)
  for (let i = 1; i <= N; i++) {
    prevK[i] = i
  }

  // dp(nextK, N) nextK = nextK + 1
  for (let i = 2; i <= K; i++) {
    const currentK = [0]

    let bestX = 1
    for (let j = 1; j <= N; j++) {
      let bestAttemps = Math.max(prevK[bestX - 1], currentK[j - bestX])

      while (bestX < j) {
        const nextX = bestX + 1
        const nextBestAttemps = Math.max(prevK[nextX - 1], currentK[j - nextX])
        if (bestAttemps > nextBestAttemps) {
          bestAttemps = nextBestAttemps
          bestX = nextX
        } else {
          break
        }
      }

      currentK[j] = 1 + bestAttemps
    }

    prevK = currentK
  }

  return prevK[N]
}

/**
 * given T moves (and K eggs), what is the most number of floors f(T, K)
 *
 * f(T, K) = 1 + f(T - 1, K - 1) + f(T - 1, K)
 *
 * f(T, 1) = T
 * f(1, K) = 1
 *
 * g(T, K) = f(T, K) - f(T, K - 1)
 *
 * g(T, K) = g(T - 1, K) + g(T - 1, K - 1)
 * This is a binomial recurrence
 * https://en.wikipedia.org/wiki/Binomial_coefficient
 *
 * f(T, K) = ∑ g(T, X)
 *      1 <= X <= K
 *
 * g(n, k + 1) = g(n, k) * ((n - k) / (k + 1))
 */
function superEggDrop3(K, N) {
  function f(t) {
    let sum = t
    let preBCVal = t

    for (let k = 2; k <= K; k++) {
      const nextBCVal = (preBCVal * (t - (k - 1))) / k
      preBCVal = nextBCVal
      sum = sum + nextBCVal
      if (sum >= N) break
    }

    return sum
  }

  let lo = 1
  let hi = N

  // Binary search for the best T moves
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)

    if (f(mid) < N) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  return lo
}

// const superEggDrop = superEggDrop3

// console.log(superEggDrop(4, 10000), 23)
// console.log(superEggDrop(4, 1000), 13)
// console.log(superEggDrop(2, 100), 14)
