const fileInput = document.getElementById("file-input");
const chooseFileBtn = document.getElementById("choose-file-btn");
const songTitle = document.getElementById("song-title");
const artistName = document.getElementById("artist-name");
const albumCover = document.getElementById("album-cover");
const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const seekBar = document.getElementById("seek-bar");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");

let audio = new Audio();
let playlist = []; // Playlist to hold multiple songs
let currentIndex = -1; // Track the current song index
let isSeeking = false; // Flag to track if user is seeking

// Helper function to format time as mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes < 10 ? "0" : ""}${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Function to load and play a song by index
function loadSong(index) {
  if (index >= 0 && index < playlist.length) {
    const song = playlist[index];
    const fileURL = URL.createObjectURL(song.file);
    audio.src = fileURL;
    currentIndex = index;
    readMetadata(song.file); // Display metadata (title, artist, album cover)

    // Reset seek bar and time displays
    seekBar.value = 0;
    currentTimeDisplay.innerText = "00:00";
    totalTimeDisplay.innerText = "00:00";

    // Once the audio metadata is loaded, set the total duration
    audio.addEventListener("loadedmetadata", () => {
      totalTimeDisplay.innerText = formatTime(audio.duration);
      audio.play(); // Automatically start playing the song
    });
  }
}

// Function to extract and display metadata
function readMetadata(file) {
  jsmediatags.read(file, {
    onSuccess: function (tag) {
      const tags = tag.tags;
      const title = tags.title || "Unknown Title";
      const artist = tags.artist || "Unknown Artist";
      const picture = tags.picture;

      songTitle.innerText = title;
      artistName.innerText = `${artist}`;

      // Set album cover if available
      if (picture) {
        const base64String = picture.data.reduce(
          (acc, byte) => acc + String.fromCharCode(byte),
          ""
        );
        const base64 = btoa(base64String);
        const mimeType = picture.format;
        albumCover.src = `data:${mimeType};base64,${base64}`;
      } else {
        albumCover.src = "default-cover.png"; // Use a default album cover if none exists
      }
    },
    onError: function (error) {
      console.log("Error reading tags: ", error);
      songTitle.innerText = file.name;
      artistName.innerText = "Artist: Unknown";
      albumCover.src = "default-cover.png";
    },
  });
}

chooseFileBtn.addEventListener("click", () => {
  fileInput.click();
});

// Allow user to select multiple files
fileInput.setAttribute("multiple", true);

fileInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    playlist = files.map((file, index) => ({ file, index }));
    loadSong(0); // Automatically play the first song
  }
});

// Update seek bar and current time as the audio plays
audio.addEventListener("timeupdate", () => {
  if (!isSeeking) {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekBar.value = progress;
    currentTimeDisplay.innerText = formatTime(audio.currentTime);
  }
});

// Play the audio when play button is clicked
playBtn.addEventListener("click", () => {
  if (audio.src) {
    audio.play();
  }
});

// Pause the audio when pause button is clicked
pauseBtn.addEventListener("click", () => {
  if (!audio.paused) {
    audio.pause();
  }
});

// Allow user to scrub (drag the seek bar) to change playback position
seekBar.addEventListener("input", () => {
  isSeeking = true; // Flag to indicate that the user is scrubbing
  const seekTo = (seekBar.value / 100) * audio.duration;
  audio.currentTime = seekTo;
  currentTimeDisplay.innerText = formatTime(seekTo); // Update the time display while scrubbing
});

// Reset flag when user finishes scrubbing
seekBar.addEventListener("change", () => {
  isSeeking = false;
});

// Implement Previous button functionality
prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    loadSong(currentIndex - 1);
  } else {
    loadSong(playlist.length - 1); // Loop back to the last song
  }
});

// Implement Next button functionality
nextBtn.addEventListener("click", () => {
  if (currentIndex < playlist.length - 1) {
    loadSong(currentIndex + 1);
  } else {
    loadSong(0); // Loop back to the first song
  }
});

// Automatically play next song when the current one ends
audio.addEventListener("ended", () => {
  if (currentIndex < playlist.length - 1) {
    loadSong(currentIndex + 1);
  } else {
    loadSong(0); // Loop back to the first song
  }
});
