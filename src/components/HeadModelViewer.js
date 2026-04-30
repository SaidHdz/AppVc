import React, { Suspense, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, Environment } from '@react-three/drei/native';
import * as THREE from 'three';

function Model({ impactZone, force, ...props }) {
  const group = useRef();
  const { scene } = useGLTF(require('../../assets/low-poly_head_base.glb'));
  
  // Lógica de color por severidad (Shield Sense Standard)
  const getSeverityColor = (f) => {
    if (!f) return "#FF0000"; 
    if (f > 11.0) return "#D32F2F"; // Rojo Severo
    if (f > 7.0) return "#FF9800";  // Naranja Moderado
    if (f >= 3.5) return "#FBC02D"; // Amarillo Leve
    return "#4CAF50";               // Verde Normal
  };

  const alertColor = getSeverityColor(force);

  // Ángulos para las 6 zonas principales del firmware
  const targetRotations = {
    'frontal': { x: 0, y: 0 },
    'lateral_derecho': { x: 0, y: -Math.PI / 2 },
    'posterior': { x: 0, y: Math.PI },
    'lateral_izquierdo': { x: 0, y: Math.PI / 2 },
    'superior': { x: Math.PI / 2.5, y: 0 },
    'inferior': { x: -Math.PI / 3, y: 0 },
  };

  useFrame((state) => {
    if (impactZone && targetRotations[impactZone] && group.current) {
      const target = targetRotations[impactZone];
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, target.y, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, target.x, 0.05);
    }

    const blink = impactZone ? (Math.sin(state.clock.elapsedTime * 6) + 1) / 2 : 0;

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
        light.intensity = (light.name === impactZone) ? blink * 150 : 0;
        light.color.set(alertColor);
      });
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} {...props} />
      
      <spotLight name="frontal" position={[0, 0, 5]} angle={0.5} penumbra={1} />
      <spotLight name="lateral_derecho" position={[5, 0, 0]} angle={0.5} penumbra={1} />
      <spotLight name="posterior" position={[0, 0, -5]} angle={0.5} penumbra={1} />
      <spotLight name="lateral_izquierdo" position={[-5, 0, 0]} angle={0.5} penumbra={1} />
      <spotLight name="superior" position={[0, 6, 0]} angle={0.5} penumbra={1} />
      <spotLight name="inferior" position={[0, -6, 0]} angle={0.5} penumbra={1} />
    </group>
  );
}

export default function HeadModelViewer({ impactZone, force }) {
  return (
    <View style={styles.container}>
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }} onCreated={(state) => state.gl.setClearColor('#0A0C10')}>
        <ambientLight intensity={0.9} color="#E3F2FD" />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <Model impactZone={impactZone} force={force} scale={2.5} position={[0, 0, 0]} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', backgroundColor: '#0A0C10' },
});