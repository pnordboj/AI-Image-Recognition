document.getElementById('submitBtn').addEventListener('click', function (event) {
    // Prevent form submission
    event.preventDefault();

    // Show the overlay
    document.getElementById('overlay').style.display = 'block';

    // Get the input text
    const promptText = document.getElementById('inputText').value;

    const data = new FormData();
    data.append('prompt', promptText);

    fetch('http://localhost:5000/generateimage', {
        method: 'POST',
        body: data
    })
        .then(response => response.json())
        .then(data => {
            const generatedImageDiv = document.getElementById('generatedImage');

            // Create the img element and set its src to the returned image url
            const img = document.createElement('img');
            img.src = data.image_url;
            img.width = 512;  // Set the image width
            img.height = 512; // Set the image height

            // Create the "Save Image" button
            const button = document.createElement('button');
            button.innerText = 'Save Image';
            button.className = 'btn btn-primary mt-3';
            button.addEventListener('click', function () {
                const link = document.createElement('a');
                link.href = img.src;
                link.download = 'generated_image.png'; // Name of the downloaded file
                link.click();
            });

            // Clear the div and append the new elements
            generatedImageDiv.innerHTML = '';
            generatedImageDiv.appendChild(img);
            generatedImageDiv.appendChild(button);
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            // Hide the overlay
            document.getElementById('overlay').style.display = 'none';
        });
});
