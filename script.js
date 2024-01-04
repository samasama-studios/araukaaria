songs = [
  {
    "src": "assets/songs/Aconcagua.mp3",
    "title": "Aconcagua",
    "cover": "assets/songs/Aconcagua.jpg",
    "background-color": "DCEDD7"
  },
  {
    "src": "assets/songs/Canto_Oscuro.mp3",
    "title": "Canto Oscuro",
    "cover": "assets/songs/Canto_Oscuro.jpg",
    "background-color": "3A719C"
  },  
  {
    "src": "assets/songs/Silver_Love.mp3",
    "title": "Silver Love",
    "cover": "assets/songs/Silver_Love.jpg",
    "background-color": "D0DCF3"
  }
  
  // {
  //   "src": "assets/songs/Some_of_us.mp3",
  //   "title": "Some of us",
  //   "cover": "assets/songs/nocover.jpg",
  //   "background-color": "white"
  // },
  // {
  //   "src": "assets/songs/Tu_Jardin.mp3",
  //   "title": "Tu Jardín",
  //   "cover": "assets/songs/nocover.jpg",
  //   "background-color": "white"
  // },
  // {
  //   "src": "assets/songs/What_makes_us.mp3",
  //   "title": "What makes us?",
  //   "cover": "assets/songs/nocover.jpg",
  //   "background-color": "white"
  // },
  // {
  //   "src": "assets/songs/Slow_Down.mp3",
  //   "title": "Slow Down",
  //   "cover": "assets/songs/nocover.jpg",
  //   "background-color": "white"
  // }
];

var player = document.getElementById("player");
var buttonPlay = document.getElementById("play");
var cover = document.getElementById("cover");
var index = 0;
var count = Object.keys(songs).length;
var autoplay = false;
console.log(count);

preloadCovers();

function preloadCovers() {
  for (let i = 0; i < songs.length; i++) {
    var cover = new Image();
    cover.src = songs[i].cover;
  }
  loadSong();
}

function nextSong() {
  if (index < count - 1) {
    index++;
  } else {
    index = 0;
  }
  loadSong();
}

function previousSong() {
  if (index > 0) {
    index--;
  } else {
    index = count - 1;
  }
  loadSong();
}

function loadSong() {
  player.src = songs[index].src;
  title.innerHTML = songs[index].title;
  cover.src = songs[index].cover;
  document.body.style.backgroundColor = songs[index]['background-color'];
  console.log(songs[index]['background-color']);
  if (autoplay) {
    play();
  }
}

function play() {
  player.style.display = "block";
  buttonPlay.style.display = "none";
  player.play();
  autplay = true;
}

player.onpause = function() {
  autoplay = false;
}

player.onplay = function() {
  autoplay = true;
}