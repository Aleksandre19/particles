const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;


// Convert dgree to radian
// Formula is: PI * r = 180 degrees
const randomRange = (min, max) => {
    return Math.random() * (max - min) + min;
}

const mapRange = (value, fromMin, fromMax, toMin, toHig) => {
    return (value - fromMin) * (toHig - toMin) / (fromMax - fromMin)  + toMin;
}

/* -------------- The code ---------------- */
let animationID;

class Particle{
  constructor({x, y, radius = 10, color, colA}) {
    // Position
    this.x = x;
    this.y = y;

    // Axeleration
    this.ax = 0;
    this.ay = 0;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // Initial value
    this.ix = x;
    this.iy = y;

    this.radius = radius; 
    this.scale = 2;
    this.colA = colA;
    this.color = this.colA;
    this.updateColor = color;

    this.minDist = randomRange(100, 200);
    this.pushFactor = randomRange(0.01, 0.02);
    this.pullFactor = randomRange(0.002, 0.006);
    this.dampFactor = randomRange(0.90, 0.95);
  }

  update() {
    let dx, dy, dd, distDelta;

    // Pull force bewteen the cursor and particle.
    dx = this.ix - this.x;
    dy = this.iy - this.y;
    dd = Math.sqrt(dx * dx + dy * dy);
    
    // Acceleration.
    this.ax = dx * this.pullFactor;
    this.ay = dy * this.pullFactor;
    
    // Scale the radius of the particle depending on the
    // distance between the cursor and particle.
    this.scale = mapRange(dd, 0, 200, 1, 3);
    
    // Change the color of the scaled particle depending 
    // on the it's scale.
    if (this.scale > 2) this.color = this.updateColor;
    else this.color = this.colA;


    // Push force of the mouse to the particle.
    dx = this.x - cursor.x;
    dy = this.y - cursor.y;
    dd = Math.sqrt(dx * dx + dy * dy);

    distDelta = this.minDist - dd;

    // When the distance between the mouse and particle 
    // is less than the min distance.
    if (dd < this.minDist) {

      // As close the mouse is to the particle as acceleration
      // of the particle increases.
      this.ax += (dx / dd) * distDelta * this.pushFactor;
      this.ay += (dy / dd) * distDelta * this.pushFactor;
     }
    
    // Apply the acceleration to the velocity.
    this.vx += this.ax;
    this.vy += this.ay;
    
    // Set the damping factor to the velocity.
    this.vx *= this.dampFactor;
    this.vy *= this.dampFactor;

    this.x += this.vx;
    this.y += this.vy;

  }

  // Draw the particle.
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.color;

    context.beginPath();
    context.arc(0, 0, this.radius * this.scale , 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

// Set the cursor away from the particles. 
const cursor = { x: 9999, y: 9999 };
let mouseUp = false;

const onMouseDown = (e) => {
  mouseUp = false;

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  animate();
  onMouseMove(e);
}

const onMouseMove = (e) => {
  // The mouse current position.
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
}


const onMouseUp = () => {
  mouseUp = true;
  canvas.removeEventListener('mousemove', onMouseMove);
  canvas.removeEventListener('mouseup', onMouseUp);

  cursor.x = 9999;
  cursor.y = 9999;
}

// Reference to the particle calss.
const callParticles = (particles) => {
  return  particles.forEach(particle => {
    particle.update();
    particle.draw(context);
  });
}

let startPos = 0;
const particles = [];
const animate = () => {

  // Clear context after every frame.
  context.clearRect(0, 0, width, height);

  // Sort the array by particles scale so the big
  // particles appears top of the small ones.
  particles.sort((a, b) => a.scale - b.scale);
  
  // Draw and update particles.
  callParticles(particles);

  animationID = requestAnimationFrame(animate);

  // Cancel the animation when all particles
  // are back to the initial place.
  if (mouseUp) {
    if (Math.abs(particles[particles.length - 1].scale) <= 1.05) {
      cancelAnimationFrame(animationID);
    }
  }
}

// To draw the image on the particles the code
// creates the second unvisible canvas element,
// draws the reference image on it and finds every 
// pixel of the reference image which coresponds
// the x and y of the particles.

// Particles are drawn before implementation 
//  the reference image code.

let imgA;
const skatch = (width, height) => {
  canvas.addEventListener('mousedown', onMouseDown);
  
  // Creat the canvas element for the reference images.
  const imgACanvas = document.createElement('canvas');
  const imgAContext = imgACanvas.getContext('2d');

  // Set the demention of the reference 
  // image to the second canvas.
  imgACanvas.width = imgA.width;
  imgACanvas.height = imgA.height;

  // Draw the reference image.
  imgAContext.drawImage(imgA, 0, 0);

  // Extract the data/colors from the reference image.
  const imgAData = imgAContext.getImageData(0, 0, imgA.width, imgA.height).data;

  let x, y, particle, radius;
  const numCircles = 25;
  const gapCircle = 1;
  const gapDot = 1;
  let color;
  let dotRadius = 6;
  let cirRadius = 0;
  const fitRadius = dotRadius;

  for (let i = 0; i < numCircles; i++){
    // The each circles circumference.
    const circumference = Math.PI * 2 * cirRadius;
    // Calculate to see how many particles fit around the each circle.
    const numFit = i ? Math.floor(circumference / (fitRadius * 2 + gapDot)) : 1;
    const fitSlice = Math.PI * 2 / numFit;
    let ix, iy, idx, r, g, b, colA;
    
    for (let j = 0; j < numFit; j++) {

      // Angle of the particles position on the circle;
      const theta = fitSlice * j;

      // Find cos and sin of the particle.
      x = Math.cos(theta) * cirRadius;
      y = Math.sin(theta) * cirRadius;

      // Position the particles in the center of the canvas.
      x += width * 0.5;
      y += height * 0.5;

      // The particles radius.
      radius = dotRadius;

      // Find the pixel of the reference image
      // which coresponds the x and y of the particle.
      ix = Math.floor((x / width)  * imgA.width);
			iy = Math.floor((y / height) * imgA.height);
      // Find the index of the array to access 
      // reference image data/colors.
      idx = (iy * imgA.width + ix) * 4;
    
      

      // Pick up the colors from the image for the particles.
			r = imgAData[idx + 0];
			g = imgAData[idx + 1];
			b = imgAData[idx + 2];
			colA = `rgb(${r}, ${g}, ${b})`;

      // Generate random collors for the increased particles
      // after the mouse has been overed over them. 
      r = randomRange(0, 255);
      g = randomRange(0, 255);
      b = randomRange(0, 255);
      color = `rgb(${r}, ${r}, ${b})`;

      // Initialize the particles and puch populate them
      // in to the array to be used in the animate function.
      particle = new Particle({ x, y, radius, color, colA });
      particles.push(particle);
    }

    // Increment the circle radius after each iteration.
    cirRadius += fitRadius * 2 + gapCircle;

    // Decrement the particle's radius at each circle
    // from the center to the edges.
    dotRadius = (1 - i / numCircles) * fitRadius;

  }
  
  // Locate the particles on the positions
  // stright after the loading of the page.
  if (!animationID) {
    callParticles(particles);
  }
}

// Import the reference image.
const loadImage = async (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
};

// Wait untill the image loads.
const start = async () => { 
  imgA = await loadImage('images/ref.jpeg'); 
  skatch(width, height); 
}

start();






