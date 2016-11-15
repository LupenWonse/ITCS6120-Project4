
// WebGL Objects
var canvas;
var gl;
var program;

// Data
var points = [];

// Vertex Buffer
var vBuffer;

// Proejction variables
var near = 1.0;
var far = 100.0;
var right = 2;
var left = -2;
var pTop = 3;
var pBottom = -1;

// ModelView Transformation variables
var eye = vec3(90.0, 550.0, 1.0);
var at = vec3(91.0, 550.0, 1.0);
var up = vec3(0.0, 0.0, -1.0);

var mvLocation, pLocation;
var modelView, projection;

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
    

    // Load uniform locations
    mvLocation = gl.getUniformLocation(program,"modelViewMatrix");
    pLocation = gl.getUniformLocation(program,"projectionMatrix");

    
    // Load data into memory
    generateRoomsFromData();
    console.log(points);
    render();
};

// Main render function
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);

    // Setup model-view and projection matrices
    mvMatrix = lookAt(eye, at, up);
    pMatrix = perspective();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    
    // Update the matrices in the shaders
    gl.uniformMatrix4fv(mvLocation, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(pLocation, false, flatten(pMatrix));
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
    for (room in data.rooms) {
        polygon(data.rooms[room].polygon);
    }
}


// Modelling functions

function polygon(vertices){
    // This function generates a room from the given polygon
    // Polygon is provided as an array of vertices
    
    // If a vertex has 3 elements instead of two then this vertex is a DOOR
    
    var polygonVertices = [], elevatedVertices = [];
    for (var i = 0 ; i < vertices.length; i++){
        polygonVertices.push(vec4(vertices[i][0],vertices[i][1],0));
        elevatedVertices.push(vec4(vertices[i][0],vertices[i][1],12));
    }
    
    console.log(elevatedVertices);
    
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
            console.log("Door");
            a[2] = -8;
            d[2] = -8;
        }
        triangle(a,b,c);
        triangle(a,d,c);
    }   
}

function triangle(a, b, c) {
    points.push(a);
    points.push(b);
    points.push(c);
    
     //normals.push(vec4(a[0],a[1],a[2],0.0));
     //normals.push(vec4(b[0],b[1],b[2],0.0));
     //normals.push(vec4(c[0],c[1],c[2],0.0));
    
    //colors.push(sphereColor);
    //colors.push(sphereColor);
    //colors.push(sphereColor);

     //index += 3;
}

window.onkeypress = function () {
    if (event.key == "a") {
        eye[0] = eye[0] - 1;
        at[0] = at[0] - 1;
    } else if (event.key == "d") {
        eye[0] = eye[0] + 1;
        at[0] = at[0] + 1;
    } else if (event.key == "s") {
        eye[1] = eye[1] - 1;
        at[1] = at[1] - 1;
    } else if (event.key == "w") {
        eye[1] = eye[1] + 1;
        at[1] = at[1] + 1;
    }
}



/*
var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];
var normals = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;

var spehereResolution = 6;
var sphereColor = vec4(1.0,1.0,0.0,1.0);

// Light source parameters
var lightPosition = vec4(1.0,1.0,1.0,1.0);
var ambientColor = vec4(0.2,0.2,0.2,1.0);
var diffuseColor = vec4(1,1.0,1.0,1.0);
var specularColor = vec4(1.0,1.0,1.0,1.0);

// Material parameters
var reflectAmbient = vec4(0.4,0.4,0.4,1.0);
var reflectDiffuse = vec4(0.2,0.2,0.2,1.0);
var reflectSpecular = vec4(1.0,1.0,1.0,1.0);
var shininess = 20.0;

// Proejction variables
var near = 1.0;
var far = 10.0;
var right = 0.5;
var left = -0.5;
var pTop = 0.5;
var pBottom = -0.5;

// ModelView Transformation variables
var eye = vec3(0.0,0.0,2.0);
var at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var mvMatrix, pMatrix;
var modelView, projection;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Create buffers
    nBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();
    // Setup webgl
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    var cPosition = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( cPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( cPosition );

    // Generate the selected model and load it into the buffers
    updateModel();
    
    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    // Calculate lighting properties
    var ambientProduct = mult(ambientColor, reflectAmbient);
    var diffuseProduct = mult(diffuseColor, reflectDiffuse);
    specularProduct = mult(specularColor, reflectSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),diffuseProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),specularProduct);
    
    gl.uniform4fv(gl.getUniformLocation(program, "reflectAmbient"),reflectAmbient);
    gl.uniform4fv(gl.getUniformLocation(program, "reflectDiffuse"),reflectDiffuse);
    
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),lightPosition);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),shininess);
    
    modelView = gl.getUniformLocation( program, "modelViewMatrix" );
    projection = gl.getUniformLocation( program, "projectionMatrix" );
    
    //event listeners for buttons
    
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    
    // Start rendering
    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Setup model-view and projection matrices
    mvMatrix = lookAt(eye, at, up);
    pMatrix = perspective2();

    
    // Update the matrices in the shaders
    gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
    gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );
    
    // Increment theta
    theta[axis] -= 2.0;
    // Update theta in GPU memory
    gl.uniform3fv(thetaLoc, theta);

    // Draw
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    // Redraw
    requestAnimFrame( render );
}
 

// Model 1 Cube Generation
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];
    
    var t1 = subtract (vertices[b], vertices[a]);
    var t2 = subtract (vertices[c], vertices[b]);
    var normal = vec4(normalize(cross(t1,t2)));
    normal[3] = 0;

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        normals.push( normal);
        colors.push( vertexColors[indices[i]] );
    
        // for solid colored faces use 
        //colors.push(vertexColors[a]);
        
    }
}


// Model 2 SPHERE Generation code
// Vertices of the base tetrahedron

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var speheColor = [0.5,0.5,0.0,1.0];
    
    
function triangle(a, b, c) {
     normals.push(vec4(a[0],a[1],a[2],0.0));
     normals.push(vec4(b[0],b[1],b[2],0.0));
     normals.push(vec4(c[0],c[1],c[2],0.0));
     
     points.push(a);
     points.push(b);      
     points.push(c);
    
    colors.push(sphereColor);
    colors.push(sphereColor);
    colors.push(sphereColor);

     //index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}


// UI Integration Code
function updateLight(){
    
    
    lightPosition[0] = document.getElementById("lightX").value;
    lightPosition[1] = document.getElementById("lightY").value;
    lightPosition[2] = document.getElementById("lightZ").value;
    
    shininess = document.getElementById("shininess").value;
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),lightPosition);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),shininess);
    
    specularColor[0] = document.getElementById("specR").value;
    specularColor[1] = document.getElementById("specG").value;
    specularColor[2] = document.getElementById("specB").value;
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),mult(specularColor,reflectSpecular));
}

// Perspective matrix generation

function perspective2()
{
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

function updateModel(){
    spehereResolution = document.getElementById("sphereResolution").value;
    points = [];
    normals = [];
    colors = [];
    console.log(document.getElementById("modelCube"));
    if (document.getElementById("modelCube").checked) {
       colorCube(); 
    } else {
        tetrahedron(va, vb, vc, vd, spehereResolution);
    }
    
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
}
*/



