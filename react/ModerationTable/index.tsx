/* eslint-disable no-console */
import React, { FC, useState, useContext, Fragment } from 'react'
import { compose, graphql, useLazyQuery, useMutation } from 'react-apollo'
import { injectIntl, defineMessages } from 'react-intl'
import { Table, Checkbox, Tab, Tabs, Input, Button, Modal, IconCog, ButtonWithIcon } from 'vtex.styleguide'

import GET_ALL_QUESTIONS from '../queries/getAllQuestions.gql'
import GET_ALL_ANSWERS from '../queries/getAllAnswers.gql'
import MODERATE_QUESTION from '../queries/moderateQuestion.gql'
import MODERATE_ANSWER from '../queries/moderateAnswer.gql'
import SAVE_SETTINGS from '../queries/saveSettings.gql'
import QUERY_CONFIG from '../queries/config.gql'
// import ItemTable from './ItemTable'


const ModerationTable: FC<any> = ({data: {config}, intl}) => {
  const [state, setState] = useState<any>({
    questionCheck: {},
    answerCheck: {},
    questionUpdate: '',
    answerUpdate: '',
    approvedQuestions: [],
    pendingQuestions: [],
    approvedAnswers: [],
    pendingAnswers: [],
    currentTab: 1,
    title: 'Q&A',
    maxQuestions: null,
    allowAnonymous: null,
    allowSearch: null,
    allowModeration: null,
    isModalOpen: false
  })

  const {
    questionUpdate,
    answerCheck,
    answerUpdate,
    currentTab,
    approvedQuestions,
    pendingQuestions,
    approvedAnswers,
    pendingAnswers,
    title,
    maxQuestions,
    allowAnonymous,
    allowSearch,
    allowModeration,
    isModalOpen,
  } = state

  const cog = <IconCog />
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

  const [modalData, setModalData] = useState(null)

  const [
    getAllQuestions,
    { data: questionsData, called: questionsCalled },
  ] = useLazyQuery(GET_ALL_QUESTIONS, {
    onCompleted: () => {
      seperateQuestions()
    },
  })

  const [
    getAllAnswers,
    { data: answersData, called: answersCalled },
  ] = useLazyQuery(GET_ALL_ANSWERS, {
    onCompleted: () => {
      seperateAnswers()
    },
  })

  const [moderateQuestion] = useMutation(MODERATE_QUESTION)

  const [moderateAnswer] = useMutation(MODERATE_ANSWER, {
    onCompleted: (res: any) => {
      const newAC = answerCheck
      newAC[res.moderateAnswer] = !newAC[res.moderateAnswer]
      setState({
        ...state,
        answerCheck: newAC,
      })
    },
  })

  const [
    saveSettings,
    { called: saveCalled, loading: saveLoading, error: saveError },
  ] = useMutation(SAVE_SETTINGS)

  const seperateQuestions = () => {
    let newApproved: any = []
    let newPending: any = []
    const random = Math.random().toString(36).substring(7)

    questionItems?.forEach((question: any) => {
      if (question.allowed) {
        newApproved.push(question)
      } else {
        newPending.push(question)
      }
    })

    if (
      newApproved.length !== approvedQuestions.length ||
      newPending.length !== pendingQuestions.length
    ) {
      setState({
        ...state,
        approvedQuestions: newApproved,
        pendingQuestions: newPending,
        questionUpdate: random,
      })
    }
  }

  const seperateAnswers = () => {
    let newApproved: any = []
    let newPending: any = []
    const random = Math.random().toString(36).substring(7)

    answerItems?.forEach((answer: any) => {
      if (answer.allowed) {
        newApproved.push(answer)
      } else {
        newPending.push(answer)
      }
    })

    if (
      newApproved.length !== approvedAnswers.length ||
      newPending.length !== pendingAnswers.length
    ) {
      setState({
        ...state,
        approvedAnswers: newApproved,
        pendingAnswers: newPending,
        answerUpdate: random,
      })
    }
  }

  const handleModalToggle = () => {
    setState({ ...state, isModalOpen: !isModalOpen })
  }

  if (!questionsCalled) {
    getAllQuestions()
  }

  if (!answersCalled) {
    getAllAnswers()
  }

  if (config && allowAnonymous === null) {
    setState({
      ...state,
      maxQuestions: config.maxQuestions,
      allowAnonymous: config.anonymous,
      allowSearch: config.search,
      allowModeration: config.moderation
    })
  }

  if (!saveLoading && saveCalled && !saveError && isModalOpen) {
    setState({ ...state, isModalOpen: false })
  }

  const questionItems = questionsData?.allQuestions || []
  const answerItems = answersData?.allAnswers || []

  const handleQuestionCheck = (question: any) => {
    const random = Math.random().toString(36).substring(7)

    const newApprovedQuestions = approvedQuestions.map((item: any) => {
      return item.id === question.id
        ? {
            ...item,
            allowed: !item.allowed,
          }
        : item
    })

    const newPendingQuestions = pendingQuestions.map((item: any) => {
      return item.id === question.id
      ? {
          ...item,
          allowed: !item.allowed,
        }
      : item
    })

    moderateQuestion({
      variables: {
        id: question.id,
      },
    })

    setState({
      ...state,
      approvedQuestions: newApprovedQuestions,
      pendingQuestions: newPendingQuestions,
      questionUpdate: random,
    })
  }

  const handleAnswerCheck = (answer: any) => {
    const random = Math.random().toString(36).substring(7)

    const newApprovedAnswers = approvedAnswers.map((item: any) => {
      return item.id === answer.id
        ? {
            ...item,
            allowed: !item.allowed,
          }
        : item
    })
    const newPendingAnswers = pendingAnswers.map((item: any) => {
      return item.id === answer.id
      ? {
          ...item,
          allowed: !item.allowed,
        }
      : item
    })

    moderateAnswer({
      variables: {
        answerId: answer.id,
      },
    })
    setState({
      ...state,
      approvedAnswers: newApprovedAnswers,
      pendingAnswers: newPendingAnswers,
      answerUpdate: random,
    })
  }

  const questionSchema = {
    properties: {
      question: {
        title: 'Question',
        width: 400,
      },
      name: {
        title: 'Name',
        width: 150,
      },
      email: {
        title: 'Email',
        width: 200,
      },
      approved: {
        title: 'Approved',
        width: 100,
        cellRenderer: ({rowData: question}: any) => {
          return (
            <div className="">
              <Checkbox
                checked={question.allowed}
                id="question-option"
                name="question-option"
                onChange={() => {
                  handleQuestionCheck(question)
                }}
              />
            </div>
          )
        },
      },
    },
  }

  const answerSchema = {
    properties: {
      answer: {
        title: 'Answer',
        width: 400,
      },
      name: {
        title: 'Name',
        width: 150,
      },
      email: {
        title: 'Email',
        width: 200,
      },
      approved: {
        title: 'Approved',
        width: 100,
        cellRenderer: (cellData: any) => {
          const answer = cellData.rowData
          return (
            <div>
              <Checkbox
                checked={answer.allowed}
                id="answer-option"
                name="answer-option"
                onChange={() => {
                  handleAnswerCheck(answer)
                }}
              />
            </div>
          )
        },
      },
    },
  }

  console.log('questionsData =>', questionsData)
  console.log('answersData =>', answersData)
  console.log('state =>', state)

  console.log('pendingQuestions =>', pendingQuestions)
  console.log('questionUpdate =>', questionUpdate)

  return (
    <div>
      <ButtonWithIcon
          onClick={() => handleModalToggle()}
          icon={cog}
          variation="secondary"
        >
          {intl.formatMessage(messages.settings)}
      </ButtonWithIcon>

      <Modal
        isOpen={isModalOpen}
        centered
        title="Settings"
        onClose={() => {
          handleModalToggle()
        }}
      >
        <div className="mt7">
          <Input
            size="small"
            label={intl.formatMessage(messages.maxQuestions)}
            value={maxQuestions || 10}
            type="number"
            helpText={intl.formatMessage(messages.helpMaxQuestions)}
            onChange={(e: any) =>
              setState({ ...state, maxQuestions: +e.target.value })
            }
          />
        </div>
        <div className="mt6">
          <Checkbox
            id="anonymous-option"
            name="anonymous-option"
            label={intl.formatMessage(messages.anonymous)}
            checked={allowAnonymous}
            onChange={() => {
              setState({...state, allowAnonymous: !allowAnonymous})
            }}
          />
        </div>
        <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpAnonymous)}</p>

        <div className="mt4">
          <Checkbox
            id="search-option"
            name="search-option"
            label={intl.formatMessage(messages.search)}
            checked={allowSearch}
            onChange={() => {
              setState({...state, allowSearch: !allowSearch})
            }}
          />
        <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpSearch)}</p>

        <div className="mt4">
          <Checkbox
            id="moderation-option"
            name="moderation-option"
            label={intl.formatMessage(messages.moderation)}
            checked={allowModeration}
            onChange={() => {
              setState({...state, allowModeration: !allowModeration})
            }}
          />
        </div>
        <p className="t-small c-muted-1 mw9">{intl.formatMessage(messages.helpModeration)}</p>

        </div>
        <div className="mt6">
          <Button
            isLoading={saveLoading}
            onClick={() => {
              saveSettings({
                variables: {
                  title,
                  anonymous: allowAnonymous,
                  search: allowSearch,
                  maxQuestions,
                  moderation: allowModeration
                },
              })
            }}
          >
            {intl.formatMessage(messages.save)}
          </Button>
        </div>
      </Modal>

      <div className="mt6">
        <Tabs>
          <Tab
            label={intl.formatMessage(messages.pending)}
            active={currentTab === 1}
            onClick={() => setState({ ...state, currentTab: 1 })}
          >
            <div className="mt8">
              <h3>{intl.formatMessage(messages.pendingQuestions)}</h3>
              <Table
                fullWidth
                onRowClick={({ rowData: { question } }: any) => {
                  setModalData(question)
                }}
                updateTableKey={questionUpdate}
                items={pendingQuestions}
                density="low"
                schema={questionSchema}
              />
              {/* <ItemTable
                onChange={() => setState({...state, questionUpdate: Math.random().toString(36).substring(7)})}
                initialState={{
                  tableKey: questionUpdate,
                  items: pendingQuestions,
                  schema: questionSchema
                }}
              /> */}
            </div>

            <div className="mt8">
              <h3>{intl.formatMessage(messages.pendingAnswers)}</h3>
              <Table
                fullWidth
                onRowClick={({ rowData: { answer } }: any) => {
                  setModalData(answer)
                }}
                updateTableKey={answerUpdate}
                items={pendingAnswers}
                density="low"
                schema={answerSchema}
              />
            </div>
          </Tab>
          <Tab
            label={intl.formatMessage(messages.approvedQuestions)}
            active={currentTab === 2}
            onClick={() => setState({ ...state, currentTab: 2 })}
          >
            <Table
              fullWidth
              onRowClick={({ rowData: { question } }: any) => {
                setModalData(question)
              }}
              updateTableKey={questionUpdate}
              items={approvedQuestions}
              density="low"
              schema={questionSchema}
            />
          </Tab>

          <Tab
            label={intl.formatMessage(messages.approvedAnswers)}
            active={currentTab === 3}
            onClick={() => setState({ ...state, currentTab: 3 })}
          >
            <Table
              fullWidth
              onRowClick={({ rowData: { answer } }: any) => {
                setModalData(answer)
              }}
              updateTableKey={answerUpdate}
              items={approvedAnswers}
              density="low"
              schema={answerSchema}
            />
          </Tab>
        </Tabs>
      </div>
      <Modal
        centered
        isOpen={modalData !== null}
        onClose={() => setModalData(null)}
      >
        <p>
          {modalData}
        </p>
      </Modal>
    </div>
  )
}

export default injectIntl(
  compose(
    graphql(QUERY_CONFIG, {
      options: { ssr: false },
    })
  )(ModerationTable)
)
