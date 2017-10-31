const canvas = document.querySelector('#webcam-video');
const context = canvas.getContext('2d');
if (isShapeDetectionApiSupported()) {
    runShapeDetectionApiDemo();
} else {
    displayFallbackMessage();
}

function isShapeDetectionApiSupported() {
    return window.FaceDetector && window.TextDetector && window.BarcodeDetector;
}

let addMario = false;
const mustacheBtn = document.getElementById('mario').addEventListener('click', function(){
    if (!addMario) {
        addPenny = false;
        addHp = false;
        addMario = true;
    } else {
        addMario = false;
    }
}, false);
let addPenny = false;
const pennyBtn = document.getElementById('penny').addEventListener('click', function(){
    if (!addPenny) {
        addPenny = true;
        addHp = false;
        addMario = false;
    } else {
        addPenny = false;
    }
}, false);
let addHp = false;
const hpBtn = document.getElementById('hp').addEventListener('click', function(){
    if (!addHp) {
        addPenny = false;
        addHp = true;
        addMario = false;
    } else {
        addHp = false;
    }
}, false);
let addFrame = true;
// const frameBtn = document.getElementById('frame').addEventListener('click', function(){
//     if (!addFrame) {
//         addFrame = true;
//     } else {
//         addFrame = false;
//     }
// }, false);
let showBounds = false;
// const boundsBtn = document.getElementById('bounding-box').addEventListener('click', function(){
//     if (!showBounds) {
//         showBounds = true;
//     } else {
//         showBounds = false;
//     }
// }, false);

// References to all the element we will need.
var image = document.querySelector('#snap'),
    start_camera = document.querySelector('#start-camera'),
    controls = document.querySelector('.controls'),
    take_photo_btn = document.querySelector('#take-photo'),
    delete_photo_btn = document.querySelector('#delete-photo'),
    download_photo_btn = document.querySelector('#download-photo');

async function runShapeDetectionApiDemo() {
    const constraints = { video: { facingMode: 'environment' } };
    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.autoplay = true;
    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    };

    let renderLocked = false;
    const faceDetector = new FaceDetector({ fastMode: true });
    const textDetector = new TextDetector();
    const barcodeDetector = new BarcodeDetector();

    showVideo();

    let photo;

    // function wait(ms){
    //    var start = new Date().getTime();
    //    var end = start;
    //    while(end < start + ms) {
    //      end = new Date().getTime();
    //   }
    // }

    take_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        let timeleft = 10;
        let timer = document.getElementById("countdowntimer");
        timer.classList.add("visible");
        let downloadTimer = setInterval(function(){
            timeleft--;
            timer.textContent = timeleft;
            if(timeleft <= 0) {
                clearInterval(downloadTimer);
                timer.classList.remove('visible');
            }
        }, 1000);

        setTimeout(function () {
            var snap = takeSnapshot();
            console.log('snap!!');

            // Show image.
            image.setAttribute('src', snap);
            image.classList.add("visible");

            // Enable delete and save buttons
            delete_photo_btn.classList.remove("disabled");
            download_photo_btn.classList.remove("disabled");

            // Set the href attribute of the download button to the snap url.
            download_photo_btn.href = snap;

            // Pause video playback of stream.
            video.pause();
        }, 10000);

    });

    delete_photo_btn.addEventListener("click", function(e){

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();

    });

    function showVideo(){
        // Display the video stream and the controls.

        hideUI();
        canvas.classList.add("visible");
        controls.classList.add("visible");
    }


    function takeSnapshot(){
        // Here we're using a trick that involves a hidden canvas element.

        var hidden_canvas = document.querySelector('#snapshot'),
            context = hidden_canvas.getContext('2d');

        var width = canvas.width,
            height = canvas.height;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(canvas, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }
    }

    function hideUI(){
        // Helper function for clearing the app UI.

        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        snap.classList.remove("visible");
    }

    function render() {
        if (!video.paused) {
            renderLocked = true;
            Promise.all([
                faceDetector.detect(video).catch((error) => console.error(error)),
                textDetector.detect(video).catch((error) => console.error(error)),
                barcodeDetector.detect(video).catch((error) => console.log(error))
            ]).then(([detectedFaces = [], detectedTexts = [], detectedBarcodes = []]) => {
                let mustache = new Image();
                mustache.src = 'images/mario-mustache.gif';
                let mHat = new Image();
                mHat.src = 'images/mario-hat.png';
                let pMouth = new Image();
                pMouth.src = 'images/penny-wise.png';
                let pBalloon = new Image();
                pBalloon.src = 'images/pennywise-balloon.png';
                let hpGlasses = new Image();
                hpGlasses.src = 'images/hp-glasses.png';
                let hpHat = new Image();
                hpHat.src = 'images/hp-hat.png';
                let ddFrame = new Image();
                ddFrame.src = 'images/DD-frame.png';


                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                if (addFrame) {
                    context.drawImage(ddFrame, 0, 0, video.videoWidth, video.videoHeight);
                }

                context.strokeStyle = 'rgba(0, 0, 0, .5)';
                context.fillStyle = 'yellow';
                context.font = '16px Mononoki';
                context.lineWidth = 5;

                detectedFaces.forEach((detectedFace) => {
                    const { top, left, width, height } = detectedFace.boundingBox;
                    if (showBounds) {
                        context.beginPath();
                        context.rect(left, top, width, height);
                        context.stroke();
                        context.fillText('face detected', left + 5, top - 8);

                        if (addHP) {
                            context.drawImage(hpGlasses, left, top, width, height);
                            context.drawImage(hpHat, left, top, width, height);
                        }
                    }

                    if (detectedFace.landmarks) {
                        detectedFace.landmarks.forEach((landmark) => {
                            if (showBounds) {
                                context.beginPath();
                                context.arc(landmark.location.x, landmark.location.y, 5, 0, Math.PI * 2);
                                context.fill();
                                context.fillText(landmark.type, landmark.location.x + 10, landmark.location.y + 4);
                            }

                            if(landmark.type === "mouth") {
                                // put the middle of the image at the landmark x and y location
                                // width of the boundingBox
                                let mWidth = width * .8; // 80% width
                                let mHeight = height / 2.5;
                                let mX = (landmark.location.x - (mWidth / 2));
                                let mY = ((landmark.location.x - (mHeight / 1.15)));

                                // bounding box right minus x location
                                if(addMario) {
                                    context.drawImage(mustache, mX, mY, mWidth, mHeight);
                                    context.drawImage(mHat, left, (top - (height * .5)), (width), (height * .65));
                                }

                                if (addPenny) {
                                    context.drawImage(pMouth, mX, mY, mWidth, mHeight);
                                    context.drawImage(pBalloon, landmark.location.x, landmark.location.x, width, height);
                                }
                            }

                            if(landmark.type === "eye") {

                              }
                        });
                    }
                    // console.log(detectedFace);

                    // let mustache = new Image();
                    // mustache.src = 'images/mario-mustache.gif';
                    // mustache.onload = function()
                    // {
                    //      context.drawImage(mustache, 78, 19);
                    // }

                });

                context.strokeStyle = '#f44336';
                context.fillStyle = '#f44336';
                context.font = '24px Mononoki';

                // detectedTexts.forEach((detectedText) => {
                //     const { top, left, width, height } = detectedText.boundingBox;
                //     context.beginPath();
                //     context.rect(left, top, width, height);
                //     context.stroke();
                //     context.fillText(detectedText.rawValue, left + 5, top - 12);
                // });

                context.strokeStyle = '#03A9F4';
                context.fillStyle = '#03A9F4';
                context.font = '16px Mononoki';

                // detectedBarcodes.forEach((detectedBarcode) => {
                //     const { top, left, width, height } = detectedBarcode.boundingBox;
                //     const cornerPoints = detectedBarcode.cornerPoints;
                //     if (cornerPoints && cornerPoints.length) {
                //         const [{ x, y }] = cornerPoints;
                //         context.beginPath();
                //         context.moveTo(x, y);
                //         for (let i = 1; i < cornerPoints.length; i++) {
                //             context.lineTo(cornerPoints[i].x, cornerPoints[i].y);
                //         }
                //         context.closePath();
                //     } else {
                //         context.beginPath();
                //         context.rect(left, top, width, height);
                //     }
                //     context.stroke();
                //     context.fillText(detectedBarcode.rawValue, left, top + height + 16);
                // });

                renderLocked = false;
            });
        }
    }

    (function renderLoop() {
        requestAnimationFrame(renderLoop);
        if (!renderLocked) {
            render();
        }
    })();
};

function displayFallbackMessage() {
    document.querySelector('.fallback-message').classList.remove('hidden');
    document.querySelector('#webcam-video').classList.add('hidden');
    document.querySelector('.links').classList.add('hidden');
}
