/**
 * Scene3D - Main 3D scene manager
 * Handles desktop and VR rendering
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export class Scene3D {
  // Three.js core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Controls
  public orbitControls: OrbitControls | null = null;
  public raycaster: THREE.Raycaster;
  public mouse: THREE.Vector2;

  // VR
  public isVRMode: boolean = false;
  private vrButton: HTMLElement | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;

  constructor(container: HTMLElement) {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 50);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 12);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;
    container.appendChild(this.renderer.domElement);

    // Desktop controls (OrbitControls)
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.minDistance = 5;
    this.orbitControls.maxDistance = 30;
    this.orbitControls.maxPolarAngle = Math.PI / 2.2; // Limit looking below horizon

    // Raycaster for mouse picking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(10, 20, 10);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.directionalLight.shadow.camera.left = -20;
    this.directionalLight.shadow.camera.right = 20;
    this.directionalLight.shadow.camera.top = 20;
    this.directionalLight.shadow.camera.bottom = -20;
    this.scene.add(this.directionalLight);

    // Grid helper (optional - for debugging)
    const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
    gridHelper.position.y = -0.5;
    this.scene.add(gridHelper);

    // Setup VR button
    this.setupVRButton();

    // Window resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));

    console.log('Scene3D initialized');
    console.log('VR supported:', this.renderer.xr.isPresenting ? 'Yes' : 'Checking...');
  }

  /**
   * Setup VR button
   */
  private setupVRButton(): void {
    this.vrButton = VRButton.createButton(this.renderer);
    this.vrButton.id = 'vr-button';

    // Add VR button to DOM
    const vrContainer = document.getElementById('vr-button');
    if (vrContainer) {
      vrContainer.appendChild(this.vrButton);
    } else {
      document.body.appendChild(this.vrButton);
    }

    // Listen for VR session start/end
    this.renderer.xr.addEventListener('sessionstart', () => {
      this.isVRMode = true;
      if (this.orbitControls) {
        this.orbitControls.enabled = false;
      }
      console.log('VR session started');
      this.updateModeInfo('VR');
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.isVRMode = false;
      if (this.orbitControls) {
        this.orbitControls.enabled = true;
      }
      console.log('VR session ended');
      this.updateModeInfo('Desktop 3D');
    });
  }

  /**
   * Update mode info in UI
   */
  private updateModeInfo(mode: string): void {
    const modeInfo = document.getElementById('mode-info');
    if (modeInfo) {
      modeInfo.textContent = `Mode: ${mode}`;
    }
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Update controls (call per frame)
   */
  public updateControls(): void {
    if (this.orbitControls && !this.isVRMode) {
      this.orbitControls.update();
    }
  }

  /**
   * Update mouse position for raycasting
   * @param clientX - Mouse X
   * @param clientY - Mouse Y
   */
  public updateMousePosition(clientX: number, clientY: number): void {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  }

  /**
   * Raycast from camera through mouse position
   * @param objects - Objects to test intersection
   * @returns First intersected object or null
   */
  public raycastFromMouse(objects: THREE.Object3D[]): THREE.Intersection | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(objects, false);
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Render scene
   */
  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start animation loop
   * @param callback - Animation callback
   */
  public startAnimationLoop(callback: (time: number, frame: THREE.XRFrame | null) => void): void {
    this.renderer.setAnimationLoop((time, frame) => {
      callback(time, frame || null);
    });
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    if (this.orbitControls) {
      this.orbitControls.dispose();
    }
    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }
}
