let cvsIn = document.getElementById("inputimg");
let ctxIn = cvsIn.getContext('2d');
let divOut = document.getElementById("predictdigit");
let svgGraph = null;
let mouselbtn = false;


// initilize
window.onload = function(){

    ctxIn.fillStyle = "white";
    ctxIn.fillRect(0, 0, cvsIn.width, cvsIn.height);
    ctxIn.lineWidth = 15;
    ctxIn.lineCap = "round";
}

// add cavas events
cvsIn.addEventListener("mousedown", function(e) {

    if(e.button == 0){
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        mouselbtn = true;
        ctxIn.beginPath();
        ctxIn.moveTo(x, y);
    }
    else if(e.button == 2){
        onClear();  // right click for clear input
    }
});

cvsIn.addEventListener("mouseup", function(e) {
    if(e.button == 0){
        mouselbtn = false;
        onRecognition();
    }
});
cvsIn.addEventListener("mousemove", function(e) {
    let rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if(mouselbtn){
        ctxIn.lineTo(x, y);
        ctxIn.stroke();
    }
});

cvsIn.addEventListener("touchstart", function(e) {
    // for touch device
    if (e.targetTouches.length == 1) {
        let rect = e.target.getBoundingClientRect();
        let touch = e.targetTouches[0];
        let x = touch.clientX - rect.left;
        let y = touch.clientY - rect.top;
        ctxIn.beginPath();
        ctxIn.moveTo(x, y);
    }
});

cvsIn.addEventListener("touchmove", function(e) {
    // for touch device
    if (e.targetTouches.length == 1) {
        let rect = e.target.getBoundingClientRect();
        let touch = e.targetTouches[0];
        let x = touch.clientX - rect.left;
        let y = touch.clientY - rect.top;
        ctxIn.lineTo(x, y);
        ctxIn.stroke();
        e.preventDefault();
    }
});

cvsIn.addEventListener("touchend", function(e) {
    // for touch device
    onRecognition();
});

// prevent display the contextmenu
cvsIn.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.getElementById("clearbtn").onclick = onClear;
function onClear(){
    mouselbtn = false;
    ctxIn.fillStyle = "white";
    ctxIn.fillRect(0, 0, cvsIn.width, cvsIn.height);
    ctxIn.fillStyle = "black";
}

function get_image_data(){
    var datum = ctxIn.getImageData(0,0,196,196)
    var pixel = datum.data
    var gs = new Array();
    var j=0;
    for (var i = 0; i < pixel.length; i += 4) {
        // var avg = (pixel[i] + pixel[i + 1] + pixel[i + 2]) / 3;
        // pixel[i] = avg; // red
        gs[j] = pixel[i];
        j++;
        // pixel[i + 1] = avg; // green
        // pixel[i + 2] = avg; // blue
    }
    console.log(pixel);
    console.log(gs);
    return gs;
}

// post data to server for recognition
async function onRecognition() {
    console.time("predict");

    var img_data = get_image_data();
    // data : {img : cvsIn.toDataURL("image/png").replace('data:image/png;base64,','') }
    var payload = {
        "data" : cvsIn.toDataURL("image/png").replace('data:image/png;base64,','')
    }
    console.log(JSON.stringify(payload))

    var response = await fetch('https://mrj5bjvhhh.execute-api.us-east-1.amazonaws.com/prod', {
        method: 'POST',
        body: JSON.stringify(payload), // string or object
        dataType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
    });
    var myJson = await response.json();
    console.log(myJson);
    showResult(JSON.parse(myJson))
    // return myJson;

    // $.ajax({
    //         url: 'https://mrj5bjvhhh.execute-api.us-east-1.amazonaws.com/prod',
    //         type:'POST',
    //         data : {img : cvsIn.toDataURL("image/png").replace('data:image/png;base64,','') },

    //     }).done(function(data) {

    //         showResult(JSON.parse(data))

    //     }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
    //         console.log(XMLHttpRequest);
    //         alert("error");
    //     })

    //console.timeEnd("time");
    //var datum = {img : cvsIn.toDataURL("image/png").replace('data:image/png;base64,','') };
    
}


function showResult(resultJson){

    // show predict digit
    divOut.textContent = resultJson.prediction;

    // show probability
    document.getElementById("probStr").innerHTML =
        "Probability : " + resultJson.probability.toFixed(2) + "%";

}


function drawImgToCanvas(canvasId, b64Img){
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext('2d');
    let img = new Image();
    img.src = "data:image/png;base64," + b64Img;
    img.onload = function(){
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    }
}
