import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
export default class CatalogClient extends ExternalClient {
  constructor(context: IOContext, options?: InstanceOptions) {
    super(
      `http://${context.account}.vtexcommercestable.com.br/api/catalog/pvt`,
      context,
      {
        ...options,
        headers: {
          ...options?.headers,
          'Cache-Control': 'no-cache',
          VtexIdclientAutcookie: context.adminUserAuthToken as string,
        },
      }
    )
  }

  public getProductByID = (productId: string) =>
    this.http.get(`/product/${productId}`)
}