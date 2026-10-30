import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DragToRotateBadge } from '../../../../shared/ui/visuals/Ocean3DSvgs';

export interface TurtleCard3DCanvasProps {
  className?: string;
  showBadge?: boolean;
}

export function TurtleCard3DCanvas({
  className = '',
  showBadge = true,
}: TurtleCard3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Availability Check
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

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;

    // 2. Scene & Depth Background
    const scene = new THREE.Scene();

    // 3. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.35, 3.7);
    camera.lookAt(0, 0, 0);

    // 4. Renderer Setup (alpha: true allows natural aquatic backdrop)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setClearColor(0x000000, 0);
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
    const ambientLight = new THREE.AmbientLight(0x16697a, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7db, 2.6);
    sunLight.position.set(2, 5, 3);
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(0x2ee6ca, 1.3);
    bounceLight.position.set(-2, -3, -1);
    scene.add(bounceLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.6);
    rimLight.position.set(0, -1, -3);
    scene.add(rimLight);

    // 6. Procedural Scute Texture for Carapace
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 256;
    textureCanvas.height = 256;
    const ctx = textureCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#2d5a27';
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = '#162d13';
      ctx.lineWidth = 5;
      ctx.fillStyle = '#488035';

      for (let y = 20; y < 256; y += 60) {
        for (let x = 20; x < 256; x += 65) {
          ctx.beginPath();
          ctx.arc(x, y, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#e6ad45';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x - 12, y);
          ctx.lineTo(x + 12, y);
          ctx.moveTo(x, y - 12);
          ctx.lineTo(x, y + 12);
          ctx.stroke();
          ctx.strokeStyle = '#162d13';
          ctx.lineWidth = 5;
        }
      }
    }

    const carapaceTexture = new THREE.CanvasTexture(textureCanvas);
    carapaceTexture.wrapS = THREE.RepeatWrapping;
    carapaceTexture.wrapT = THREE.RepeatWrapping;

    const shellMaterial = new THREE.MeshStandardMaterial({
      map: carapaceTexture,
      roughness: 0.35,
      metalness: 0.1,
    });

    const plastronMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4ecd8,
      roughness: 0.5,
      metalness: 0.05,
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d6b38,
      roughness: 0.6,
      metalness: 0.05,
    });

    // 7. Construct Green Sea Turtle Anatomy
    const turtleGroup = new THREE.Group();
    turtleGroup.scale.set(0.9, 0.9, 0.9);

    // Carapace (Top Shell)
    const shellGeo = new THREE.SphereGeometry(1.2, 28, 20);
    shellGeo.scale(1.0, 0.42, 1.4);
    const carapaceMesh = new THREE.Mesh(shellGeo, shellMaterial);
    carapaceMesh.position.set(0, 0.1, 0);
    turtleGroup.add(carapaceMesh);

    // Plastron (Under Shell)
    const plastronGeo = new THREE.BoxGeometry(1.45, 0.14, 1.85);
    const plastronMesh = new THREE.Mesh(plastronGeo, plastronMaterial);
    plastronMesh.position.set(0, -0.12, 0);
    turtleGroup.add(plastronMesh);

    // Neck & Head
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, -0.05, 1.2);

    const neckGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.45, 14);
    neckGeo.rotateX(Math.PI / 2.8);
    const neckMesh = new THREE.Mesh(neckGeo, skinMaterial);
    neckMesh.position.set(0, 0.1, 0.12);
    neckGroup.add(neckMesh);

    const headGeo = new THREE.SphereGeometry(0.32, 18, 14);
    headGeo.scale(0.85, 0.7, 1.15);
    const headMesh = new THREE.Mesh(headGeo, skinMaterial);
    headMesh.position.set(0, 0.25, 0.45);
    neckGroup.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.32, 0.58);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.32, 0.58);
    neckGroup.add(leftEye);
    neckGroup.add(rightEye);
    turtleGroup.add(neckGroup);

    // Front Flippers
    const leftFlipperGroup = new THREE.Group();
    leftFlipperGroup.position.set(-0.85, -0.05, 0.65);

    const flipperShape = new THREE.Shape();
    flipperShape.moveTo(0, 0);
    flipperShape.bezierCurveTo(-0.5, 0.25, -1.3, 0.15, -1.7, -0.35);
    flipperShape.bezierCurveTo(-1.4, -0.7, -0.7, -0.5, 0, -0.18);
    flipperShape.closePath();

    const flipperGeo = new THREE.ExtrudeGeometry(flipperShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    flipperGeo.rotateX(Math.PI / 2);

    const leftFlipperMesh = new THREE.Mesh(flipperGeo, skinMaterial);
    leftFlipperGroup.add(leftFlipperMesh);
    turtleGroup.add(leftFlipperGroup);

    const rightFlipperGroup = new THREE.Group();
    rightFlipperGroup.position.set(0.85, -0.05, 0.65);
    const rightFlipperGeo = flipperGeo.clone();
    rightFlipperGeo.scale(-1, 1, 1);
    const rightFlipperMesh = new THREE.Mesh(rightFlipperGeo, skinMaterial);
    rightFlipperGroup.add(rightFlipperMesh);
    turtleGroup.add(rightFlipperGroup);

    // Hind Flippers
    const hindShape = new THREE.Shape();
    hindShape.moveTo(0, 0);
    hindShape.bezierCurveTo(-0.3, 0.1, -0.7, -0.1, -0.85, -0.45);
    hindShape.bezierCurveTo(-0.6, -0.65, -0.3, -0.45, 0, -0.15);
    hindShape.closePath();

    const hindGeo = new THREE.ExtrudeGeometry(hindShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    hindGeo.rotateX(Math.PI / 2);

    const leftHindGroup = new THREE.Group();
    leftHindGroup.position.set(-0.65, -0.1, -0.9);
    leftHindGroup.add(new THREE.Mesh(hindGeo, skinMaterial));
    turtleGroup.add(leftHindGroup);

    const rightHindGroup = new THREE.Group();
    rightHindGroup.position.set(0.65, -0.1, -0.9);
    const rightHindGeo = hindGeo.clone();
    rightHindGeo.scale(-1, 1, 1);
    rightHindGroup.add(new THREE.Mesh(rightHindGeo, skinMaterial));
    turtleGroup.add(rightHindGroup);

    scene.add(turtleGroup);

    // Initial slight three-quarter view matching mockup
    turtleGroup.rotation.set(0.18, 0.45, 0);

    // 8. Floating Ocean Bubbles
    const bubbleCount = 45;
    const bubbleGeo = new THREE.BufferGeometry();
    const bubblePos = new Float32Array(bubbleCount * 3);
    for (let i = 0; i < bubbleCount * 3; i += 3) {
      bubblePos[i] = (Math.random() - 0.5) * 6;
      bubblePos[i + 1] = (Math.random() - 0.5) * 4;
      bubblePos[i + 2] = (Math.random() - 0.5) * 6;
    }
    bubbleGeo.setAttribute('position', new THREE.BufferAttribute(bubblePos, 3));
    const bubbleMat = new THREE.PointsMaterial({
      color: 0x2ee6ca,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const bubbles = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubbles);

    // 9. Interactive Drag Orbit Variables
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let targetRotationY = 0.45;
    let targetRotationX = 0.18;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      targetRotationY += deltaX * 0.01;
      targetRotationX = Math.max(-0.4, Math.min(0.65, targetRotationX + deltaY * 0.008));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      setIsInteracting(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Safe fallback
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerUp);

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow idle rotation when not dragging
      if (!isDragging) {
        targetRotationY += 0.005;
      }

      // Smooth damping
      turtleGroup.rotation.y += (targetRotationY - turtleGroup.rotation.y) * 0.09;
      turtleGroup.rotation.x += (targetRotationX - turtleGroup.rotation.x) * 0.09;

      // Gentle swimming flipper strokes
      const stroke = Math.sin(elapsed * 2.2);
      leftFlipperGroup.rotation.z = stroke * 0.4;
      leftFlipperGroup.rotation.x = Math.cos(elapsed * 2.2) * 0.18;
      rightFlipperGroup.rotation.z = -stroke * 0.4;
      rightFlipperGroup.rotation.x = Math.cos(elapsed * 2.2) * 0.18;

      // Gentle vertical floating bob
      turtleGroup.position.y = Math.sin(elapsed * 1.3) * 0.06;
      neckGroup.rotation.x = Math.sin(elapsed * 1.1) * 0.04;

      // Rise bubbles
      const pos = bubbleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < bubbleCount * 3; i += 3) {
        pos[i] += 0.007;
        if (pos[i] > 2.5) pos[i] = -2.5;
      }
      bubbleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Observer for fluid responsiveness
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerUp);

      renderer.dispose();
      shellGeo.dispose();
      plastronGeo.dispose();
      neckGeo.dispose();
      headGeo.dispose();
      eyeGeo.dispose();
      flipperGeo.dispose();
      hindGeo.dispose();
      bubbleGeo.dispose();
      carapaceTexture.dispose();
      shellMaterial.dispose();
      plastronMaterial.dispose();
      skinMaterial.dispose();
      bubbleMat.dispose();

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  if (!webGlSupported) {
    return (
      <div className={`relative w-full h-full bg-[#1B8A9E] flex items-center justify-center ${className}`}>
        <img
          src="/assets/generated/creatures/mockup_card_turtle.png"
          alt="Rùa biển 3D"
          className="w-full h-full object-cover"
        />
        {showBadge && (
          <div className="absolute top-3.5 right-3.5">
            <DragToRotateBadge />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${
        isInteracting ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      style={{
        WebkitUserSelect: 'none',
        background: 'radial-gradient(circle at 65% 15%, #28AEC4 0%, #15758B 55%, #0A4A5A 100%)',
      }}
    >
      {/* Subtle sun ray caustics in background */}
      <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen overflow-hidden">
        <svg viewBox="0 0 320 200" fill="none" preserveAspectRatio="none" className="w-full h-full">
          <polygon points="110,0 150,0 190,200 120,200" fill="url(#sunray1)" opacity="0.6" />
          <polygon points="175,0 215,0 265,200 195,200" fill="url(#sunray2)" opacity="0.75" />
          <polygon points="50,0 80,0 100,200 50,200" fill="url(#sunray1)" opacity="0.4" />
          <defs>
            <linearGradient id="sunray1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#2EE6CA" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sunray2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showBadge && (
        <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
          <DragToRotateBadge />
        </div>
      )}
    </div>
  );
}
