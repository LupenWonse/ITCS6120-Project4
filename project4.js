
window.onload = function init() {
    "use strict";
    console.log("Window loading complete.");

    var img = document.getElementById("floorImage"),
        canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    var pixelData = canvas.getContext('2d').getImageData(0, 0, 2, 2).data;
    
    
    console.log(pixelData);
    
};