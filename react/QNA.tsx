/* eslint-disable no-console */
import React, { FC, useContext, useState } from 'react'
import { compose, graphql } from 'react-apollo'
import { injectIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { ProductContext } from 'vtex.product-context'
import { Button, Modal } from 'vtex.styleguide'

import QUERY_CONFIG from './queries/config.gql'

import styles from './qnastyle.css'

const QuestionsAndAnswers: FC<any> = ({ data: { config }, intl }) => {
  const [state, setState] = useState<any>({
    isModalOpen: false,
  })

  const { isModalOpen } = state

  const handleModalToggle = () => {
    setState({ ...state, isModalOpen: !isModalOpen })
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
            <button className={styles.increment}></button>
          </div>
          <div className={styles['vote-count']}>1</div>
          <div className={styles['vote-text']}>vote</div>
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
          <div className={styles['vote-text']}>vote</div>
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
            <FormattedMessage id="store/question.additional-info.by"/> Chris <FormattedMessage id="store/question.additional-info.on"/> March 29, 2020
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
            <FormattedMessage id="store/question.additional-info.by"/> Chris <FormattedMessage id="store/question.additional-info.on"/> March 29, 2020
          </div>
          <a className={styles['questions-dropdown']}>
            <FormattedMessage
                id="store/question.more-answers.label"
                defaultMessage="See more answers"
              /> (2)</a>
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
        /> (10)
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
          <div className="dark-gray">
            <form action="#" method="POST" id="question-form">
              <textarea
                name=""
                id=""
                placeholder={intl.formatMessage({
                  id: "store/question.modal.search.placeholder",
                  defaultMessage: "Please enter a question.",
                })}
                rows={4}
                cols={50}
                className={styles['question-text-box']}
              ></textarea>

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
            </form>

            <div className={styles['modal-buttons-container']}>
              <button
                type="submit"
                className={styles['submit-question-button']}
              >
                <FormattedMessage
                  id="store/question.modal.post-button.label"
                  defaultMessage="Post"
                />
              </button>
              <button
                onClick={() => handleModalToggle()}
                className={styles['close-modal-button']}
              >
                <FormattedMessage
                  id="store/question.modal.cancel-button.label"
                  defaultMessage="Cancel"
                />
              </button>
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
