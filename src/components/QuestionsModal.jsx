export default function QuestionsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn welcome-close" onClick={onClose}>✕</button>

        <div className="welcome-page">
          <h2 className="welcome-title">Questions</h2>

          <p className="faq-intro">
            Learn more about Top10, including how to access, play, and find answers to
            common questions below:
          </p>

          <div className="faq-list">
            <div className="faq-item">
              <p className="faq-q">About Top10</p>
              <p className="faq-a">
                Top10 is a daily ranking game where players have 3 attempts to guess the
                correct order of the Community Top10, and give their own opinion on the
                Daily Top10. Currently, you do not have to register or sign in to play as
                Top10 is free to play on all platforms. We do recommend creating a Top10
                account so you can play Top10 across devices or platforms while retaining
                your progress and stats.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-q">Where to Play</p>
              <p className="faq-a">
                You can play Top10 in the Games app at: "Interest hyperlink to site", or
                download the Top10 app from the App Store.
              </p>
            </div>

            <div className="faq-item">
              <p className="faq-q">When to Play</p>
              <p className="faq-a">The daily Top10 game releases at 12:00pm EST.</p>
            </div>

            <div className="faq-item">
              <p className="faq-q">Top10 Statistics</p>
              <p className="faq-a">
                After you complete a daily Top10, your basic stats appear on the end page.
                You can also view your stats during a game by selecting the bar graph icon
                at the top right of the page.
              </p>
              <ol className="faq-stats-list">
                <li># of attempts</li>
                <li>Time taken to rank the Top10</li>
                <li>Total Games Played</li>
                <li>Current Streak</li>
                <li>Max Streak</li>
              </ol>
              <p className="faq-a">
                To see more exciting advanced statistics, create a Top10 account and
                subscribe to the advanced stats plan. Confirm you are logged into your
                Top10 account or sign up for free to start saving your stats.
              </p>
              <p className="faq-note">
                Note: If you finish a Top10 after midnight EST, your streak will be broken
                and a new streak will begin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
