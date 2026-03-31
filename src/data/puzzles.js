export const puzzles = [
  {
    id: 0,
    date: '2026-03-16',
    category: 'Cinema History',
    question: 'Rank these iconic films from oldest to newest',
    hint: 'By original theatrical release year',
    items: [
      { id: 1, name: 'Gone with the Wind', correctRank: 1 },       // 1939
      { id: 2, name: 'Casablanca', correctRank: 2 },               // 1942
      { id: 3, name: 'Psycho', correctRank: 3 },                   // 1960
      { id: 4, name: '2001: A Space Odyssey', correctRank: 4 },    // 1968
      { id: 5, name: 'The Godfather', correctRank: 5 },            // 1972
      { id: 6, name: 'Star Wars', correctRank: 6 },                // 1977
      { id: 7, name: 'E.T. the Extra-Terrestrial', correctRank: 7 }, // 1982
      { id: 8, name: 'Jurassic Park', correctRank: 8 },            // 1993
      { id: 9, name: 'The Dark Knight', correctRank: 9 },          // 2008
      { id: 10, name: 'Parasite', correctRank: 10 },               // 2019
    ],
    opinionPuzzle: {
      category: 'Food Opinions',
      question: 'Rank these foods from your personal favorite to least favorite',
      items: [
        { id: 1, name: 'Pizza' },
        { id: 2, name: 'Sushi' },
        { id: 3, name: 'Tacos' },
        { id: 4, name: 'Burgers' },
        { id: 5, name: 'Pasta' },
        { id: 6, name: 'Ramen' },
        { id: 7, name: 'Steak' },
        { id: 8, name: 'Fried Chicken' },
        { id: 9, name: 'Dumplings' },
        { id: 10, name: 'Ice Cream' },
      ],
    },
  },
  {
    id: 1,
    date: '2026-03-17',
    category: 'World Geography',
    question: 'Rank these countries from largest to smallest by land area',
    hint: 'By total land area in km²',
    items: [
      { id: 1, name: 'Russia', correctRank: 1 },
      { id: 2, name: 'Canada', correctRank: 2 },
      { id: 3, name: 'United States', correctRank: 3 },
      { id: 4, name: 'China', correctRank: 4 },
      { id: 5, name: 'Brazil', correctRank: 5 },
      { id: 6, name: 'Australia', correctRank: 6 },
      { id: 7, name: 'India', correctRank: 7 },
      { id: 8, name: 'Argentina', correctRank: 8 },
      { id: 9, name: 'Kazakhstan', correctRank: 9 },
      { id: 10, name: 'Algeria', correctRank: 10 },
    ],
    opinionPuzzle: {
      category: 'Travel Opinions',
      question: 'Rank these destinations from most to least desirable to visit',
      items: [
        { id: 1, name: 'Paris, France' },
        { id: 2, name: 'Tokyo, Japan' },
        { id: 3, name: 'New York, USA' },
        { id: 4, name: 'Sydney, Australia' },
        { id: 5, name: 'Rome, Italy' },
        { id: 6, name: 'Bali, Indonesia' },
        { id: 7, name: 'Santorini, Greece' },
        { id: 8, name: 'Dubai, UAE' },
        { id: 9, name: 'Machu Picchu, Peru' },
        { id: 10, name: 'Reykjavik, Iceland' },
      ],
    },
  },
  {
    id: 2,
    date: '2026-03-18',
    category: 'Pop Music',
    question: 'Rank these artists by total Grammy wins (most to fewest)',
    hint: 'As of 2024',
    items: [
      { id: 1, name: 'Beyoncé', correctRank: 1 },
      { id: 2, name: 'Jay-Z', correctRank: 2 },
      { id: 3, name: 'Adele', correctRank: 3 },
      { id: 4, name: 'Taylor Swift', correctRank: 4 },
      { id: 5, name: 'Kanye West', correctRank: 5 },
      { id: 6, name: 'Eminem', correctRank: 6 },
      { id: 7, name: 'Bruno Mars', correctRank: 7 },
      { id: 8, name: 'Billie Eilish', correctRank: 8 },
      { id: 9, name: 'Kendrick Lamar', correctRank: 9 },
      { id: 10, name: 'Harry Styles', correctRank: 10 },
    ],
    opinionPuzzle: {
      category: 'Music Opinions',
      question: 'Rank these music genres from your personal favorite to least favorite',
      items: [
        { id: 1, name: 'Pop' },
        { id: 2, name: 'Hip-Hop / Rap' },
        { id: 3, name: 'Rock' },
        { id: 4, name: 'R&B / Soul' },
        { id: 5, name: 'Country' },
        { id: 6, name: 'Electronic / EDM' },
        { id: 7, name: 'Jazz' },
        { id: 8, name: 'Classical' },
        { id: 9, name: 'Reggae' },
        { id: 10, name: 'Metal' },
      ],
    },
  },
]
