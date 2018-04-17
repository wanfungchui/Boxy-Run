
/**
 *
 * BOXY RUN
 * ----
 * Character demonstration, created with love by Walvin An
 *
 * Boilerplate for character, scene, camera, renderer, lights taken from
 * https://codepen.io/dalhundal/pen/pJdLjL
 *
 */

/**
 * Constants used in this game.
 */
var Colors = {
	cherry: 0xe35d6a,
	blue: 0x1560bd,
	white: 0xd8d0d1,
	black: 0x000000,
	brown: 0x59332e,
	peach: 0xffdab9,
	yellow: 0xffff00,
	olive: 0x556b2f,
};

var deg2Rad = Math.PI / 180;

// Make a new world when the page is loaded.
window.addEventListener('load', function(){
	new World(document.getElementById('world'));
});

/**
 * Utility function for generating current values of sinusoidally
 * varying variables. All sinusoids of equal frequency are globally 
 * synced, so the phase argument fully specifies the relative phase.
 *
 * @param {number} FREQUENCY The number of oscillations per second.
 * @param {number} MINIMUM The minimum value of the sinusoid.
 * @param {number} MAXIMUM The maximum value of the sinusoid.
 * @param {number} PHASE The phase offset in degrees.
 * @return {number} The offset of the sinusoid at the current time.
 *
 */
function sinusoid(frequency, minimum, maximum, phase) {
	var amplitude = 0.5 * (maximum - minimum);
	var angularFrequency = 2 * Math.PI * frequency;
	var phaseRadians = phase * Math.PI / 180;
	var currTimeInSecs = new Date() / 1000;
	var offset = amplitude * Math.sin(
		angularFrequency * currTimeInSecs + phaseRadians);
	var average = (minimum + maximum) / 2;
	return average + offset;
}

/**
 * Creates an empty group of objects at a specified location.
 *
 * @param {number} X The x-coordinate of the group.
 * @param {number} Y The y-coordinate of the group.
 * @param {number} Z The z-coordinate of the group.
 * @return {Three.Group} An empty group at the specified coordinates.
 *
 */
function createGroup(x, y, z) {
	var group = new THREE.Group();
	group.position.set(x, y, z);
	return group;
}

/**
 * Creates and returns a simple box with the specified properties.
 *
 * @param {number} DX The width of the box.
 * @param {number} DY The height of the box.
 * @param {number} DZ The depth of the box.
 * @param {color} COLOR The color of the box.
 * @param {number} X The x-coordinate of the center of the box.
 * @param {number} Y The y-coordinate of the center of the box.
 * @param {number} Z The z-coordinate of the center of the box.
 * @param {boolean} NOTFLATSHADING True iff the flatShading is false.
 * @return {THREE.Mesh} A box with the specified properties.
 *
 */
function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({
		color:color, 
    	flatShading: notFlatShading != true
    });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = false;
    box.position.set(x, y, z);
    return box;
}

/**
  * The player's character in the game.
  */
function Character() {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Character defaults.
	this.skinColor = Colors.brown;
	this.hairColor = Colors.black;
	this.shirtColor = Colors.yellow;
	this.shortsColor = Colors.olive;
	this.stepFreq = 2;

	// Initialize the character.
	init();

	/**
	  * Builds the character in depth-first order. The parts of are 
  	  * modelled by the following object hierarchy:
	  *
	  * - character (this.element)
	  *    - head
	  *       - face
	  *       - hair
	  *    - torso
	  *    - leftArm
	  *       - leftLowerArm
	  *    - rightArm
	  *       - rightLowerArm
	  *    - leftLeg
	  *       - rightLowerLeg
	  *    - rightLeg
	  *       - rightLowerLeg
	  * 
	  */
	function init() {

		self.face = createBox(100, 100, 60, self.skinColor, 0, 0, 0);
		self.hair = createBox(105, 20, 65, self.hairColor, 0, 50, 0);
		self.head = createGroup(0, 260, -25);
		self.head.add(self.face);
		self.head.add(self.hair);

		self.torso = createBox(150, 190, 40, self.shirtColor, 0, 100, 0);

		self.leftLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
		self.leftArm = createLimb(30, 140, 40, self.skinColor, -100, 190, -10);
		self.leftArm.add(self.leftLowerArm);

		self.rightLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
		self.rightArm = createLimb(30, 140, 40, self.skinColor, 100, 190, -10);
		self.rightArm.add(self.rightLowerArm);

		self.leftLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
		self.leftLeg = createLimb(50, 170, 50, self.shortsColor, -50, -10, 30);
		self.leftLeg.add(self.leftLowerLeg);

		self.rightLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
		self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
		self.rightLeg.add(self.rightLowerLeg);

		self.element = createGroup(0, 0, -300);
		self.element.add(self.head);
		self.element.add(self.torso);
		self.element.add(self.leftArm);
		self.element.add(self.rightArm);
		self.element.add(self.leftLeg);
		self.element.add(self.rightLeg);

	}

	/**
	 * Creates and returns a limb with an axis of rotation at the top.
	 *
	 * @param {number} DX The width of the limb.
	 * @param {number} DY The length of the limb.
	 * @param {number} DZ The depth of the limb.
	 * @param {color} COLOR The color of the limb.
	 * @param {number} X The x-coordinate of the rotation center.
	 * @param {number} Y The y-coordinate of the rotation center.
	 * @param {number} Z The z-coordinate of the rotation center.
	 * @return {THREE.GROUP} A group that includes a box representing
	 *                       the limb, with the specified properties.
	 *
	 */
	function createLimb(dx, dy, dz, color, x, y, z) {
	    var limb = createGroup(x, y, z);
	    var offset = -1 * (Math.max(dx, dz) / 2 + dy / 2);
		var limbBox = createBox(dx, dy, dz, color, 0, offset, 0);
		limb.add(limbBox);
		return limb;
	}
	
	/**
	 * A method called on the character when time moves forward.
	 */
	this.update = function() {
		self.element.rotation.y += 0.02;
		self.element.position.y = sinusoid(2 * self.stepFreq, 0, 20, 0);
		self.head.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 0) * deg2Rad;
		self.torso.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 180) * deg2Rad;
		self.leftArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 180) * deg2Rad;
		self.rightArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 0) * deg2Rad;
		self.leftLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 180) * deg2Rad;
		self.rightLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 0) * deg2Rad;
		self.leftLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 0) * deg2Rad;
		self.rightLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 180) * deg2Rad;
		self.leftLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 240) * deg2Rad;
		self.rightLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 60) * deg2Rad;
	}

}

/** 
  * The world in which Boxy Run takes place.
  */
function World(element) {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Scoped variables in this world.
	var scene, camera, character, renderer, light, shadowLight;

	// Initialize the world.
	init();
	
	/**
	  * Builds the renderer, scene, lights, camera, and the character,
	  * then begins the rendering loop.
	  */
	function init() {

		// Initialize the renderer.
		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		element.appendChild(renderer.domElement);

		// Initialize the scene.
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x363d3d, -1, 3000);

		// Initialize the lights.
		light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
		shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
		shadowLight.position.set(200, 200, 200);
		shadowLight.castShadow = true;
		scene.add(light);
		scene.add(shadowLight);

		// Initialize the camera with field of view, aspect ratio,
		// near plane, and far plane.
		camera = new THREE.PerspectiveCamera(
			60, window.innerWidth / window.innerHeight, 1, 2000);
		camera.position.set(0, 400, 800);
		camera.lookAt(new THREE.Vector3(0, 150, 0));
		window.camera = camera;

		// Set up resizing capabilities.
		window.addEventListener('resize', handleWindowResize, false);

		// Initialize the character and add it to the scene.
		character = new Character();
		scene.add(character.element);

		// Begin the rendering loop.
		loop();
		
	}
	
	/**
	  * The main animation loop.
	  */
	function loop() {
		character.update();
		renderer.render(scene, camera);
		requestAnimationFrame(loop);
	}

	/**
	  * A method called when window is resized.
	  */
	function handleWindowResize() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	
}
