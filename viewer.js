var player; // Define the YouTube player

const API_URL = "https://thawing-brushlands-21148-3bd1b9a2efde.herokuapp.com/api/clips/"; // Update to your Django server URL

// Function called by the YouTube IFrame API when it's ready
function onYouTubeIframeAPIReady() {
    // Initialize the YouTube player
    initializePlayer();
    // Set a flag in sessionStorage indicating that the API is loaded
    sessionStorage.setItem('youtubeApiLoaded', 'true');
}

// Initialize the YouTube player
function initializePlayer() {
    // If a player instance already exists, destroy it to avoid duplicates
    if (player) {
        player.destroy();
    }
    // Create a new YouTube player instance
    player = new YT.Player('playerContainer', {
        height: '390',
        width: '640',
        videoId: '', // Video ID will be set when a clip is selected
    });
}

// Runs when the document content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    populateTitleDropdown(); // Populate the dropdown with clip titles
    displayClips(); // Display clips in the list
    // Check if the YouTube API is already loaded
    if (sessionStorage.getItem('youtubeApiLoaded')) {
        initializePlayer();
    } else {
        // Dynamically load the YouTube IFrame API script
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
});

// Populates the title dropdown with unique titles from the clips
function populateTitleDropdown() {
    var titleDropdown = document.getElementById('titleDropdown');
    titleDropdown.innerHTML = '<option value="">Select a Title</option>'; // Clear existing options

    axios.get(API_URL)
        .then(response => {
            var clips = response.data;
            var titles = new Set(clips.map(clip => clip.title));
            titles.forEach(title => {
                var option = document.createElement('option');
                option.value = title;
                option.textContent = title;
                titleDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching clips:', error));
}

// Filters clips based on the selected title and/or entered keyword
function filterClips() {
    var titleDropdown = document.getElementById('titleDropdown').value;
    var keywordSearch = document.getElementById('keywordSearch').value.toLowerCase();

    axios.get(API_URL)
        .then(response => {
            var filteredClips = response.data;
            if (titleDropdown) {
                filteredClips = filteredClips.filter(clip => clip.title === titleDropdown);
            }
            if (keywordSearch) {
                filteredClips = filteredClips.filter(clip => clip.keyword.toLowerCase().includes(keywordSearch));
            }
            displayClips(filteredClips);
        })
        .catch(error => console.error('Error fetching clips:', error));
}

// Displays clips in the list, including a play button for each
function displayClips(clips = []) {
    var clipsList = document.getElementById('clipsList');
    clipsList.innerHTML = ''; // Clear existing clips

    clips.forEach(function(clip) {
        var li = document.createElement('li');
        li.innerHTML = `Title: ${clip.title}, Keyword: ${clip.keyword}, Timestamp: ${clip.timestamp}, 
        Link: <a href="#" onclick="playClip('${clip.link}', event)">Play</a>`; // Adds a Play link
        clipsList.appendChild(li);
    });
}

// Plays the selected clip in the YouTube player
function playClip(link, event) {
    event.preventDefault(); // Prevent default action of the link

    // Ensure the link has the expected format
    if (link.includes('v=')) {
        var videoId = link.split('v=')[1].split('&')[0]; // Extract video ID from the link
        var startTime = link.includes('&t=') ? link.split('&t=')[1].split('s')[0] : 0; // Extract start time, if present

        if (player && player.loadVideoById) {
            player.loadVideoById({ 'videoId': videoId, 'startSeconds': parseInt(startTime, 10) });
        }
    } else {
        console.error('Invalid video link:', link);
    }
}


