import { method, Service, ClientsConfig, ParamsContext, RecorderState, ServiceContext } from '@vtex/api'

import { Clients } from './clients'
import { resolvers } from './resolvers'
import { getAnswers, updateMultipleAnswers } from './resolvers/answers'
import { getQuestions, updateMultipleQuestions } from './resolvers/questions'
import unsubscribeFromQuestion from './middleware/unsubscribeFromQuestion'

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients>

}

export default new Service<Clients, RecorderState, ParamsContext>({
  clients,
  graphql: {
    resolvers: {
      Mutation: {
        ...resolvers.Mutation,
        moderateQuestions: updateMultipleQuestions,
        moderateAnswers: updateMultipleAnswers
      },
      Query: {
        ...resolvers.Query,
        questionsV2: getQuestions,
        answersV2: getAnswers
      },
      Question: {
        answers: getAnswers
      }
    }
  },
  routes: {
    unsubscribeFromQuestion: method({
      GET: [unsubscribeFromQuestion],
    }),
  }
})
