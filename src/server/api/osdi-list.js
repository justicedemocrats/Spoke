import { mapFieldsToModel } from './lib/utils'
import { Campaign, JobRequest, r } from '../models'

/*
 * Schema for OSDI List, for purposes of querying the available lists
 * to import from the front-end
 * 
 * This schema does not map to a DB schema – it only maps to an external osdi
 * api
 */

export const schema = `
  input OsdiListFilter {
    search: String
  }

  type OsdiList {
    id: ID
    identifiers: [ID]
    name: String
    summary: String
    total_items: Int
  }
`

const simple = attr => obj => obj[attr]

export const resolvers = {
  OsdiList: {
    name: simple('name'),
    id: simple('id'),
    identifiers: simple('identifiers'),
    summary: simple('summary'),
    total_items: simple('total_items')
  }
}