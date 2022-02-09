import { SCHEMA_VERSION } from "."
import subscriptionMail from "../utils/subscriptionMail"
import { STATUS } from '../utils/constants'

export const getAnswers = async (
  parent: any,
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
  let sort = 'createdIn DESC'

  if(filter?.status !== undefined) {
    where.push(`status=${filter.status}`)
  }
  
  if (filter?.searchTerm) {
    where.push(`(name=*${filter?.searchTerm}* OR 
                email=*${filter?.searchTerm}* OR
                productId=*${filter?.searchTerm}*)`)
  }
    
  if(parent?.id) {
    where.push(`questionId=${parent.id}`)
    where.push(`status=${STATUS.APPROVED}`)
    sort = 'votes DESC'
  }

  return masterdata.searchDocuments({
    dataEntity: 'answer',
    schema: SCHEMA_VERSION,
    fields: ['_all'],
    where: where.join(' AND '),
    sort,
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
    status
  } = data.input

  const {
    clients: { masterdata }
  } = ctx

  const updates = ids.map((id: string) => masterdata.updatePartialDocument({
    dataEntity: 'answer',
    schema: SCHEMA_VERSION,
    id,
    fields: {
      status
    }
  }))

  return Promise.all(updates)
    .then(async () => {
      if(status === STATUS.APPROVED) {
        // send email to all subscribers of answered questions
        const questionIds = await masterdata.searchDocuments({
          dataEntity: 'answer',
          schema: SCHEMA_VERSION,
          where: `id=${ids.join(" OR id=")}`,
          fields: ['questionId'],
          pagination: {
            page: 1,
            pageSize: 999
          }
        })

        const uniqueQuestionIds = [...new Set(questionIds.map((i:any)=>i.questionId))]

        uniqueQuestionIds.forEach(id => {
          // no need to wait for mail sent
          subscriptionMail(ctx,id)
        });
      }
      return true
    })
    .catch((errors) => {
      console.log(errors)
      return false
    })
}
