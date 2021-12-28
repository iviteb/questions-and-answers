/* eslint-disable no-console */
import React, { FC, useState } from 'react'
import { useIntl, defineMessages } from 'react-intl'
import { Tab, Tabs } from 'vtex.styleguide'

import GET_ALL_QUESTIONS from '../queries/getAllQuestions.gql'
import GET_ALL_ANSWERS from '../queries/getAllAnswers.gql'
import MODERATE_QUESTION from '../queries/moderateQuestion.gql'
import MODERATE_ANSWER from '../queries/moderateAnswer.gql'
import ItemTable from './ItemTable'
import SettingsTab from './SettingsTab'

const questionSchema = {
  properties: {
    question: {
      title: 'Question',
      width: 150,
    },
    product: {
      title: 'Product',
      cellRenderer: (data: any) => {
        const { origin } = window.location;
        return (<a href={`${origin}/${data.cellData.LinkId}/p`} onClick={e => e.stopPropagation()} target="_blank">{data.cellData.Name}</a>)
      }
    },
    name: {
      title: 'Name',
      width: 150,
    },
    email: {
      title: 'Email',
      width: 200,
    },
  },
}

const answerSchema = {
  properties: {
    answer: {
      title: 'Answer',
    },

    question: {
      title: 'Question',
      width: 250,
      cellRenderer: (data: any) => {
          const { origin } = window.location;
          return (
            <div>
              <div>{data.cellData.questionText}</div>
              <div>
                <a href={`${origin}/${data.cellData.product.LinkId}/p`} onClick={e => e.stopPropagation()} target="_blank">
                 {data.cellData.product.Name}
                </a>
              </div>
            </div>
          )
      }
    },

    name: {
      title: 'Name',
      width: 150,
    },
    email: {
      title: 'Email',
      width: 200,
    },
  },
}

const messages = defineMessages({
  settings: {
    id: 'admin/questions.settings.label',
    defaultMessage: 'Settings',
  },
  maxQuestions: {
    id: 'admin/questions.max-questions.label',
    defaultMessage: 'Max Number of Questions',
  },
  anonymous: {
    id: 'admin/questions.anonymous.label',
    defaultMessage: 'Allow Anonymous',
  },
  search: {
    id: 'admin/questions.search.label',
    defaultMessage: 'Show Search Bar',
  },
  moderation: {
    id: 'admin/questions.moderation.label',
    defaultMessage: 'Require Admin Approval',
  },
  save: {
    id: 'admin/questions.save.label',
    defaultMessage: 'Save',
  },
  pendingQuestions: {
    id: 'admin/questions.pending-questions.label',
    defaultMessage: 'Pending Questions',
  },
  pendingAnswers: {
    id: 'admin/questions.pending-answers.label',
    defaultMessage: 'Pending Answers',
  },
  pending: {
    id: 'admin/questions.tab.pending.label',
    defaultMessage: 'Pending',
  },
  approvedQuestions: {
    id: 'admin/questions.tab.approved-questions.label',
    defaultMessage: 'Approved Questions',
  },
  approvedAnswers: {
    id: 'admin/questions.tab.approved-answers.label',
    defaultMessage: 'Approved Answers',
  },
  helpMaxQuestions: {
    id: 'admin/questions.modal.max-questions.help',
    defaultMessage: 'Sets a maximum number of questions per page',
  },
  helpAnonymous: {
    id: 'admin/questions.modal.anonymous.help',
    defaultMessage: 'Allows users to ask and answer questions without showing their names',
  },
  helpModeration: {
    id: 'admin/questions.modal.moderation.help',
    defaultMessage: 'Require administrator approval before newly submitted questions or answers are displayed',
  },
  helpSearch: {
    id: 'admin/questions.modal.search.help',
    defaultMessage: 'Allows users to search through previously asked questions',
  }
})

const ModerationTable: FC<any> = () => {
  const intl = useIntl()
  const [state, setState] = useState<any>({
    currentTab: 1,
    title: 'Q&A',
    maxQuestions: null,
    allowAnonymous: null,
    allowSearch: null,
    allowModeration: null,
    isModalOpen: false
  })

  const {
    currentTab,
  } = state


  return (
    <div>
      <div className="mt6">
        <Tabs>
          <Tab
            label={intl.formatMessage(messages.pending)}
            active={currentTab === 1}
            onClick={() => setState({ ...state, currentTab: 1 })}
          >
            <div className="mt8">
              <h3>{intl.formatMessage(messages.pendingQuestions)}</h3>
              <ItemTable
                query={GET_ALL_QUESTIONS}
                mutation={MODERATE_QUESTION}
                bulkActionLabel="Approve"
                textPath="question"
                schema={questionSchema}
                filter={{allowed: false}}
              />
            </div>

            <div className="mt8">
              <h3>{intl.formatMessage(messages.pendingAnswers)}</h3>
              <ItemTable
                query={GET_ALL_ANSWERS}
                mutation={MODERATE_ANSWER}
                bulkActionLabel="Approve"
                textPath="answer"
                schema={answerSchema}
                filter={{allowed: false}}
              />
            </div>
          </Tab>
          <Tab
            label={intl.formatMessage(messages.approvedQuestions)}
            active={currentTab === 2}
            onClick={() => setState({ ...state, currentTab: 2 })}
          >
              <ItemTable
                query={GET_ALL_QUESTIONS}
                mutation={MODERATE_QUESTION}
                bulkActionLabel="Reject"
                textPath="question"
                schema={questionSchema}
                filter={{allowed: true}}
              />
          </Tab>
          <Tab
            label={intl.formatMessage(messages.approvedAnswers)}
            active={currentTab === 3}
            onClick={() => setState({ ...state, currentTab: 3 })}
          >
            <ItemTable
              query={GET_ALL_ANSWERS}
              mutation={MODERATE_ANSWER}
              bulkActionLabel="Reject"
              textPath="answer"
              schema={answerSchema}
              filter={{allowed: true}}
            />
          </Tab>
          <Tab
            label={intl.formatMessage(messages.settings)}
            active={currentTab === 4}
            onClick={() => setState({ ...state, currentTab: 4 })}
          >
            <SettingsTab/>
          </Tab>
        </Tabs>
      </div>

    </div>
  )
}

export default ModerationTable
