
const unsubscribeFromQuestion = async (ctx: Context, next: () => Promise<any>) => {
  const { subscriptionId }: any = ctx.vtex.route.params
  console.log("🚀 ~ file: unsubscribeFromQuestion.ts ~ line 4 ~ unsubscribeFromQuestion ~ ctx.vtex", ctx)

  const {
    clients: {
      masterdata,
    }
  } = ctx
  console.log("🚀 ~ file: unsubscribeFromQuestion.ts ~ line 10 ~ unsubscribeFromQuestion ~ masterdata", masterdata)

  const deleted = await masterdata.deleteDocument({
    dataEntity: 'subscriptions',
    id: subscriptionId
  })
  console.log("🚀 ~ file: unsubscribeFromQuestion.ts ~ line 17 ~ unsubscribeFromQuestion ~ deleted", deleted)

  ctx.status = 200
  ctx.body = `
    <div style="text-align: center; margin-top: 10%;">
      <h3>You have been unsubscribed from this question</h3>
    </div>
  `

  await next()
}

export default unsubscribeFromQuestion
