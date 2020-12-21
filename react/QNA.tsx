/* eslint-disable no-console */
import React, { FC, useContext, useState } from 'react'
import { compose, graphql, useMutation } from 'react-apollo'
import { injectIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { ProductContext } from 'vtex.product-context'
import { Button, Modal, Spinner, Textarea, ButtonGroup } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import QUERY_CONFIG from './queries/config.gql'
import ADD_QUESTION from './queries/addQuestion.gql'
import ADD_ANSWER from './queries/addAnswer.gql'
import VOTE_QUESTION from './queries/voteQuestion.gql'
import VOTE_ANSWER from './queries/voteAnswer.gql'
import MODERATE_QUESTION from './queries/moderateQuestion.gql'
import MODERATE_ANSWER from './queries/moderateAnswer.gql'


import styles from './qnastyle.css'

const CSS_HANDLES = ['formContainer'] as const

const QuestionsAndAnswers: FC<any> = ({ data: { config }, intl }) => {
  const [state, setState] = useState<any>({
    isModalOpen: false,
    question: null,
  })

  const [addQuestion, { loading: addLoading, called: questionCalled, error: questionError }] = useMutation(
    ADD_QUESTION
  )

  const [addAnswer, {loading: ansLoading, called: answerCalled, error: answerError}] = useMutation(
    ADD_ANSWER
  )

  const [voteQuestion, {loading: voteQuestionLoading, called: voteQuestionCalled, error: voteQuestionError}] = useMutation(
    VOTE_QUESTION
  )

  const [voteAnswer, {loading: voteAnswerLoading, called: voteAnswerCalled, error: voteAnswerError}] = useMutation(
    VOTE_ANSWER
  )

  const [moderateQuestion, {loading: moderateQuestionLoading, called: moderateQuestionCalled, error: moderateQuestionError}] = useMutation(
    MODERATE_QUESTION
  )

  const [moderateAnswer, {loading: moderateAnswerLoading, called: moderateAnswerCalled, error: moderateAnswerError}] = useMutation(
    MODERATE_ANSWER
  )
  

  const handles = useCssHandles(CSS_HANDLES)

  const { isModalOpen, question } = state

  const handleModalToggle = () => {
    setState({ ...state, isModalOpen: !isModalOpen })
  }

  if (!addLoading && questionCalled && !questionError && isModalOpen) {
    setState({ ...state, isModalOpen: false })
  }

  console.log('QuestionsAndAnswers =>', ProductContext)
  const { product } = useContext(ProductContext) as any

  console.log('Config =>', config)
  console.log('Product =>', product)

  if (!config) return null

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

      <div className={styles['votes-question-container']}>
        <div className={styles.votes}>
            
            <div className={styles['button-container']}>
              <Button 
                className={styles.increment}
                onClick={() => {
                  voteQuestion({
                    variables: {
                      questionId: question.questionId,
                      email: 'test@test.com',
                      vote: 1,
                    },
                  })
                }}
              />
            </div>
            <div className={styles['vote-text']}>
              <FormattedMessage
                id="store/question.votes.label"
                values={{
                  quantity: 3,
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
                      questionId: question.questionId,
                      email: 'test@test.com',
                      vote: -1,
                    },
                  })
                }}
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
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>

          <div className={styles['no-answer']}>
            <FormattedMessage
              id="store/question.no-answer.text"
              defaultMessage="No answers yet. Be the first!"
            />
          </div>
        </div>
      </div>

      <div className={styles['votes-question-container']}>
        <div className={styles.votes}>
          <div className={styles['button-container']}>
            <button className={styles.increment}></button>
          </div>
          <div className={styles['vote-count']}>1</div>
          <div className={styles['vote-text']}>
            <FormattedMessage
              id="store/question.votes.label"
              values={{
                quantity: 1,
              }}
              defaultMessage="vote"
            />
          </div>
          <div className={styles['button-container']}>
            <button className={styles.decrement}></button>
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
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className={styles['answer-container']}>
            <div className={styles['answer-label']}>
              <FormattedMessage
                id="store/answer.label"
                defaultMessage="Answer"
              />
              :
            </div>
            <div className={styles['answer-text']}>
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className={styles['additional-info']}>
            <FormattedMessage id="store/question.additional-info.by" /> Chris{' '}
            <FormattedMessage id="store/question.additional-info.on" /> March
            29, 2020
          </div>
        </div>
      </div>

      <div className={styles['votes-question-container']}>
        <div className={styles.votes}>
          <div className={styles['button-container']}>
            <button className={styles.increment}></button>
          </div>
          <div className={styles['vote-count']}>0</div>
          <div className={styles['vote-text']}>
            <FormattedMessage
              id="store/question.votes.label"
              values={{
                quantity: 0,
              }}
              defaultMessage="vote"
            />
          </div>
          <div className={styles['button-container']}>
            <button className={styles.decrement}></button>
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
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className={styles['answer-container']}>
            <div className={styles['answer-label']}>
              <FormattedMessage
                id="store/answer.label"
                defaultMessage="Answer"
              />
              :
            </div>
            <div className={styles['answer-text']}>
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className={styles['additional-info']}>
            <FormattedMessage id="store/question.additional-info.by" /> Chris{' '}
            <FormattedMessage id="store/question.additional-info.on" /> March
            29, 2020
          </div>
          <a className={styles['questions-dropdown']}>
            <FormattedMessage
              id="store/question.more-answers.label"
              defaultMessage="See more answers"
            />{' '}
            (2)
          </a>
          <button className={styles['collapse-button']}>
            <FormattedMessage
              id="store/question.collapse.label"
              defaultMessage="Collapse all answers"
            />
          </button>
        </div>
      </div>

      <button className={styles['more-questions-button']}>
        <FormattedMessage
          id="store/question.more-questions.label"
          defaultMessage="See more answered questions"
        />{' '}
        (10)
      </button>

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
            <Textarea
              placeholder={intl.formatMessage({
                id: 'store/question.modal.search.placeholder',
                defaultMessage: 'Please enter a question.',
              })}
              rows={4}
              onChange={(e: any) =>
                setState({ ...state, question: e.target.value.trim() })
              }
              value={question}
              className={styles['question-text-box']}
            />

            <div
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
                      name: 'Test',
                      email: 'test@test.com',
                      anonymous: false,
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
