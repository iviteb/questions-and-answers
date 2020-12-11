/* eslint-disable no-console */
import { Apps } from '@vtex/api'

const getAppId = (): string => {
  return process.env.VTEX_APP_ID ?? ''
}
const SCHEMA_VERSION = 'v0.2'
const schema = {
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
    answers: {
      type: 'array',
      title: 'Answers',
    },
    votes: {
      type: 'integer',
      title: 'Votes',
    },
    creationDate: {
      type: 'string',
      title: 'Creation Date',
    },
  },
  'v-indexed': ['email', 'question', 'creationDate'],
  'v-default-fields': ['email', 'cart', 'creationDate', 'cartLifeSpan'],
  'v-cache': false,
}
const routes = {
  baseUrl: (account: string) =>
    `http://${account}.vtexcommercestable.com.br/api`,
  questionEntity: (account: string) =>
    `${routes.baseUrl(account)}/dataentities/qna`,
  listQuestions: (account: string, email: string) =>
    `${routes.questionEntity(
      account
    )}/search?email=${email}&_schema=${SCHEMA_VERSION}&_fields=id,name,question,email,votes,answers,creationDate&_sort=creationDate DESC`,
  getQuestion: (account: string, id: string) =>
    `${routes.questionEntity(
      account
    )}/documents/${id}?_fields=id,name,question,email,votes,answers,creationDate`,

  saveSchema: (account: string) =>
    `${routes.questionEntity(account)}/schemas/${SCHEMA_VERSION}`,

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
            const url = routes.saveSchema(account)
            const headers = defaultHeaders(authToken)

            await hub.put(url, schema, headers)

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
        fields: ['question','name', 'email', 'anonymous', 'answers', 'votes', 'creationDate'],
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
      args: { keyword: string },
      ctx: Context
    ) => {
      const {
        clients: {
          masterdata
        }
      } = ctx

      const result = await masterdata.searchDocuments({
        dataEntity: 'qna',
        fields: ['question', 'name', 'email','anonymous', 'answers', 'votes', 'creationDate'],
        where: `question=*${args.keyword}*`,
        pagination: {
          page: 1,
          pageSize: 99,
        },
        schema: SCHEMA_VERSION,
      })

      console.log('result =>', result)
      return result
    },
    answers: async (_: any, __: {}) => {
      return [{
        answer: 'Test',
        votes: 99
      } ]
    },
  },
  Mutation: {
    addQuestion: (_:any, args: any, ctx: Context) => {
      const {
        clients: {
          masterdata
        },
      } = ctx

      masterdata.createDocument({dataEntity: 'qna', fields: args, schema: SCHEMA_VERSION,
        }).then((res: any) => {
          console.log('Add Question', res)
        }).catch((err: any) => {
          console.log('Error Adding', err)
        })

    },
    addAnswer: (_:any) => {

    },
    voteQuestion: (_:any) => {

    },
    voteAnswer: (_:any) => {

    },
    moderateQuestion: (_:any) => {

    },
    moderateAnswer: (_:any) => {

    },
    deleteQuestion: (_:any) => {

    },
    deleteAnswer: (_:any) => {

    },
  }
}
