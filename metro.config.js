const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Soporte para modelos 3D
config.resolver.assetExts.push('glb', 'gltf');

module.exports = config;