/* eslint-disable no-console */
import React, { FC, useContext, useState, useEffect } from 'react'
import { compose, graphql, useMutation, useLazyQuery } from 'react-apollo'
import { injectIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { ProductContext } from 'vtex.product-context'
import {
  Button,
  Modal,
  Spinner,
  Textarea,
  Input,
  Checkbox,
} from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { getSession } from './modules/session'

import QUERY_CONFIG from './queries/config.gql'
import ADD_QUESTION from './queries/addQuestion.gql'
import ADD_ANSWER from './queries/addAnswer.gql'
import VOTE_QUESTION from './queries/voteQuestion.gql'
import VOTE_ANSWER from './queries/voteAnswer.gql'
import MODERATE_QUESTION from './queries/moderateQuestion.gql'
import MODERATE_ANSWER from './queries/moderateAnswer.gql'
import QUERY_GET_QUESTIONS from './queries/getQuestions.gql'

import styles from './qnastyle.css'

const CSS_HANDLES = ['formContainer', 'questionsList'] as const

const useSessionResponse = () => {
  const [session, setSession] = useState()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then(sessionResponse => {
      const { response } = sessionResponse

      setSession(response)
    })
  }, [sessionPromise])

  return session
}

const QuestionsAndAnswers: FC<any> = ({ data: { config }, intl }) => {
  const [state, setState] = useState<any>({
    isModalOpen: false,
    question: null,
    votes: {},
    anonymousCheck: false,
    email: '',
    name: '',
  })

  const [
    getQuestions,
    { loading: loadingQuestions, data: questionsData, called: questionsCalled },
  ] = useLazyQuery(QUERY_GET_QUESTIONS)

  const [
    addQuestion,
    { loading: addLoading, called: questionCalled, error: questionError },
  ] = useMutation(ADD_QUESTION)

  const [
    addAnswer,
    { loading: ansLoading, called: answerCalled, error: answerError },
  ] = useMutation(ADD_ANSWER)

  const [
    voteQuestion,
    {
      loading: voteQuestionLoading,
      called: voteQuestionCalled,
      error: voteQuestionError,
    },
  ] = useMutation(VOTE_QUESTION, {
    onCompleted: (res: any) => {
      console.log('res =>', res)
      const newVotes = state.votes
      newVotes[res.voteQuestion.id] = res.voteQuestion.votes
      console.log('onCompleted =>', res.voteQuestion.votes)
      setState({
        ...state,
        votes: newVotes,
      })
      console.log('Mutation response =>', res)
    },
  })

  // User is authenticated
  // Search query for productId/UserEmail/QuestionId
  // Return same number of votes if already voted, exception will increment vote

  const [
    voteAnswer,
    {
      loading: voteAnswerLoading,
      called: voteAnswerCalled,
      error: voteAnswerError,
    },
  ] = useMutation(VOTE_ANSWER)

  const [
    moderateQuestion,
    {
      loading: moderateQuestionLoading,
      called: moderateQuestionCalled,
      error: moderateQuestionError,
    },
  ] = useMutation(MODERATE_QUESTION)

  const [
    moderateAnswer,
    {
      loading: moderateAnswerLoading,
      called: moderateAnswerCalled,
      error: moderateAnswerError,
    },
  ] = useMutation(MODERATE_ANSWER)
  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)

  const { isModalOpen, question, votes, email, name, anonymousCheck } = state

  const handleModalToggle = () => {
    setState({ ...state, isModalOpen: !isModalOpen })
  }

  console.log('QuestionsAndAnswers =>', ProductContext)
  const { product } = useContext(ProductContext) as any

  if (!addLoading && questionCalled && !questionError && isModalOpen) {
    setState({ ...state, isModalOpen: false })
  }

  console.log('Config =>', config)
  console.log('Product =>', product)
  console.log('questionsData =>', questionsData)

  if (!config) return null

  if (product && !questionsCalled) {
    getQuestions({
      variables: {
        productId: product.productId,
      },
    })
  }

  console.log('questionsData =>', questionsData)

  console.log('sessionResponse =>', sessionResponse)

  return (
    <div>
      <h2 className={styles['qna-header']}>{config.title}</h2>

      {config.search && (
        <div className={styles['qna-search-container']}>
          <input
            type="search"
            name="qna-search"
            className={styles['qna-search']}
            placeholder={intl.formatMessage({
              id: 'store/question.search.placeholder',
              defaultMessage: 'Have a question? Search for answers',
            })}
          />
        </div>
      )}

      {loadingQuestions && <Spinner />}
      {!loadingQuestions && questionsData?.questions.length && (
        <div className={handles.questionsList}>
          {questionsData.questions.map((row: any) => {
            return (
              <div key={row.id} className={styles['votes-question-container']}>
                <div className={styles.votes}>
                  <div className={styles['button-container']}>
                    <Button
                      size="small"
                      className={styles.increment}
                      onClick={() => {
                        voteQuestion({
                          variables: {
                            id: row.id,
                            email: 'test@test.com',
                            vote: 1,
                          },
                        })
                      }}
                    />
                  </div>
                  <div className={styles['vote-count']}>
                    {votes[row.id] || row.votes}
                  </div>
                  <div className={styles['vote-text']}>
                    <FormattedMessage
                      id="store/question.votes.label"
                      values={{
                        quantity: votes[row.id] || row.votes,
                      }}
                      defaultMessage="vote"
                    />
                  </div>
                  <div className={styles['button-container']}>
                    <Button
                      className={styles.decrement}
                      onClick={() => {
                        voteQuestion({
                          variables: {
                            id: row.id,
                            email: 'test@test.com',
                            vote: -1,
                          },
                        })
                      }}
                      size="small"
                    />
                  </div>
                </div>
                <div className={styles['question-answer-container']}>
                  <div className={styles['question-container']}>
                    <div className={styles['question-label']}>
                      <FormattedMessage
                        id="store/question.label"
                        defaultMessage="Question"
                      />
                      :
                    </div>
                    <a className={styles['question-text']}>{row.question}</a>
                  </div>

                  <div className={styles['no-answer']}>
                    <FormattedMessage
                      id="store/question.no-answer.text"
                      defaultMessage="No answers yet. Be the first!"
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <button className={styles['more-questions-button']}>
            <FormattedMessage
              id="store/question.more-questions.label"
              defaultMessage="See more answered questions"
            />{' '}
            (10)
          </button>
        </div>
      )}
      <div className={styles['create-question-container']}>
        <div className={styles['create-question-text']}>
          <FormattedMessage
            id="store/question.create-question.label"
            defaultMessage="Don't see the answer you're looking for?"
          />
        </div>
        <Button
          onClick={() => handleModalToggle()}
          className={styles['open-modal-button']}
        >
          <FormattedMessage
            id="store/question.create-question-button.label"
            defaultMessage="Ask a question"
          />
        </Button>
      </div>

      <div className={styles['modal-container']}>
        <Modal
          isOpen={isModalOpen}
          centered
          title={intl.formatMessage({
            id: 'store/question.modal.title',
            defaultMessage: 'Have a question? Search for answers',
          })}
          onClose={() => {
            handleModalToggle()
          }}
        >
          <div className={`${handles.formContainer} dark-gray`}>
            {addLoading && <Spinner />}

            <div className="question-email-container">
              <Input
                placeholder=""
                label={intl.formatMessage({
                  id: 'store/question.modal.name.label',
                  defaultMessage: 'Name',
                })}
                value={name}
                onChange={(e: any) =>
                  setState({ ...state, name: e.target.value })
                }
                required="true"
              />
            </div>

            <div className="question-email-container mt4">
              <Input
                placeholder=""
                helpText="Get notified when someone replies"
                label={intl.formatMessage({
                  id: 'store/question.modal.email.label',
                  defaultMessage: 'Email',
                })}
                onChange={(e: any) =>
                  setState({ ...state, email: e.target.value.trim() })
                }
                value={email}
                required="true"
              />
            </div>

            <div className="mt4">
              <Textarea
                placeholder={intl.formatMessage({
                  id: 'store/question.modal.search.placeholder',
                  defaultMessage: 'Please enter a question.',
                })}
                rows={4}
                onChange={(e: any) =>
                  setState({ ...state, question: e.target.value })
                }
                value={question}
                className={styles['question-text-box']}
              />
            </div>
            <div className="anonymousCheck mt4">
              <Checkbox
                checked={anonymousCheck}
                id=""
                label={intl.formatMessage({
                  id: 'store/question.modal.anonymous-check.label',
                  defaultMessage: 'Ask anonymously',
                })}
                name=""
                onChange={() =>
                  setState({ ...state, anonymousCheck: !anonymousCheck })
                }
              />
            </div>

            <div
              className="mt4"
              style={{
                backgroundColor: '#edf4fa',
                borderRadius: '4px',
                border: 'solid #368df7',
                borderWidth: '0 0 0 4px',
                boxSizing: 'border-box',
                padding: '12px 16px',
              }}
            >
              <FormattedMessage
                id="store/question.modal.text"
                defaultMessage="Your question might be answered by sellers, manufacturers, or customers who bought this product."
              />
            </div>

            <div className={styles['modal-buttons-container']}>
              <Button
                className={styles['submit-question-button']}
                isLoading={addLoading}
                onClick={() => {
                  addQuestion({
                    variables: {
                      productId: product.productId,
                      question,
                      name,
                      email,
                      anonymous: state.anonymousCheck,
                    },
                  })
                }}
              >
                <FormattedMessage
                  id="store/question.modal.post-button.label"
                  defaultMessage="Post"
                />
              </Button>
              <Button
                variation="tertiary"
                onClick={() => handleModalToggle()}
                className={styles['close-modal-button']}
              >
                <FormattedMessage
                  id="store/question.modal.cancel-button.label"
                  defaultMessage="Cancel"
                />
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

export default injectIntl(
  compose(
    graphql(QUERY_CONFIG, {
      options: { ssr: false },
    })
  )(QuestionsAndAnswers)
)
