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
  ButtonWithIcon,
  IconCaretUp,
  IconCaretDown,
  InputSearch,
} from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import { getSession } from './modules/session'
import QUERY_CONFIG from './queries/config.gql'
import ADD_QUESTION from './queries/addQuestion.gql'
import ADD_ANSWER from './queries/addAnswer.gql'
import VOTE_QUESTION from './queries/voteQuestion.gql'
import VOTE_ANSWER from './queries/voteAnswer.gql'
import QUERY_GET_QUESTIONS from './queries/getQuestions.gql'
import SEARCH_QUESTIONS from './queries/searchQuestions.gql'
import storageFactory from './utils/storage'
import styles from './qnastyle.css'
import { settings } from 'cluster'

const CSS_HANDLES = ['formContainer', 'questionsList', 'thumbsIcon', 'openAnswerModalContainer', 'moreQuestions',
                     'lessQuestions', 'answerHelpful', 'thumbsIconContainer', 'questionAnswerContainer'] as const
let timeout: any = null
const localStore = storageFactory(() => sessionStorage)

const useSessionResponse = () => {
  const [session, setSession] = useState()
  const sessionPromise = getSession()

  useEffect(() => {
    if (!sessionPromise) {
      return
    }

    sessionPromise.then((sessionResponse) => {
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
    ansVotes: {},
    anonymousCheck: false,
    answerAnonymousCheck: false,
    email: '',
    name: '',
    isAnswerModalOpen: false,
    answer: '',
    currentQuestion: null,
    questionList: null,
    showAllQuestions: false,
    showAllAnswers: {},
    search: '',
    subscribeCheck: false,
  })
  const {
    isModalOpen,
    question,
    showAllAnswers,
    currentQuestion,
    votes,
    search,
    email,
    name,
    ansVotes,
    anonymousCheck,
    isAnswerModalOpen,
    answer,
    showAllQuestions,
    subscribeCheck,
    questionList,
    answerAnonymousCheck,
  } = state

  const [
    getQuestions,
    {
      loading: loadingQuestions,
      data: questionsData,
      called: questionsCalled,
      refetch,
    },
  ] = useLazyQuery(QUERY_GET_QUESTIONS, {
    fetchPolicy: 'network-only',
  })

  const [
    addQuestion,
    { loading: addLoading, called: questionCalled, error: questionError },
  ] = useMutation(ADD_QUESTION, {
    onCompleted: (questionRes) => {
      const newQuestionList = questionList
      newQuestionList.push({
        name,
        email,
        question,
        id: questionRes.addQuestion,
        anonymous: anonymousCheck,
        votes: 0,
        allowed: true
      })
      setState({ ...state, questionList: newQuestionList })
    }
  })

  const [
    addAnswer,
    { loading: ansLoading, called: answerCalled, error: answerError },
  ] = useMutation(ADD_ANSWER, {
    onCompleted: (answerRes) => {
      const newQuestionList = questionList.map((q:any) => {
        if (q.id === currentQuestion.id) {
          if (!q.answers) {
            q.answers = []
          }
          q.answers.push({
            name,
            email,
            answer,
            id: answerRes.addAnswer,
            anonymous: answerAnonymousCheck,
            votes: 0,
            allowed: true,
            questionId: q.id
          })
        }

        return q
      })

      setState({ ...state, questionList: newQuestionList })
    }
  })

  const [voteQuestion] = useMutation(VOTE_QUESTION, {
    onCompleted: (res: any) => {
      const newVotes = state.votes
      newVotes[res.voteQuestion.id] = res.voteQuestion.votes
      setState({
        ...state,
        votes: newVotes,
      })
      localStore.setItem(res.voteQuestion.id, 'true')
    },
  })

  const [voteAnswer] = useMutation(VOTE_ANSWER, {
    onCompleted: (res: any) => {
      const newVotes = state.ansVotes
      newVotes[res.voteAnswer.id] = res.voteAnswer.votes
      setState({
        ...state,
        ansVotes: newVotes,
      })
      localStore.setItem(res.voteAnswer.id, 'true')
      refetch()
    },
  })

  const [searchQuestions] = useLazyQuery(SEARCH_QUESTIONS, {
    onCompleted: (res: any) => {
      if (res && res.search.length && res.search !== questionList) {
        setState({ ...state, questionList: res.search })
      }
    },
  })

  const sessionResponse: any = useSessionResponse()
  const handles = useCssHandles(CSS_HANDLES)

  const handleModalToggle = () => {
    setState({ ...state, isModalOpen: !isModalOpen })
  }

  const handleAnswerModalToggle = () => {
    setState({ ...state, isAnswerModalOpen: !isAnswerModalOpen })
  }

  const updateCurrentQuestion = (row: any) => {
    setState({ ...state, isAnswerModalOpen: true, currentQuestion: row })
  }

  const hideAnswerButton = (q: any) => {
    if (q.answers && q.answers.length > 1) {
      return true
    }

    return false
  }

  const handleSearch = (e: any) => {
    const { value } = e.target
    setState({ ...state, search: value })
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      searchQuestions({
        variables: {
          keyword: value,
          productId: product.productId
        },
      })
    }, 1000)
  }

  const clearSearch = () => {
    if (!search) {
      return
    }

    const newQuestionList = questionsData.questions.filter(
      (_: any, index: any) => {
        return index < 3
      })

      setState({
      ...state,
      search: '',
      showAllQuestions: false,
      questionList: newQuestionList
    })
  }

  const toggleShowAnswers = (questionId: any) => {
    if (showAllAnswers[questionId]) {
      const answers = showAllAnswers
      answers[questionId] = !answers[questionId]
      setState({ ...state, showAllAnswers: answers })
    } else {
      const answers = showAllAnswers
      answers[questionId] = true
      setState({ ...state, showAllAnswers: answers })
    }
  }

  const { product } = useContext(ProductContext) as any

  if (!addLoading && questionCalled && !questionError && isModalOpen) {
    setState({ ...state, isModalOpen: false })
  }

  if (!ansLoading && answerCalled && !answerError && isAnswerModalOpen) {
    setState({ ...state, isAnswerModalOpen: false })
  }

  if (!config) return null

  if (product && !questionsCalled && !search) {
    getQuestions({
      variables: {
        productId: product.productId,
      },
    })
  }

  if (questionsData && !questionList && !search) {
    const newQuestionList = questionsData.questions.filter(
      (_: any, index: any) => {
        return showAllQuestions ? true : index < 3
      }
    )
    setState({
      ...state,
      questionList: newQuestionList,
    })
  }

  const checkFill = (answerId: any) => {
    return !!localStore.getItem(answerId)
  }


  if (sessionResponse?.namespaces?.profile?.email?.value && !email) {
    setState({
      ...state,
      email: sessionResponse?.namespaces?.profile?.email?.value,
    })
  }

  return (
    <div className="ma4">
      <div className="ma4">
        <h2 className={styles['qna-header']}>{config.title}</h2>
      </div>

      {(config.search && questionList?.length > 1) && (
        <div className="ma4">
          <InputSearch
            placeholder="Have a question? Search for answers"
            value={search}
            size="regular"
            onChange={(e: any) => {
              handleSearch(e)
            }}
            onClear={() => {
              clearSearch()
            }}
          />
        </div>
      )}

      {loadingQuestions && <Spinner />}
      {!loadingQuestions && !!questionList?.length && (
        <div className={handles.questionsList}>
          {questionList.map((row: any) => {
            return (
              <div key={row.id} className={styles['votes-question-container']}>
                <div className={styles.votes}>
                  <div className={styles['button-container']}>
                    <ButtonWithIcon
                      size="small"
                      variation="tertiary"
                      className={styles.increment}
                      icon={<IconCaretUp />}
                      onClick={() => {
                        if (!localStore.getItem(row.id)) {
                          voteQuestion({
                            variables: {
                              id: row.id,
                              email,
                              vote: 1,
                            },
                          })
                        }
                      }}
                    />
                  </div>
                  <div className={styles['vote-count']}>
                    {votes[row.id] || row.votes || 0}
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
                  <div className="mt3">
                    <ButtonWithIcon
                      className={styles.decrement}
                      size="small"
                      variation="tertiary"
                      icon={<IconCaretDown />}
                      onClick={() => {
                        if (!localStore.getItem(row.id)) {
                          voteQuestion({
                            variables: {
                              id: row.id,
                              email,
                              vote: -1,
                            },
                          })
                        }
                      }}
                    />
                  </div>
                </div>

                <div className={`${handles.questionAnswerContainer}`}>
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

                  {!row.answers?.length && (
                    <div className={styles['no-answer']}>
                      <FormattedMessage
                        id="store/question.no-answer.text"
                        defaultMessage="No answers yet. Be the first!"
                      />
                    </div>
                  )}

                  <div className={styles['answer-container']}>
                    {!!row.answers?.length && (
                      <div className={styles['answer-label']}>
                        <FormattedMessage
                          id="store/answer.label"
                          defaultMessage="No answers yet. Be the first!"
                        />
                        :
                      </div>
                    )}
                    <div className={styles['answer-items-container']}>
                      {row.answers.map((answerItem: any, index: any) => {
                        return (
                          <div className={styles['answer-item']} key={index}>
                            <div className={styles['answer-item-text']}>
                              {answerItem.answer}
                            </div>
                            <div className={styles['answer-item-info']}>
                              By{' '}
                              <span>
                                {answerItem.anonymous
                                  ? 'anonymous'
                                  : answerItem.name}
                              </span>
                            </div>
                            <div
                              className={styles['answer-item-button-container']}
                            >
                              {(answerItem.votes ||
                                ansVotes[answerItem.id]) && (
                                <div className={`${handles.answerHelpful} mt4`}>
                                  {ansVotes[answerItem.id] || answerItem.votes}{' '}
                                  <FormattedMessage
                                    id="store/question.answer-helpful.text"
                                    defaultMessage="people have found this helpful"
                                    values={{
                                      quantity:
                                        ansVotes[answerItem.id] ||
                                        answerItem.votes,
                                    }}
                                  />
                                </div>
                              )}

                              <div className={`${handles.thumbsIconContainer} mt3`}>
                                <Button
                                  size="small"
                                  variation="tertiary"
                                  className={styles.increment}
                                  onClick={() => {
                                    if (!localStore.getItem(answerItem.id)) {
                                      voteAnswer({
                                        variables: {
                                          id: answerItem.id,
                                          questionId: row.id,
                                          email,
                                        },
                                      })
                                    }
                                  }}
                                >
                                  <span
                                    className={`${handles.thumbsIcon} ${
                                      checkFill(answerItem.id)
                                        ? styles.fill
                                        : styles.outline
                                    } ${styles.iconSize}`}
                                  />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {hideAnswerButton(row) && (
                    <div className="ml6 mt4">
                      <Button
                        size="small"
                        variation="tertiary"
                        onClick={() => {
                          toggleShowAnswers(row.id)
                        }}
                      >
                        <FormattedMessage
                          id="store/question.more-answers-button.label"
                          defaultMessage="Show all answers"
                          values={{
                            quantity: showAllAnswers[row.id] ? 1 : 0,
                          }}
                        />{' '}
                        {!showAllAnswers[row.id] &&
                          `(${  row.answers?.length - 1  })`}
                      </Button>
                    </div>
                  )}

                  <div className={`${handles.openAnswerModalContainer} open-answer-modal-container ma6`}>
                    <Button
                      onClick={() => {
                        updateCurrentQuestion(row)
                      }}
                      className={styles['open-answer-modal-button']}
                      size="small"
                      variation="secondary"
                    >
                      <FormattedMessage
                        id="store/question.create-answer-button.label"
                        defaultMessage="Answer question"
                      />
                    </Button>
                  </div>

                  <div className={styles['answer-modal-container']}>
                    <Modal
                      isOpen={isAnswerModalOpen}
                      centered
                      title={intl.formatMessage({
                        id: 'store/answer.modal.title',
                        defaultMessage: 'Post your answer',
                      })}
                      onClose={() => {
                        handleAnswerModalToggle()
                      }}
                    >
                      <div className={`${handles.formContainer} dark-gray`}>
                        <div className="answer-email-container">
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
                            required={true}
                          />
                        </div>

                        <div className="answer-email-container mt4">
                          <Input
                            placeholder=""
                            label={intl.formatMessage({
                              id: 'store/question.modal.email.label',
                              defaultMessage: 'Email',
                            })}
                            onChange={(e: any) =>
                              setState({
                                ...state,
                                email: e.target.value.trim(),
                              })
                            }
                            value={email}
                            required={true}
                          />
                        </div>

                        <div className="mt4">
                          <Textarea
                            placeholder={intl.formatMessage({
                              id: 'store/answer.modal.search.placeholder',
                              defaultMessage: 'Please enter your answer',
                            })}
                            rows={4}
                            onChange={(e: any) =>
                              setState({ ...state, answer: e.target.value })
                            }
                            value={answer}
                            className={styles['answer-text-box']}
                          />
                        </div>

                        {config.anonymous && (
                          <div className="anonymousCheck mt4">
                            <Checkbox
                              checked={answerAnonymousCheck}
                              id=""
                              label={intl.formatMessage({
                                id:
                                  'store/question.modal.answer-anonymous-check.label',
                                defaultMessage: 'Answer anonymously',
                              })}
                              name=""
                              onChange={() =>
                                setState({
                                  ...state,
                                  answerAnonymousCheck: !answerAnonymousCheck,
                                })
                              }
                            />
                          </div>
                        )}

                        <div className={styles['modal-buttons-container']}>
                          <Button
                            className={styles['submit-answer-button']}
                            isLoading={ansLoading}
                            disabled={!(answer && name && email)}
                            onClick={() => {
                              addAnswer({
                                variables: {
                                  questionId: currentQuestion.id,
                                  answer,
                                  name,
                                  email,
                                  anonymous: answerAnonymousCheck,
                                  allowed: !config.moderation
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
                            onClick={() => handleAnswerModalToggle()}
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
              </div>
            )
          })}

          {!showAllQuestions &&
            !search &&
            questionsData?.questions.length > 3 &&
            questionList.length !== questionsData.questions.length && (
              <div className={`${handles.moreQuestions} ml8`}>
                <Button
                  size="regular"
                  variation="danger-tertiary"
                  onClick={() => {
                    setState({
                      ...state,
                      showAllQuestions: true,
                      questionList: questionsData.questions,
                    })
                  }}
                >
                  <FormattedMessage
                    id="store/question.more-questions.label"
                    defaultMessage="See more answered questions"
                  />{' '}
                </Button>
              </div>
            )}

          {showAllQuestions && !search && (
            <div className={`${handles.lessQuestions} ml8`}>
              <Button
                size="regular"
                variation="danger-tertiary"
                onClick={() => {
                  setState({
                    ...state,
                    showAllQuestions: false,
                    questionList: null,
                  })
                }}
              >
                <FormattedMessage
                  id="store/question.less-questions.label"
                  defaultMessage="Collapse questions"
                />
              </Button>
            </div>
          )}
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
          variation="danger"
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
            defaultMessage: 'Post your question',
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
                required={true}
              />
            </div>

            <div className="question-email-container mt4">
              <Input
                placeholder=""
                label={intl.formatMessage({
                  id: 'store/question.modal.email.label',
                  defaultMessage: 'Email',
                })}
                onChange={(e: any) =>
                  setState({ ...state, email: e.target.value.trim() })
                }
                value={email}
                required={true}
              />
              <Checkbox
                checked={subscribeCheck}
                label={intl.formatMessage({
                  id:
                    'store/question.modal.question-subscribe-check.label',
                  defaultMessage: 'Subscribe to answers',
                })}
                onChange={() =>
                  setState({
                    ...state,
                    subscribeCheck: !subscribeCheck,
                  })
                }
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
            {config.anonymous && (
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
            )}

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

            <div className="mt4">
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

              <Button
                className={styles['submit-question-button']}
                isLoading={addLoading}
                disabled={!(question && name && email)}
                onClick={() => {
                  addQuestion({
                    variables: {
                      productId: product.productId,
                      question,
                      name,
                      email,
                      anonymous: anonymousCheck,
                      allowed: !config.moderation,
                      subscribed: subscribeCheck
                    },
                  })
                }}
              >
                <FormattedMessage
                  id="store/question.modal.post-button.label"
                  defaultMessage="Post"
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
