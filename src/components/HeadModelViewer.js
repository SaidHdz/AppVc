import React, { Suspense, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment } from '@react-three/drei/native';
import * as THREE from 'three';

function Model({ impactZone, ...props }) {
  const group = useRef();
  const { scene } = useGLTF(require('../../assets/low-poly_head_base.glb'));
  
  // Ángulos para las 14 zonas (incluyendo el anillo superior)
  const targetRotations = {
    // Ecuador
    'frontal': { x: 0, y: 0 },
    'lateral_derecho': { x: 0, y: -Math.PI / 2 },
    'posterior': { x: 0, y: Math.PI },
    'lateral_izquierdo': { x: 0, y: Math.PI / 2 },
    // Diagonales Ecuador
    'frontal_derecho': { x: 0, y: -Math.PI / 4 },
    'posterior_derecho': { x: 0, y: -3 * Math.PI / 4 },
    'posterior_izquierdo': { x: 0, y: 3 * Math.PI / 4 },
    'frontal_izquierdo': { x: 0, y: Math.PI / 4 },
    // Anillo Superior (Intermedio)
    'frontal_superior': { x: Math.PI / 6, y: 0 },
    'posterior_superior': { x: Math.PI / 6, y: Math.PI },
    'lateral_derecho_superior': { x: Math.PI / 6, y: -Math.PI / 2 },
    'lateral_izquierdo_superior': { x: Math.PI / 6, y: Math.PI / 2 },
    // Polos
    'superior': { x: Math.PI / 2.5, y: 0 },
    'inferior': { x: -Math.PI / 3, y: 0 },
  };

  useFrame((state) => {
    if (impactZone && targetRotations[impactZone] && group.current) {
      const target = targetRotations[impactZone];
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.y, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, target.x, 0.05);
    }

    const blink = impactZone ? (Math.sin(state.clock.elapsedTime * 3) + 1) / 2 : 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeVertexNormals();
        child.material.flatShading = false;
        child.material.color.set('#BBDEFB');
      }
    });

    if (group.current) {
      const lights = group.current.children.filter(c => c.isSpotLight);
      lights.forEach(light => {
        light.intensity = (light.name === impactZone) ? blink * 100 : 0;
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} {...props} />
      
      {/* Luces Ecuador */}
      <spotLight name="frontal" position={[0, 0, 5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="lateral_derecho" position={[5, 0, 0]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="posterior" position={[0, 0, -5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="lateral_izquierdo" position={[-5, 0, 0]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="frontal_derecho" position={[3.5, 0, 3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="posterior_derecho" position={[3.5, 0, -3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="posterior_izquierdo" position={[-3.5, 0, -3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="frontal_izquierdo" position={[-3.5, 0, 3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      
      {/* Luces Anillo Superior Intermedio */}
      <spotLight name="frontal_superior" position={[0, 3.5, 3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="posterior_superior" position={[0, 3.5, -3.5]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="lateral_derecho_superior" position={[3.5, 3.5, 0]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="lateral_izquierdo_superior" position={[-3.5, 3.5, 0]} angle={0.4} penumbra={1} color="#FF0000" />

      {/* Luces Polos */}
      <spotLight name="superior" position={[0, 6, 0]} angle={0.4} penumbra={1} color="#FF0000" />
      <spotLight name="inferior" position={[0, -6, 0]} angle={0.4} penumbra={1} color="#FF0000" />
    </group>
  );
}

export default function HeadModelViewer({ impactZone }) {
  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }} onCreated={(state) => state.gl.setClearColor('#0A0C10')}>
        <ambientLight intensity={0.9} color="#E3F2FD" />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model impactZone={impactZone} scale={2.5} position={[0, 0, 0]} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#0A0C10' },
});