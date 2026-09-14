import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { oceanAudio } from '../../shared/sound/oceanAudio';

export interface GreenSeaTurtleSceneProps {
  onSelectHotspot?: (hotspotKey: 'shell' | 'flipper') => void;
  selectedHotspot?: 'shell' | 'flipper' | null;
  className?: string;
  showLegacyControls?: boolean;
  autoRotate?: boolean;
  zoomTrigger?: number;
  resetTrigger?: number;
}

export function GreenSeaTurtleScene({
  onSelectHotspot,
  selectedHotspot,
  className = '',
  showLegacyControls = false,
  autoRotate = false,
  zoomTrigger = 0,
  resetTrigger = 0,
}: GreenSeaTurtleSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References for camera controls
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const turtleGroupRef = useRef<THREE.Group | null>(null);
  const leftFlipperRef = useRef<THREE.Group | null>(null);
  const rightFlipperRef = useRef<THREE.Group | null>(null);
  const neckRef = useRef<THREE.Group | null>(null);

  // Target rotation values that can be manipulated by user drag or autoRotate
  const targetRotationYRef = useRef(0.2);
  const targetRotationXRef = useRef(0.15);

  // Camera reset function
  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.8, 4.2);
      cameraRef.current.lookAt(0, 0, 0);
    }
    targetRotationYRef.current = 0.2;
    targetRotationXRef.current = 0.15;
    if (turtleGroupRef.current) {
      turtleGroupRef.current.rotation.set(0.15, 0.2, 0);
    }
  };

  // React to zoomTrigger prop changes
  useEffect(() => {
    if (zoomTrigger > 0 && cameraRef.current) {
      const currentZ = cameraRef.current.position.z;
      // Step closer with clamp between 2.2 and 6.5
      cameraRef.current.position.z = Math.max(2.2, currentZ - 0.7);
    }
  }, [zoomTrigger]);

  // React to resetTrigger prop changes
  useEffect(() => {
    if (resetTrigger > 0) {
      resetCamera();
    }
  }, [resetTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Check WebGL Availability
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 2. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#B6E2EB');
    scene.fog = new THREE.FogExp2('#B6E2EB', 0.02);

    // 3. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 4. Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGlSupported(false);
      return;
    }

    // 5. Lighting Setup - Natural Sunlit Tropical Ocean
    const ambientLight = new THREE.AmbientLight(0x17657a, 1.2);
    scene.add(ambientLight);

    // Sun shaft rays from surface
    const sunLight = new THREE.DirectionalLight(0xfff4d4, 2.8);
    sunLight.position.set(2, 6, 3);
    scene.add(sunLight);

    // Deep water cyan bounce light
    const bounceLight = new THREE.DirectionalLight(0x2ee6ca, 1.4);
    bounceLight.position.set(-2, -4, -1);
    scene.add(bounceLight);

    // Rim light for silhouette clarity
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(0, -1, -4);
    scene.add(rimLight);

    // 6. Generate Procedural Scute Texture for Carapace
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 512;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d');
    if (ctx) {
      // Base deep olive green
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, 0, 512, 512);

      // Scute pattern plates with amber / dark lines
      ctx.strokeStyle = '#152b12';
      ctx.lineWidth = 8;
      ctx.fillStyle = '#447a32';

      // Draw hexagonal scute plates
      for (let y = 40; y < 512; y += 100) {
        for (let x = 40; x < 512; x += 110) {
          ctx.beginPath();
          ctx.arc(x, y, 42, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Amber sunburst radiating streaks
          ctx.strokeStyle = '#e5a93c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 20, y);
          ctx.lineTo(x + 20, y);
          ctx.moveTo(x, y - 20);
          ctx.lineTo(x, y + 20);
          ctx.stroke();
          ctx.strokeStyle = '#152b12';
          ctx.lineWidth = 8;
        }
      }
    }

    const carapaceTexture = new THREE.CanvasTexture(textureCanvas);
    carapaceTexture.wrapS = THREE.RepeatWrapping;
    carapaceTexture.wrapT = THREE.RepeatWrapping;

    // Materials
    const shellMaterial = new THREE.MeshStandardMaterial({
      map: carapaceTexture,
      roughness: 0.35,
      metalness: 0.1,
    });

    const plastronMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4ecd8, // Creamy ivory yellow
      roughness: 0.5,
      metalness: 0.05,
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d6b38, // Olive green scaly skin
      roughness: 0.6,
      metalness: 0.05,
    });

    // 7. Construct Anatomical Green Sea Turtle Hierarchy
    const turtleGroup = new THREE.Group();
    turtleGroupRef.current = turtleGroup;

    // --- CARAPACE (Top Shell) ---
    // Dome shaped slightly flattened oval
    const shellGeo = new THREE.SphereGeometry(1.3, 32, 24);
    shellGeo.scale(1.0, 0.45, 1.45);
    const carapaceMesh = new THREE.Mesh(shellGeo, shellMaterial);
    carapaceMesh.position.set(0, 0.1, 0);
    turtleGroup.add(carapaceMesh);

    // --- PLASTRON (Bottom Shell) ---
    const plastronGeo = new THREE.BoxGeometry(1.6, 0.15, 2.0);
    const plastronMesh = new THREE.Mesh(plastronGeo, plastronMaterial);
    plastronMesh.position.set(0, -0.15, 0);
    turtleGroup.add(plastronMesh);

    // --- NECK & HEAD GROUP ---
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, -0.05, 1.3);
    neckRef.current = neckGroup;

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.5, 16);
    neckGeo.rotateX(Math.PI / 2.8);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, 0.1, 0.15);
    neckGroup.add(neckMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.35, 20, 16);
    headGeo.scale(0.85, 0.7, 1.15);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 0.28, 0.5);
    neckGroup.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.22, 0.35, 0.65);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.22, 0.35, 0.65);
    neckGroup.add(leftEye);
    neckGroup.add(rightEye);

    turtleGroup.add(neckGroup);

    // --- FRONT PADDLE FLIPPERS ---
    // Left Flipper
    const leftFlipperGroup = new THREE.Group();
    leftFlipperGroup.position.set(-0.9, -0.05, 0.7);
    leftFlipperRef.current = leftFlipperGroup;

    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.bezierCurveTo(-0.6, 0.3, -1.5, 0.2, -1.9, -0.4);
    flipperShape.bezierCurveTo(-1.6, -0.8, -0.8, -0.6, 0, -0.2);
    flipperShape.closePath();

    const flipperGeo = new THREE.ExtrudeGeometry(flipperShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    flipperGeo.rotateX(Math.PI / 2);

    const leftFlipperMesh = new THREE.Mesh(flipperGeo, skinMaterial);
    leftFlipperGroup.add(leftFlipperMesh);
    turtleGroup.add(leftFlipperGroup);

    // Right Flipper (Mirrored)
    const rightFlipperGroup = new THREE.Group();
    rightFlipperGroup.position.set(0.9, -0.05, 0.7);
    rightFlipperRef.current = rightFlipperGroup;

    const rightFlipperMesh = leftFlipperMesh.clone();
    rightFlipperMesh.scale.set(-1, 1, 1);
    rightFlipperGroup.add(rightFlipperMesh);
    turtleGroup.add(rightFlipperGroup);

    // --- REAR STEERING FLIPPERS ---
    const rearFlipperGeo = new THREE.SphereGeometry(0.35, 16, 12);
    rearFlipperGeo.scale(0.8, 0.12, 1.4);
    const leftRear = new THREE.Mesh(rearFlipperGeo, skinMaterial);
    leftRear.position.set(-0.7, -0.1, -1.2);
    leftRear.rotation.y = 0.35;
    const rightRear = new THREE.Mesh(rearFlipperGeo, skinMaterial);
    rightRear.position.set(0.7, -0.1, -1.2);
    rightRear.rotation.y = -0.35;
    turtleGroup.add(leftRear);
    turtleGroup.add(rightRear);

    // --- TINY TAIL ---
    const tailGeo = new THREE.ConeGeometry(0.12, 0.4, 12);
    tailGeo.rotateX(-Math.PI / 2.3);
    const tailMesh = new THREE.Mesh(tailGeo, skinMaterial);
    tailMesh.position.set(0, -0.1, -1.4);
    turtleGroup.add(tailMesh);

    scene.add(turtleGroup);

    // 8. Water Floating Dust / Bubble Particles
    const bubbleGeo = new THREE.BufferGeometry();
    const bubbleCount = 70;
    const bubblePos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount * 3; i += 3) {
      bubblePos[i] = (Math.random() - 0.5) * 8;
      bubblePos[i + 1] = (Math.random() - 0.5) * 6;
      bubblePos[i + 2] = (Math.random() - 0.5) * 8;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0x2ee6ca,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    // 9. Interactive Drag Orbit Controls (Pointer/Touch)
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !turtleGroupRef.current) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;

      targetRotationYRef.current += deltaX * 0.008;
      targetRotationXRef.current = Math.max(-0.6, Math.min(0.8, targetRotationXRef.current + deltaY * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    // Constrained Zoom with Mouse Wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const newZ = cameraRef.current.position.z + e.deltaY * 0.003;
      // Clamp between 2.2m and 6.5m
      cameraRef.current.position.z = Math.max(2.2, Math.min(6.5, newZ));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // If auto-rotating, gently advance targetRotationY
      if (autoRotate && !isDragging) {
        targetRotationYRef.current += 0.008;
      }

      // Smooth damped rotation
      if (turtleGroupRef.current) {
        turtleGroupRef.current.rotation.y += (targetRotationYRef.current - turtleGroupRef.current.rotation.y) * 0.08;
        turtleGroupRef.current.rotation.x += (targetRotationXRef.current - turtleGroupRef.current.rotation.x) * 0.08;

        // Gentle undulating floating bob
        turtleGroupRef.current.position.y = Math.sin(elapsedTime * 1.2) * 0.08;
      }

      // Harmonic swimming strokes for front paddle flippers
      const strokeAngle = Math.sin(elapsedTime * 2.2);
      if (leftFlipperRef.current) {
        leftFlipperRef.current.rotation.z = strokeAngle * 0.45;
        leftFlipperRef.current.rotation.x = Math.cos(elapsedTime * 2.2) * 0.2;
      }
      if (rightFlipperRef.current) {
        rightFlipperRef.current.rotation.z = -strokeAngle * 0.45;
        rightFlipperRef.current.rotation.x = Math.cos(elapsedTime * 2.2) * 0.2;
      }

      // Neck and head breathing cadence
      if (neckRef.current) {
        neckRef.current.rotation.x = Math.sin(elapsedTime * 1.1) * 0.05;
      }

      // Slowly rise bubbles
      const pos = bubbleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < bubbleCount * 3; i += 3) {
        pos[i] += 0.008;
        if (pos[i] > 3) pos[i] = -3;
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      shellGeo.dispose();
      plastronGeo.dispose();
      flipperGeo.dispose();
      bubbleGeo.dispose();
    };
  }, [autoRotate]);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Hotspots on Screen (Legacy, shown in Landing Beat 3) */}
      {showLegacyControls && (
        <>
          <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
            <button
              type="button"
              onClick={() => {
                onSelectHotspot?.('shell');
                oceanAudio.speak('Mai rùa cứng như chiếc áo giáp che chở bạn rùa khỏi cá dữ!');
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-md border text-sm font-extrabold transition-all cursor-pointer shadow-lg ${
                selectedHotspot === 'shell'
                  ? 'bg-[#F67650] text-[#12384B] border-white scale-105 ring-4 ring-[#F67650]/40'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#E5A93C] animate-ping" />
              <span>🔍 Mai Rùa Cứng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectHotspot?.('flipper');
                oceanAudio.speak('Đôi vây bơi to khỏe như đôi mái chèo giúp rùa bơi lướt sóng hàng nghìn cây số!');
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-md border text-sm font-extrabold transition-all cursor-pointer shadow-lg ${
                selectedHotspot === 'flipper'
                  ? 'bg-[#F67650] text-[#12384B] border-white scale-105 ring-4 ring-[#F67650]/40'
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[#2EE6CA] animate-ping" />
              <span>🔍 Đôi Vây Mái Chèo</span>
            </button>
          </div>

          {/* Reset Camera Button */}
          <div className="absolute bottom-6 left-6 z-20">
            <button
              type="button"
              onClick={resetCamera}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md transition-all cursor-pointer"
            >
              🔄 Đặt Lại Góc Nhìn
            </button>
          </div>
        </>
      )}

      {/* 2D Fallback Overlay when WebGL is unavailable */}
      {!webGlSupported && (
        <div className="absolute inset-0 z-30 bg-[#12384B] flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="text-8xl mb-4">🐢</div>
          <h3 className="font-extrabold text-2xl mb-2">Rùa Xanh (Chelonia mydas)</h3>
          <p className="text-slate-300 max-w-md text-sm mb-4">
            Thiết bị của bạn đang xem ở chế độ minh họa 2D nhẹ. Rùa xanh là loài bò sát biển quý giá, ăn cỏ biển ở rạn san hô nước nông.
          </p>
        </div>
      )}
    </div>
  );
}
