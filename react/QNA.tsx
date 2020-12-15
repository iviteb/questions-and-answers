import React, { FC } from 'react'

import styles from './qnastyle.css'

const QuestionsAndAnswers: FC = () => {
  return (
    <div>
      <h2 className={styles['qna-header']}>Customer Questions &amp; Answers</h2>

      <div className={styles['qna-search-container']}>
        <input
          type="search"
          name="qna-search"
          className={styles['qna-search']}
          placeholder="Have a question? Search for answers"
        />
      </div>

      <div className={styles['votes-question-container']}>
        <div className={styles['votes']}>
          <div className={styles['button-container']}>
            <button className={styles['increment']}></button>
          </div>
          <div className={styles['vote-count']}>1</div>
          <div className={styles['vote-text']}>vote</div>
          <div className={styles['button-container']}>
            <button className={styles['decrement']}></button>
          </div>
        </div>

        <div className={styles['question-answer-container']}>
          <div className={styles['question-container']}>
            <div className={styles['question-label']}>Question:</div>
            <a className={styles['question-text']}>
              Does the stand detach from the microphone body?
            </a>
          </div>

          <div className={styles['no-answer']}>No answers yet. Be the first!</div>
        </div>
      </div>

      <div className={styles['votes-question-container']}>
        <div className={styles['votes']}>
          <div className={styles['button-container']}>
            <button className={styles['increment']}></button>
          </div>
          <div className={styles['vote-count']}>1</div>
          <div className={styles['vote-text']}>vote</div>
          <div className={styles['button-container']}>
            <button className={styles['decrement']}></button>
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
          <div className={styles['additional-info']}>By Chris on March 29, 2020</div>
        </div>
      </div>

      <div className={styles['votes-question-container']}>
        <div className={styles['votes']}>
          <div className={styles['button-container']}>
            <button className={styles['increment']}></button>
          </div>
          <div className={styles['vote-count']}>1</div>
          <div className={styles['vote-text']}>vote</div>
          <div className={styles['button-container']}>
            <button className={styles['decrement']}></button>
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
          <div className={styles['additional-info']}>By Chris on March 29, 2020</div>
          <a className={styles['questions-dropdown']}>See more answers (2)</a>
          <button className={styles['collapse-button']}>Collapse all answers</button>
        </div>
      </div>

      <button className={styles['more-questions-button']}>
        See more answered questions (10)
      </button>
    </div>
  )
}

export default QuestionsAndAnswers
