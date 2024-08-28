/*                                VERTEX - FRAGMENT SHADER                                 */
export const vs = `
attribute vec4 a_position;   // Posizione del vertice nello spazio del modello
attribute vec3 a_normal;     // Normale del vertice nello spazio del modello
attribute vec3 a_tangent;    // Tangente del vertice nello spazio del modello
attribute vec2 a_texcoord;   // Coordinate della texture
attribute vec4 a_color;      // Colore del vertice

uniform mat4 u_projection;   // Matrice di proiezione
uniform mat4 u_view;         // Matrice di vista
uniform mat4 u_world;        // Matrice di trasformazione del mondo
uniform vec3 u_viewWorldPosition; // Posizione della camera
uniform vec3 u_lightWorldPosition; 
uniform mat4 u_textureMatrix;


varying vec3 v_normal;       // Normal to be passed to fragment shader
varying vec3 v_tangent;      // Tangent to be passed to fragment shader
varying vec3 v_surfaceToView; // Vector from surface to view to be passed to fragment shader
varying vec2 v_texcoord;     // Texture coordinates to be passed to fragment shader
varying vec4 v_color;        // Color to be passed to fragment shader
varying vec4 v_projectedTexcoord;
varying vec3 v_surfaceToLight; //*

/*         
uniform vec3 u_lightDirection; // Direzione della luce
uniform vec3 u_ambientLight;  // Colore della luce ambientale

// Usare flat per evitare interpolazioni
flat varying vec4 v_color; // Colore uniforme per tutti i frammenti del triangolo
 */

void main() {
  vec4 worldPosition = u_world * a_position; // Transform vertex position to world space
  gl_Position = u_projection * u_view * worldPosition; // Transform vertex position to clip space
  v_texcoord = a_texcoord; 
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz; // Calculate vector from surface to view - worldPosition.xyz - surfaceWorldPosition in webgl
  v_surfaceToLight = u_lightWorldPosition - worldPosition.xyz; //*
  v_projectedTexcoord = u_textureMatrix * worldPosition;

  mat3 normalMat = mat3(u_world); // Extract 3x3 matrix for normal transformation
  v_normal = normalize(normalMat * a_normal); // Transform and normalize the normal
  v_tangent = normalize(normalMat * a_tangent); // Transform and normalize the tangent
  v_texcoord = a_texcoord; // Pass texture coordinates to fragment shader
  v_projectedTexcoord = u_textureMatrix * worldPosition;
  v_color = a_color; // Pass color to fragment shader
}
`;

export const fs = `
precision highp float; // Set precision for float variables

varying vec3 v_normal; // Interpolated normal from vertex shader
varying vec3 v_tangent; // Interpolated tangent from vertex shader
varying vec3 v_surfaceToView; // Interpolated vector from surface to view from vertex shader
varying vec3 v_surfaceToLight; //*
varying vec2 v_texcoord;                // Interpolated texture coordinates from vertex shader
varying vec4 v_color;                   // Interpolated color from vertex shader
varying vec4 v_projectedTexcoord;

uniform vec3 diffuse;                   // Colore dell'oggetto color -- u_color di webgl
uniform sampler2D diffuseMap;           // Molto probabilmente la texture map -- u_texture di webgl
uniform vec3 ambient; // Ambient color
uniform vec3 emissive; // Emissive color
uniform vec3 specular; // Specular color
uniform sampler2D specularMap; // Specular texture map
uniform float shininess; // Shininess coefficient for specular highlight
uniform float opacity; // Opacity of the material
uniform vec3 u_lightDirection; // Direction of the light
uniform vec3 u_ambientLight; // Ambient light color
uniform sampler2D u_projectedTexture;
uniform sampler2D normalMap; // Normal map texture
uniform float useNormalMap; // Flag to determine if normal map should be used
uniform float useTextureMap; // Flag to determine if normal map should be used
uniform float useIntensityLight; //alba giorno notte

uniform float u_bias;

void main () {
  vec3 normal = normalize(v_normal); // Normalize interpolated normal

  if (useNormalMap == 1.0) {
    vec3 tangent = normalize(v_tangent); // Normalize interpolated tangent
    vec3 bitangent = normalize(cross(normal, tangent)); // Compute bitangent as the cross product of normal and tangent
    
    mat3 tbn = mat3(tangent, bitangent, normal); // Create TBN matrix for transforming normals
    normal = texture2D(normalMap, v_texcoord).rgb * 2.0 - 1.0; // Sample the normal map and convert from [0,1] range to [-1,1] range
    normal = normalize(tbn * normal); // Transform and normalize the sampled normal
  }

  vec3 surfaceToLightDirection = u_lightDirection-normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView); // Compute the view direction
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  float fakeLight = dot(surfaceToLightDirection, normal)* 0.5 + 0.7; // Compute the diffuse lighting component
  float specularLight = clamp(dot(normal, halfVector), 0.0001, 1.0); // Compute the specular lighting component

  vec4 specularMapColor = texture2D(specularMap, v_texcoord); // Sample the specular map
  vec3 effectiveSpecular = mix(specular, specular * specularMapColor.rgb, useTextureMap); // Compute the effective specular color

  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord); // Sample the diffuse map
  vec3 effectiveDiffuse = mix(diffuse, diffuseMapColor.rgb, useTextureMap)* v_color.rgb;
  float effectiveOpacity = mix(opacity * v_color.a, opacity * diffuseMapColor.a * v_color.a, useTextureMap);

  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  
  float currentDepth = projectedTexcoord.z + u_bias;

   bool inRange = 
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;
    float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
    float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.6 : 0.8;  
  
  float projectedAmount = inRange ? 1.0 : 0.0;

  vec4 gCol = vec4(
    emissive + // Add emissive color
    ambient * u_ambientLight + // Add ambient color
    effectiveDiffuse*useIntensityLight * fakeLight + // Add diffuse lighting
    effectiveSpecular*useIntensityLight * pow(specularLight, shininess), // Add specular lighting
    effectiveOpacity // Set the final opacity
  );

  gl_FragColor = vec4(gCol.rgb * shadowLight, gCol.a);
}
`;


export const vsColor = `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;
export const fsColor = `
precision mediump float;

uniform vec4 u_color;
void main() {
  gl_FragColor = u_color;
}
`;
