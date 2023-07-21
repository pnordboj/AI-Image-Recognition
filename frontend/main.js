var uploadContainer = document.querySelector('.upload-container');
var imageUpload = document.getElementById('imageUpload');
var submitBtn = document.getElementById('submitBtn');
var uploadPreview = document.getElementById('uploadPreview');

// File input change handler
imageUpload.addEventListener('change', function (e) {
    updateImagePreview(e.target.files[0]);
    submitBtn.disabled = false;
});

// File drop handler
uploadContainer.addEventListener('drop', function (e) {
    e.preventDefault();
    if (e.dataTransfer.items) {
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
            if (e.dataTransfer.items[i].kind === 'file') {
                var file = e.dataTransfer.items[i].getAsFile();
                imageUpload.files = new FileListItems([file]);
                updateImagePreview(file);
                submitBtn.disabled = false;
            }
        }
    }
});

uploadContainer.addEventListener('click', function () {
    imageUpload.click();
});

// Drag over handler to prevent default behavior
uploadContainer.addEventListener('dragover', function (e) {
    e.preventDefault();
});

// Update image preview
function updateImagePreview(file) {
    var reader = new FileReader();
    reader.onload = function (event) {
        while (uploadPreview.firstChild) {
            uploadPreview.firstChild.remove();
        }
        var img = document.createElement('img');
        img.src = event.target.result;
        uploadPreview.appendChild(img);
    }
    reader.readAsDataURL(file);
}


submitBtn.addEventListener('click', function () {
    var file = imageUpload.files[0];
    var formData = new FormData();
    formData.append('file', file);

    fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            var predictions = document.getElementById('predictions');
            predictions.innerHTML = ""; // Clear previous predictions
            data['predictions'].forEach(prediction => {
                var p = document.createElement('p');
                p.classList.add('prediction');
                p.innerText = `${prediction.label}: ${prediction.probability.toFixed(2)}`;
                predictions.appendChild(p);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// Create a simple helper function to allow us create a FileList object
function FileListItems(files) {
    var b = new ClipboardEvent('').clipboardData || new DataTransfer();
    for (var i = 0, len = files.length; i < len; i++) b.items.add(files[i]);
    return b.files;
}
