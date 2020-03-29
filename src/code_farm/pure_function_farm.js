const {
  Worker
} = require('worker_threads')
const path = require('path')
const os = require('os')

class PureFunctionFarm {
  constructor(code, params = [], staticContext = {}, size = 0) {
    this.size = size ? size : os.cpus().length
    this.penddingTask = []
    this._initWorkers(code, params, staticContext)
  }

  _initWorkers(code, params, staticContext) {
    const size = this.size

    this.workers = []
    for (let i = 0; i <= size; i++) {
      const worker = new Worker(path.join(__dirname, './code_runner.js'), {workerData: staticContext})
      const workerWrap = {
        worker: worker,
        isIdle: true,
        token: null,
      }

      worker.postMessage({
        type: 'code',
        data: {
          code,
          params
        }
      })
      worker.on('message', (a) => {
        if (a.type === 'result') {
          const [resolve] = workerWrap.token
          workerWrap.isIdle = true
          workerWrap.token = null
          resolve(a.data)
          this._runTask()
        }
      })
      worker.on('error', (e) => {
        console.log(e)
      });
      worker.on('exit', (code) => {
        if (code) {
          console.log(`worker exit with code ${code}`)
        }
      })

      this.workers.push(workerWrap)
    }
  }

  _pushTask(params, token) {
    this.penddingTask.push({
      params,
      token,
    })
  }

  _runTask() {
    const idleWorker = this.workers.find(i => i.isIdle)

    if (idleWorker && this.penddingTask.length) {
      const {params, token} = this.penddingTask.pop()
      idleWorker.isIdle = false
      idleWorker.token = token
      idleWorker.worker.postMessage({
        type: 'run',
        data: params,
      })
    }
  }

  run(params) {
    let resolve, reject

    const task = new Promise((_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })
    this._pushTask(params, [resolve, reject])
    this._runTask()

    return task
  }

  stop() {
    this.workers.forEach(({worker} )=> worker.postMessage({type: 'exit'}))
  }
}

exports.PureFunctionFarm = PureFunctionFarm
