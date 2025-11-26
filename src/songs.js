// TODO: Move these audio files to Firebase Storage or public folder
// Cloudinary charges API tokens for audio streaming
const songs = [
  {
    id: 1,
    name: "Sheep",
    artist: "Dolly",
    link: "/audio/Dolly_Sheep_2.mp3", // Move to public/audio/
  },
  {
    id: 2,
    name: "self-titled",
    artist: "Dolly",
    link: "/audio/Dolly_Self_Titled.mp3", // Move to public/audio/
  },
  {
    id: 3,
    name: "Two",
    artist: "Dolly",
    link: "/audio/Dolly_2.mp3", // Move to public/audio/
  },
];

export default songs;
