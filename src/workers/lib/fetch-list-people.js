const axios = require('axios')

export default async ({osdi_api_url, osdi_api_token, list_id, limit}) => {
  const url = `${osdi_api_url}/lists/${list_id}/items`
  console.log(url)
  const items = await axios.get(url, {
    headers: {'OSDI-API-Token': osdi_api_token}
  })
  return items.data._embedded['osdi:items']
}