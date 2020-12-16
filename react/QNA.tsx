/* eslint-disable no-console */
import React, { FC, useContext, useState } from 'react'
import { compose, graphql } from 'react-apollo'
import { injectIntl } from 'react-intl'

import { ProductContext } from 'vtex.product-context'
import { Button, Modal } from 'vtex.styleguide'

import QUERY_CONFIG from './queries/config.gql'

import styles from './qnastyle.css'

const QuestionsAndAnswers: FC<any> = ({ data: { config } }) => {
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
            placeholder="Have a question? Search for answers"
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
            <div className={styles['question-label']}>Question:</div>
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>

          <div className={styles['no-answer']}>
            No answers yet. Be the first!
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
            <div className={styles['question-label']}>Question:</div>
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className={styles['answer-container']}>
            <div className={styles['answer-label']}>Answer:</div>
            <div className={styles['answer-text']}>
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className={styles['additional-info']}>
            By Chris on March 29, 2020
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
            <div className={styles['question-label']}>Question:</div>
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className={styles['answer-container']}>
            <div className={styles['answer-label']}>Answer:</div>
            <div className={styles['answer-text']}>
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className={styles['additional-info']}>
            By Chris on March 29, 2020
          </div>
          <a className={styles['questions-dropdown']}>See more answers (2)</a>
          <button className={styles['collapse-button']}>
            Collapse all answers
          </button>
        </div>
      </div>

      <button className={styles['more-questions-button']}>
        See more answered questions (10)
      </button>

      <div className={styles['create-question-container']}>
        <div className={styles['create-question-text']}>Don't see the answer you're looking for?</div>
        <Button onClick={() => handleModalToggle()} className={styles['open-modal-button']}>Ask a question</Button>
      </div>

      <div className={styles['modal-container']}>
        <Modal
          isOpen={isModalOpen}
          centered
          title="Post your question"
          onClose={() => {
            handleModalToggle()
          }}
        >
          <div className="dark-gray">
            
            <form action="#" method="POST" id="question-form">
              <textarea name="" id="" placeholder="Please enter a question." rows={4} cols={50} className={styles['question-text-box']}></textarea>

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
                Your question might be answered by sellers, manufacturers, or customers who bought this product.
              </div>

            </form>

            <div className={styles['modal-buttons-container']}>
              <button type="submit" className={styles['submit-question-button']}>Post</button>
              <button onClick={() => handleModalToggle()} className={styles['close-modal-button']}>Cancel</button>  
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
