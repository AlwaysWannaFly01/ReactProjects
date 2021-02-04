import proxies from './proxies'

async function routes(ctx, next) {
  await require('./clientRoute').default(ctx, next)
}

async function authorize(ctx, next) {
  await require('./authorize').default(ctx, next)
}

export default function middleware(app) {
  proxies(app)
  app.use(authorize)
  app.use(routes)
}
