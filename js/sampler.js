// State management
class State {
  constructor(state, data) {
    this.state = state;
    this.uploadCount = 0;
    this.sessionTime = new Date();
    this.error = data
  }
}

// Methods
function exit(e) {
  if (e.state == "success") {
    videos.classList.remove("uploadingState");
  }
}

function database() {
  if (window.recorderVideo && !hasUserUploaded) {
    let blob = new Blob(window.recorderVideo, {
      type: "video/webm",
    });
    let date = new Date();
    let time = date.getTime();
    blob.id = time;

    let storageRef = firebase.storage().ref();
    // Upload task
    storageRef
      .child("user-videos/" + blob.id + ".webm")
      .put(blob)
      .then(exit);

    videos.classList.add("uploadingState");
    hasUserUploaded = true;
    console.log(hasUserUploaded);
  } else if (hasUserUploaded == true) {
    alert("Hai già caricato un video. Aggiorna per farne un altro.");
  } else if (!window.recorderVideo) {
    alert("Crea un video prima di premere upload.");
  }
}

function switchVideos(fromWhere) {
  let storedVideo = document.getElementById("storedVideo");
  if (fromWhere == "record") {
    storedVideo.classList.add("hide");
  }
  if (fromWhere == "stop") {
    storedVideo.classList.remove("hide");
  }
}

function storeVideo(fromWhere) {
  window.recorder.ondataavailable = (e) => {
    window.recorderVideo = [];
    window.recorderVideo.push(e.data);
    let blob = new Blob(window.recorderVideo, {
      type: "video/webm",
    });
    storedVideo.src = URL.createObjectURL(blob);

    if (fromWhere == "upload") {
      database(blob);
    }
  };
}

function daw(control) {
  let audio = document.getElementById("audio");
  let storedVideo = document.getElementById("storedVideo");

  if (control == "record") {
    console.log(`record triggered at: ` + window.audioCtx.currentTime);
    window.recorder.start();
    window.recorder.onstart = function () {
      console.log(`recorder started at: ` + window.audioCtx.currentTime);
      audio.currentTime = 0;
      audio.play();
      console.log(`audio played at: ` + window.audioCtx.currentTime);
    };

    videos.classList.add("recordingState");
    return switchVideos("record");
  }
  if (control == "stop") {
    if (window.recorder.state == "recording") {
      window.recorder.stop();
    }
    audio.pause();
    if (storedVideo.src) storedVideo.pause();
    storeVideo("stop");
    videos.classList.remove("recordingState", "playingState");
    switchVideos("stop");
  }
  if (control == "play") {
    if (window.recorder.state == "inactive" && storedVideo.src) {
      switchVideos("stop");
      storedVideo.currentTime = 0;
      audio.currentTime = 0;
      audio.play();
    }
    if (window.recorder.state == "recording") {
      window.recorder.stop();
      switchVideos("stop");
      storeVideo("play");
    }
    if (window.recorder.state == "inactive" && !storedVideo.src) {
      audio.currentTime = 0;
      audio.play();
    }
    videos.classList.add("playingState");
  }
}

function handleVisibilityChange() {
  if (document.visibilityState == "visible") {
    start();
  } else {
    if (window.stream) {
      window.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }
}

function gotAudio() {
  if (!window.audioCtx) {
    // creation of new AudioContext
    window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx = window.audioCtx;

    let DOMmusic = document.getElementById("audio");
    let DOMaudio = document.getElementById("storedVideo");
    let music = audioCtx.createMediaElementSource(DOMmusic);
    let audio = audioCtx.createMediaElementSource(DOMaudio);

    let musicGain = audioCtx.createGain();

    musicGain.gain.value = 0.75;

    music.connect(musicGain).connect(audioCtx.destination);
    audio.connect(audioCtx.destination);
  }
}

function gotDevices(devicesInfos) {
  let audioInputSelect = document.getElementById("devices");
  audioInputSelect.innerHTML = null;

  for (let deviceInfo of devicesInfos) {
    let device = document.createElement("div");
    device.innerHTML = deviceInfo.label;
    device.dataset.id = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      audioInputSelect.appendChild(device);
    }
  }
}

function gotStream(stream) {
  let videoElement = document.getElementById("liveVideo");
  window.stream = stream;
  videoElement.srcObject = stream;
  window.recorder = new MediaRecorder(stream, {
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 3500000,
    mimeType: "video/webm",
  });
  return navigator.mediaDevices.enumerateDevices();
}

function handleErrors(e) {
  state = new State('error', e);
  console.log(state.error);
  let displayError = document.getElementById("displayError");
  let txtError = document.getElementById("txtError");
  displayError.classList.remove("hide");

  if (e.name == "NotAllowedError") {
    txtError.innerHTML = `Qualcosa è andato storto.<br>Aggiorna, e assicurati di aver abilitato microfono e videocamera.`;
  }

  if (e == "BrowserError") {
    txtError.innerHTML = `Ci dispiace, per ora il tuo browser non è supportato. Ti preghiamo di utilizzare Chrome su desktop.`;
  }

}

function start(source) {
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  let audioInput = {
    sampleRate: 44100,
    channelCount: 2,
    sampleSize: 16,
    echoCancellation: false,
    noiseSuppression: false,
    latency: 0,
    volume: 1.0,
    autoGainControl: true,
  };

  if (source) {
    audioInput.deviceId = source;
  }

  const constraints = {
    audio: audioInput,
    video: {
      facingMode: "user",
      width: {
        min: 640,
        ideal: 720,
        max: 1280,
      },
      height: {
        min: 640,
        ideal: 720,
        max: 1280,
      },
      aspectRatio: 1,
    },
  };

  if (
    (window.MediaRecorder && ua.browser.family.includes("Chrome")) ||
    ua.browser.family.includes("Firefox")
  ) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(gotStream)
      .then(gotDevices)
      .then(gotAudio)
      .catch(handleErrors);
  } else {
    handleErrors("BrowserError");
  }

  state.push(new State('active'));
}

// event listeners
let audioDevices = document.getElementById("devices");
let buttons = document.getElementById("buttons");
let btnStop = document.getElementById("btnStop");
let storedVideo = document.getElementById("storedVideo");
let audio = document.getElementById("audio");
let btnUpload = document.getElementById("btnUpload");
let hasUserUploaded = false;
let btnMic = document.getElementById("btnMic");
let micSetup = document.getElementById("micSetup");
let audioCtx;
let ua = detect.parse(navigator.userAgent);
let videos = document.getElementById("videos");
let container = document.querySelector(".sampler-container")

// State: app initializes on 'disabled'
var state = [];

// crossOrigin
audio.crossOrigin = 'anonymous';

audioDevices.addEventListener("click", (e) => {
  audioSourceSelect = e.target.dataset.id;
  start(audioSourceSelect);
});

buttons.addEventListener("click", (e) => {
  if (e.target.id == "btnRecord") {
    console.log(`record pressed at: ` + window.audioCtx.currentTime);
    daw("record");
  }
  if (e.target.id == "btnStop") {
    daw("stop");
  }
  if (e.target.id == "btnPlay") {
    daw("play");
  }
  if (e.target.id == "btnUpload") {
    database();
  }
});

storedVideo.onended = () => {
  daw("play");
};

btnMic.onclick = () => {
  micSetup.classList.toggle("hidden");
  btnMic.classList.toggle("half-opacity");
};

document.addEventListener("visibilitychange", handleVisibilityChange);

// Initializer
container.onclick = () => {
  if (state.length == 0) {
    start();
  }
}
