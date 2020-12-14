/* eslint-disable no-console */
import { Apps } from '@vtex/api'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}
const SCHEMA_VERSION = 'v0.4'
const schemaQuestions = {
  properties: {
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
  'v-indexed': ['email', 'question', 'creationDate', 'allowed'],
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
  'v-indexed': ['email', 'answer', 'questionId', 'allowed', 'creationDate'],
  'v-default-fields': ['email', 'answer', 'creationDate', 'cartLifeSpan'],
  'v-cache': false,
}

const routes = {
  baseUrl: (account: string) =>
    `http://${account}.vtexcommercestable.com.br/api`,
    questionEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/qna`,

    answerEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/answer`,

  saveSchemaQuestion: (account: string) =>
    `${routes.questionEntity(account)}/schemas/${SCHEMA_VERSION}`,

    saveSchemaAnswer: (account: string) =>
    `${routes.answerEntity(account)}/schemas/${SCHEMA_VERSION}`,

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
      const defaultSettings = {
        schema: false,
        schemaVersion: null,
        title: 'Q&A',
        anonymous: false,
        search: true,
        maxQuestions: 10
      }

      if(!settings.title) {
        settings = defaultSettings
      }

      if (!settings.schema || settings.schemaVersion !== SCHEMA_VERSION) {
          try {
            const url = routes.saveSchemaQuestion(account)
            const headers = defaultHeaders(authToken)

            await hub.put(url, schemaQuestions, headers)

            settings.schema = true
            settings.schemaVersion = SCHEMA_VERSION
          } catch (e) {
            console.log('Error saving', e)
            settings.schema = false
          }

          try {
            const url = routes.saveSchemaAnswer(account)
            const headers = defaultHeaders(authToken)

            await hub.put(url, schemaAnswers, headers)

            settings.schema = true
            settings.schemaVersion = SCHEMA_VERSION
          } catch (e) {
            console.log('Error saving', e)
            settings.schema = false
          }

        await apps.saveAppSettings(app, settings)
      }
      console.log('settings AFTER =>', settings)

      return settings
    },
    questions: async (
      _: any,
      __: any,
      ctx: Context
    ) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'qna',
        fields: ['question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate', 'allowed', 'productId'],
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
        fields: ['question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate'],
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `question=*${args.keyword}*`,
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
        fields: ['answer','votes', 'questionId', 'name', 'email', 'anonymous', 'allowed'],
        pagination: {
          page: 1,
          pageSize: 99,
        },
        where: `questionId=${args.questionId}`,
        schema: SCHEMA_VERSION,
      })

      return result
    }
  },
  Mutation: {
    addQuestion: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      return masterdata.createDocument({dataEntity: 'qna', fields: args, schema: SCHEMA_VERSION,
        }).then((res: any) => {
          console.log('Adding', res)
          console.log('Question ID', args.id)
          return res.DocumentId
        }).catch((err: any) => {
          console.log('Error Adding Question', err)
        })

    },
    addAnswer: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      return masterdata.createDocument({dataEntity: 'answer', fields: args, schema: SCHEMA_VERSION,
        }).then((res: any) => {
          console.log('Add Answer', res)
          console.log('Answer ID', args.id)
          return res.DocumentId
        }).catch((err: any) => {
          console.log('Error Adding Answer', err)
        })

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
      }, headers).then((ret: any) => {
        console.log('Return =>', ret)
        return newVote
      }).catch((err: any) => {
        console.log('Error Voting', err)
      })

      console.log('Votes', votes)
      console.log('New Vote', newVote)
      return result

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

      console.log('answerId => ', args.id)

      const answer:any = await masterdata.getDocument({
        dataEntity: 'answer',
        id: args.id,
        fields: ['votes']
      })

      const votes:number = answer?.votes ?? 0
      const newVote = votes + 1

      const headers = defaultHeaders(authToken)
      const result = await hub.patch(`http://api.vtex.com/api/dataentities/answer/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          votes: newVote
      }, headers).then((ret: any) => {
        console.log('Return =>', ret)
        return newVote
      }).catch((err: any) => {
        console.log('Error Voting', err)
      })

      console.log('Votes', votes)
      console.log('New Vote', newVote)
      return result

    },
    moderateQuestion: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const newAllowed = args.allowed

      const headers = defaultHeaders(authToken)
      const result = await hub.patch(`http://api.vtex.com/api/dataentities/qna/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          allowed: newAllowed
      }, headers).then((ret: any) => {
        console.log('Return =>', ret)
        return newAllowed
      })

      return result
      

    },
    moderateAnswer: async (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          hub,
        },
        vtex: {
          account,
          authToken,
        }
      } = ctx

      const newAllowed = args.allowed

      const headers = defaultHeaders(authToken)
      const result = await hub.patch(`http://api.vtex.com/api/dataentities/answer/documents/${args.id}?an=${account}&_schema=${SCHEMA_VERSION}`, {
          allowed: newAllowed
      }, headers).then((ret: any) => {
        console.log('Return =>', ret)
        return newAllowed
      })
      console.log(result)
      return result

    },
    deleteQuestion: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      return masterdata.deleteDocument({dataEntity: 'qna', id: args.id
        }).then(() => {
          console.log('Delete Success')
        }).catch((err: any) => {
          console.log('Error Deleting Question', err)
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
          console.log('Delete Success')
        }).catch((err: any) => {
          console.log('Error Deleting Answer', err)
        })

    },
  }
}
