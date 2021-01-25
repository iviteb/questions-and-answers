/* eslint-disable no-console */
import React, { FC, useState, useContext, Fragment } from 'react'
import { compose, graphql, useLazyQuery, useMutation } from 'react-apollo'
import { injectIntl } from 'react-intl'
import { Table, Checkbox, Tab, Tabs, Input, Button, Modal, IconCog, ButtonWithIcon } from 'vtex.styleguide'

import GET_ALL_QUESTIONS from '../queries/getAllQuestions.gql'
import GET_ALL_ANSWERS from '../queries/getAllAnswers.gql'
import MODERATE_QUESTION from '../queries/moderateQuestion.gql'
import MODERATE_ANSWER from '../queries/moderateAnswer.gql'
import SAVE_SETTINGS from '../queries/saveSettings.gql'
import QUERY_CONFIG from '../queries/config.gql'


const ModerationTable: FC<any> = ({data: {config}}) => {
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
    questionCheck,
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
        cellRenderer: (cellData: any) => {
          const question = cellData.rowData
          return (
            <div>
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

  console.log('approvedQuestions =>', approvedQuestions)
  console.log('questionUpdate =>', questionUpdate)

  return (
    <div>
      <ButtonWithIcon
          onClick={() => handleModalToggle()}
          icon={cog}
          variation="secondary"
        >
          Settings
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
            label="Max Number of Questions"
            value={maxQuestions || 10}
            type="number"
            onChange={(e: any) =>
              setState({ ...state, maxQuestions: +e.target.value })
            }
          />
        </div>
        <div className="mt6">
          <Checkbox
            id="anonymous-option"
            name="anonymous-option"
            label="Allow Anonymous"
            checked={allowAnonymous}
            onChange={() => {
              setState({...state, allowAnonymous: !allowAnonymous})
            }}
          />
        </div>
        <div className="mt4">
          <Checkbox
            id="search-option"
            name="search-option"
            label="Allow Search"
            checked={allowSearch}
            onChange={() => {
              setState({...state, allowSearch: !allowSearch})
            }}
          />
        <div className="mt4">
          <Checkbox
            id="moderation-option"
            name="moderation-option"
            label="Allow Moderation"
            checked={allowModeration}
            onChange={() => {
              setState({...state, allowModeration: !allowModeration})
            }}
          />
        </div>
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
            Save
          </Button>
        </div>
      </Modal>

      <div className="mt6">
        <Tabs>
          <Tab
            label="Pending"
            active={currentTab === 1}
            onClick={() => setState({ ...state, currentTab: 1 })}
          >
            <div className="mt8">
              <h3>Pending Questions</h3>
              <Table
                fullWidth
                updateTableKey={questionUpdate}
                items={pendingQuestions}
                density="low"
                schema={questionSchema}
              />
            </div>

            <div className="mt8">
              <h3>Pending Answers</h3>
              <Table
                fullWidth
                updateTableKey={answerUpdate}
                items={pendingAnswers}
                density="low"
                schema={answerSchema}
              />
            </div>
          </Tab>
          <Tab
            label="Approved Questions"
            active={currentTab === 2}
            onClick={() => setState({ ...state, currentTab: 2 })}
          >
            <Table
              fullWidth
              updateTableKey={questionUpdate}
              items={approvedQuestions}
              density="low"
              schema={questionSchema}
            />
          </Tab>

          <Tab
            label="Approved Answers"
            active={currentTab === 3}
            onClick={() => setState({ ...state, currentTab: 3 })}
          >
            <Table
              fullWidth
              updateTableKey={answerUpdate}
              items={approvedAnswers}
              density="low"
              schema={answerSchema}
            />
          </Tab>
        </Tabs>
      </div>
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
