const fs = require('fs')
const data = fs.readFileSync('./output', {encoding: 'utf8'})

const entrys = data.split('\n')

const knMap = entrys.reduce((result, line) => {
  if (line) {
    const matched = line.match(/K: (\w+), N: (\w+)/)

    if (!matched) return result

    const K = parseInt(matched[1])
    const N = parseInt(matched[2])

    result[K] = (result[K] || [])

    result[K].push(`${N}`.padStart(2, '0'))
  }

  return result
}, {})

Object.keys(knMap).forEach(key => {
  knMap[key] = knMap[key].join(', ')
})

console.log(knMap)
