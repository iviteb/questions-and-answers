/* eslint-disable no-console */
import { Apps } from '@vtex/api'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}
export const SCHEMA_VERSION = 'v0.10'
const schemaQuestions = {
  properties: {
    productId: {
      type: 'string',
      title: 'Product ID',
    },
    question: {
      type: 'string',
      title: 'Question',
    },
    name: {
      type: 'string',
      title: 'Name',
    },
    email: {
      type: 'string',
      title: 'Email',
    },
    anonymous: {
      type: 'boolean',
      title: 'Anonymous',
    },
    votes: {
      type: 'integer',
      title: 'Votes',
      default: 0,
    },
    allowed: {
      type: 'boolean',
      title: 'allowed',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': ['productId', 'email', 'question', 'creationDate', 'allowed', 'votes'],
  'v-default-fields': ['email', 'question', 'creationDate', 'cartLifeSpan'],
  'v-cache': false,
}
const schemaAnswers = {
  properties: {
    questionId: {
      type: 'string',
      title: 'Question ID',
    },
    answer: {
      type: 'string',
      title: 'Name',
    },
    name: {
      type: 'string',
      title: 'Name',
    },
    email: {
      type: 'string',
      title: 'Email',
    },
    anonymous: {
      type: 'boolean',
      title: 'Anonymous',
    },
    votes: {
      type: 'integer',
      title: 'Votes',
      default: 0,
    },
    allowed: {
      type: 'boolean',
      title: 'allowed',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': ['email', 'answer', 'questionId', 'allowed', 'creationDate', 'votes'],
  'v-default-fields': ['email', 'answer', 'creationDate', 'cartLifeSpan'],
  'v-cache': false,
}
const schemaSubscriptions = {
  properties: {
    questionId: {
      type: 'string',
      title: 'Question ID',
    },
    email: {
      type: 'string',
      title: 'Email',
    },
  },
  'v-indexed': ['email', 'questionId'],
  'v-default-fields': ['email', 'questionId'],
  'v-cache': false,
}

const routes = {
  baseUrl: (account: string) =>
    `http://${account}.vtexcommercestable.com.br/api`,

  questionEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/qna`,

  answerEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/answer`,

  subscriptionsEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/subscriptions`,

  saveSchemaQuestion: (account: string) =>
    `${routes.questionEntity(account)}/schemas/${SCHEMA_VERSION}`,

  saveSchemaAnswer: (account: string) =>
    `${routes.answerEntity(account)}/schemas/${SCHEMA_VERSION}`,

  saveSchemaSubscriptions: (account: string) =>
    `${routes.subscriptionsEntity(account)}/schemas/${SCHEMA_VERSION}`,

}

const defaultHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vtex.ds.v10+json',
  VtexIdclientAutCookie: authToken,
  'Proxy-Authorization': authToken,
})

export const resolvers = {
  Query: {
    config: async (_: any, __: any, ctx: any) => {
      const {
        vtex: { account, authToken },
        clients: { hub },
      } = ctx

      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      let settings = await apps.getAppSettings(app)
      console.log("🚀 ~ file: index.ts ~ line 139 ~ config: ~ settings", settings)
      const defaultSettings = {
        schema: false,
        schemaVersion: null,
        title: 'Q&A',
        anonymous: false,
        search: true,
        maxQuestions: 10,
        moderation: false
      }

      if(!settings.title) {
        settings = defaultSettings
      }

      let schemaError = false

      if (!settings.schema || settings.schemaVersion !== SCHEMA_VERSION) {
        try {
          const url = routes.saveSchemaQuestion(account)
          const headers = defaultHeaders(authToken)
          console.log("CREATING QUESTIONS SCHEMA")
          await hub.put(url, schemaQuestions, headers)

        } catch (e) {
          if(e.response.status >= 400) {
            schemaError = true
          }
        }

        if(!schemaError) {
          try {
            const url = routes.saveSchemaAnswer(account)
            const urlSubscriptions = routes.saveSchemaSubscriptions(account)
            const headers = defaultHeaders(authToken)
            console.log("CREATING OTHER SCHEMAS")

            await hub.put(url, schemaAnswers, headers)
            await hub.put(urlSubscriptions, schemaSubscriptions, headers)

          } catch (e) {
            if(e.response.status >= 400) {
              schemaError = true
            }
          }
        }

        settings.schema = !schemaError
        settings.schemaVersion = !schemaError ? SCHEMA_VERSION : null

        console.log(settings)

        await apps.saveAppSettings(app, settings)
      }

      return settings
    },
    questions: async (
      _: any,
      args: any,
      ctx: Context
    ) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'qna',
        fields: ['id', 'question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate', 'allowed', 'productId'],
        sort: 'votes DESC',
        where: `productId=${args.productId} AND allowed=${true}`,
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      return result
    },
    search: async (
      _: any,
      args: any,
      ctx: Context
    ) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'qna',
        fields: ['id', 'question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate', 'allowed', 'productId'],
        sort: 'votes DESC',
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `productId=${args.productId} AND question=*${args.keyword}*  AND allowed=${true}`,
        schema: SCHEMA_VERSION,
      })

      return result
    },
    answers: async (
      _: any,
      args: any,
      ctx: Context
    ) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'answer',
        fields: ['id', 'answer','votes', 'questionId', 'name', 'email', 'anonymous', 'allowed'],
        sort: 'votes DESC',
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `questionId=${args.questionId}  AND allowed=${true}`,
        schema: SCHEMA_VERSION,
      })

      return result
    },
    allQuestions: async (_: any, __: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'qna',
        fields: ['id', 'question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate', 'allowed', 'productId'],
        sort: "allowed DESC",
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      return result
    },
    allAnswers: async (_: any, __: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'answer',
        fields: ['id', 'answer','name', 'email', 'anonymous', 'votes', 'creationDate', 'allowed', 'questionId'],
        sort: "allowed ASC",
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      return result
    },
  },
  Mutation: {
    addQuestion: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      const {
        subscribed,
        ...fields
      } = args



      return masterdata.createDocument({
        dataEntity: 'qna',
        fields,
        schema: SCHEMA_VERSION,
        }).then((res: any) => {
          console.log("🚀 ~ file: index.ts ~ line 339 ~ addQuestion: ~ res", res)
          if(subscribed) {
            masterdata.createDocument({
              dataEntity: 'subscriptions',
              fields: {
                id: res.DocumentId, // questionId
                email: fields.email
              }
            })
          }
          return res.DocumentId
        }).catch((err: any) => {
          return err.response.message
        })
    },
    addAnswer: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata,
          hub,
          apps,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const { moderation } = await apps.getAppSettings(
        `${process.env.VTEX_APP_ID}`
      )

      if(!moderation) {
        subscriptionMail(ctx, args.questionId)
      }

      const result:any = await masterdata.createDocument({dataEntity: 'answer', fields: args, schema: SCHEMA_VERSION,
        }).then((res: any) => {
          return res.DocumentId
        }).catch((err: any) => {
          return err.response.message
        })

      const question:any = await masterdata.getDocument({
        dataEntity: 'qna',
        id: args.questionId,
        fields: ['answers']
      })

      const answers = question.answers ?? []
      answers.push({...args, id: result})

      console.log(args)
      const headers = defaultHeaders(authToken)
      await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${args.questionId}?an=${account}&_schema=${SCHEMA_VERSION}`, {
        answers
      }, headers).then(() => {
        return answers
      }).catch(() => {
        return answers
      })

      return result
    },
    voteQuestion: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata,
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const question:any = await masterdata.getDocument({
        dataEntity: 'qna',
        id: args.id,
        fields: ['votes']
      })
      const votes:number = question?.votes ?? 0

      const newVote = votes + parseInt(args.vote, 10)
      const headers = defaultHeaders(authToken)
      const result = await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          votes: newVote
      }, headers).then(() => {
        return newVote
      }).catch(() => {
        return votes
      })
      return {votes: result, id: args.id}

    },
    voteAnswer: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata,
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const answer:any = await masterdata.getDocument({
        dataEntity: 'answer',
        id: args.id,
        fields: ['votes','questionId']
      })

      const votes:number = answer?.votes ?? 0
      const newVote = votes + 1

      const headers = defaultHeaders(authToken)
      const result = await hub.patch(`http://api.vtex.com/api/dataentities/answer/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          votes: newVote
      }, headers).then(() => {
        return newVote
      }).catch(() => {
        return votes
      })

      const answers = await masterdata.searchDocuments({
        dataEntity: 'answer',
        fields: ['id', 'answer','votes', 'questionId', 'name', 'email', 'anonymous', 'allowed'],
        sort: 'votes DESC',
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `questionId=${answer.questionId}`,
        schema: SCHEMA_VERSION,
      })

      await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${answer.questionId}?an=${account}&_schema=${SCHEMA_VERSION}`, {
        answers
      }, headers).then((e) => {
        console.log("contents =>", e)
        return answers
      }).catch((e) => {
        console.log("error =>", e)
        return answers
      })

      return {votes: result, id: args.id}

    },
    moderateQuestion: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata,
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const question:any = await masterdata.getDocument({
        dataEntity: 'qna',
        id: args.id,
        fields: ['allowed', 'id']
      })

      const allowed = !question.allowed
      const headers = defaultHeaders(authToken)
      await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          allowed: allowed
      }, headers).then(() => {
        return allowed
      })

      return args.id
    },
    moderateAnswer: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata,
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const answer:any = await masterdata.getDocument({
        dataEntity: 'answer',
        id: args.answerId,
        fields: ['allowed','questionId']
      })

      const newAllowed = !answer.allowed

      const headers = defaultHeaders(authToken)
      await hub.patch(`http://api.vtex.com/api/dataentities/answer/documents/${args.answerId}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          allowed: newAllowed
      }, headers).then(() => {
        return newAllowed
      })

      const answers = await masterdata.searchDocuments({
        dataEntity: 'answer',
        fields: ['id', 'answer','votes', 'questionId', 'name', 'email', 'anonymous', 'allowed'],
        sort: 'votes DESC',
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `questionId=${answer.questionId}`,
        schema: SCHEMA_VERSION,
      })

      await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${answer.questionId}?an=${account}&_schema=${SCHEMA_VERSION}`, {
        answers
      }, headers).then((e) => {
        console.log("contents =>", e)
        return answers
      }).catch((e) => {
        console.log("error =>", e)
        return answers
      })

      console.log("answer.id =>", answer.id)
      console.log("args.id =>", args.answerId)

      return args.answerId

    },
    deleteQuestion: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      return masterdata.deleteDocument({dataEntity: 'qna', id: args.id
        }).then(() => {
          return true
        }).catch(() => {
          return false
        })
    },
    deleteAnswer: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      return masterdata.deleteDocument({dataEntity: 'answer', id: args.id
        }).then(() => {
          return true
        }).catch(() => {
          return false
        })

    },
    saveSettings: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {

        },
      } = ctx

      const apps = new Apps(ctx.vtex)
      const app: string = getAppId()
      let settings = {
        schema: null,
        schemaVersion: SCHEMA_VERSION,
        title: 'Q&A',
        anonymous: args.anonymous,
        search: args.search,
        maxQuestions: args.maxQuestions || 10,
        moderation: args.moderation,
        subscriptionEmailTemplate: args.subscriptionEmailTemplate
      }

      await apps.saveAppSettings(app, settings)

      return true
    }
  }
}
