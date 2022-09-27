import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export default class Mail extends JanusClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(context, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie: context.authToken,
      },
    })
  }

  public async send(data: any, template: string): Promise<string> {
    const mailData = {
      providerName: null,
      templateName: template,
      jsonData: {
        ...data,
      },
    }

    const {
      account
    } = this.context

    return this.http.post(
      `http://${account}.vtexcommercestable.com.br/api/mail-service/pvt/sendmail`,
      mailData
    )
  }
}
