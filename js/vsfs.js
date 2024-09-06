/*                                VERTEX - FRAGMENT SHADER                                 */
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
uniform vec3 u_lightWorldPosition; 
uniform mat4 u_textureMatrix;
uniform float useNormalMap;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec3 v_surfaceToLight;
varying vec2 v_texcoord; 
varying vec4 v_color;
varying vec4 v_projectedTexcoord;
varying mat3 v_tbn;

void main() {
  vec4 worldPosition = u_world * a_position;
  gl_Position = u_projection * u_view * worldPosition;
  
  v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
  v_surfaceToLight = u_lightWorldPosition - worldPosition.xyz;
  v_projectedTexcoord = u_textureMatrix * worldPosition;

  v_normal = normalize((u_world * vec4(a_normal, 0.0)).xyz);
  v_tangent = normalize((u_world * vec4(a_tangent, 0.0)).xyz);
  v_texcoord = a_texcoord;
  v_color = a_color;

  if (useNormalMap == 1.0) {
    vec3 bitangent = cross(v_normal, v_tangent);
    v_tbn = mat3(v_tangent, bitangent, v_normal);
  }
}
`;

export const fs = `
precision highp float;

varying vec3 v_normal;
varying vec3 v_tangent;
varying vec3 v_surfaceToView;
varying vec3 v_surfaceToLight;
varying vec2 v_texcoord;
varying vec4 v_color;
varying vec4 v_projectedTexcoord;
varying mat3 v_tbn;

uniform vec3 diffuse;
uniform sampler2D diffuseMap;
uniform vec3 specular;
uniform sampler2D specularMap;
uniform float shininess;
uniform float opacity;
uniform vec3 u_lightDirection;
uniform vec3 u_ambientLight;
uniform sampler2D u_projectedTexture;
uniform sampler2D normalMap;
uniform float u_bias;

uniform float useNormalMap; // Flag to determine if normal map should be used
uniform float useTextureMap; // Flag to determine if texture should be used
uniform float useIntensityLight; // Intensity of light (alba giorno notte)

void main () {

  vec3 normal = normalize(v_normal);// Normalize interpolated normal
  
  //CALCOLO NORMAL MAP
  if (useNormalMap == 1.0) {
    normal = texture2D(normalMap, v_texcoord).rgb * 2.0 - 1.0;
    normal = normalize(v_tbn * normal);
  }

  //CALCOLO OPACITA
  float effectiveOpacity = opacity * v_color.a;

  vec3 surfaceToLightDirection = u_lightDirection-normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);

  //CALCOLO LUCI DIFFUSE E SPECULARI
  float diffuseLight = dot(surfaceToLightDirection, normal)* 0.5 + 0.7;               // Diffuse lighting component [L·N]
  vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);                           // Sample the diffuse map
  vec3 diffuseColor = mix(diffuse, diffuseMapColor.rgb, useTextureMap) * v_color.rgb; // k
  
  //vec3 reflectDir = reflect(-surfaceToLightDirection, normal); 
  //float specularLight = pow(max(dot(surfaceToViewDirection, reflectDir), 0.0), shininess);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);      //derivante dal modello di Blinn-Phong
  float specularHN = clamp(dot(halfVector, normal), 0.001, 1.0);                      
  specularHN = specularHN + 0.007*useNormalMap*useTextureMap;                         // Incrementa la potenza dell'effetto di luce
  float specularLight = pow(specularHN, shininess);                                   // Specular lighting component [(H·N)^n]
  vec4 specularMapColor = texture2D(specularMap, v_texcoord);                         // Sample the specular map
  vec3 specularColor = mix(specular, specular*specularMapColor.rgb, useTextureMap);   // k
 
  //CALCOLO OMBRE
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
  float currentDepth = projectedTexcoord.z + u_bias;
  bool inRange = projectedTexcoord.x >= 0.0 && projectedTexcoord.x <= 1.0 &&
                 projectedTexcoord.y >= 0.0 && projectedTexcoord.y <= 1.0;
  float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
  float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.6 : 0.8;

  //CALCOLO COLORE con lluminazione di Phong (Blinn-Phong)
  vec3 gCol = v_color.rgb * u_ambientLight + // Luce d'ambiente I=KI
    diffuseColor * useIntensityLight * diffuseLight + // Luce diffusa I=KI(LN)
    specularColor* useIntensityLight * specularLight; // Luce speculare I=KI*(RV)^n

  gl_FragColor = vec4(gCol * shadowLight, effectiveOpacity);
}
`;


export const vsColor = `
attribute vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
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
