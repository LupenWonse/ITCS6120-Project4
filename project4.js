
// WebGL Objects
var canvas;
var gl;
var program;

// Data
var points = [];
var colors = [];
var normals = [];

// Temporary Current Color variable
var currentColor = [];

// Material properties for lighting
var reflectAmbient = [0.5,0.5,0.5,1];
var reflectDiffuse = [0.3,0.3,0.3,1];
var wallColor = [1,0.55,0,1];
var floorColor = [0.9,0.9,0.9,1];
var ceilingColor = [0.9,0.9,0.9,1];

// Light properties
var lightPosition = vec4(90.0, 550.0, -4.0,1);

// Vertex Buffer // Color Buffer // Normals Buffer
var vBuffer;
var cBuffer;
var nBuffer;
// Uniform locations
var reflectAmbientUniformLocation;
var reflectDiffuseUniformLocation;
var lightPositionUniformLocation;

// Proejction variables
var near = 1.0;
var far = 100.0;
var right = 2;
var left = -2;
var pTop = 3;
var pBottom = -1;

// ModelView Transformation variables
// Current instant transformaion
var instanceTransform = mat4(1);

var lookAlpha = 0/180*Math.PI;
var lookBeta = 90/180*Math.PI; ;
// First Person View
var eye = vec3(90.0, 550.0, -4.0);
var at = vec3(91.0, 550.0, -4.0);
var up = vec3(0.0, 0.0, -1.0);

//Top Down View
//var eye = vec3(90.0, 550.0, -50.0);
//var at = vec3(90.0, 550.0, -49.0);
//var up = vec3(0.0, -1.0, 0.0);

var mvLocation, pLocation;
var modelView, projection;

// Option Flags
var showCeilings = true;
var showFloors = true;

//Internal Data
var countRooms = 0;
var countTriangles = 0;

window.onload = function init() {
    "use strict";
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { this.alert("WebGL isn't available"); }
    
    // Setup webgl
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 1.0, 1.0);
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // Create the vertex color buffer
    // This might have to removed / changed when implementing lighting / shading models
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var cPosition = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(cPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cPosition);
    
    // Create the normals buffer
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    var nPosition = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(nPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(nPosition);
    

    // Load uniform locations
    mvLocation = gl.getUniformLocation(program,"modelViewMatrix");
    pLocation = gl.getUniformLocation(program,"projectionMatrix");
    
    reflectAmbientUniformLocation = gl.getUniformLocation(program,"reflectAmbient");
    reflectDiffuseUniformLocation = gl.getUniformLocation(program,"reflectDiffuse");
    lightPositionUniformLocation = gl.getUniformLocation(program,"lightPosition");

    // Generate model data
    generateRoomsFromData();
    // Upload model data to GPU
    updateModel();
    // Start rendering
    render();
};

// Upload model data to the GPU
function updateModel () {
    // Update vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    //Update colors
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    //Update normals
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    // Update materials
    gl.uniform4fv(reflectAmbientUniformLocation, flatten(reflectAmbient));
    gl.uniform4fv(reflectDiffuseUniformLocation, flatten(reflectDiffuse));
    
    // Update lights
    gl.uniform4fv(lightPositionUniformLocation,lightPosition);
    
    // Update UI
    document.getElementById("numberOfRooms").innerHTML = countRooms;
    document.getElementById("numberOfTriangles").innerHTML = countTriangles;
}

// Main render function
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    // Setup model-view and projection matrices
    mvMatrix = lookAt(eye, at, up);
    pMatrix = perspective();
    
    // Update the matrices in the shaders
    gl.uniformMatrix4fv(mvLocation, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(pLocation, false, flatten(pMatrix));
    
    // Update lights
    gl.uniform4fv(lightPositionUniformLocation,lightPosition);
    
    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, points.length);

    // Redraw
    requestAnimationFrame(render);
}

function perspective() {
    // Simply constructthe 4x4 Perspective matrix using the calculated formula
    var result = mat4();
    result[0][0] = 2 * near / (right - left);
    result[0][2] = (right + left) / (right - left);
    result[1][1] = 2 * near / (pTop - pBottom);
    result[1][2] = (pTop + pBottom) / (pTop - pBottom);
    result[2][2] = - (far + near) / (far - near);
    result[2][3] = - (2 *far * near) / (far - near);
    result[3][2] = -1;
    return result;
}

// Data handling functions
function generateRoomsFromData(){
    // Clear all the data
    points = [];
    colors = [];
    normals = [];
    
    countRooms = 0;
    countTriangles = 0;
    
    for (room in data.rooms) {
        countRooms++;
        floor = data.rooms[room].floor;
        polygon(data.rooms[room].polygon, floor);
    }
    

    
    // Rotate and move the stairs to its position
    r = rotate(90,[0,0,1]);
    t = translate(112,372,0);
    //instanceTransform = t;
    instanceTransform = math.multiply(t,r);
    console.log(instanceTransform);
    // Create stairs instance
    stairs(16,48,12,12);
    
    instanceTransform = mat4(1);
}


// Modelling functions

function polygon(vertices,floor){
    // This function generates a room from the given polygon
    // Polygon is provided as an array of vertices
    
    // If a vertex has 3 elements instead of two then this vertex is a DOOR
    
    var polygonVertices = [], elevatedVertices = [], floorVertices = [];
    for (var i = 0 ; i < vertices.length; i++){
        // If this vertex is a door vertex
            polygonVertices.push(vec4(vertices[i][0],vertices[i][1],(floor-1)*-12));
            elevatedVertices.push(vec4(vertices[i][0],vertices[i][1],floor*(-12))); 
        
        // Generate suitable 
        floorVertices.push(vertices[i][0]);
        floorVertices.push(vertices[i][1]);
        
    }
    
    // Triangulate the floor
    var floorTriangles = PolyK.Triangulate(floorVertices);
    
    // Set wall color
    currentColor = wallColor;
    // Draw Walls
    for (var i = 0 ; i < vertices.length; i++){
        if (i == vertices.length - 1) {
            next = 0
        } else {
            next = i+1;
        }
        
        var a = polygonVertices[i].slice(0);
        var b = elevatedVertices[i].slice(0);
        var c = elevatedVertices[next].slice(0);
        var d = polygonVertices[next].slice(0);
        
        // Door CASE
        if ( vertices[i].length == 3 ){
            a[2] = -8 + ((floor -1) * -12);
            d[2] = -8 + ((floor -1) * -12);
        }
        triangle(a,d,b);
        triangle(d,c,b);
    }   
    
    // Draw floors and ceilings
    
     for (var i = 0 ; i < floorTriangles.length; i = i + 3){
         
         // Floor
         if (showFloors) {
             currentColor = floorColor;
            var a = polygonVertices[floorTriangles[i]];
            var b = polygonVertices[floorTriangles[i+1]];
            var c = polygonVertices[floorTriangles[i+2]];
            triangle(a,c,b); 
         }
         
         if (showCeilings) {
             currentColor = ceilingColor;
             var d = elevatedVertices[floorTriangles[i]];
             var e = elevatedVertices[floorTriangles[i+1]];
             var f = elevatedVertices[floorTriangles[i+2]];
             triangle(d,e,f);             
         }
     }
}

function extrudedPolygon(vertices, ground, ceiling){
    // This function generates an extured polygon object
    // Polygon is provided as an array of vertices
    
    var polygonVertices = [], elevatedVertices = [], floorVertices = [];
    for (var i = 0 ; i < vertices.length; i++){
        // If this vertex is a door vertex
            polygonVertices.push(vec4(vertices[i][0],vertices[i][1],-ground));
            elevatedVertices.push(vec4(vertices[i][0],vertices[i][1],-ceiling)); 
        
        // Generate suitable 
        floorVertices.push(vertices[i][0]);
        floorVertices.push(vertices[i][1]);
        
    }
    
    // Triangulate the floor
    var floorTriangles = PolyK.Triangulate(floorVertices);
    
    // Set wall color
    currentColor = wallColor;
    // Draw Walls
    for (var i = 0 ; i < vertices.length; i++){
        if (i == vertices.length - 1) {
            next = 0
        } else {
            next = i+1;
        }
        
        var a = polygonVertices[i].slice(0);
        var b = elevatedVertices[i].slice(0);
        var c = elevatedVertices[next].slice(0);
        var d = polygonVertices[next].slice(0);
        
        triangle(a,b,d);
        triangle(d,b,c);
    }   
    
    // Draw floors and ceilings
    
     for (var i = 0 ; i < floorTriangles.length; i = i + 3){
         
         // Floor
         if (showFloors) {
             currentColor = floorColor;
            var a = polygonVertices[floorTriangles[i]];
            var b = polygonVertices[floorTriangles[i+1]];
            var c = polygonVertices[floorTriangles[i+2]];
            triangle(a,b,c); 
         }
         
         if (showCeilings) {
             currentColor = ceilingColor;
             var d = elevatedVertices[floorTriangles[i]];
             var e = elevatedVertices[floorTriangles[i+1]];
             var f = elevatedVertices[floorTriangles[i+2]];
             triangle(d,f,e);             
         }
     }
}

function stairs(width, length, height, steps){
    stepLength = length / steps;
    stepHeight = height / steps;
    
    for (i=0;i<steps;i++){
        console.log("Step: Width: " + width);
        extrudedPolygon([[0,0],[width,0],[width,length - (i * stepLength)],[0,length - (i * stepLength) ]],stepHeight * i,stepHeight * (i + 1));                 
    }
}

function triangle(a, b, c) {
    var ab = subtract(b,a);
    var ac = subtract(c,a);
    // Calculate normal with cross product
    var normal = vec4(cross(ab,ac),0);
    
    // Remove any calls with colinear points
    if(length(normal) != 0){
        points.push(math.multiply(instanceTransform, a));
        points.push(math.multiply(instanceTransform, b));
        points.push(math.multiply(instanceTransform, c));

        normals.push(math.multiply(instanceTransform, normal));
        normals.push(math.multiply(instanceTransform, normal));
        normals.push(math.multiply(instanceTransform, normal));

        colors.push(currentColor);
        colors.push(currentColor);
        colors.push(currentColor);

        countTriangles++;
    }
}

// Movement controller functions

window.onkeydown = function () {
   // console.log(event.keyCode);
    if (event.key == "a") {
        moveLeft();
    } else if (event.key == "d") {
        moveRight();
    } else if (event.key == "s") {
        moveBackwards();
    } else if (event.key == "w") {
        moveForward();
    } else if (event.keyCode == 37){
        lookLeft();
    } else if (event.keyCode == 38){
        lookUp();
    } else if (event.keyCode == 39){
        lookRight();
    } else if (event.keyCode == 40){
        lookDown();
    }
}



function moveForward(){
    var forward = subtract(at , eye);
    move(forward);
}

function moveLeft(){
    var forward = subtract(at , eye);
    var left = cross(up , forward);
    move(left);
}

function moveRight(){
    var forward = subtract(at , eye);
    var right = cross(forward , up);
    move(right);
}

function moveBackwards(){
    var backwards = subtract(eye,at);
    move(backwards);
}

function move(direction){
    eye = add(eye, direction);
    at = add(at, direction);
}

function lookUp(){
    lookBeta =  lookBeta + 5/180*Math.PI;
    look();
}

function lookDown(){
    lookBeta =  lookBeta - 5/180*Math.PI;
    look();
}

function lookRight(){
    lookAlpha =  lookAlpha + 5/180*Math.PI;
    look();
    
}

function lookLeft(){
    lookAlpha =  lookAlpha - 5/180*Math.PI;
    look();
}

function look(){
    var x = eye[0] + Math.cos(lookAlpha) * Math.sin(lookBeta)
    var y = eye[1] + Math.sin(lookAlpha) * Math.sin(lookBeta)
    var z = eye[2] + Math.cos(lookBeta)

    at = vec3(x,y,z);
}

// UI Functions
function uiChanged(object){
    showCeilings = document.getElementById("checkboxCeiling").checked;
    
    if(object){
        switch (object.valueElement.id){
        case "colorWall":
            wallColor = vec4(object.rgb[0]/255, object.rgb[1]/255, object.rgb[2]/255,1);
            break;
        case "colorFloor":
            floorColor = vec4(object.rgb[0]/255, object.rgb[1]/255, object.rgb[2]/255,1);
            break;
        case "colorCeiling":
            ceilingColor = vec4(object.rgb[0]/255, object.rgb[1]/255, object.rgb[2]/255,1);
            break;
        } 
    }
    generateRoomsFromData();
    updateModel();
}

function goTo(location){
console.log(goTo);
    switch (location){
        case "west":
            eye = vec3(23,373,-6);
            lookAlpha = 0;
            lookBeta = radians(90);
            look();
            break;
        case "class":
            eye = vec3(36,232,-6);
            lookAlpha = 0;
            lookBeta = radians(90);
            look();
            break;
        case "northWest":
            break;
        case "west2":
            eye = vec3(23,373,-18);
            lookAlpha = 0;
            lookBeta = radians(90);
            look();
            break;
    }
}



