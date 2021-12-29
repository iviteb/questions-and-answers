import type { EventContext } from '@vtex/api'
import type { Clients } from '../clients'

export const getProduct = async (
  parent: any,
  data: any,
  ctx: EventContext<Clients> | Context
): Promise<any> => {
  const {
    clients: { catalog },
  } = ctx

  return await catalog.getProductByID(data?.productId || parent?.productId)
}
