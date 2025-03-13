import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const loader = new THREE.TextureLoader();
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 5; // move camera back to get wider view
  
  // Add OrbitControls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.update();
  
  const scene = new THREE.Scene();
  
  // Skybox with added darker tint
  const skyboxLoader = new THREE.CubeTextureLoader();
  const skyboxTexture = skyboxLoader.load([
    'resources/images/tracks.png',  // positive x
    'resources/images/tracks.png',   // negative x
    'resources/images/tracks.png',    // positive y
    'resources/images/tracks.png', // negative y
    'resources/images/tracks.png',  // positive z
    'resources/images/tracks.png'    // negative z
  ]);
  scene.background = skyboxTexture;
  // fog
  scene.fog = new THREE.Fog(0x0a1a2a, 5, 100);
  
  // Load texture function
  function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  
  // cube faces
  const materials = [
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/1blueeye.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/2blueeye.gif') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/3blueeye.gif') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/4blueeye.jpg') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/5blueeye.gif') }),
    new THREE.MeshBasicMaterial({ map: loadColorTexture('resources/images/6blueeye.gif') }),
  ];

  // Add three light sources with dark blue light
  {
    // main light from front
    const mainLight = new THREE.DirectionalLight(0x1a3a6c, 2.0); // Dark blue light
    mainLight.position.set(2, 2, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;  // Higher resolution shadows
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    scene.add(mainLight);
    
    // secondary light from back
    const fillLight = new THREE.DirectionalLight(0x0a1a4f, 1.5); // Deeper blue
    fillLight.position.set(-3, 1, -2);
    scene.add(fillLight);
    
    // 3. spotlight from top
    const spotLight = new THREE.SpotLight(0x4a6aAA, 3); // Blue-tinted white
    spotLight.position.set(0, 5, 1);
    spotLight.angle = Math.PI / 6; // 30 degrees
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 20;
    spotLight.target.position.set(0, 0, 0); // Target the center
    spotLight.castShadow = true;
    scene.add(spotLight);
    scene.add(spotLight.target);
    
    // ambient light added
    const ambientLight = new THREE.AmbientLight(0x0a1525, 0.8);
    scene.add(ambientLight);
  }
  
  // turn on shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // added shapes
  function makeShape(geometry, color, x, texture) {
    let mesh;
    if (texture === 1) {
      mesh = new THREE.Mesh(geometry, materials);
    } else {
      const material = new THREE.MeshPhongMaterial({ 
        color: color,
        envMap: skyboxTexture,
        reflectivity: 0.5
      });
      mesh = new THREE.Mesh(geometry, material);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    mesh.position.x = x;
    return mesh;
  }

  // Create geometries for different shapes
  const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, .1);
  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16); // radius, widthSegments, heightSegments
  const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32); // radiusTop, radiusBottom, height, radialSegments

  // Create the three different shapes
  const shapes = [
    //makeShape(sphereGeometry, 0x44aa88, -2, 0),  // Sphere on the left
    makeShape(boxGeometry, 0x8844aa, 0, 1),      // Cube in the center
    //makeShape(cylinderGeometry, 0xaa8844, 2, 0)   // Cylinder on the right
  ];

  const groundSize = 100;
  const planeGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
  
  // Load ground textures
  const groundTexture = loadColorTexture('resources/images/ground.jpg');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(20, 20); // Repeat the texture 20x20 times
  
  const groundNormalMap = loader.load('resources/images/ground.jpg');
  groundNormalMap.wrapS = THREE.RepeatWrapping;
  groundNormalMap.wrapT = THREE.RepeatWrapping;
  groundNormalMap.repeat.set(20, 20);
  
  // Create material with textures
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: groundTexture,
    normalMap: groundNormalMap,
    normalScale: new THREE.Vector2(1, 1),
    roughness: 0.8,
    metalness: 0.2
  });
  
  const ground = new THREE.Mesh(planeGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  ground.position.y = -2; // Position below objects
  ground.receiveShadow = true;
  scene.add(ground);
  
  // Create cement pillars
  function createPillars() {
    // Load cement texture
    const cementTexture = loadColorTexture('resources/images/darkcement.jpeg');
    cementTexture.wrapS = THREE.RepeatWrapping;
    cementTexture.wrapT = THREE.RepeatWrapping;
    cementTexture.repeat.set(1, 2); // Repeat vertically for the pillars
    
    // Optional: Load cement normal map
    const cementNormalMap = loader.load('resources/images/darkcement.jpeg');
    cementNormalMap.wrapS = THREE.RepeatWrapping;
    cementNormalMap.wrapT = THREE.RepeatWrapping;
    cementNormalMap.repeat.set(1, 2);
    
    // Create cement material
    const cementMaterial = new THREE.MeshStandardMaterial({
      map: cementTexture,
      normalMap: cementNormalMap,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    // Pillar dimensions
    const pillarRadius = 0.4;
    const pillarHeight = 50;
    const pillarGeometry = new THREE.CylinderGeometry(
      pillarRadius,         // top radius
      pillarRadius * 1.2,   // bottom radius (slightly wider)
      pillarHeight,         // height
      16,                   // radial segments
      4                     // height segments
    );
    
    // top for pillars
    const capRadius = pillarRadius * 1.3;
    const capHeight = 0.3;
    const capGeometry = new THREE.CylinderGeometry(
      capRadius * 0.9,      // top radius (slightly narrower)
      capRadius,            // bottom radius
      capHeight,            // height
      16,                   // radial segments
      1                     // height segments
    );
    
    // Base for pillars
    const baseRadius = pillarRadius * 1.5;
    const baseHeight = 0.4;
    const baseGeometry = new THREE.CylinderGeometry(
      baseRadius,           // top radius
      baseRadius,           // bottom radius
      baseHeight,           // height
      16,                   // radial segments
      1                     // height segments
    );
    
    // pillar placment
    const rowDistance = 12;  // dist between the two rows (left and right)
    const pillarSpacing = 6; // dist between pillars in the same row
    const numPillarsPerRow = 12; // number of pillars in each row
    const startZ = -25;      // starting Z position
    
    // array to hold pillars
    const leftRowPillars = [];
    const rightRowPillars = [];
    
    // pillars for both sides
    for (let i = 0; i < numPillarsPerRow; i++) {
      const zPos = startZ + i * pillarSpacing;
      
      // add base and cap
      function createCompletePillar(xPos, zPos) {
        // make pillar body
        const pillar = new THREE.Mesh(pillarGeometry, cementMaterial);
        pillar.position.set(xPos, -2 + pillarHeight / 2, zPos);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
        
        // make cap
        const cap = new THREE.Mesh(capGeometry, cementMaterial);
        cap.position.set(xPos, -2 + pillarHeight + capHeight / 2, zPos);
        cap.castShadow = true;
        cap.receiveShadow = true;
        scene.add(cap);
        
        // make base
        const base = new THREE.Mesh(baseGeometry, cementMaterial);
        base.position.set(xPos, -2 + baseHeight / 2, zPos);
        base.castShadow = true;
        base.receiveShadow = true;
        scene.add(base);
        
        return { pillar, cap, base };
      }
      
      // left row
      const leftPillar = createCompletePillar(-rowDistance / 2, zPos);
      leftRowPillars.push(leftPillar);
      
      // right row
      const rightPillar = createCompletePillar(rowDistance / 2, zPos);
      rightRowPillars.push(rightPillar);
    }
    
    return { leftRowPillars, rightRowPillars };
  }
  
  // create the pillars
  const pillars = createPillars();

  // Load GLTF model
  const gltfLoader = new GLTFLoader();
  const url = 'resources/models/geto_suguru_fanart/scene.gltf';
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    
    // mmove and scale model
    root.position.set(0, -1.7, -0.5); 
    root.scale.set(25, 25, 25); // Scale down if needed
    
    //turn on shadows
    root.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    
    
    shapes.forEach((shape, ndx) => {
      const speed = 0.5 + ndx * 0.05; // Slowed down rotation for better control
      const rot = time * speed;
      shape.rotation.x = rot;
      shape.rotation.y = rot;
    });
    
    // update controls in animation loop
    controls.update();
    
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();