export const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec2 a_texcoord;
attribute vec4 a_color;uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_viewWorldPosition;
 
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;
 
void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
 
  v_normal = mat3(u_world) * a_normal;
  mat3 normalMat = mat3(u_world);
  v_normal = normalize(normalMat * a_normal);
  v_tangent = normalize(normalMat * a_tangent);
 
  v_texcoord = a_texcoord;
  v_color = a_color;
}
`;
 
export const fs = `
precision highp float;
 
varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;
 
uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform sampler2D specularMap;
uniform float shininess;
uniform sampler2D normalMap;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;
 
void main () {
  vec3 normal = normalize(v_normal);
  vec3 tangent = normalize(v_tangent);
  vec3 bitangent = normalize(cross(normal, tangent));
 
  mat3 tbn = mat3(tangent, bitangent, normal);
  normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
  normal = normalize(tbn * normal);
 
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);
 
  float fakeLight = dot(u_lightDirection, normal) * 0.5 + .5;
  float specularLight = clamp(dot(normal, halfVector), 0.001, 1.0);
  vec4 specularMapColor = texture2D(specularMap, v_texcoord);
  vec3 effectiveSpecular = specular * specularMapColor.rgb;
 
  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;
 
  gl_FragColor = vec4(
      emissive +
      ambient * u_ambientLight +
      effectiveDiffuse * fakeLight +
      effectiveSpecular * pow(specularLight, shininess),
      effectiveOpacity);// * 0.0 + vec4(normal * 0.5 + 0.5 + effectiveSpecular * pow(specularLight, shininess), 1);
}
`;

/*ERIK ACCENDE E SPEGNE LUCE
export const vs = `
attribute vec4 a_position;   // Vertex position in model space
attribute vec3 a_normal;     // Vertex normal in model space
attribute vec3 a_tangent;    // Vertex tangent in model space
attribute vec2 a_texcoord;   // Texture coordinates
attribute vec4 a_color;      // Vertex color

uniform mat4 u_projection;   // Projection matrix
uniform mat4 u_view;         // View matrix
uniform mat4 u_world;        // World transformation matrix
uniform vec3 u_viewWorldPosition; // Camera position in world space

varying vec3 v_normal;       // Normal to be passed to fragment shader
varying vec3 v_tangent;      // Tangent to be passed to fragment shader
varying vec3 v_surfaceToView; // Vector from surface to view to be passed to fragment shader
varying vec2 v_texcoord;     // Texture coordinates to be passed to fragment shader
varying vec4 v_color;        // Color to be passed to fragment shader

void main() {
  vec4 worldPosition = u_world * a_position; // Transform vertex position to world space
  gl_Position = u_projection * u_view * worldPosition; // Transform vertex position to clip space
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz; // Calculate vector from surface to view
  mat3 normalMat = mat3(u_world); // Extract 3x3 matrix for normal transformation
  v_normal = normalize(normalMat * a_normal); // Transform and normalize the normal
  v_tangent = normalize(normalMat * a_tangent); // Transform and normalize the tangent
  v_texcoord = a_texcoord; // Pass texture coordinates to fragment shader
  v_color = a_color; // Pass color to fragment shader
}
`;


export const fs = `
precision highp float; // Set precision for float variables
varying vec3 v_normal; // Interpolated normal from vertex shader
varying vec3 v_tangent; // Interpolated tangent from vertex shader
varying vec3 v_surfaceToView; // Interpolated vector from surface to view from vertex shader
varying vec2 v_texcoord; // Interpolated texture coordinates from vertex shader
varying vec4 v_color; // Interpolated color from vertex shader

uniform int u_lightsEnabled; // Flag to enable or disable lighting
uniform int u_bumpMappingEnabled; // Flag to enable or disable bump mapping
uniform vec3 diffuse; // Diffuse color
uniform sampler2D diffuseMap; // Diffuse texture map
uniform vec3 ambient; // Ambient color
uniform vec3 emissive; // Emissive color
uniform vec3 specular; // Specular color
uniform sampler2D specularMap; // Specular texture map
uniform sampler2D normalMap; // Normal map texture
uniform float shininess; // Shininess coefficient for specular highlight
uniform float opacity; // Opacity of the material
uniform vec3 u_lightDirection; // Direction of the light
uniform vec3 u_ambientLight; // Ambient light color

void main () {
  //if (u_lightsEnabled == 1) { // Check if lighting is enabled
    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 ); // Compute the normal, adjusting for front-facing or back-facing
    if (u_bumpMappingEnabled == 0) { // Check if bump mapping is enabled
      vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 ); // Normalize tangent and adjust for facing direction
      vec3 bitangent = normalize(cross(normal, tangent)); // Compute bitangent as the cross product of normal and tangent
      
      mat3 tbn = mat3(tangent, bitangent, normal); // Create TBN matrix for transforming normals
      normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.; // Sample the normal map and convert from [0,1] range to [-1,1] range
      normal = normalize(tbn * normal); // Transform and normalize the sampled normal
    }
      vec3 surfaceToViewDirection = normalize(v_surfaceToView); // Compute the view direction
      vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection); // Compute the half vector for specular lighting

      float fakeLight = dot(u_lightDirection, normal) * .5 + .5; // Compute the diffuse lighting component
      float specularLight = clamp(dot(normal, halfVector), 0.5, 1.0); // Compute the specular lighting component
      vec4 specularMapColor = texture2D(specularMap, v_texcoord); // Sample the specular map
      vec3 effectiveSpecular = specular * specularMapColor.rgb; // Compute the effective specular color

      vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord); // Sample the diffuse map
      vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb; // Compute the effective diffuse color
      float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a; // Compute the effective opacity

      gl_FragColor = vec4(
          emissive + // Add emissive color
          ambient * u_ambientLight + // Add ambient color
          effectiveDiffuse * fakeLight + // Add diffuse lighting
          effectiveSpecular * pow(specularLight, shininess), // Add specular lighting
          effectiveOpacity); // Set the final opacity
  //} else {
    //  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // If lighting is disabled, set fragment color to black with full opacity
  //}
}
`;*/

/*
export const vs = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec2 a_texcoord;
attribute vec4 a_color;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform vec3 u_viewWorldPosition;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_tangent;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
  v_normal = mat3 normalMat = mat3(u_world);
  v_normal = normalize(normalMat * a_normal);
  v_tangent = normalize(normalMat * a_tangent);
  v_texcoord = a_texcoord;
  v_color = a_color;
}
`;

export const fs = `
precision highp float;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec2 v_texcoord;
varying vec4 v_color;

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 ambient;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;

void main () {
  // interpolazione normali per shading
			vec3 normal = normalize(v_normal) 
      
    vec3 tangent = normalize(v_tangent);
    vec3 bitangent = normalize(cross(normal, tangent));
  
    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
    normal = normalize(tbn * normal);
			//}

  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
  float specularLight = clamp(dot(normal, halfVector), 0.05, 1.0);

  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
  vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
  float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

  gl_FragColor = vec4(
      emissive +
      ambient * u_ambientLight +
      effectiveDiffuse * fakeLight +
      specular * pow(specularLight, shininess),
      effectiveOpacity);
}
`;
*/
export function rand(min, max) {
    return Math.random()*(max-min)+min;
}

/**
 * Converte gradi in radianti.
 * @param {number} deg - Valore in gradi.
 * @returns {number} - Valore in radianti.
 */
export function degToRad(deg) {
    return deg * Math.PI / 180;
}
