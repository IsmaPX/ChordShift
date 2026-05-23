import { fmt, sec } from './songs'

export function songsTrumpet() {
  return [
    ...hymnMelodies(),
    ...worshipMelodies(),
  ]
}

function hymnMelodies() {
  return [
    fmt('How Great Thou Art', 'Stuart Hine', 'style-ht', 3, 'G', 70, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'O Lord my God, when I in awesome wonder consider all the worlds Thy hands have made.'),
    fmt('The Old Rugged Cross', 'George Bennard', 'style-ht', 2, 'G', 72, [sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]), sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,4])], 'On a hill far away stood an old rugged cross, the emblem of suffring and shame.'),
    fmt('Blessed Assurance', 'Fanny Crosby', 'style-ht', 2, 'D', 74, [sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,1], ['D',8,1], ['A',9,2], ['D',11,4]), sec('Coro', ['D',1,2], ['G',3,2], ['D',5,2], ['A',7,2], ['D',9,2], ['G',11,2], ['D',13,2], ['A',15,2], ['D',17,4])], 'Blessed assurance, Jesus is mine, O what a foretaste of glory divine.'),
    fmt('Great Is Thy Faithfulness', 'Thomas Chisholm', 'style-ht', 2, 'G', 72, [sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'Great is Thy faithfulness, O God my Father, there is no shadow of turning with Thee.'),
    fmt('It Is Well With My Soul', 'Horatio Spafford', 'style-ht', 2, 'D', 68, [sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['F#m',7,1], ['G',8,1], ['D',9,2], ['A',11,2], ['D',13,4]), sec('Coro', ['G',1,2], ['D',3,2], ['A',5,2], ['D',7,2], ['G',9,2], ['D',11,2], ['A',13,2], ['D',15,4])], 'When peace like a river attendeth my way, when sorrows like sea billows roll.'),
    fmt('What a Friend We Have in Jesus', 'Joseph Scriven', 'style-ht', 2, 'G', 74, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]), sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,4])], 'What a friend we have in Jesus, all our sins and griefs to bear.'),
    fmt('All Hail the Power', 'Edward Perronet', 'style-ht', 3, 'G', 80, [sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,2], ['D',10,1], ['G',11,4]), sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,4])], 'All hail the power of Jesus name, let angels prostrate fall.'),
    fmt('To God Be the Glory', 'Fanny Crosby', 'style-ht', 2, 'G', 76, [sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]), sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,4])], 'To God be the glory, great things He hath done, so loved He the world that He gave us His Son.'),
    fmt('Crown Him With Many Crowns', 'Matthew Bridges', 'style-ht', 3, 'D', 82, [sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,2], ['G',15,1], ['D',16,1], ['A',17,1], ['D',18,4]), sec('Verso 2', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,2], ['G',15,1], ['D',16,1], ['A',17,1], ['D',18,4])], 'Crown Him with many crowns, the Lamb upon His throne.'),
    fmt('Holy Holy Holy', 'Reginald Heber', 'style-ht', 2, 'G', 78, [sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,2], ['D',10,1], ['G',11,4]), sec('Verso 2', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,2], ['D',10,1], ['G',11,4])], 'Holy, holy, holy, Lord God Almighty, early in the morning our song shall rise to Thee.'),
  ]
}

function worshipMelodies() {
  return [
    fmt('How He Loves', 'John Mark McMillan', 'style-wc', 3, 'G', 72, [sec('Verso 1', ['G',1,2], ['D',3,1], ['Em',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'He is jealous for me, loves like a hurricane, I am a tree.'),
    fmt('Oceans', 'Hillsong', 'style-wc', 3, 'D', 70, [sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['G',13,2], ['D',15,4]), sec('Coro', ['G',1,2], ['D',3,2], ['A',5,2], ['Bm',7,2], ['G',9,2], ['D',11,2], ['A',13,2], ['D',15,4])], 'You call me out upon the waters, the great unknown where feet may fail.'),
    fmt('Great Are You Lord', 'All Sons & Daughters', 'style-wc', 2, 'G', 76, [sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'Great are You Lord, its Your breath in our lungs, we pour out our praise.'),
    fmt('Who You Say I Am', 'Hillsong', 'style-wc', 2, 'G', 74, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'Who the Son sets free, oh is free indeed, Im a child of God, yes I am.'),
    fmt('What a Beautiful Name', 'Hillsong', 'style-wc', 3, 'D', 72, [sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['G',13,2], ['D',15,4]), sec('Coro', ['G',1,2], ['D',3,2], ['A',5,2], ['Bm',7,2], ['G',9,2], ['D',11,2], ['A',13,2], ['D',15,4])], 'What a beautiful name it is, what a beautiful name it is, the name of Jesus Christ my King.'),
    fmt('This Is Amazing Grace', 'Phil Wickham', 'style-wc', 3, 'A', 82, [sec('Verso 1', ['A',1,2], ['E',3,2], ['F#m',5,2], ['D',7,2], ['A',9,2], ['E',11,2], ['D',13,2], ['A',15,4]), sec('Coro', ['A',1,2], ['E',3,2], ['F#m',5,2], ['D',7,2], ['A',9,2], ['E',11,2], ['D',13,2], ['A',15,4])], 'This is amazing grace, this is unfailing love, that You would take my place.'),
    fmt('King of Kings', 'Hillsong', 'style-wc', 3, 'G', 78, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4]), sec('Coro', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4])], 'King of kings and Lord of lords, heaven and earth adore You.'),
    fmt('Way Maker', 'Sinach', 'style-wc', 3, 'G', 76, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'Way maker, miracle worker, promise keeper, light in the darkness.'),
    fmt('Reckless Love', 'Cory Asbury', 'style-wc', 3, 'G', 74, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4]), sec('Coro', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4])], 'Oh the overwhelming, never-ending, reckless love of God.'),
    fmt('10,000 Reasons', 'Matt Redman', 'style-wc', 2, 'G', 76, [sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['C',13,2], ['G',15,4]), sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4])], 'Bless the Lord O my soul, O my soul, worship His holy name.'),
  ]
}
