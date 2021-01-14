import React, { FC, useState, useContext, Fragment } from 'react'
import { compose, useLazyQuery, useMutation } from 'react-apollo'
import { injectIntl } from 'react-intl'
import {
  Table,
  Checkbox,
  IconArrowUp,
  IconArrowDown,
  IconShoppingCart,
  Input,
} from 'vtex.styleguide'

import GET_ALL_QUESTIONS from '../queries/getAllQuestions.gql'
import GET_ALL_ANSWERS from '../queries/getAllAnswers.gql'
import MODERATE_QUESTION from '../queries/moderateQuestion.gql'
import MODERATE_ANSWER from '../queries/moderateAnswer.gql'

const ModerationTable: FC<any> = (data) => {
  const [state, setState] = useState<any>({
    questionCheck: {},
    answerCheck: {},
    questionUpdate: '',
    answerUpdate: ''
  })

  const { questionCheck, questionUpdate, answerCheck, answerUpdate} = state

  const [
    getAllQuestions,
    {
      data: questionsData,
      called: questionsCalled,
    },
  ] = useLazyQuery(GET_ALL_QUESTIONS)

  const [
    getAllAnswers,
    {
      data: answersData,
      called: answersCalled,
    },
  ] = useLazyQuery(GET_ALL_ANSWERS)

  const [moderateQuestion] = useMutation(MODERATE_QUESTION, {
    onCompleted: (res: any) => {
      const newQC = questionCheck
      newQC[res.moderateQuestion] = !newQC[res.moderateQuestion]
      setState({
        ...state,
        questionCheck: newQC,
      })
    },
  })

  const [moderateAnswer] = useMutation(MODERATE_ANSWER, {
    onCompleted: (res:any) => {
      console.log("mutation oncomplete =>", res)
      const newAC = answerCheck
      newAC[res.moderateAnswer] = !newAC[res.moderateAnswer]
      setState({
        ...state,
        answerCheck: newAC
      })
    }
  })

  if (!questionsCalled) {
    getAllQuestions()
  }

  if (!answersCalled) {
    getAllAnswers()
  }

  const handleQuestionCheck = (question:any) => {
    const random = Math.random().toString(36).substring(7)
    setState({
      ...state,
      questionUpdate: random
    })
    moderateQuestion({
      variables: {
        id: question.id
      },
    })

    console.log("state =>", state.questionCheck)
  }

  const handleAnswerCheck = (answer:any) => {
    const random = Math.random().toString(36).substring(7)
    console.log("answer check=>", answer)
    setState({
      ...state,
      answerUpdate: random
    })
    moderateAnswer({
      variables: {
        answerId: answer.id
      }
    })
    console.log("state =>", state.answerCheck)

  }

  const questionItems = questionsData?.allQuestions || []
  const answerItems = answersData?.allAnswers || []

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
          return (
            <div>
              <Checkbox
                checked={questionCheck[question.id] || question.allowed || false}
                id="question-option"
                name="question-option"
                onChange={() => {handleQuestionCheck(question)}}
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
                checked={answerCheck[answer.id] || answer.allowed || false}
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


  return(
    <div>
        Questions
        <Table
          fullWidth
          updateTableKey={questionUpdate}
          items={questionItems}
          density="low"
          schema={questionSchema}
        />

      <div className="mt8">
        Answers
        <Table
          fullWidth
          updateTableKey={answerUpdate}
          items={answerItems}
          density="low"
          schema={answerSchema}
        />
      </div>
    </div>


  )
}

export default injectIntl((ModerationTable))

