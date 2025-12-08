import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeDChart component
 * Renders a 3D bar chart using Three.js
 * Expects data in Chart.js format: { labels: [], datasets: [{ data: [] }] }
 */
function ThreeDChart({ data, xAxis, yAxis }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!data || !data.labels || !data.datasets || !data.datasets[0]) {
      return;
    }

    const labels = data.labels;
    const values = data.datasets[0].data;
    const maxValue = Math.max(...values, 1);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 30, 50);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Create bars
    const barGroup = new THREE.Group();
    const barWidth = 0.8;
    const barSpacing = 1.2;
    const startX = -(labels.length * barSpacing) / 2;

    labels.forEach((label, index) => {
      const height = (values[index] / maxValue) * 20; // Scale to max 20 units
      const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((index / labels.length) * 0.7, 0.7, 0.6),
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(startX + index * barSpacing, height / 2, 0);
      barGroup.add(bar);
    });

    scene.add(barGroup);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50);
    scene.add(gridHelper);

    // Mouse controls for rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition.x = e.clientX;
      previousMousePosition.y = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      barGroup.rotation.y += deltaX * 0.01;
      barGroup.rotation.x += deltaY * 0.01;

      previousMousePosition.x = e.clientX;
      previousMousePosition.y = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('mouseleave', onMouseUp);
        if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [data, xAxis, yAxis]);

  return (
    <div
      id="three-d-chart"
      ref={mountRef}
      style={{ width: '100%', height: '500px', border: '1px solid #ddd' }}
    />
  );
}

export default ThreeDChart;



