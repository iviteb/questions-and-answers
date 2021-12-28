import { IOClients } from '@vtex/api'

import Mail from './mail'
import RequestHub from '../utils/Hub'
import CatalogClient from './catalog'

export class Clients extends IOClients {
  public get hub() {
    return this.getOrSet('hub', RequestHub)
  }
  public get mail() {
    return this.getOrSet('mail', Mail)
  }
  public get catalog() {
    return this.getOrSet('catalog', CatalogClient)
  }
}
