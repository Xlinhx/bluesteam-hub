import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HabitatPlacedItem, HabitatToolType } from './habitatTypes';

export interface Habitat3DCanvasProps {
  mode: 'build' | 'run';
  items: HabitatPlacedItem[];
  onItemsChange: (items: HabitatPlacedItem[]) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  activeTool: HabitatToolType;
  activeAssetId: string;
  isPaused?: boolean;
  resetTrigger?: number;
  zoomTrigger?: number;
  compassRotation?: number; // Target azimuthal rotation in radians
  onCameraRotate?: (headingAngle: number) => void;
  onSelectAlert?: () => void;
  className?: string;
}

export function Habitat3DCanvas({
  mode,
  items,
  onItemsChange,
  selectedItemId,
  onSelectItem,
  activeTool,
  activeAssetId,
  isPaused = false,
  resetTrigger = 0,
  zoomTrigger = 0,
  compassRotation,
  onCameraRotate,
  onSelectAlert,
  className = '',
}: Habitat3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const itemsGroupRef = useRef<THREE.Group | null>(null);
  const selectionHelperRef = useRef<THREE.Group | null>(null);
  const bubblesMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const alertMarkerRef = useRef<THREE.Group | null>(null);

  // Animation and interaction state refs
  const animTimeRef = useRef<number>(0);
  const isDraggingItemRef = useRef<boolean>(false);
  const isOrbitingCameraRef = useRef<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.4,
    radius: 25,
  });

  // Keep items in ref for event handlers
  const itemsRef = useRef<HabitatPlacedItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const selectedItemIdRef = useRef<string | null>(selectedItemId);
  useEffect(() => {
    selectedItemIdRef.current = selectedItemId;
  }, [selectedItemId]);

  const modeRef = useRef<'build' | 'run'>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const activeToolRef = useRef<HabitatToolType>(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  const isPausedRef = useRef<boolean>(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Update camera position from spherical coordinates
  const updateCameraFromSpherical = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0.5, 0);
    onCameraRotate?.(theta);
  }, [onCameraRotate]);

  // React to compass target rotation
  useEffect(() => {
    if (compassRotation !== undefined && !isOrbitingCameraRef.current) {
      cameraAngleRef.current.theta = compassRotation;
      updateCameraFromSpherical();
    }
  }, [compassRotation, updateCameraFromSpherical]);

  // React to zoom triggers
  useEffect(() => {
    if (zoomTrigger > 0) {
      cameraAngleRef.current.radius = Math.max(14, cameraAngleRef.current.radius - 2.5);
      updateCameraFromSpherical();
    }
  }, [zoomTrigger, updateCameraFromSpherical]);

  // React to reset triggers
  useEffect(() => {
    if (resetTrigger > 0) {
      cameraAngleRef.current = {
        theta: Math.PI / 4,
        phi: Math.PI / 5,
        radius: 24,
      };
      updateCameraFromSpherical();
      animTimeRef.current = 0;
    }
  }, [resetTrigger, updateCameraFromSpherical]);

  // Toggle grid and helpers when mode changes
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = mode === 'build';
    }
    if (selectionHelperRef.current) {
      selectionHelperRef.current.visible = mode === 'build' && selectedItemId !== null;
    }
    if (alertMarkerRef.current) {
      alertMarkerRef.current.visible = mode === 'run';
    }
  }, [mode, selectedItemId]);

  // =========================================================================
  // Three.js Initialization & Scene Setup
  // =========================================================================
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 560;

    // 1. Scene with Deep Oceanic Atmosphere
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to blend with underwater panoramic background
    scene.fog = new THREE.FogExp2(0x0a3848, 0.008); // Subtle natural oceanic haze
    sceneRef.current = scene;

    // 2. Camera (Isometric Perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraFromSpherical();

    // 3. Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting System aligned with Ocean Sunlight Shafts
    const ambientLight = new THREE.AmbientLight(0x19677e, 1.8);
    scene.add(ambientLight);

    // Main Sunlight shaft angled from surface down to seabed
    const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.8);
    sunLight.position.set(10, 22, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    const d = 16;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    // Turquoise seafloor water bounce light
    const oceanFillLight = new THREE.DirectionalLight(0x2fe0c8, 1.2);
    oceanFillLight.position.set(-10, -3, -8);
    scene.add(oceanFillLight);

    // 5. Natural Marine Sandbed matching aquarium dimensions
    const sandWidth = 14.7;
    const sandLength = 9.9;
    const sandGeo = new THREE.PlaneGeometry(sandWidth, sandLength, 64, 64);
    const posAttr = sandGeo.attributes.position;

    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);

      // Natural gentle dune ripples across the seabed (positive elevation above base)
      const wave =
        Math.sin(vx * 0.42) * Math.cos(vy * 0.52) * 0.12 +
        Math.sin(vx * 0.85 + vy * 0.65) * 0.05 +
        0.18;

      posAttr.setZ(i, wave);
    }
    sandGeo.computeVertexNormals();

    // Tactile sand diffuse micro-grain texture
    const sandCanvas = document.createElement('canvas');
    sandCanvas.width = 256;
    sandCanvas.height = 256;
    const sctx = sandCanvas.getContext('2d');
    if (sctx) {
      sctx.fillStyle = '#dbcca7';
      sctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const rad = Math.random() * 1.2 + 0.4;
        const shade = Math.random();
        sctx.fillStyle =
          shade > 0.6
            ? 'rgba(255, 255, 255, 0.28)'
            : shade > 0.3
            ? 'rgba(165, 145, 110, 0.22)'
            : 'rgba(95, 80, 55, 0.12)';
        sctx.beginPath();
        sctx.arc(x, y, rad, 0, Math.PI * 2);
        sctx.fill();
      }
    }
    const sandDiffuseMap = new THREE.CanvasTexture(sandCanvas);
    sandDiffuseMap.wrapS = THREE.RepeatWrapping;
    sandDiffuseMap.wrapT = THREE.RepeatWrapping;
    sandDiffuseMap.repeat.set(4, 3);

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xded2b6,
      map: sandDiffuseMap,
      roughness: 0.92,
      metalness: 0.02,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.name = 'sandbed';
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.y = -0.04;
    sandMesh.receiveShadow = true;
    scene.add(sandMesh);

    // 6. Holographic Marine Research Grid & Perimeter (Visible in Build Mode, 100% hidden in Run Mode)
    const researchGroup = new THREE.Group();
    researchGroup.visible = modeRef.current === 'build';
    gridHelperRef.current = researchGroup as unknown as THREE.GridHelper;
    scene.add(researchGroup);

    // Subtle warm sandy alignment grid (fitting inside tray)
    const gridHelper = new THREE.GridHelper(13, 12, 0xcab58e, 0xdfd3b9);
    gridHelper.position.y = 0.035;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    (gridHelper.material as THREE.Material).transparent = true;
    researchGroup.add(gridHelper);

    // Perimeter boundary line (inside sand tray)
    const halfW = 6.6;
    const halfL = 4.4;
    const perimeterPts = [
      new THREE.Vector3(-halfW, 0.045, -halfL),
      new THREE.Vector3(halfW, 0.045, -halfL),
      new THREE.Vector3(halfW, 0.045, halfL),
      new THREE.Vector3(-halfW, 0.045, halfL),
      new THREE.Vector3(-halfW, 0.045, -halfL),
    ];
    const perimeterGeo = new THREE.BufferGeometry().setFromPoints(perimeterPts);
    const perimeterMat = new THREE.LineBasicMaterial({
      color: 0xc8a068,
      transparent: true,
      opacity: 0.45,
    });
    const perimeterLine = new THREE.Line(perimeterGeo, perimeterMat);
    researchGroup.add(perimeterLine);

    // 4 Corner holographic research beacon pins
    const cornerCoords = [
      [-halfW, -halfL],
      [halfW, -halfL],
      [halfW, halfL],
      [-halfW, halfL],
    ];
    const beaconPinGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.45, 8);
    const beaconPinMat = new THREE.MeshStandardMaterial({
      color: 0x164e63,
      metalness: 0.8,
      roughness: 0.25,
    });
    const beaconLightGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const beaconLightMat = new THREE.MeshBasicMaterial({ color: 0x2ee6ca });

    cornerCoords.forEach(([cx, cz]) => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(cx, 0.22, cz);
      const pin = new THREE.Mesh(beaconPinGeo, beaconPinMat);
      const light = new THREE.Mesh(beaconLightGeo, beaconLightMat);
      light.position.y = 0.26;
      pinGroup.add(pin);
      pinGroup.add(light);
      researchGroup.add(pinGroup);
    });

    // 6. Diorama Glass Aquarium Walls & Rim Highlight (matching Mockup)
    // 6. Warm Wooden Craft Diorama Tray & Backing (matching Mockup ocean_diorama_habitat.jpg)
    const trayWidth = 15.6;
    const trayLength = 10.8;
    const trayHeight = 0.55;
    const tankGroup = new THREE.Group();
    tankGroup.name = 'aquarium_tank';
    scene.add(tankGroup);

    // Procedural oak wood grain canvas texture
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 256;
    woodCanvas.height = 256;
    const wctx = woodCanvas.getContext('2d');
    if (wctx) {
      wctx.fillStyle = '#bda078';
      wctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 240; i++) {
        wctx.fillStyle = Math.random() > 0.5 ? 'rgba(145, 110, 70, 0.22)' : 'rgba(85, 60, 35, 0.15)';
        wctx.fillRect(0, Math.random() * 256, 256, Math.random() * 2 + 0.5);
      }
    }
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: 0xc49a6c,
      roughness: 0.78,
      metalness: 0.04,
    });

    // Solid wooden craft base plate
    const trayBaseGeo = new THREE.BoxGeometry(trayWidth, trayHeight, trayLength);
    const trayBaseMesh = new THREE.Mesh(trayBaseGeo, woodMat);
    trayBaseMesh.position.y = -trayHeight / 2 - 0.02;
    trayBaseMesh.receiveShadow = true;
    tankGroup.add(trayBaseMesh);

    // Raised rounded wooden lip around the sand tray
    const lipThickness = 0.35;
    const lipHeight = 0.45;
    const lipMat = woodMat;

    // North lip
    const lipN = new THREE.Mesh(new THREE.BoxGeometry(trayWidth, lipHeight, lipThickness), lipMat);
    lipN.position.set(0, lipHeight / 2 - 0.02, -trayLength / 2 + lipThickness / 2);
    lipN.receiveShadow = true;
    tankGroup.add(lipN);

    // South lip
    const lipS = new THREE.Mesh(new THREE.BoxGeometry(trayWidth, lipHeight, lipThickness), lipMat);
    lipS.position.set(0, lipHeight / 2 - 0.02, trayLength / 2 - lipThickness / 2);
    lipS.receiveShadow = true;
    tankGroup.add(lipS);

    // West lip
    const lipW = new THREE.Mesh(new THREE.BoxGeometry(lipThickness, lipHeight, trayLength - lipThickness * 2), lipMat);
    lipW.position.set(-trayWidth / 2 + lipThickness / 2, lipHeight / 2 - 0.02, 0);
    lipW.receiveShadow = true;
    tankGroup.add(lipW);

    // East lip
    const lipE = new THREE.Mesh(new THREE.BoxGeometry(lipThickness, lipHeight, trayLength - lipThickness * 2), lipMat);
    lipE.position.set(trayWidth / 2 - lipThickness / 2, lipHeight / 2 - 0.02, 0);
    lipE.receiveShadow = true;
    tankGroup.add(lipE);

    // Realistic Diorama Layered Oceanic Watercolor Backdrop Plane
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/creative/ocean_diorama_habitat.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const backdropGeo = new THREE.PlaneGeometry(24, 11);
      const backdropMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.88,
      });
      const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
      backdropMesh.position.set(0, 4.8, -trayLength / 2 - 0.2);
      tankGroup.add(backdropMesh);
    });

    // Diorama pedestal base frame & contact shadow (matching Mockup)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const shCtx = shadowCanvas.getContext('2d');
    if (shCtx) {
      shCtx.fillStyle = '#000000';
      shCtx.fillRect(0, 0, 512, 512);
      const grad = shCtx.createRadialGradient(256, 256, 120, 256, 256, 240);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      shCtx.fillStyle = grad;
      shCtx.fillRect(0, 0, 512, 512);
    }
    const shadowAlphaMap = new THREE.CanvasTexture(shadowCanvas);
    const contactShadowGeo = new THREE.PlaneGeometry(trayWidth + 4, trayLength + 4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a1e28,
      transparent: true,
      opacity: 0.35,
      alphaMap: shadowAlphaMap,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = -0.16;
    scene.add(contactShadowMesh);

    // Dark charcoal pedestal base frame
    const baseFrameGeo = new THREE.BoxGeometry(trayWidth + 0.3, 0.22, trayLength + 0.3);
    const baseFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1a2630,
      roughness: 0.7,
      metalness: 0.3,
    });
    const baseFrameMesh = new THREE.Mesh(baseFrameGeo, baseFrameMat);
    baseFrameMesh.position.y = -0.2;
    tankGroup.add(baseFrameMesh);

    // 7. Placed Items Group
    const itemsGroup = new THREE.Group();
    itemsGroupRef.current = itemsGroup;
    scene.add(itemsGroup);

    // 7. Selection Helper Gizmo (Cyan dashed grid footprint + vertical stem + 3D rotation arrows)
    const selectionGroup = new THREE.Group();
    selectionGroup.visible = false;
    selectionHelperRef.current = selectionGroup;
    scene.add(selectionGroup);

    // Dashed square footprint on sandbed
    const footprintGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const footprintEdges = new THREE.EdgesGeometry(footprintGeo);
    const footprintMat = new THREE.LineDashedMaterial({
      color: 0x2ee6ca,
      linewidth: 2,
      dashSize: 0.3,
      gapSize: 0.18,
    });
    const footprintLine = new THREE.LineSegments(footprintEdges, footprintMat);
    footprintLine.computeLineDistances();
    footprintLine.rotation.x = -Math.PI / 2;
    footprintLine.position.y = 0.04;
    selectionGroup.add(footprintLine);

    // Vertical guide stem connecting sand to rotation handle
    const stemGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(0, 2.2, 0),
    ]);
    const stemMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const stemLine = new THREE.Line(stemGeo, stemMat);
    selectionGroup.add(stemLine);

    // Two curved rotation arrows (⤾ ⤿) hovering above item
    const arcCurve1 = new THREE.EllipseCurve(0, 0, 0.7, 0.7, 0.2, Math.PI * 0.8, false, 0);
    const arcGeo1 = new THREE.BufferGeometry().setFromPoints(arcCurve1.getPoints(24).map(p => new THREE.Vector3(p.x, 0, p.y)));
    const arcMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    const arcLine1 = new THREE.Line(arcGeo1, arcMat);
    arcLine1.position.y = 2.2;
    selectionGroup.add(arcLine1);

    const arcCurve2 = new THREE.EllipseCurve(0, 0, 0.7, 0.7, Math.PI + 0.2, Math.PI * 1.8, false, 0);
    const arcGeo2 = new THREE.BufferGeometry().setFromPoints(arcCurve2.getPoints(24).map(p => new THREE.Vector3(p.x, 0, p.y)));
    const arcLine2 = new THREE.Line(arcGeo2, arcMat);
    arcLine2.position.y = 2.2;
    selectionGroup.add(arcLine2);

    // 8. Bubbles Particle System (InstancedMesh)
    const bubbleCount = 45;
    const bubbleGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const bubblesMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, bubbleCount);
    const bubbleDummy = new THREE.Object3D();
    const bubblePositions: Array<{ x: number; y: number; z: number; speed: number }> = [];

    const bubbleBoxWidth = 14.0;
    const bubbleBoxHeight = 6.0;
    const bubbleBoxLength = 9.5;

    for (let i = 0; i < bubbleCount; i++) {
      const bx = (Math.random() - 0.5) * (bubbleBoxWidth - 1.5);
      const by = Math.random() * bubbleBoxHeight;
      const bz = (Math.random() - 0.5) * (bubbleBoxLength - 1.5);
      const speed = 0.02 + Math.random() * 0.03;
      bubblePositions.push({ x: bx, y: by, z: bz, speed });
      bubbleDummy.position.set(bx, by, bz);
      bubbleDummy.updateMatrix();
      bubblesMesh.setMatrixAt(i, bubbleDummy.matrix);
    }
    bubblesMesh.instanceMatrix.needsUpdate = true;
    bubblesMeshRef.current = bubblesMesh;
    scene.add(bubblesMesh);

    // 9. Alert / Focus Marker (!) for Run Mode
    const alertGroup = new THREE.Group();
    alertGroup.position.set(2.2, 2.2, 0.4);
    alertGroup.visible = modeRef.current === 'run';
    alertMarkerRef.current = alertGroup;

    const alertBgGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const alertBgMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xf67650,
      emissiveIntensity: 0.4,
    });
    const alertBgMesh = new THREE.Mesh(alertBgGeo, alertBgMat);
    alertGroup.add(alertBgMesh);

    // Ring border
    const alertRingGeo = new THREE.TorusGeometry(0.38, 0.04, 12, 24);
    const alertRingMat = new THREE.MeshBasicMaterial({ color: 0xf67650 });
    const alertRingMesh = new THREE.Mesh(alertRingGeo, alertRingMat);
    alertRingMesh.rotation.x = Math.PI / 2;
    alertGroup.add(alertRingMesh);

    scene.add(alertGroup);

    // =======================================================================
    // 10. Animation Loop
    // =======================================================================
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isPausedRef.current) {
        animTimeRef.current += 0.016;
      }
      const t = animTimeRef.current;

      // Update bubbles in Run Mode
      if (bubblesMeshRef.current) {
        for (let i = 0; i < bubbleCount; i++) {
          const bp = bubblePositions[i];
          if (!isPausedRef.current) {
            bp.y += bp.speed;
            if (bp.y > trayHeight) bp.y = 0.1;
          }
          bubbleDummy.position.set(bp.x + Math.sin(t * 2 + i) * 0.05, bp.y, bp.z);
          bubbleDummy.updateMatrix();
          bubblesMeshRef.current.setMatrixAt(i, bubbleDummy.matrix);
        }
        bubblesMeshRef.current.instanceMatrix.needsUpdate = true;
      }

      // Sway seagrass clusters
      if (itemsGroupRef.current) {
        itemsGroupRef.current.children.forEach(child => {
          const itemType = child.userData?.type;
          if (itemType === 'seagrass') {
            const sway = Math.sin(t * 2.5 + child.position.x) * 0.08;
            child.rotation.z = sway;
          } else if (itemType === 'turtle' && modeRef.current === 'run' && !isPausedRef.current) {
            // Turtle swim trajectory loop
            const pathRadiusX = 4.2;
            const pathRadiusZ = 2.4;
            const swimSpeed = 0.35;
            const angle = t * swimSpeed;
            child.position.x = Math.sin(angle) * pathRadiusX;
            child.position.z = Math.cos(angle) * pathRadiusZ;
            child.position.y = 1.6 + Math.sin(angle * 2) * 0.3;
            child.rotation.y = angle + Math.PI / 2;
            child.rotation.z = Math.sin(t * 3) * 0.1; // Gentle body roll
          } else if (itemType === 'fish' && modeRef.current === 'run' && !isPausedRef.current) {
            // Fish swim trajectory
            const fAngle = t * 0.8 + (child.userData?.offset || 0);
            child.position.x += Math.cos(fAngle) * 0.02;
            child.position.z += Math.sin(fAngle) * 0.02;
            child.rotation.y = -fAngle;
          }
        });
      }

      // Bobbing Alert Marker in Run Mode
      if (alertMarkerRef.current && alertMarkerRef.current.visible) {
        alertMarkerRef.current.position.y = 2.2 + Math.sin(t * 3) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();
    setSceneReady(true);

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      setSceneReady(false);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [updateCameraFromSpherical]);

  // =========================================================================
  // Synchronize Placed 3D Items Meshes
  // =========================================================================
  useEffect(() => {
    const group = itemsGroupRef.current;
    if (!group) return;

    // Clear existing children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    // Material definitions
    // Procedural rock texture for natural granite crevices & subtle marine patina
    const rockCanvas = document.createElement('canvas');
    rockCanvas.width = 256;
    rockCanvas.height = 256;
    const rctx = rockCanvas.getContext('2d');
    if (rctx) {
      rctx.fillStyle = '#7a7164';
      rctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2500; i++) {
        const rx = Math.random() * 256;
        const ry = Math.random() * 256;
        const rrad = Math.random() * 1.8 + 0.6;
        rctx.fillStyle = Math.random() > 0.5 ? 'rgba(50, 44, 38, 0.3)' : 'rgba(150, 140, 125, 0.25)';
        rctx.fillRect(rx, ry, rrad, rrad);
      }
      for (let i = 0; i < 35; i++) {
        const gx = Math.random() * 256;
        const gy = Math.random() * 256;
        const grad = rctx.createRadialGradient(gx, gy, 1, gx, gy, 8 + Math.random() * 10);
        grad.addColorStop(0, 'rgba(45, 105, 75, 0.35)');
        grad.addColorStop(1, 'rgba(45, 105, 75, 0)');
        rctx.fillStyle = grad;
        rctx.beginPath();
        rctx.arc(gx, gy, 18, 0, Math.PI * 2);
        rctx.fill();
      }
    }
    const rockDiffuseMap = new THREE.CanvasTexture(rockCanvas);

    const rockMat = new THREE.MeshStandardMaterial({
      map: rockDiffuseMap,
      color: 0x8a8072,
      roughness: 0.85,
      metalness: 0.05,
    });
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x229e64,
      roughness: 0.35,
      metalness: 0.04,
      emissive: 0x083318,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    });
    const coralMat = new THREE.MeshStandardMaterial({
      color: 0xff6242,
      roughness: 0.4,
      metalness: 0.08,
      emissive: 0x661805,
      emissiveIntensity: 0.3,
    });
    const turtleShellMat = new THREE.MeshStandardMaterial({
      color: 0x286348,
      roughness: 0.4,
      metalness: 0.08,
    });
    const turtleBellyMat = new THREE.MeshStandardMaterial({
      color: 0xe8efc5,
      roughness: 0.5,
    });
    const clownfishMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      roughness: 0.35,
    });

    items.forEach((item, index) => {
      const itemGroup = new THREE.Group();
      itemGroup.position.set(item.x, item.y || 0, item.z);
      itemGroup.rotation.y = item.rotation;
      itemGroup.scale.setScalar(item.scale);
      itemGroup.userData = { id: item.id, type: item.type, index, offset: index * 1.5 };

      if (item.type === 'rock') {
        // Procedural rock boulder with organic facets
        const baseRadius = item.assetId === 'rock-large' ? 1.4 : 0.8;
        const rockGeo = new THREE.DodecahedronGeometry(baseRadius, 1);
        const rPos = rockGeo.attributes.position;
        for (let ri = 0; ri < rPos.count; ri++) {
          const rx = rPos.getX(ri);
          const ry = rPos.getY(ri);
          const rz = rPos.getZ(ri);
          const deform = 1 + Math.sin(rx * 3 + ry * 2) * 0.12;
          rPos.setXYZ(ri, rx * deform, ry * deform * 0.82, rz * deform);
        }
        rockGeo.computeVertexNormals();
        const rockMesh = new THREE.Mesh(rockGeo, rockMat);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        rockMesh.position.y = item.assetId === 'rock-large' ? 0.75 : 0.42;
        itemGroup.add(rockMesh);
      } else if (item.type === 'seagrass') {
        // Multi-blade seagrass clump with natural curvature
        const bladeCount = item.assetId === 'seagrass-tall' ? 9 : 6;
        const bladeHeight = item.assetId === 'seagrass-tall' ? 2.5 : 1.4;

        for (let b = 0; b < bladeCount; b++) {
          const bladeGeo = new THREE.CylinderGeometry(0.018, 0.075, bladeHeight, 6);
          const bladeMesh = new THREE.Mesh(bladeGeo, grassMat);
          bladeMesh.castShadow = true;
          bladeMesh.position.set(
            (Math.random() - 0.5) * 0.45,
            bladeHeight / 2,
            (Math.random() - 0.5) * 0.45
          );
          bladeMesh.rotation.z = (Math.random() - 0.5) * 0.35;
          bladeMesh.rotation.x = (Math.random() - 0.5) * 0.35;
          itemGroup.add(bladeMesh);
        }
      } else if (item.type === 'coral' || item.type === 'anemone') {
        // Branching coral structure with vibrant glow
        const trunkGeo = new THREE.CylinderGeometry(0.16, 0.32, 1.2, 8);
        const trunk = new THREE.Mesh(trunkGeo, coralMat);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        itemGroup.add(trunk);

        for (let c = 0; c < 5; c++) {
          const branchGeo = new THREE.ConeGeometry(0.12, 0.85, 6);
          const branch = new THREE.Mesh(branchGeo, coralMat);
          branch.position.set(Math.cos(c * 1.3) * 0.32, 1.15, Math.sin(c * 1.3) * 0.32);
          branch.rotation.z = Math.cos(c * 1.3) * 0.55;
          itemGroup.add(branch);
        }
      } else if (item.type === 'turtle') {
        // Green sea turtle mesh with carapace, plastron, and flippers
        const shellGeo = new THREE.SphereGeometry(0.9, 16, 12);
        shellGeo.scale(1, 0.42, 1.25);
        const shell = new THREE.Mesh(shellGeo, turtleShellMat);
        shell.castShadow = true;
        itemGroup.add(shell);

        const bellyGeo = new THREE.SphereGeometry(0.85, 16, 12);
        bellyGeo.scale(0.95, 0.25, 1.15);
        const belly = new THREE.Mesh(bellyGeo, turtleBellyMat);
        belly.position.y = -0.12;
        itemGroup.add(belly);

        const headGeo = new THREE.SphereGeometry(0.28, 12, 10);
        headGeo.scale(0.8, 0.7, 1.1);
        const head = new THREE.Mesh(headGeo, turtleShellMat);
        head.position.set(0, 0.08, 1.35);
        head.castShadow = true;
        itemGroup.add(head);

        const flipperGeo = new THREE.BoxGeometry(1.25, 0.06, 0.45);
        const leftFlipper = new THREE.Mesh(flipperGeo, turtleShellMat);
        leftFlipper.position.set(-1.05, -0.05, 0.4);
        leftFlipper.rotation.y = -0.35;
        leftFlipper.rotation.z = -0.15;
        leftFlipper.castShadow = true;
        itemGroup.add(leftFlipper);

        const rightFlipper = new THREE.Mesh(flipperGeo, turtleShellMat);
        rightFlipper.position.set(1.05, -0.05, 0.4);
        rightFlipper.rotation.y = 0.35;
        rightFlipper.rotation.z = 0.15;
        rightFlipper.castShadow = true;
        itemGroup.add(rightFlipper);
      } else if (item.type === 'fish') {
        // Clownfish
        const bodyGeo = new THREE.SphereGeometry(0.4, 12, 8);
        bodyGeo.scale(0.5, 0.7, 1.2);
        const body = new THREE.Mesh(bodyGeo, clownfishMat);
        body.castShadow = true;
        itemGroup.add(body);

        // White band ring
        const bandGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12);
        const bandMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.rotation.x = Math.PI / 2;
        band.position.z = 0.05;
        itemGroup.add(band);
      }

      group.add(itemGroup);
    });

    // Update selection gizmo position
    if (selectedItemId && selectionHelperRef.current) {
      const selected = items.find(it => it.id === selectedItemId);
      if (selected) {
        selectionHelperRef.current.position.set(selected.x, 0, selected.z);
        selectionHelperRef.current.rotation.y = selected.rotation;
        selectionHelperRef.current.visible = mode === 'build';
      } else {
        selectionHelperRef.current.visible = false;
      }
    }
  }, [items, selectedItemId, mode, sceneReady]);

  // =========================================================================
  // Pointer Events & Raycasting (Click-to-Place, Selection, Camera Drag)
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const rect = container.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // Check click on Alert Marker in Run Mode
    if (modeRef.current === 'run' && alertMarkerRef.current?.visible) {
      const alertIntersects = raycaster.intersectObjects(alertMarkerRef.current.children, true);
      if (alertIntersects.length > 0) {
        onSelectAlert?.();
        return;
      }
    }

    // In Build Mode: Check click on items
    if (modeRef.current === 'build' && itemsGroupRef.current) {
      const itemIntersects = raycaster.intersectObjects(itemsGroupRef.current.children, true);

      if (itemIntersects.length > 0) {
        // Find top group with userData.id
        let targetObj: THREE.Object3D | null = itemIntersects[0].object;
        while (targetObj && !targetObj.userData?.id && targetObj.parent) {
          targetObj = targetObj.parent;
        }

        const clickedId = targetObj?.userData?.id;
        if (clickedId) {
          if (activeToolRef.current === 'delete') {
            // Delete item
            const newItems = itemsRef.current.filter(it => it.id !== clickedId);
            onItemsChange(newItems);
            onSelectItem(null);
            return;
          }

          if (activeToolRef.current === 'rotate') {
            // Rotate item 45 degrees
            const newItems = itemsRef.current.map(it =>
              it.id === clickedId ? { ...it, rotation: it.rotation + Math.PI / 4 } : it
            );
            onItemsChange(newItems);
            onSelectItem(clickedId);
            return;
          }

          // Select item for move
          onSelectItem(clickedId);
          isDraggingItemRef.current = true;
          return;
        }
      }

      // Check click on seabed plane to place new item
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hitPos = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, hitPos)) {
        if (Math.abs(hitPos.x) <= 7.0 && Math.abs(hitPos.z) <= 4.75) {
          const newItem: HabitatPlacedItem = {
            id: `item-${Date.now()}-${activeAssetId}`,
            type: activeAssetId.startsWith('rock')
              ? 'rock'
              : activeAssetId.startsWith('seagrass')
              ? 'seagrass'
              : activeAssetId.includes('coral')
              ? 'coral'
              : activeAssetId.includes('turtle')
              ? 'turtle'
              : 'fish',
            assetId: activeAssetId,
            nameVi: 'Sinh vật đáy biển',
            nameEn: 'Marine Specimen',
            x: Math.max(-6.2, Math.min(6.2, hitPos.x)),
            z: Math.max(-4.2, Math.min(4.2, hitPos.z)),
            rotation: 0,
            scale: 1.0,
          };

          const updated = [...itemsRef.current, newItem];
          onItemsChange(updated);
          onSelectItem(newItem.id);
          return;
        }
      }
    }

    // Default: orbit camera
    isOrbitingCameraRef.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (isDraggingItemRef.current && selectedItemIdRef.current && modeRef.current === 'build') {
      // Drag placed item on grid
      const container = mountRef.current;
      if (!container || !cameraRef.current) return;
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, target);

      if (target) {
        const clampedX = Math.max(-6, Math.min(6, target.x));
        const clampedZ = Math.max(-4, Math.min(4, target.z));
        const updated = itemsRef.current.map(it =>
          it.id === selectedItemIdRef.current ? { ...it, x: clampedX, z: clampedZ } : it
        );
        onItemsChange(updated);
      }
      return;
    }

    if (isOrbitingCameraRef.current) {
      cameraAngleRef.current.theta -= dx * 0.006;
      cameraAngleRef.current.phi = Math.max(0.2, Math.min(Math.PI / 2.2, cameraAngleRef.current.phi - dy * 0.006));
      updateCameraFromSpherical();
    }
  };

  const handlePointerUp = () => {
    isDraggingItemRef.current = false;
    isOrbitingCameraRef.current = false;
  };

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#eef3f6] text-[#12384B] rounded-3xl text-center">
        <span className="text-4xl mb-3">🌊</span>
        <h3 className="text-lg font-bold">Không tìm thấy hỗ trợ WebGL</h3>
        <p className="text-xs text-gray-500">Môi trường 3D yêu cầu trình duyệt hỗ trợ WebGL.</p>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-full h-full relative cursor-grab active:cursor-grabbing select-none ${className}`}
    />
  );
}
