const subscriptionMail = async (ctx: Context, questionId: string) => {
  const {
    clients: {
      masterdata,
      mail,
      apps,
      catalogGraphQL
    },
    vtex: {
      host
    }
  } = ctx

  const { subscriptionEmailTemplate } = await apps.getAppSettings(
    `${process.env.VTEX_APP_ID}`
  )

  if(subscriptionEmailTemplate){
    const subscription: any = await masterdata.getDocument({
      dataEntity: 'subscriptions',
      fields: ['email'],
      id: questionId
    })

    if(subscription) {
      const { question, productId } = await masterdata.getDocument({
        dataEntity: 'qna',
        id: questionId,
        fields: ['question', 'productId']
      })

      const product: any = await catalogGraphQL.product(productId)

      mail.send({
        toEmail: subscription.email,
        questionText: question.question,
        productUrl: `https://${host}/${product.LinkId}`,
        unsubscribeUrl: `https://${host}/qna/unsubscribe/${args.questionId}`,
      }, subscriptionEmailTemplate)

    }
  }
}
