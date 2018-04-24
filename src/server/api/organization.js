import { mapFieldsToModel } from './lib/utils'
import { r, Organization } from '../models'
import { accessRequired, hasOsdiConfigured } from './errors'
import axios from 'axios'

export const schema = `
  type Organization {
    id: ID
    uuid: String
    name: String
    campaigns(campaignsFilter: CampaignsFilter): [Campaign]
    people(role: String): [User]
    optOuts: [OptOut]
    threeClickEnabled: Boolean
    textingHoursEnforced: Boolean
    textingHoursStart: Int
    textingHoursEnd: Int
    osdiLists(osdiListsFilter: OsdiListFilter): [OsdiList]
    osdiEnabled: Boolean
    osdiApiToken: String
    osdiApiUrl: String
  }
`

export const resolvers = {
  Organization: {
    ...mapFieldsToModel([
      'id',
      'name'
    ], Organization),
    campaigns: async (organization, { campaignsFilter }, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')
      let query = r.table('campaign').getAll(organization.id, { index:
        'organization_id' })

      if (campaignsFilter && campaignsFilter.hasOwnProperty('isArchived') && campaignsFilter.isArchived !== null) {
        query = query.filter({ is_archived: campaignsFilter.isArchived })
      }

      query = query.orderBy(r.desc('due_by'))

      return query
    },
    osdiLists: async (organization, { osdiListFilter }, { user }) => {
      await hasOsdiConfigured(organization)
      const {osdiApiUrl, osdiApiToken} = JSON.parse(organization.features)
    
      let page = 1
      let lists = []
      let res = await axios.get(`${osdiApiUrl}/lists`, {
        headers: {'OSDI-API-Token': osdiApiToken},
        params: {page}
      })

      while (res.data._links.next) {
        page++

        res = await axios.get(`${osdiApiUrl}/lists`, {
          headers: {'OSDI-API-Token': osdiApiToken},
          params: {page}
        })

        lists = lists.concat(res.data._embedded['osdi:lists'])
      }

      return lists
    },
    uuid: async (organization, _, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')
      const result = await r.knex('organization')
        .column('uuid')
        .where('id', organization.id)
      return result[0].uuid
    },
    optOuts: async (organization, _, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')
      return r.table('opt_out')
        .getAll(organization.id, { index: 'organization_id' })
    },
    people: async (organization, { role }, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')

      const roleFilter = role ? { role } : {}

      return r.table('user_organization')
        .getAll(organization.id, { index: 'organization_id' })
        .filter(roleFilter)
        .eqJoin('user_id', r.table('user'))('right')
        .distinct()
    },
    threeClickEnabled: (organization) => organization.features.indexOf('threeClick') !== -1,
    textingHoursEnforced: (organization) => organization.texting_hours_enforced,
    textingHoursStart: (organization) => organization.texting_hours_start,
    textingHoursEnd: (organization) => organization.texting_hours_end,
    osdiEnabled: async (organization, _, { user }) => {
      return tryFeatureParse(organization, 'osdiEnabled', false)
    },
    osdiApiUrl: async (organization, _, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')
      return tryFeatureParse(organization, 'osdiApiUrl', '')
    },
    osdiApiToken: async (organization, _, { user }) => {
      await accessRequired(user, organization.id, 'ADMIN')
      return tryFeatureParse(organization, 'osdiApiToken', '')
    }
  }
}

function tryFeatureParse(organization, key, backup) {
  try {
    const possible = JSON.parse(organization.features)[key]
    const result = possible !== undefined ? possible : backup
    return result
  } catch (ex) {
    return backup
  }
}
