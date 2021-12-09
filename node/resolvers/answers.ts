import { SCHEMA_VERSION } from "."

export const getAnswers = async (
  _: any,
  data: any,
  ctx: Context
): Promise<any> => {
  const {
    clients: { masterdata },
  } = ctx

  const {
    filter
  } = data

  let where = []

  if(filter?.allowed !== null) {
    where.push(`allowed=${filter.allowed}`)
  }

  return masterdata.searchDocuments({
    dataEntity: 'answer',
    schema: SCHEMA_VERSION,
    fields: ['_all'],
    where: where.join(' AND '),
    sort: 'createdIn DESC',
    pagination: {
      page: 1,
      pageSize: 99
    }
  })
}

export const updateMultipleAnswers = async(
  _: any,
  data: any,
  ctx: Context
): Promise<any> => {
  const {
    ids,
    allowed
  } = data.input

  const {
    clients: { masterdata }
  } = ctx

  const updates = ids.map((id: string) => masterdata.updatePartialDocument({
    dataEntity: 'answer',
    schema: SCHEMA_VERSION,
    id,
    fields: {
      allowed
    }
  }))

  return Promise.all(updates)
    .then(() => true)
    .catch((errors) => {
      console.log(errors)
      return false
    })
}