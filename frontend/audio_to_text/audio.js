const youtube_api_key = "AIzaSyC-DrcDtHohLqfNLYpVdV23gIc4H9XDDyg";

document.getElementById('uploadPreview').addEventListener('click', function () {
    if (!document.getElementById('youtubeUrl').value) {
        document.getElementById('audioUpload').click();
    }
});

document.getElementById('audioUpload').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        document.getElementById('submitBtn').disabled = false;
        document.querySelector('.upload-text').textContent = this.files[0].name;
        document.getElementById('youtubeUrl').disabled = true;
    }
});

document.getElementById('youtubeUrl').addEventListener('input', async function () {
    if (this.value) {
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('audioUpload').disabled = true;
        const youtubeurl = this.value;
        const videoId = youtubeurl.split('v=')[1];
        const api_url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${youtube_api_key}&part=snippet,contentDetails`;
        await fetch(api_url)
            .then(response => response.json())
            .then(data => {
                const duration = data.items[0].contentDetails.duration;
                const time = duration.match(/\d+/g);
                // Convert the time const to minutes and seconds, and format it to ensure that it has 2 digits
                const totalTime = `${time[0]} Minutes and ${time[1]} Seconds`;
                const thumbnail = data.items[0].snippet.thumbnails.high.url;
                const title = data.items[0].snippet.title;

                //document.getElementById('uploadPreview').style.display = 'none';

                const html = document.getElementById('uploadPreview');
                html.innerHTML = `
                    <div class="youtube-preview card">
                        <img src="${thumbnail}" alt="Youtube Thumbnail" class="card-img-top youtube-thumbnail">
                        <div class="youtube-details card-body">
                            <h3 class="youtube-title card-title">${title}</h3>
                            <p class="youtube-duration card-text">Duration: ${totalTime}</p>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('audioUpload').disabled = false;
    }
});

document.getElementById('submitBtn').addEventListener('click', async function () {
    // Avoid refreshing the page
    event.preventDefault();
    const audioFile = document.getElementById('audioUpload').files[0];
    const youtubeUrl = document.getElementById('youtubeUrl').value;
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('youtube_url', youtubeUrl);
    document.getElementById('spinner').style.display = 'block';

    await fetch('http://localhost:5000/speechtotext', {
        method: 'POST',
        mode: 'cors',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('transcript').innerText = data.transcript;
            document.getElementById('spinner').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('spinner').style.display = 'none';
        });
});