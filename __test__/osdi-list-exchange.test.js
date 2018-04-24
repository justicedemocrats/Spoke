// import nock from 'nock'
import fetchListPeople from '../src/workers/lib/fetch-list-people'

it('should fetch items from an osdi list', async () => {
  const people = await fetchListPeople({
    osdi_api_url: 'https://ak-proxy.herokuapp.com/ak/osdi',
    osdi_api_token: 'G2rdjAMk4MUKF2Ek',
    list_id: '722'
  })

  expect(Array.isArray(people)).toBe(true)
})

it('should respect the limit', () => {

})

it('should enrich people with extra columns', () => {

})
