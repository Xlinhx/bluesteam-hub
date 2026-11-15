import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type TurtleViewer = ReturnType<typeof createTurtleViewer>;

export function createTurtleViewer(parent:HTMLElement, signal:AbortSignal) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#d8eff7');
  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.xr.enabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  parent.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(42,1,.04,100);
  camera.position.set(2.8,1.7,3.4);
  const controls = new OrbitControls(camera,renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 1.25;
  controls.maxDistance = 9;
  controls.saveState();
  const sunlight = new THREE.DirectionalLight('#ffefd7',2.3);
  sunlight.position.set(4,6,2);
  scene.add(sunlight,new THREE.HemisphereLight('#e4faff','#577d89',2.2));
  const model = new THREE.Group();
  scene.add(model);
  const vrRoot = new THREE.Group();
  scene.add(vrRoot);
  vrRoot.add(camera);
  const materials = new Set<THREE.MeshStandardMaterial>();
  const geometries = new Set<THREE.BufferGeometry>();
  const textures = new Set<THREE.Texture>();
  function release() {
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
  }
  let session: XRSession | null = null;
  let mixer: THREE.AnimationMixer | undefined;
  let lastTime = 0;
  let inspecting = false;
  const ready = new GLTFLoader().loadAsync('/assets/learner-worlds/turtle/model.gltf').then(gltf => {
    gltf.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of list) {
        materials.add(material);
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
      }
    });
    if (signal.aborted) {release();return;}
    const bounds = new THREE.Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
    model.scale.setScalar(2.4/Math.max(size.x,size.y,size.z));
    model.add(gltf.scene);
    if (gltf.animations[0] && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
      mixer = new THREE.AnimationMixer(gltf.scene);
      mixer.clipAction(gltf.animations[0]).play();
    }
  });
  const resize = new ResizeObserver(() => {
    if (renderer.xr.isPresenting) return;
    const width = parent.clientWidth, height = parent.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width,height,false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resize.observe(parent);
  renderer.setAnimationLoop(time => {
    if (lastTime && !inspecting && !document.hidden) mixer?.update(Math.min(.05,(time-lastTime)/1000));
    lastTime = time;
    if (!renderer.xr.isPresenting) controls.update();
    renderer.render(scene,camera);
  });
  return {
    ready,
    inspect(enabled:boolean) {
      inspecting = enabled;
      for (const material of materials) material.wireframe = enabled;
    },
    reset() { controls.reset(); },
    async enterVR() {
      if (!navigator.xr) throw new Error('Thiết bị chưa hỗ trợ kính VR.');
      if (session) return;
      const current = await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});
      if (signal.aborted) { await current.end();throw new Error('Màn quan sát đã đóng.'); }
      session = current;
      current.addEventListener('end',() => {session = null;model.position.set(0,0,0);controls.reset();},{once:true});
      try {
        renderer.xr.setReferenceSpaceType('local');
        await renderer.xr.setSession(current);
        model.position.set(0,-.25,-3);
      } catch (error) { void current.end().catch(() => {});throw error; }
    },
    dispose() {
      void session?.end().catch(() => {});
      renderer.setAnimationLoop(null);
      resize.disconnect();
      controls.dispose();
      release();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
