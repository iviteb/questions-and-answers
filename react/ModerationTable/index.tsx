import React, { FC, useState, useContext, Fragment } from 'react'
import { compose, useLazyQuery, useMutation } from 'react-apollo'
import { injectIntl } from 'react-intl'
import {
  Table,
  Checkbox,
  Tab,
  Tabs,
} from 'vtex.styleguide'

import GET_ALL_QUESTIONS from '../queries/getAllQuestions.gql'
import GET_ALL_ANSWERS from '../queries/getAllAnswers.gql'
import MODERATE_QUESTION from '../queries/moderateQuestion.gql'
import MODERATE_ANSWER from '../queries/moderateAnswer.gql'
// import QuestionTable from './questionTable'


const ModerationTable: FC<any> = (data) => {
  const [state, setState] = useState<any>({
    questionCheck: {},
    answerCheck: {},
    questionUpdate: '',
    answerUpdate: '',
    approvedQuestions: [],
    pendingQuestions: [],
    approvedAnswers: [],
    pendingAnswers: [],
    currentTab: 1
  })

  const { questionCheck, questionUpdate, answerCheck, answerUpdate, currentTab, approvedQuestions, pendingQuestions, approvedAnswers, pendingAnswers} = state

  const [
    getAllQuestions,
    {
      data: questionsData,
      called: questionsCalled,
    },
  ] = useLazyQuery(GET_ALL_QUESTIONS, {
    onCompleted: () => {
      seperateQuestions()
    }
  })

  const [
    getAllAnswers,
    {
      data: answersData,
      called: answersCalled,
    },
  ] = useLazyQuery(GET_ALL_ANSWERS, {
    onCompleted: () => {
      seperateAnswers()
    }
  })

  const [moderateQuestion] = useMutation(MODERATE_QUESTION)
  //   , {
  //   onCompleted: (res: any) => {
  //     const newQC = questionCheck
  //     newQC[res.moderateQuestion] = !newQC[res.moderateQuestion]
  //     setState({
  //       ...state,
  //       questionCheck: newQC,
  //     })
  //   },
  // })

  const [moderateAnswer] = useMutation(MODERATE_ANSWER, {
    onCompleted: (res:any) => {
      const newAC = answerCheck
      newAC[res.moderateAnswer] = !newAC[res.moderateAnswer]
      setState({
        ...state,
        answerCheck: newAC
      })
    }
  })


  const seperateQuestions = () => {
    let newApproved:any = []
    let newPending:any = []
    const random = Math.random().toString(36).substring(7)

    questionItems?.forEach((question:any) => {
      if (question.allowed) {
        newApproved.push(question)
      } else {
        newPending.push(question)
      }
    })

    if (newApproved.length !== approvedQuestions.length || newPending.length !== pendingQuestions.length) {
      setState({
        ...state,
        approvedQuestions: newApproved,
        pendingQuestions: newPending,
        questionUpdate: random
      })
    }
  }

  const seperateAnswers = () => {
    let newApproved:any = []
    let newPending:any = []
    const random = Math.random().toString(36).substring(7)

    answerItems?.forEach((answer:any) => {
      if (answer.allowed) {
        newApproved.push(answer)
      } else {
        newPending.push(answer)
      }
    })

    if (newApproved.length !== approvedAnswers.length || newPending.length !== pendingAnswers.length) {
      setState({
        ...state,
        approvedAnswers: newApproved,
        pendingAnswers: newPending,
        answerUpdate: random
      })
    }
  }

  if (!questionsCalled) {
    getAllQuestions()
  }

  if (!answersCalled) {
    getAllAnswers()
  }

  const questionItems = questionsData?.allQuestions || []
  const answerItems = answersData?.allAnswers || []


  const handleQuestionCheck = (question:any) => {
    const random = Math.random().toString(36).substring(7)
    const newQC = questionCheck
    if (newQC[question.id]) {
      newQC[question.id] = !newQC[question.id]
    } else {
      newQC[question.id] = !question.allowed
    }

    moderateQuestion({
      variables: {
        id: question.id
      },
    })

    setState({
      ...state,
      questionCheck: newQC,
      questionUpdate: random
    })

    console.log("state =>", state)
  }

  const handleAnswerCheck = (answer:any) => {
    const random = Math.random().toString(36).substring(7)
    moderateAnswer({
      variables: {
        answerId: answer.id
      }
    })
    setState({
      ...state,
      answerUpdate: random
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
        cellRenderer: (cellData:any) => {
          const question = cellData.rowData
          let checked
          if (questionCheck[question.id]) {
            checked = questionCheck[question.id]
          } else {
            checked = question.allowed
          }
          return (
            <div>
              <Checkbox
                checked={checked}
                id="question-option"
                name="question-option"
                onChange={() => {
                  handleQuestionCheck(question)
                }}
              />
            </div>
          )
        },
      }
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
        cellRenderer: (cellData:any) => {
          const answer = cellData.rowData
          return (
            <div>
              <Checkbox
                checked={answerCheck[answer.id] || answer.allowed}
                id="answer-option"
                name="answer-option"
                onChange={() => {handleAnswerCheck(answer)}}
              />
            </div>
          )
        },
      }
    },
  }

  console.log("questionsData =>", questionsData)
  console.log("answersData =>", answersData)
  console.log("state =>", state)

  return(
    <div>
      <Tabs>
        <Tab
          label="Pending"
          active={currentTab === 1}
          onClick={() => setState({ ...state, currentTab: 1 })}>
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
          onClick={() => setState({ ...state, currentTab: 2 })}>
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
          onClick={() => setState({ ...state, currentTab: 3 })}>
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


  )
}

export default injectIntl((ModerationTable))

