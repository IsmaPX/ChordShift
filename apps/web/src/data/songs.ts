import { songsGuitar } from './songsGuitar'
import { songsTrumpet } from './songsTrumpet'

interface SeedChord {
  chord: string
  beat: number
  duration: number
}

interface SeedSection {
  name: string
  chords: SeedChord[]
}

export function chords(patterns: [string, number, number][]): SeedChord[] {
  return patterns.map(([chord, beat, duration]) => ({ chord, beat, duration }))
}

export function sec(name: string, ...patterns: [string, number, number][]): SeedSection {
  return { name, chords: chords(patterns) }
}

export function fmt(title: string, artist: string, style: string, diff: number, key: string, bpm: number, sections: SeedSection[], lyrics?: string) {
  return {
    id: `song-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`,
    title, artist, style_id: style, difficulty: diff, key_signature: key, bpm,
    chord_data: { sections }, lyrics, is_published: true,
  }
}

interface SeedSong {
  id: string
  title: string
  artist: string
  style_id: string
  difficulty: number
  key_signature: string
  bpm: number
  chord_data: { sections: SeedSection[] }
  lyrics?: string
  is_published: boolean
}

function hymns(): SeedSong[] {
  return [
    fmt('Amazing Grace', 'John Newton', 'style-ht', 2, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,2]),
      sec('Verso 2', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,2]),
      sec('Coro', ['G',1,2], ['D',3,2], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,2]),
    ], 'Amazing grace! How sweet the sound\nThat saved a wretch like me.\nI once was lost, but now am found,\nWas blind, but now I see.'),
    fmt('Holy Holy Holy', 'Reginald Heber', 'style-ht', 2, 'E', 80, [
      sec('Verso 1', ['E',1,2], ['A',3,1], ['E',4,1], ['B',5,2], ['E',7,1], ['A',8,1], ['E',9,2], ['B',11,2], ['E',13,4]),
      sec('Verso 2', ['E',1,2], ['A',3,1], ['E',4,1], ['B',5,2], ['E',7,1], ['A',8,1], ['E',9,2], ['B',11,2], ['E',13,4]),
    ], 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee.'),
    fmt('How Firm a Foundation', 'John Rippon', 'style-ht', 2, 'D', 76, [
      sec('Verso 1', ['D',1,1], ['G',2,1], ['D',3,2], ['A',5,1], ['D',6,1], ['G',7,1], ['D',8,1], ['A',9,1], ['D',10,4]),
      sec('Verso 2', ['D',1,1], ['G',2,1], ['D',3,2], ['A',5,1], ['D',6,1], ['G',7,1], ['D',8,1], ['A',9,1], ['D',10,4]),
    ], 'How firm a foundation, ye saints of the Lord,\nIs laid for your faith in His excellent Word!'),
    fmt('It Is Well With My Soul', 'Horatio Spafford', 'style-bp', 2, 'D', 70, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['F#m',7,1], ['G',8,1], ['D',9,2], ['A',11,1], ['D',12,2]),
      sec('Coro', ['D',1,2], ['G',3,1], ['A',4,1], ['D',5,2], ['Bm',7,2], ['G',9,2], ['A',11,2], ['D',13,4]),
    ], 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll.'),
    fmt('Blessed Assurance', 'Fanny Crosby', 'style-ht', 2, 'D', 88, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
      sec('Coro', ['A',1,2], ['D',3,2], ['A',5,2], ['D',7,2], ['G',9,2], ['D',11,2], ['A',13,2], ['D',15,4]),
    ], 'Blessed assurance, Jesus is mine!\nOh, what a foretaste of glory divine!'),
    fmt('What a Friend We Have in Jesus', 'Joseph Scriven', 'style-ht', 1, 'F', 76, [
      sec('Verso 1', ['F',1,1], ['C',2,1], ['F',3,2], ['Bb',5,1], ['F',6,1], ['C',7,1], ['F',8,2]),
      sec('Verso 2', ['F',1,1], ['C',2,1], ['F',3,2], ['Bb',5,1], ['F',6,1], ['C',7,1], ['F',8,2]),
    ], 'What a Friend we have in Jesus,\nAll our sins and griefs to bear!'),
    fmt('Just As I Am', 'Charlotte Elliott', 'style-ht', 1, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Just as I am, without one plea,\nBut that Thy blood was shed for me.'),
    fmt('Rock of Ages', 'Augustus Toplady', 'style-ht', 1, 'C', 70, [
      sec('Verso 1', ['C',1,2], ['G',3,1], ['C',4,1], ['F',5,2], ['C',7,2], ['G',9,2], ['C',11,4]),
      sec('Verso 2', ['C',1,2], ['G',3,1], ['C',4,1], ['F',5,2], ['C',7,2], ['G',9,2], ['C',11,4]),
    ], 'Rock of Ages, cleft for me,\nLet me hide myself in Thee.'),
    fmt('Come Thou Fount', 'Robert Robinson', 'style-ht', 2, 'G', 80, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['Em',3,1], ['C',4,1], ['G',5,1], ['D',6,1], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,2]),
      sec('Verso 2', ['G',1,1], ['D',2,1], ['Em',3,1], ['C',4,1], ['G',5,1], ['D',6,1], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,2]),
    ], 'Come, Thou Fount of every blessing,\nTune my heart to sing Thy grace.'),
    fmt('All Creatures of Our God and King', 'Francis of Assisi', 'style-ht', 2, 'C', 84, [
      sec('Verso 1', ['C',1,1], ['F',2,1], ['C',3,2], ['G',5,1], ['C',6,1], ['F',7,1], ['C',8,1], ['G',9,1], ['C',10,4]),
      sec('Verso 2', ['C',1,1], ['F',2,1], ['C',3,2], ['G',5,1], ['C',6,1], ['F',7,1], ['C',8,1], ['G',9,1], ['C',10,4]),
    ], 'All creatures of our God and King,\nLift up your voice and with us sing.'),
    fmt('Be Thou My Vision', 'Irish traditional (8th c.)', 'style-ht', 2, 'D', 76, [
      sec('Verso 1', ['D',1,2], ['Em',3,1], ['A',4,1], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,1], ['D',12,2]),
      sec('Verso 2', ['D',1,2], ['Em',3,1], ['A',4,1], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,1], ['D',12,2]),
    ], 'Be Thou my Vision, O Lord of my heart.\nNaught be all else to me, save that Thou art.'),
    fmt('This Is My Father World', 'Maltbie Babcock', 'style-ht', 1, 'G', 80, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
    ], 'This is my Father world,\nAnd to my listening ears.'),
    fmt('I Need Thee Every Hour', 'Annie Hawks', 'style-ht', 1, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
      sec('Coro', ['D',1,2], ['G',3,1], ['D',4,1], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'I need Thee every hour,\nMost gracious Lord.'),
    fmt('Nearer My God to Thee', 'Sarah Adams', 'style-ht', 2, 'C', 76, [
      sec('Verso 1', ['C',1,2], ['G',3,2], ['Am',5,2], ['Em',7,1], ['F',8,1], ['C',9,2], ['G',11,1], ['C',12,4]),
      sec('Verso 2', ['C',1,2], ['G',3,2], ['Am',5,2], ['Em',7,1], ['F',8,1], ['C',9,2], ['G',11,1], ['C',12,4]),
    ], 'Nearer, my God, to Thee,\nNearer to Thee.'),
    fmt('Abide With Me', 'Henry Lyte', 'style-ht', 2, 'Eb', 70, [
      sec('Verso 1', ['Eb',1,2], ['Bb',3,1], ['Eb',4,1], ['Ab',5,2], ['Eb',7,2], ['Bb',9,1], ['Eb',10,2]),
      sec('Verso 2', ['Eb',1,2], ['Bb',3,1], ['Eb',4,1], ['Ab',5,2], ['Eb',7,2], ['Bb',9,1], ['Eb',10,2]),
    ], 'Abide with me; fast falls the eventide.\nThe darkness deepens; Lord with me abide.'),
    fmt('The Old Rugged Cross', 'George Bennard', 'style-ht', 2, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,1], ['C',8,1], ['G',9,2], ['D',11,2], ['G',13,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'On a hill far away stood an old rugged cross,\nThe emblem of suffering and shame.'),
    fmt('Leaning on the Everlasting Arms', 'Elisha Hoffman', 'style-ht', 1, 'A', 84, [
      sec('Verso 1', ['A',1,1], ['D',2,1], ['A',3,2], ['E',5,1], ['A',6,1], ['D',7,1], ['A',8,1], ['E',9,1], ['A',10,4]),
      sec('Coro', ['A',1,2], ['D',3,2], ['A',5,2], ['E',7,2], ['A',9,2], ['D',11,2], ['A',13,4]),
    ], 'What a fellowship, what a joy divine,\nLeaning on the everlasting arms.'),
    fmt('In the Garden', 'C. Austin Miles', 'style-bp', 2, 'F', 72, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,1], ['Bb',6,1], ['F',7,2], ['C',9,2], ['F',11,4]),
      sec('Coro', ['F',1,2], ['Dm',3,2], ['Bb',5,1], ['F',6,1], ['C',7,2], ['F',9,2], ['C',11,1], ['F',12,4]),
    ], 'I come to the garden alone,\nWhile the dew is still on the roses.'),
    fmt('Softly and Tenderly', 'Will Thompson', 'style-bp', 1, 'G', 70, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Softly and tenderly Jesus is calling,\nCalling for you and for me.'),
    fmt('Great Is Thy Faithfulness', 'Thomas Chisholm', 'style-wc', 2, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,1], ['D',10,1], ['G',11,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Great is Thy faithfulness, O God my Father.\nThere is no shadow of turning with Thee.'),
    fmt('Praise to the Lord Almighty', 'Joachim Neander', 'style-ht', 2, 'G', 84, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
    ], 'Praise to the Lord, the Almighty, the King of creation!\nO my soul, praise Him, for He is thy health and salvation!'),
    fmt('O for a Thousand Tongues', 'Charles Wesley', 'style-ht', 2, 'G', 80, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,2], ['G',9,1], ['D',10,1], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
      sec('Verso 2', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,2], ['G',9,1], ['D',10,1], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
    ], 'O for a thousand tongues to sing\nMy great Redeemer praise!'),
    fmt('How Great Thou Art', 'Stuart Hine', 'style-wc', 2, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'O Lord my God, when I in awesome wonder\nConsider all the works Thy hands have made.'),
    fmt('Take Time to Be Holy', 'William Longstaff', 'style-sk', 1, 'G', 66, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Take time to be holy, speak oft with thy Lord.\nAbide in Him always, and feed on His Word.'),
    fmt('Turn Your Eyes Upon Jesus', 'Helen Lemmel', 'style-wc', 1, 'D', 72, [
      sec('Verso 1', ['D',1,2], ['A',3,1], ['D',4,1], ['G',5,2], ['D',7,1], ['A',8,1], ['D',9,2], ['Em',11,1], ['A',12,1], ['D',13,4]),
      sec('Coro', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['G',13,2], ['D',15,4]),
    ], 'O soul, are you weary and troubled?\nNo light in the darkness you see?'),
    fmt('To God Be the Glory', 'Fanny Crosby', 'style-ht', 2, 'A', 80, [
      sec('Verso 1', ['A',1,2], ['D',3,1], ['A',4,1], ['E',5,2], ['A',7,1], ['D',8,1], ['A',9,2], ['E',11,2], ['A',13,4]),
      sec('Coro', ['A',1,2], ['D',3,2], ['A',5,1], ['E',6,1], ['A',7,2], ['D',9,2], ['E',11,2], ['A',13,4]),
    ], 'To God be the glory, great things He hath done!\nSo loved He the world that He gave us His Son.'),
    fmt('I Surrender All', 'Judson Van DeVenter', 'style-bp', 1, 'F', 70, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,1], ['Bb',6,1], ['F',7,2], ['C',9,2], ['F',11,4]),
      sec('Coro', ['F',1,2], ['C',3,2], ['Dm',5,1], ['Bb',6,1], ['F',7,2], ['C',9,2], ['F',11,4]),
    ], 'All to Jesus I surrender,\nAll to Him I freely give.'),
    fmt('All Hail the Power of Jesus Name', 'Edward Perronet', 'style-ht', 2, 'D', 84, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,1], ['D',8,1], ['A',9,2], ['D',11,4]),
      sec('Verso 2', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,1], ['D',8,1], ['A',9,2], ['D',11,4]),
    ], 'All hail the power of Jesus name!\nLet angels prostrate fall.'),
    fmt('At the Cross', 'Isaac Watts', 'style-ht', 1, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Alas, and did my Savior bleed?\nAnd did my Sovereign die?'),
    fmt('Jesus Loves Me', 'Anna Warner', 'style-bp', 1, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,1], ['G',8,1], ['D',9,1], ['G',10,4]),
      sec('Coro', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,1], ['D',10,1], ['G',11,4]),
    ], 'Jesus loves me, this I know,\nFor the Bible tells me so.'),
    fmt('Come Ye Thankful People Come', 'Henry Alford', 'style-ht', 2, 'G', 84, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,4]),
    ], 'Come, ye thankful people, come,\nRaise the song of harvest home.'),
    fmt('O Sacred Head Now Wounded', 'Bernard of Clairvaux', 'style-ht', 2, 'Am', 66, [
      sec('Verso 1', ['Am',1,2], ['Dm',3,2], ['Am',5,1], ['E',6,1], ['Am',7,2], ['G',9,1], ['C',10,1], ['F',11,1], ['E',12,1], ['Am',13,4]),
      sec('Verso 2', ['Am',1,2], ['Dm',3,2], ['Am',5,1], ['E',6,1], ['Am',7,2], ['G',9,1], ['C',10,1], ['F',11,1], ['E',12,1], ['Am',13,4]),
    ], 'O sacred Head, now wounded,\nWith grief and shame weighed down.'),
    fmt('When I Survey the Wondrous Cross', 'Isaac Watts', 'style-ht', 2, 'G', 70, [
      sec('Verso 1', ['G',1,2], ['Em',3,2], ['C',5,1], ['G',6,1], ['D',7,2], ['G',9,2], ['C',11,1], ['G',12,1], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['Em',3,2], ['C',5,1], ['G',6,1], ['D',7,2], ['G',9,2], ['C',11,1], ['G',12,1], ['D',13,1], ['G',14,4]),
    ], 'When I survey the wondrous cross\nOn which the Prince of glory died.'),
    fmt('Fairest Lord Jesus', 'Münster Gesangbuch', 'style-ht', 1, 'G', 78, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['G',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Fairest Lord Jesus, ruler of all nature,\nO Thou of God and man the Son.'),
    fmt('My Jesus I Love Thee', 'William Featherston', 'style-bp', 1, 'F', 74, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
      sec('Verso 2', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
    ], 'My Jesus, I love Thee, I know Thou art mine.\nFor Thee all the follies of sin I resign.'),
    fmt('Christ the Lord Is Risen Today', 'Charles Wesley', 'style-gc', 2, 'D', 88, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,1], ['D',8,1], ['A',9,2], ['D',11,2], ['G',13,1], ['D',14,1], ['A',15,1], ['D',16,4]),
      sec('Verso 2', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,1], ['D',8,1], ['A',9,2], ['D',11,2], ['G',13,1], ['D',14,1], ['A',15,1], ['D',16,4]),
    ], 'Christ the Lord is risen today, Alleluia!\nSons of men and angels say, Alleluia!'),
    fmt('Joyful Joyful We Adore Thee', 'Henry van Dyke', 'style-gc', 2, 'G', 84, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,1], ['D',10,1], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,1], ['D',10,1], ['G',11,4]),
    ], 'Joyful, joyful, we adore Thee,\nGod of glory, Lord of love.'),
    fmt('Crown Him With Many Crowns', 'Matthew Bridges', 'style-ht', 2, 'D', 84, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
      sec('Verso 2', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
    ], 'Crown Him with many crowns,\nThe Lamb upon His throne.'),
    fmt('Stand Up Stand Up for Jesus', 'George Duffield', 'style-ht', 2, 'G', 88, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,1], ['G',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Stand up, stand up for Jesus,\nYe soldiers of the cross.'),
    fmt('He Hideth My Soul in the Cleft', 'Fanny Crosby', 'style-ht', 2, 'D', 76, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,1], ['G',6,1], ['D',7,2], ['A',9,2], ['D',11,4]),
      sec('Coro', ['D',1,2], ['G',3,1], ['D',4,1], ['A',5,2], ['D',7,2], ['G',9,2], ['D',11,2], ['A',13,1], ['D',14,4]),
    ], 'A wonderful Savior is Jesus my Lord,\nA wonderful Savior to me.'),
    fmt('I Heard the Voice of Jesus Say', 'Horatius Bonar', 'style-sk', 1, 'G', 68, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
    ], 'I heard the voice of Jesus say,\n"Come unto Me and rest."'),
    fmt('Love Divine All Loves Excelling', 'Charles Wesley', 'style-ht', 2, 'G', 80, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,2], ['C',13,1], ['G',14,1], ['D',15,1], ['G',16,4]),
    ], 'Love divine, all loves excelling,\nJoy of heaven, to earth come down.'),
    fmt('Nothing But the Blood', 'Robert Lowry', 'style-gs', 1, 'G', 84, [
      sec('Verso 1', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,2], ['D',11,1], ['G',12,4]),
      sec('Coro', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'What can wash away my sin?\nNothing but the blood of Jesus.'),
  ]
}

function latinHymns(): SeedSong[] {
  return [
    fmt('Santa Biblia', 'Tradicional Latino', 'style-wl', 2, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
    ], 'Santa Biblia, para mí eres un tesoro aquí.\nTú contienes con amor la verdad del Salvador.'),
    fmt('Celestial Jerusalén', 'Tradicional Latino', 'style-ht', 2, 'G', 74, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
    ], 'Jerusalén, celeste ciudad,\nDe paz y amor eternal.'),
    fmt('Dulce Oración', 'Tradicional Latino', 'style-sk', 1, 'F', 66, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['Dm',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
      sec('Verso 2', ['F',1,2], ['C',3,2], ['Dm',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
    ], 'Dulce oración, que al cielo vas,\nLlevando mi clamor de paz.'),
    fmt('Cristo Te Sigue', 'Tradicional Latino', 'style-wl', 2, 'G', 80, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Cristo te sigue, ven a Él.\nÉl es camino, verdad y ser.'),
    fmt('Salmo 150', 'Tradicional Latino', 'style-gc', 2, 'C', 88, [
      sec('Verso 1', ['C',1,2], ['F',3,2], ['C',5,2], ['G',7,2], ['C',9,2], ['F',11,2], ['C',13,2], ['G',15,2], ['C',17,4]),
      sec('Verso 2', ['C',1,2], ['F',3,2], ['C',5,2], ['G',7,2], ['C',9,2], ['F',11,2], ['C',13,2], ['G',15,2], ['C',17,4]),
    ], 'Alabad a Dios en su santuario.\nAlabadle por sus poderosos hechos.'),
    fmt('Venid a Cristo', 'Tradicional Latino', 'style-bp', 1, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['Em',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,1], ['Em',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Venid a Cristo, venid a Él.\nÉl es la fuente de todo bien.'),
    fmt('Santo Santo Santo', 'Tradicional Latino', 'style-wl', 2, 'G', 80, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Santo, santo, santo es el Señor.\nToda la tierra llena está de Su gloria.'),
    fmt('Oh Señor Envíame', 'Tradicional Latino', 'style-wl', 2, 'D', 84, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
      sec('Verso 2', ['D',1,2], ['A',3,2], ['Bm',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
    ], 'Oh Señor, envíame a llevar Tu amor.\nSeré instrumento de Tu paz.'),
    fmt('Alabaré', 'Tradicional Latino', 'style-wl', 1, 'C', 90, [
      sec('Verso 1', ['C',1,1], ['F',2,1], ['C',3,2], ['G',5,1], ['C',6,1], ['F',7,1], ['C',8,2], ['G',10,1], ['C',11,4]),
      sec('Coro', ['C',1,2], ['F',3,2], ['C',5,2], ['G',7,2], ['C',9,2], ['F',11,2], ['C',13,2], ['G',15,2], ['C',17,4]),
    ], 'Alabaré, alabaré, alabaré a mi Señor.\nAlabaré, alabaré, alabaré a mi Señor.'),
    fmt('Tal Como Soy', 'Tradicional Latino', 'style-bp', 1, 'G', 68, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
    ], 'Tal como soy, sin más ni más,\nA Ti, oh Cristo, vengo ya.'),
    fmt('Gloria a Dios en las Alturas', 'Tradicional Latino', 'style-gc', 2, 'G', 84, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Gloria a Dios en las alturas,\nPaz en la tierra a los hombres.'),
    fmt('Te Alabamos Oh Señor', 'Tradicional Latino', 'style-wc', 2, 'G', 78, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['Em',4,1], ['C',5,2], ['G',7,2], ['D',9,1], ['G',10,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Te alabamos, oh Señor,\nCon todo nuestro ser.'),
    fmt('Junto a la Cruz', 'Tradicional Latino', 'style-ht', 2, 'Dm', 70, [
      sec('Verso 1', ['Dm',1,2], ['Am',3,2], ['Bb',5,1], ['F',6,1], ['Dm',7,2], ['Am',9,1], ['Dm',10,4]),
      sec('Verso 2', ['Dm',1,2], ['Am',3,2], ['Bb',5,1], ['F',6,1], ['Dm',7,2], ['Am',9,1], ['Dm',10,4]),
    ], 'Junto a la cruz de Cristo,\nAllí hallo mi paz.'),
    fmt('Cuan Grande Es Él', 'Tradicional Latino', 'style-wc', 2, 'G', 74, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'Cuan grande es Él, cuan grande es Él.\nMi alma canta, cuan grande es Él.'),
    fmt('En la Cruz', 'Tradicional Latino', 'style-ht', 2, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'En la cruz do Cristo dio Su vida por mí,\nEs mi gloria y mi canción.'),
  ]
}

function spirituals(): SeedSong[] {
  return [
    fmt('Swing Low Sweet Chariot', 'Tradicional Afroamericano', 'style-gs', 2, 'F', 76, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
      sec('Coro', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,2], ['F',9,2], ['C',11,2], ['F',13,4]),
    ], 'Swing low, sweet chariot,\nComing for to carry me home.'),
    fmt('Nobody Knows the Trouble', 'Tradicional Afroamericano', 'style-gs', 2, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,2], ['D',12,1], ['G',13,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Nobody knows the trouble Ive seen,\nNobody knows but Jesus.'),
    fmt('Go Down Moses', 'Tradicional Afroamericano', 'style-gc', 2, 'G', 80, [
      sec('Verso 1', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,1], ['C',7,1], ['G',8,2], ['D',10,1], ['G',11,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Go down, Moses, way down in Egypt land.\nTell old Pharaoh, let my people go!'),
    fmt('Deep River', 'Tradicional Afroamericano', 'style-sk', 1, 'G', 66, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['Em',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,4]),
    ], 'Deep river, my home is over Jordan.\nDeep river, Lord, I want to cross over into campground.'),
    fmt('Sometimes I Feel Like a Motherless Child', 'Tradicional Afroamericano', 'style-sk', 1, 'Am', 66, [
      sec('Verso 1', ['Am',1,2], ['Dm',3,2], ['Am',5,2], ['E',7,2], ['Am',9,2], ['Dm',11,2], ['Am',13,2], ['E',15,1], ['Am',16,4]),
      sec('Verso 2', ['Am',1,2], ['Dm',3,2], ['Am',5,2], ['E',7,2], ['Am',9,2], ['Dm',11,2], ['Am',13,2], ['E',15,1], ['Am',16,4]),
    ], 'Sometimes I feel like a motherless child,\nSometimes I feel like a motherless child.'),
    fmt('Oh Freedom', 'Tradicional Afroamericano', 'style-gc', 2, 'G', 82, [
      sec('Verso 1', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,2], ['C',8,1], ['G',9,2], ['D',11,1], ['G',12,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Oh freedom, oh freedom, oh freedom over me.\nAnd before Id be a slave, Ill be buried in my grave.'),
    fmt('This Little Light of Mine', 'Tradicional Afroamericano', 'style-gs', 1, 'G', 88, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,4]),
      sec('Verso 2', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,4]),
    ], 'This little light of mine, Im gonna let it shine.\nThis little light of mine, Im gonna let it shine.'),
    fmt('Kumbaya', 'Tradicional Afroamericano', 'style-sk', 1, 'G', 68, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
    ], 'Kumbaya, my Lord, kumbaya.\nKumbaya, my Lord, kumbaya.'),
    fmt('Wade in the Water', 'Tradicional Afroamericano', 'style-gs', 2, 'G', 86, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,4]),
      sec('Coro', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,1], ['C',7,1], ['G',8,2], ['D',10,1], ['G',11,4]),
    ], 'Wade in the water, wade in the water children.\nWade in the water, God gonna trouble the water.'),
    fmt('Steal Away', 'Tradicional Afroamericano', 'style-sk', 1, 'F', 66, [
      sec('Verso 1', ['F',1,2], ['C',3,1], ['F',4,1], ['Bb',5,2], ['F',7,2], ['C',9,2], ['F',11,4]),
      sec('Coro', ['F',1,1], ['Bb',2,1], ['F',3,2], ['C',5,1], ['F',6,2], ['Bb',8,1], ['F',9,2], ['C',11,1], ['F',12,4]),
    ], 'Steal away, steal away, steal away to Jesus.\nSteal away, steal away home, I aint got long to stay here.'),
    fmt('Were You There', 'Tradicional Afroamericano', 'style-ht', 2, 'G', 72, [
      sec('Verso 1', ['G',1,2], ['Em',3,2], ['C',5,2], ['D',7,1], ['G',8,2], ['Em',10,2], ['C',12,1], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['Em',3,2], ['C',5,2], ['D',7,1], ['G',8,2], ['Em',10,2], ['C',12,1], ['D',13,1], ['G',14,4]),
    ], 'Were you there when they crucified my Lord?\nWere you there when they crucified my Lord?'),
    fmt('Joshua Fit the Battle', 'Tradicional Afroamericano', 'style-gc', 2, 'F', 84, [
      sec('Verso 1', ['F',1,1], ['C',2,1], ['F',3,2], ['Bb',5,1], ['F',6,2], ['C',8,1], ['F',9,4]),
      sec('Coro', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,2], ['F',9,2], ['C',11,2], ['F',13,4]),
    ], 'Joshua fit the battle of Jericho, Jericho, Jericho.\nJoshua fit the battle of Jericho, and the walls came tumbling down.'),
    fmt('Let Us Break Bread Together', 'Tradicional Afroamericano', 'style-ht', 1, 'G', 74, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
    ], 'Let us break bread together on our knees.\nLet us break bread together on our knees.'),
    fmt('Down by the Riverside', 'Tradicional Afroamericano', 'style-gs', 1, 'G', 82, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Gonna lay down my burden down by the riverside.\nDown by the riverside, down by the riverside.'),
    fmt('I Want Jesus to Walk With Me', 'Tradicional Afroamericano', 'style-sk', 1, 'Am', 68, [
      sec('Verso 1', ['Am',1,2], ['Dm',3,2], ['Am',5,2], ['E',7,1], ['Am',8,2], ['Dm',10,2], ['Am',12,2], ['E',14,1], ['Am',15,4]),
      sec('Verso 2', ['Am',1,2], ['Dm',3,2], ['Am',5,2], ['E',7,1], ['Am',8,2], ['Dm',10,2], ['Am',12,2], ['E',14,1], ['Am',15,4]),
    ], 'I want Jesus to walk with me.\nAll along my pilgrim journey.'),
  ]
}

function carols(): SeedSong[] {
  return [
    fmt('Silent Night', 'Franz Xaver Gruber', 'style-bp', 1, 'G', 68, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,1], ['G',12,2]),
      sec('Verso 2', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,1], ['G',12,2]),
    ], 'Silent night, holy night!\nAll is calm, all is bright.'),
    fmt('O Holy Night', 'Adolphe Adam', 'style-bp', 2, 'C', 72, [
      sec('Verso 1', ['C',1,2], ['G',3,2], ['Am',5,2], ['Em',7,1], ['F',8,1], ['C',9,2], ['G',11,2], ['C',13,4]),
      sec('Coro', ['F',1,2], ['C',3,2], ['G',5,2], ['C',7,2], ['F',9,2], ['C',11,2], ['G',13,2], ['C',15,4]),
    ], 'O holy night! The stars are brightly shining.\nIt is the night of the dear Saviours birth.'),
    fmt('Joy to the World', 'George Frideric Handel', 'style-gc', 2, 'D', 84, [
      sec('Verso 1', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
      sec('Verso 2', ['D',1,2], ['A',3,2], ['D',5,2], ['G',7,2], ['D',9,2], ['A',11,2], ['D',13,4]),
    ], 'Joy to the world! The Lord is come.\nLet earth receive her King.'),
    fmt('Hark the Herald Angels Sing', 'Felix Mendelssohn', 'style-gc', 2, 'F', 86, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,2], ['Bb',13,1], ['F',14,1], ['C',15,1], ['F',16,4]),
      sec('Verso 2', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,2], ['Bb',13,1], ['F',14,1], ['C',15,1], ['F',16,4]),
    ], 'Hark! The herald angels sing,\nGlory to the newborn King!'),
    fmt('O Come All Ye Faithful', 'John Francis Wade', 'style-ht', 2, 'G', 80, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,2], ['C',13,2], ['G',15,2], ['D',17,2], ['G',19,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'O come, all ye faithful, joyful and triumphant.\nO come ye, o come ye to Bethlehem.'),
    fmt('Away in a Manger', 'James R. Murray', 'style-bp', 1, 'F', 72, [
      sec('Verso 1', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
      sec('Verso 2', ['F',1,2], ['C',3,2], ['F',5,2], ['Bb',7,1], ['F',8,1], ['C',9,2], ['F',11,4]),
    ], 'Away in a manger, no crib for a bed.\nThe little Lord Jesus laid down His sweet head.'),
    fmt('We Three Kings', 'John Henry Hopkins', 'style-ht', 2, 'Em', 82, [
      sec('Verso 1', ['Em',1,2], ['Am',3,2], ['Em',5,2], ['B',7,2], ['Em',9,2], ['Am',11,2], ['Em',13,2], ['B',15,1], ['Em',16,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,2], ['D',15,1], ['G',16,4]),
    ], 'We three kings of Orient are.\nBearing gifts we traverse afar.'),
    fmt('Angels We Have Heard on High', 'Tradicional Francés', 'style-gc', 2, 'F', 84, [
      sec('Verso 1', ['F',1,2], ['C',3,1], ['F',4,1], ['Bb',5,2], ['F',7,2], ['C',9,2], ['F',11,4]),
      sec('Coro', ['F',1,1], ['C',2,1], ['F',3,1], ['Bb',4,1], ['F',5,2], ['C',7,2], ['F',9,1], ['C',10,1], ['F',11,1], ['Bb',12,1], ['F',13,4]),
    ], 'Angels we have heard on high,\nSweetly singing oer the plains.'),
    fmt('What Child Is This', 'William Chatterton Dix', 'style-ht', 2, 'Em', 76, [
      sec('Verso 1', ['Em',1,2], ['Am',3,2], ['Em',5,2], ['B',7,2], ['Em',9,2], ['D',11,2], ['G',13,1], ['B',14,1], ['Em',15,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['Em',5,2], ['Bm',7,1], ['C',8,1], ['G',9,2], ['D',11,2], ['G',13,1], ['D',14,1], ['G',15,4]),
    ], 'What child is this, who, laid to rest,\nOn Marys lap is sleeping?'),
    fmt('The First Noel', 'Tradicional Inglés', 'style-ht', 2, 'G', 78, [
      sec('Verso 1', ['G',1,2], ['D',3,1], ['Em',4,1], ['C',5,2], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Coro', ['C',1,2], ['G',3,2], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,2], ['G',15,4]),
    ], 'The first Noel the angel did say\nWas to certain poor shepherds in fields as they lay.'),
  ]
}

function folkGospel(): SeedSong[] {
  return [
    fmt('Wayfaring Stranger', 'Tradicional', 'style-sk', 1, 'Em', 66, [
      sec('Verso 1', ['Em',1,2], ['Am',3,2], ['Em',5,2], ['B',7,2], ['Em',9,2], ['Am',11,2], ['Em',13,2], ['B',15,1], ['Em',16,4]),
      sec('Verso 2', ['Em',1,2], ['Am',3,2], ['Em',5,2], ['B',7,2], ['Em',9,2], ['Am',11,2], ['Em',13,2], ['B',15,1], ['Em',16,4]),
    ], 'I am a poor wayfaring stranger,\nWhile journeying through this world of woe.'),
    fmt('The Water Is Wide', 'Tradicional', 'style-bp', 1, 'G', 68, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,2], ['G',11,2], ['D',13,1], ['G',14,4]),
    ], 'The water is wide, I cannot cross oer.\nAnd neither have I wings to fly.'),
    fmt('Ill Fly Away', 'Albert E. Brumley', 'style-gs', 1, 'G', 88, [
      sec('Verso 1', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,1], ['C',7,1], ['G',8,2], ['D',10,1], ['G',11,4]),
      sec('Coro', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,2], ['D',12,1], ['G',13,4]),
    ], 'Some glad morning when this life is oer,\nIll fly away.'),
    fmt('Just a Closer Walk With Thee', 'Tradicional', 'style-gs', 1, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['Em',5,1], ['C',6,1], ['G',7,2], ['D',9,2], ['G',11,4]),
      sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,2], ['G',13,2], ['D',15,1], ['G',16,4]),
    ], 'Just a closer walk with Thee.\nGrant it, Jesus, is my plea.'),
    fmt('Shall We Gather at the River', 'Robert Lowry', 'style-gc', 2, 'G', 82, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,1], ['D',11,1], ['G',12,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Shall we gather at the river,\nWhere bright angel feet have trod?'),
    fmt('When the Saints Go Marching In', 'Tradicional', 'style-gs', 1, 'G', 90, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,2], ['D',11,1], ['G',12,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,1], ['C',8,1], ['G',9,2], ['D',11,1], ['G',12,4]),
    ], 'Oh when the saints go marching in,\nOh when the saints go marching in.'),
    fmt('Peace Like a River', 'Tradicional', 'style-sk', 1, 'G', 70, [
      sec('Verso 1', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,2], ['D',12,1], ['G',13,4]),
      sec('Verso 2', ['G',1,2], ['C',3,1], ['G',4,1], ['D',5,2], ['G',7,2], ['C',9,1], ['G',10,2], ['D',12,1], ['G',13,4]),
    ], 'Ive got peace like a river, Ive got peace like a river.\nIve got peace like a river in my soul.'),
    fmt('This Train', 'Tradicional', 'style-gs', 1, 'G', 84, [
      sec('Verso 1', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,1], ['C',7,1], ['G',8,2], ['D',10,1], ['G',11,4]),
      sec('Verso 2', ['G',1,1], ['C',2,1], ['G',3,2], ['D',5,1], ['G',6,1], ['C',7,1], ['G',8,2], ['D',10,1], ['G',11,4]),
    ], 'This train is bound for glory, this train.\nThis train is bound for glory, this train.'),
    fmt('Do Lord', 'Tradicional', 'style-gs', 1, 'G', 86, [
      sec('Verso 1', ['G',1,1], ['D',2,1], ['G',3,2], ['C',5,1], ['G',6,1], ['D',7,1], ['G',8,4]),
      sec('Coro', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,2], ['G',9,2], ['D',11,2], ['G',13,4]),
    ], 'Do Lord, oh do Lord, oh do remember me.\nDo Lord, oh do Lord, oh do remember me.'),
    fmt('I Love to Tell the Story', 'A. Katherine Hankey', 'style-ht', 1, 'G', 76, [
      sec('Verso 1', ['G',1,2], ['D',3,2], ['G',5,2], ['C',7,1], ['G',8,1], ['D',9,2], ['G',11,4]),
      sec('Coro', ['G',1,2], ['C',3,2], ['G',5,2], ['D',7,2], ['G',9,2], ['C',11,1], ['G',12,1], ['D',13,1], ['G',14,4]),
    ], 'I love to tell the story of unseen things above.\nOf Jesus and His glory, of Jesus and His love.'),
  ]
}

function contemplative(): SeedSong[] {
  return [
    fmt('Spirit of the Living God', 'Tradicional', 'style-sk', 1, 'D', 60, [
      sec('Sección A', ['D',1,4], ['A',5,4], ['Bm',9,4], ['G',13,4], ['D',17,4], ['A',21,4], ['G',25,4], ['D',29,8]),
      sec('Sección B', ['G',1,4], ['D',5,4], ['Em',9,4], ['A',13,4], ['D',17,4], ['G',21,4], ['D',25,4], ['A',29,4], ['D',33,8]),
    ], 'Spirit of the Living God, fall fresh on me.\nSpirit of the Living God, fall fresh on me.'),
    fmt('Dwelling Place', 'Tradicional', 'style-sk', 1, 'G', 58, [
      sec('Sección A', ['G',1,4], ['D',5,4], ['Em',9,4], ['C',13,4], ['G',17,4], ['C',21,4], ['G',25,4], ['D',29,4], ['G',33,8]),
      sec('Sección B', ['C',1,4], ['G',5,4], ['D',9,4], ['G',13,4], ['Em',17,4], ['C',21,4], ['G',25,4], ['D',29,4], ['G',33,8]),
    ], 'I love You, Lord, and I lift my voice.\nTo worship You, oh my soul rejoice.'),
    fmt('Meditation on Amazing Grace', 'Arreglo Contemplativo', 'style-sk', 2, 'G', 56, [
      sec('Sección A', ['G',1,4], ['C',5,4], ['G',9,4], ['D',13,4], ['G',17,4], ['C',21,4], ['G',25,4], ['D',29,4], ['G',33,8]),
      sec('Sección B', ['Em',1,4], ['C',5,4], ['G',9,4], ['D',13,4], ['C',17,4], ['G',21,4], ['D',25,4], ['G',29,8]),
    ], 'Meditación instrumental sobre Amazing Grace.\nEstilo contemplativo con pedal tone.'),
    fmt('River of Rest', 'Arreglo Contemplativo', 'style-sk', 2, 'D', 54, [
      sec('Sección A', ['D',1,4], ['A',5,4], ['Bm',9,4], ['G',13,4], ['D',17,4], ['A',21,4], ['Bm',25,4], ['A',29,4], ['D',33,8]),
      sec('Sección B', ['G',1,4], ['D',5,4], ['Em',9,4], ['A',13,4], ['D',17,4], ['G',21,4], ['D',25,4], ['A',29,4], ['D',33,8]),
    ], 'Río de descanso, fluye en mí.\nPaz que sobrepasa todo entender.'),
    fmt('Be Still My Soul', 'Arreglo Contemplativo', 'style-sk', 1, 'C', 58, [
      sec('Sección A', ['C',1,4], ['G',5,4], ['Am',9,4], ['F',13,4], ['C',17,4], ['G',21,4], ['F',25,4], ['C',29,8]),
      sec('Sección B', ['F',1,4], ['C',5,4], ['G',9,4], ['Am',13,4], ['F',17,4], ['C',21,4], ['G',25,4], ['C',29,8]),
    ], 'Be still, my soul, the Lord is on thy side.\nBear patiently the cross of grief or pain.'),
  ]
}

function exercises(): SeedSong[] {
  return [
    fmt('Ejercicio de Práctica #1', 'Worship Piano', 'style-wc', 1, 'C', 80, [
      sec('Progresión I-V-vi-IV', ['C',1,2], ['G',3,2], ['Am',5,2], ['F',7,2], ['C',9,2], ['G',11,2], ['F',13,2], ['C',15,4]),
    ], 'Progresión I-V-vi-IV en C mayor.\nEstilo: Worship Contemporáneo.'),
    fmt('Ejercicio de Práctica #2', 'Worship Piano', 'style-wl', 2, 'Am', 88, [
      sec('Progresión Latina', ['Am',1,2], ['G',3,2], ['F',5,2], ['E',7,2], ['Am',9,2], ['G',11,2], ['F',13,2], ['E',15,2], ['Am',17,4]),
    ], 'Progresión i-VII-VI-V en Am.\nEstilo: Worship Latino.'),
    fmt('Ejercicio de Práctica #3', 'Worship Piano', 'style-gs', 3, 'G', 96, [
      sec('Turnaround Gospel', ['G',1,2], ['G7',3,2], ['C',5,2], ['C#dim',7,2], ['G',9,2], ['D',11,2], ['D#dim',13,2], ['Em',15,2], ['A7',17,2], ['D7',19,2], ['G',21,4]),
    ], 'Turnaround gospel en G.\nEstilo: Gospel Sureño.'),
    fmt('Ejercicio de Práctica #4', 'Worship Piano', 'style-bp', 1, 'D', 72, [
      sec('Balada I-V-vi-III-IV', ['D',1,2], ['A',3,2], ['Bm',5,2], ['F#m',7,2], ['G',9,2], ['D',11,2], ['A',13,2], ['D',15,4]),
    ], 'Progresión de balada en D mayor.\nEstilo: Balada Pop Cristiana.'),
    fmt('Ejercicio de Práctica #5', 'Worship Piano', 'style-gc', 4, 'Eb', 100, [
      sec('Mass Choir Progression', ['Eb',1,2], ['Ab',3,2], ['Bb',5,2], ['Eb',7,2], ['Ab',9,2], ['Eb',11,2], ['Fm',13,2], ['Bb',15,2], ['Eb',17,4]),
    ], 'Progresión de mass choir en Eb.\nEstilo: Gospel Coral.'),
  ]
}

export const SEED_SONGS: SeedSong[] = [
  ...hymns(),
  ...latinHymns(),
  ...spirituals(),
  ...carols(),
  ...folkGospel(),
  ...contemplative(),
  ...exercises(),
  ...songsGuitar(),
  ...songsTrumpet(),
]
