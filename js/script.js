console.log("Welcome to Spotify");
let currentSong = new Audio();
let songs;
var play_bar = document.getElementById("play_of_bar")
var next_bar = document.getElementById("next_of_bar")
var previous_bar = document.getElementById("previous_of_bar")
let currentFolder;

async function getSongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }



    // show all the songs in playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (let song of songs) {
        songUl.innerHTML += `<li>
                                <img src="img/music.svg" alt="">
                                <div class="info">
                                    <div class="song-name">${song.replaceAll("%20", " ")}</div>
                                    <div class="song-artist">Tajbid</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img src="img/play.svg" alt="">
                                </div>
                            </li>`;
    }
    //Attach event listener to all songs
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}

function formatTime(seconds) {

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);

    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



const playmusic = (track, pause = false) => {
    // let audio=new Audio("/Songs/"+ track)
    currentSong.src = `/${currentFolder}/` + track
    if (!pause) {
        currentSong.play()
        play_bar.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split(".mp3")[0]);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/Songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let allAncors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(allAncors)
    for (let i = 0; i < array.length; i++) {
        const e = array[i]
        if (e.href.includes("/Songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            //get the meta data
            let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <circle cx="12" cy="12" r="12" fill="#1ed760" />
                                <circle cx="12" cy="12" r="10" stroke="black" stroke-width="1.5" fill="none" />
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="black" />
                            </svg>
                        </div>
                        <img src="/Songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playmusic(songs[0])
        })
    });
}
async function main() {
    //Getting the list of all songs
    await getSongs("Songs/ncs");
    playmusic(songs[0], true);

    //Display all albums on the page
    displayAlbums()

    //attach event listener to play,next and previous buttons
    play_bar.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play_bar.src = "img/pause.svg"
        } else {
            currentSong.pause()
            play_bar.src = "img/play.svg"
        }
    })
    next_bar.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index + 1) < songs.length) {

            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[0])
        }

    })
    previous_bar.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) > 0) {

            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[songs.length - 1])
        }
    })
    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        try {
            document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        } catch (message) {
            document.querySelector(".songtime").innerHTML = "00:00/00:00"
        }
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    // add an event listener to a seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        const seekbar = e.currentTarget;
        const rect = seekbar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const getPercent = (offsetX / rect.width) * 100 + "%";
        document.querySelector(".circle").style.left = getPercent;
        currentSong.currentTime = parseInt(getPercent.slice(0, getPercent.length - 1)) * currentSong.duration / 100;

    });
    // add event lister to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // add an event listener to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume == 0) {
            document.getElementById("vol").src = "img/volumeoff.svg"
        }
        else {
            document.getElementById("vol").src = "img/volume.svg"
        }
    })
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target)
        if(e.target.src.includes("img/volume.svg"))
        {
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
            document.getElementById("vol").src = "img/volumeoff.svg"

        }
        else{
            document.querySelector(".range").getElementsByTagName("input")[0].value=10
            e.target.src=e.target.src.replace("img/volumeoff.svg","img/volume.svg")

        }
    })

}
main()