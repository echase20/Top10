const TIPS = [
  {
    title: 'Top-Down Approach',
    desc: "Start by focusing on what you think are the best or most obvious choices for the #1 spot and work your way down the list. This strategy works well when you feel confident about the top-ranked items of the specific topic. Once you secure the top position, it becomes easier to sort the rest of the items in descending order of importance.",
  },
  {
    title: 'Bottom-Up Approach',
    desc: "In contrast to the top-down strategy, the bottom-up approach involves identifying the worst or least likely item for the category first and placing it at #10. From there, you work upwards, progressively filling in the list with items of increasing importance. This method can help you make decisions more easily by eliminating the worst options first, allowing you to focus on what's left without the pressure of guessing the top items too soon.",
  },
  {
    title: 'Middle-Out Approach',
    desc: "If you're unsure of the absolute best or worst choices, the middle-out approach might suit you. Start by selecting items you feel are most likely to land in the middle of the ranking, placing them around spots #4, #5 and #6. From there, you can work your way up and down, fine-tuning the top and bottom positions based on what feels right. This can be a balanced way to hedge your bets and avoid making costly mistakes at the top or bottom of the list.",
  },
  {
    title: 'Category Familiarity',
    desc: 'If you\'re an expert or familiar with the category, use your knowledge to guide your decisions. Lean on experience or widely held opinions about the topic to match the community. For example, if the category is "Best Movie Franchises," knowledge about box office hits, popular franchises, and cultural impact can help you rank more effectively.',
  },
  {
    title: 'Context Clues',
    desc: 'Some categories may offer subtle clues in the list itself. Pay attention to any hints or cues about trends or popular opinions. For example, in a category about "Best Pizza Toppings," remember what\'s most popular based on current food trends or recent social media posts. Picking up on these contextual clues can give you an edge.',
  },
]

export default function TipsModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn welcome-close" onClick={onClose}>✕</button>

        <div className="welcome-page">
          <h2 className="welcome-title">Gameplay Strategies for Top10er's</h2>
          <ol className="tips-list">
            {TIPS.map((tip, i) => (
              <li key={i} className="tips-item">
                <span className="tips-item-title">{tip.title}</span>
                <p className="tips-item-desc">{tip.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
