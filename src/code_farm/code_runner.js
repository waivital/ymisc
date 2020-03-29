const { parentPort, workerData } = require('worker_threads')

const vm = require('vm')

let script = null

const staticContext = vm.createContext({
  ...workerData,
  console,
})

function fastApply(fun, ctx, args) {
  switch (args.length) {
    case 0:
      return fun.call(ctx)
    case 1:
      return fun.call(ctx, args[0])
    case 2:
      return fun.call(ctx, args[0], args[1])
    case 3:
      return fun.call(ctx, args[0], args[2], args[3])
    case 4:
      return fun.call(ctx, args[0], args[2], args[3], args[4])
    default:
      return fun.apply(ctx, args)
  }
}

parentPort.addListener('message', ({ type, data }) => {
  switch (type) {
    case 'code':
      script = vm.compileFunction(data.code, data.params, {parsingContext: staticContext})
      return
    case 'run':
      if (script) {
        const result = fastApply(script, undefined, data)
        parentPort.postMessage({
          type: 'result',
          data: result
        })
      }
      return
    case 'exit':
      return process.exit(0)
  }
})
