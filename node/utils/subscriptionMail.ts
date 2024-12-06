import { SCHEMA_VERSION } from '../resolvers'

const subscriptionMail = async (ctx: Context, questionId: string) => {
  const {
    clients: { masterdata, mail, apps, catalogGraphQL },
    vtex: { host, production },
  } = ctx

  const { subscriptionEmailTemplate } = await apps.getAppSettings(
    `${process.env.VTEX_APP_ID}`
  )

  if (subscriptionEmailTemplate) {
    const subscriptions: any = await masterdata.searchDocuments({
      dataEntity: 'subscriptions',
      schema: SCHEMA_VERSION,
      fields: ['id', 'email'],
      where: `questionId=${questionId}`,
      pagination: {
        page: 1,
        pageSize: 999,
      },
    })

    if (subscriptions.length) {
      const { question, productId } = await masterdata.getDocument<any>({
        dataEntity: 'qna',
        id: questionId,
        fields: ['question', 'productId'],
      })

      const { product }: any = await catalogGraphQL.product(productId)

      subscriptions.forEach((subscription: any) => {
        const options = {
          toEmail: subscription.email,
          questionText: question,
          productUrl: production
            ? `https://pentruanimale.ro/${product.linkId}/p`
            : `https://${host}/${product.linkId}/p`,
          unsubscribeUrl: production
            ? `https://pentruanimale.ro/qna/unsubscribe/${subscription.id}`
            : `https://${host}/qna/unsubscribe/${subscription.id}`,
        }

        mail.send(options, subscriptionEmailTemplate)
      })
    }
  }
}

export default subscriptionMail
