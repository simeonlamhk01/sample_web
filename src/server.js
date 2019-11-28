function Logger(...args) {
  this.args = args;
}
Logger.prototype.info = function (msg) { msg.pod_name = "myLogger"; console.log(msg); };
Logger.prototype.error = function (msg) { msg.pod_name = "myLogger"; console.log(msg); };
Logger.prototype.debug = function (msg) { msg.pod_name = "myLogger"; console.log(msg); };
Logger.prototype.fatal = function (msg) { msg.pod_name = "myLogger"; console.log(msg); };
Logger.prototype.warn = function (msg) { msg.pod_name = "myLogger"; console.log(msg);};
Logger.prototype.trace = function (msg) { msg.pod_name = "myLogger"; console.log(msg); };
Logger.prototype.child = function () { return new Logger() };


const myLogger = new Logger()

const fastify = require('fastify')({
  logger: {
    level: 'trace',
    serializers: {
      req: function asReqValue (req) {
        return {
          method: req.method,
          url: req.url,
          version: req.headers['accept-version'],
          hostname: req.hostname,
          remoteAddress: req.ip,
          remotePort: req.connection.remotePort,
          podName: 'test pod name'
        }
      },
      res: function asResValue (res) {
        return {
          statusCode: res.statusCode,
          podName: 'test pod name'
        }
      }
    }
  }
  // logger: myLogger
})
const statusPlugin = require('fastify-status')

fastify.register(statusPlugin, {
  endpoint: '/health',
  method: 'GET',
  hide: true
})

const sleep = (s) => {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

const complete = []

fastify.post('/test', async (req, reply) => {
  const body = req.body
  console.log(JSON.stringify(body, null, 2))
  reply.code(200).send({ url: `https://66c40410.ngrok.io/test?id=${body.id}`, message: 'start' })
  await sleep(30)
  complete.push(body.id)
  console.log(`added: ${body.id}`)
})

fastify.get('/test', async (req, reply) => {
  const query = req.query

  console.log(JSON.stringify(complete, null, 2))

  let status = { status: 'Success'}
  if (complete.indexOf(query.id) === -1)
    status = { status: 'Not complete'}
  else
    complete.pop()
  reply.code(200).send(status)
})

// ---- Run the server! ----
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    fastify.log.trace(`trace`)
    fastify.log.warn(`warn`)
    fastify.log.debug(`debug`)
    fastify.log.error(`error`)
    fastify.log.fatal(`fatal`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()