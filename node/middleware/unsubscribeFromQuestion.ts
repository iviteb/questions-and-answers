
const unsubscribeFromQuestion = async (ctx: Context, next: () => Promise<any>) => {
  const { subscriptionId }: any = ctx.vtex.route.params

  const {
    clients: {
      masterdata,
    }
  } = ctx

  await masterdata.deleteDocument({
    dataEntity: 'subscriptions',
    id: subscriptionId
  })

  ctx.status = 200
  ctx.body = `
    <div style="text-align: center; margin-top: 10%;">
      <h3>You have been unsubscribed from this question</h3>
    </div>
  `

  await next()
}

export default unsubscribeFromQuestion
