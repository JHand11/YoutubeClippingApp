var player;

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
    player = new YT.Player('player', {
        height: '360',
        width: '640',
        events: {
            'onReady': onPlayerReady
        }
    });
}

// Function called when the player is ready
function onPlayerReady(event) {
    // Player is ready
}

// Runs when the document content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
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

// Load the video into the player
function loadVideo() {
    var url = document.getElementById('youtubeUrl').value;
    var videoId = extractVideoId(url);
    if (videoId) {
        player.loadVideoById(videoId);
    } else {
        console.error('Invalid YouTube URL:', url);
    }
}

// Extract the video ID from the YouTube URL
function extractVideoId(url) {
    if (url.includes('v=')) {
        return url.split('v=')[1].split('&')[0];
    } else if (url.includes('/live/')) {
        return url.split('/live/')[1].split('?')[0];
    }
    return null;
}

// Clip the video at the current time
function clipVideo() {
    var keyword = document.getElementById('keyword').value;
    var currentTime = Math.floor(player.getCurrentTime());
    var url = document.getElementById('youtubeUrl').value;
    var videoId = extractVideoId(url);
    var videoTitle = player.getVideoData().title;

    var clipLink = `https://www.youtube.com/watch?v=${videoId}&t=${currentTime}s`;
    var clip = { title: videoTitle, keyword: keyword, timestamp: currentTime, link: clipLink };

    axios.post(API_URL, clip)
        .then(response => {
            console.log('Clip saved:', response.data);
            displayClips(); // Refresh the clips list
        })
        .catch(error => console.error('Error saving clip:', error));
}

// Display the list of clips
function displayClips() {
    axios.get(API_URL)
        .then(response => {
            var clipsList = document.getElementById('clipsList');
            clipsList.innerHTML = '';
            response.data.forEach(function(clip) {
                var li = document.createElement('li');
                li.innerHTML = `Title: ${clip.title}, Keyword: ${clip.keyword}, Timestamp: ${clip.timestamp}, Link: <a href="${clip.link}" target="_blank">Watch Clip</a> <button onclick="deleteClip(${clip.id})">Delete</button>`;
                clipsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching clips:', error));
}

// Clear all clips
function clearClips() {
    axios.delete(API_URL)
        .then(response => {
            displayClips([]);
        })
        .catch(error => console.error('Error clearing clips:', error));
}

// Delete a specific clip
function deleteClip(id) {
    axios.delete(`${API_URL}${id}/`)
        .then(response => {
            displayClips(); // Refresh the clips list
        })
        .catch(error => console.error('Error deleting clip:', error));
}

// Clip the video at 15 seconds before the current time
function clipMinus15s() {
    var keyword = document.getElementById('keyword').value;
    var currentTime = Math.floor(player.getCurrentTime()) - 15; // Subtract 15 seconds
    if (currentTime < 0) {
        currentTime = 0; // Ensure the timestamp is non-negative
    }
    var url = document.getElementById('youtubeUrl').value;
    var videoId = extractVideoId(url);
    var videoTitle = player.getVideoData().title;

    var clipLink = `https://www.youtube.com/watch?v=${videoId}&t=${currentTime}s`;
    var clip = { title: videoTitle, keyword: keyword, timestamp: currentTime, link: clipLink };

    axios.post(API_URL, clip)
        .then(response => {
            console.log('Clip saved:', response.data);
            displayClips(); // Refresh the clips list
        })
        .catch(error => console.error('Error saving clip:', error));
}

// Export clips to a CSV file
function exportCSV() {
    axios.get(API_URL)
        .then(response => {
            var existingClips = response.data;

            if (existingClips.length === 0) {
                alert('No clips to export.');
                return;
            }

            var csvContent = "Title,Keyword,Timestamp,Link\n";
            
            existingClips.forEach(function(clip) {
                var row = `${clip.title},${clip.keyword},${clip.timestamp},${clip.link}\n`;
                csvContent += row;
            });

            var blob = new Blob([csvContent], { type: 'text/csv' });
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'clips.csv';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => console.error('Error fetching clips:', error));
}
