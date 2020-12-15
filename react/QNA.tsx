import React, { FC } from 'react'

import styles from './qnastyle.css'

const QuestionsAndAnswers: FC = () => {
  return (
    <div>
      <h2 className={styles['qna-header']}>Customer Questions &amp; Answers</h2>

      <div className="qna-search-container">
        <input
          type="search"
          name="qna-search"
          className="qna-search"
          placeholder="Have a question? Search for answers"
        />
      </div>

      <div className="votes-question-container">
        <div className="votes">
          <div className="button-container">
            <button className="increment"></button>
          </div>
          <div className="vote-count">1</div>
          <div className="vote-text">vote</div>
          <div className="button-container">
            <button className="decrement"></button>
          </div>
        </div>

        <div className="question-answer-container">
          <div className="question-container">
            <div className="question-label">Question:</div>
            <a className="question-text">
              Does the stand detach from the microphone body?
            </a>
          </div>

          <div className="no-answer">No answers yet. Be the first!</div>
        </div>
      </div>

      <div className="votes-question-container">
        <div className="votes">
          <div className="button-container">
            <button className="increment"></button>
          </div>
          <div className="vote-count">1</div>
          <div className="vote-text">vote</div>
          <div className="button-container">
            <button className="decrement"></button>
          </div>
        </div>

        <div className="question-answer-container">
          <div className="question-container">
            <div className="question-label">Question:</div>
            <a className="question-text">
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className="answer-container">
            <div className="answer-label">Answer:</div>
            <div className="answer-text">
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className="additional-info">By Chris on March 29, 2020</div>
        </div>
      </div>

      <div className="votes-question-container">
        <div className="votes">
          <div className="button-container">
            <button className="increment"></button>
          </div>
          <div className="vote-count">1</div>
          <div className="vote-text">vote</div>
          <div className="button-container">
            <button className="decrement"></button>
          </div>
        </div>

        <div className="question-answer-container">
          <div className="question-container">
            <div className="question-label">Question:</div>
            <a className="question-text">
              Does the stand detach from the microphone body?
            </a>
          </div>
          <div className="answer-container">
            <div className="answer-label">Answer:</div>
            <div className="answer-text">
              Thanks for your question! It is important that you store your
              brewer in a safe and frost free environment. If your brewer has
              been in an environment below freezing, let it warm to room
              temperature for at least 2 hours before using. We hope this is
              helpful!
            </div>
          </div>
          <div className="additional-info">By Chris on March 29, 2020</div>
          <a className="questions-dropdown">See more answers (2)</a>
          <button className="collapse-button">Collapse all answers</button>
        </div>
      </div>

      <button className="more-questions-button">
        See more answered questions (10)
      </button>
    </div>
  )
}

export default QuestionsAndAnswers
