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
    console.log("🚀 ~ file: mail.ts ~ line 23 ~ Mail ~ send ~ mailData", mailData)
    console.log("🚀 ~ file: mail.ts ~ line 25 ~ Mail ~ send ~ this.context", this.context)

    return '';
    // return this.http.post(
    //   `http://floriaro.vtexcommercestable.com.br/api/mail-service/pvt/sendmail`,
    //   mailData
    // )
  }
}
