import Router from 'koa-router'

const token = 'eyJzY29wZSI6InF0ZXN0YnVja2V0IiwiZGVhZGxpbmUiOjE0NTg2MzEzNTh9'
const router = new Router({ prefix: '/api' })
router.post('/login', ctx => {
  console.log(ctx.cookies)
  ctx.status = 200
  ctx.body = {
    body: {
      token,
    },
    code: 200,
  }
})

router.get('/callback', ctx => {
  ctx.status = 200
  ctx.body = `
    <script>
      // location.href = '/api/login'
    </script>
  `
})

export default router
