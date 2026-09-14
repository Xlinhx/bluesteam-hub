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
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 5,
    radius: 24,
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

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#eef3f6');
    sceneRef.current = scene;

    // 2. Camera (Isometric Perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraFromSpherical();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xdcf8f6, 1.8);
    scene.add(ambientLight);

    // Sunlight from top right casting gentle shadows
    const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.6);
    sunLight.position.set(12, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    const d = 12;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cyan water scatter fill light
    const oceanFillLight = new THREE.DirectionalLight(0x2ee6ca, 1.4);
    oceanFillLight.position.set(-10, -5, -10);
    scene.add(oceanFillLight);

    // 5. Glass Diorama Tray & Seabed Sandbox
    const tankWidth = 14;
    const tankLength = 9;
    const tankHeight = 5.5;

    // Tank Base (Dark Rim)
    const baseGeo = new THREE.BoxGeometry(tankWidth + 0.3, 0.4, tankLength + 0.3);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x12384b,
      roughness: 0.3,
      metalness: 0.1,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.2;
    scene.add(baseMesh);

    // Sandbed Floor
    const sandGeo = new THREE.PlaneGeometry(tankWidth, tankLength, 32, 32);
    // Subtle sand dunes displacement
    const posAttr = sandGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const wave = Math.sin(vx * 0.8) * Math.cos(vy * 0.9) * 0.12;
      posAttr.setZ(i, wave);
    }
    sandGeo.computeVertexNormals();

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xe6cca0,
      roughness: 0.85,
      metalness: 0.05,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.receiveShadow = true;
    scene.add(sandMesh);

    // Seabed Placement Grid (Isometric grid lines)
    const gridHelper = new THREE.GridHelper(tankWidth, 14, 0x17657a, 0x2ee6ca);
    gridHelper.position.y = 0.02;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    gridHelper.visible = modeRef.current === 'build';
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

    // Water Volume with Clear Glass Walls
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.22,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.333,
      reflectivity: 0.5,
      depthWrite: false,
    });

    // Glass Tank Volume Box
    const tankGeo = new THREE.BoxGeometry(tankWidth, tankHeight, tankLength);
    const tankMesh = new THREE.Mesh(tankGeo, glassMat);
    tankMesh.position.y = tankHeight / 2;
    scene.add(tankMesh);

    // Water Top Surface Shimmer
    const waterTopGeo = new THREE.PlaneGeometry(tankWidth, tankLength);
    const waterTopMat = new THREE.MeshStandardMaterial({
      color: 0x90e0ef,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.3,
    });
    const waterTopMesh = new THREE.Mesh(waterTopGeo, waterTopMat);
    waterTopMesh.rotation.x = -Math.PI / 2;
    waterTopMesh.position.y = tankHeight;
    scene.add(waterTopMesh);

    // 6. Placed Items Group
    const itemsGroup = new THREE.Group();
    itemsGroupRef.current = itemsGroup;
    scene.add(itemsGroup);

    // 7. Selection Helper Gizmo (Green dashed grid footprint + 3D rotation arc)
    const selectionGroup = new THREE.Group();
    selectionGroup.visible = false;
    selectionHelperRef.current = selectionGroup;
    scene.add(selectionGroup);

    // Dashed square footprint
    const footprintGeo = new THREE.PlaneGeometry(2.2, 2.2);
    const footprintEdges = new THREE.EdgesGeometry(footprintGeo);
    const footprintMat = new THREE.LineDashedMaterial({
      color: 0x2ee6ca,
      linewidth: 2,
      dashSize: 0.3,
      gapSize: 0.2,
    });
    const footprintLine = new THREE.LineSegments(footprintEdges, footprintMat);
    footprintLine.computeLineDistances();
    footprintLine.rotation.x = -Math.PI / 2;
    footprintLine.position.y = 0.04;
    selectionGroup.add(footprintLine);

    // Rotation arc indicator
    const arcCurve = new THREE.EllipseCurve(0, 0, 1.2, 1.2, 0, Math.PI * 1.5, false, 0);
    const arcPoints = arcCurve.getPoints(32);
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const arcMat = new THREE.LineBasicMaterial({ color: 0x2ee6ca, linewidth: 2 });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    arcLine.position.y = 2.0;
    selectionGroup.add(arcLine);

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

    for (let i = 0; i < bubbleCount; i++) {
      const bx = (Math.random() - 0.5) * (tankWidth - 1.5);
      const by = Math.random() * tankHeight;
      const bz = (Math.random() - 0.5) * (tankLength - 1.5);
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
            if (bp.y > tankHeight) bp.y = 0.1;
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
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x5a5348,
      roughness: 0.9,
      metalness: 0.1,
    });
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f,
      roughness: 0.6,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const coralMat = new THREE.MeshStandardMaterial({
      color: 0xf67650,
      roughness: 0.4,
      metalness: 0.1,
    });
    const turtleShellMat = new THREE.MeshStandardMaterial({
      color: 0x2b4c3f,
      roughness: 0.5,
    });
    const clownfishMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      roughness: 0.3,
    });

    items.forEach((item, index) => {
      const itemGroup = new THREE.Group();
      itemGroup.position.set(item.x, item.y || 0, item.z);
      itemGroup.rotation.y = item.rotation;
      itemGroup.scale.setScalar(item.scale);
      itemGroup.userData = { id: item.id, type: item.type, index, offset: index * 1.5 };

      if (item.type === 'rock') {
        // Procedural rock boulder with random nodules
        const rockGeo = new THREE.DodecahedronGeometry(item.assetId === 'rock-large' ? 1.4 : 0.8, 1);
        const rockMesh = new THREE.Mesh(rockGeo, rockMat);
        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;
        rockMesh.position.y = item.assetId === 'rock-large' ? 0.9 : 0.5;
        itemGroup.add(rockMesh);
      } else if (item.type === 'seagrass') {
        // Multi-blade seagrass clump
        const bladeCount = item.assetId === 'seagrass-tall' ? 9 : 6;
        const bladeHeight = item.assetId === 'seagrass-tall' ? 2.4 : 1.4;

        for (let b = 0; b < bladeCount; b++) {
          const bladeGeo = new THREE.CylinderGeometry(0.02, 0.08, bladeHeight, 6);
          const bladeMesh = new THREE.Mesh(bladeGeo, grassMat);
          bladeMesh.castShadow = true;
          bladeMesh.position.set(
            (Math.random() - 0.5) * 0.4,
            bladeHeight / 2,
            (Math.random() - 0.5) * 0.4
          );
          bladeMesh.rotation.z = (Math.random() - 0.5) * 0.3;
          bladeMesh.rotation.x = (Math.random() - 0.5) * 0.3;
          itemGroup.add(bladeMesh);
        }
      } else if (item.type === 'coral' || item.type === 'anemone') {
        // Branching coral structure
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.3, 1.2, 8);
        const trunk = new THREE.Mesh(trunkGeo, coralMat);
        trunk.position.y = 0.6;
        trunk.castShadow = true;
        itemGroup.add(trunk);

        for (let c = 0; c < 4; c++) {
          const branchGeo = new THREE.ConeGeometry(0.12, 0.8, 6);
          const branch = new THREE.Mesh(branchGeo, coralMat);
          branch.position.set(Math.cos(c * 1.5) * 0.3, 1.1, Math.sin(c * 1.5) * 0.3);
          branch.rotation.z = Math.cos(c * 1.5) * 0.5;
          itemGroup.add(branch);
        }
      } else if (item.type === 'turtle') {
        // Green sea turtle mesh
        const shellGeo = new THREE.SphereGeometry(0.9, 16, 12);
        shellGeo.scale(1, 0.45, 1.25);
        const shell = new THREE.Mesh(shellGeo, turtleShellMat);
        shell.castShadow = true;
        itemGroup.add(shell);

        // Turtle flippers
        const flipperGeo = new THREE.BoxGeometry(1.2, 0.08, 0.4);
        const leftFlipper = new THREE.Mesh(flipperGeo, turtleShellMat);
        leftFlipper.position.set(-1.0, 0, 0.3);
        leftFlipper.rotation.y = -0.4;
        itemGroup.add(leftFlipper);

        const rightFlipper = new THREE.Mesh(flipperGeo, turtleShellMat);
        rightFlipper.position.set(1.0, 0, 0.3);
        rightFlipper.rotation.y = 0.4;
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
  }, [items, selectedItemId, mode]);

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
      const sandIntersects = raycaster.intersectObjects(sceneRef.current.children, false);
      const seabedHit = sandIntersects.find(hit => hit.object.type === 'Mesh' && hit.point.y <= 0.1);

      if (seabedHit) {
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
          x: Math.max(-6, Math.min(6, seabedHit.point.x)),
          z: Math.max(-4, Math.min(4, seabedHit.point.z)),
          rotation: 0,
          scale: 1.0,
        };

        const updated = [...itemsRef.current, newItem];
        onItemsChange(updated);
        onSelectItem(newItem.id);
        return;
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
