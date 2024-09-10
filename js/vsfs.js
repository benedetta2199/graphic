/*                                VERTEX - FRAGMENT SHADER                                 */
export const vs = `
//variabili sono per-vertex data passati dalla CPU alla GPU
attribute vec4 a_position;                //posizione del vertice
attribute vec3 a_normal;                  //normale al vertice
attribute vec3 a_tangent;                 //il vettore tangente
attribute vec2 a_texcoord;                //coordinate della texture associate al verice
attribute vec4 a_color;                   //il colore del vertice

//costanti durante il rendering di un intero oggetto (dati condivisi tra i vertici)
uniform mat4 u_world;                     //matrice trasformazione model-space -> world-space
uniform mat4 u_view;                      //matrice di vista, trasformazione world-space -> view-space
uniform mat4 u_projection;                //matrice di proiezione, trasformazione view-space -> clip-space
uniform vec3 u_viewPosition;              //posizione della camera
uniform vec3 u_lightPosition;             //posizione della luce
uniform mat4 u_textureMatrix;             //le coordinate della texture proiettata ??

uniform float useNormalMap;               //flag che indica se usare la mappa normale.

//variabili usate per passare dati dal vertex shader al fragment shader
varying vec3 v_normal;                    // normale della superficie in uno spazio 3D
varying vec3 v_surfaceToView;             // direzione dal punto della superficie (o frammento) alla posizione della fotocamera
varying vec3 v_surfaceToLight;            // direzione dal punto della superficie (o frammento) alla sorgente di luce.
varying vec2 v_texcoord;                  // coordinate UV della texture usate per mappare una texture 2D sulla superficie di un oggetto 3D
varying vec4 v_color;                     // vettore con le componenti colore del vertice
varying vec4 v_projectedTexcoord;         // coordinate proiettate della texture, tilizzata per determinare se un frammento è in ombra o meno
varying mat3 v_tbn;                       // contiene i vettori Tangente (T), Bitangente (B) e Normale (N) ( per trasformare le normali dalla space tangente allo spazio mondo o allo spazio della vista ??)

void main() {
  vec4 worldPosition = u_world * a_position;                        // Posizione del vertice nel mondo (la posizione del vertice a_position viene trasformata dalla matrice u_worl)
  gl_Position = u_projection * u_view * worldPosition;              // Posizione del vertice a schermo (la posizione del vertice nel mondo worldPosition viene trasformata da u_view e u_projection)
  
  v_surfaceToView = u_viewPosition - worldPosition.xyz;
  v_surfaceToLight = u_lightPosition - worldPosition.xyz;
  v_projectedTexcoord = u_textureMatrix * worldPosition;

  v_normal = normalize(mat3(u_world) * a_normal);                 // Orienta le normali, usiamo mat3(u_world) perchè la normale è una direzione, quindi non ci interessano le traslazioni 
  v_texcoord = a_texcoord;
  v_color = a_color;

  if (useNormalMap == 1.0) {
    vec3 tangent = normalize(mat3(u_world) * a_tangent);         // trasformo e normalizzo la tangente del vertice nel mondo
    vec3 bitangent = cross(v_normal, tangent);                 // calcolo la bitangente come prodotto vettoriale della normale e della tangente (già nello spazio del mondo)
    v_tbn = mat3(tangent, bitangent, v_normal);                  // matrice trasformazione TBN 
  }
}
`;

export const fs = `
precision highp float;

// variabili che contengono i dati interpolati dal vertex shader.
varying vec3 v_normal;
varying vec3 v_surfaceToView;
varying vec3 v_surfaceToLight;
varying vec2 v_texcoord;
varying vec4 v_color;
varying vec4 v_projectedTexcoord;
varying mat3 v_tbn;

//costanti durante il rendering di un intero oggetto (proprietà di materiali, proprietà della luce, texture e flag)
uniform vec3 diffuse;                         // vettore con le componenti colore diffuso del materiale
uniform sampler2D diffuseMap;                 // texture da applicare alla superficie dell'oggetto
uniform vec3 specular;                        // vettore con le componenti colore speculare del materiale
uniform sampler2D specularMap;                // texture utilizzata per definire come la luce speculare è distribuita sulla superficie
uniform float shininess;                      // controlla la dimensione e l'intensità del riflesso speculare (> shininess ->riflesso speculare più piccolo e concentrato, < shininess-> produce un riflesso più ampio e sfumato)
uniform float opacity;                        // controlla la trasparenza del materiale
uniform vec3 u_lightDirection;                // rappresenta la direzione della luce incidente sulla superficie
uniform vec3 u_ambientLight;                  // componente di luce ambientale
uniform sampler2D u_projectedTexture;         // texture usata per shadow map, contiene le informazioni di profondità dalla prospettiva della luce
uniform sampler2D normalMap;                  // texture con informazioni sulle normali da applicare alla superficie
uniform float u_bias;                         //offset per evitare che una superficie ombreggi su se stessa a causa di errori di precisione numerica

uniform float useNormalMap;                   // Flag to determine if normal map should be used
uniform float useTextureMap;                  // Flag to determine if texture should be used
uniform float useIntensityLight;              // Intensity of light (alba giorno notte)

//calcola le ombre usando la tecnica del Shadow Mapping con o senza PCF in un campionamento 2n+1 x 2n+1
float calculateShadow(vec4 shadowCoord) {
  vec3 projectedCoord = shadowCoord.xyz / shadowCoord.w;                    // coordinate normalizzate
  float currentDepth = projectedCoord.z + u_bias;                           // aggiunta del bias per evitare shadow acne
  float shadow = 0.0;
  int usePCF = 1;                                                           // flag per PCF

  if (usePCF == 1) {                                                        // Percentage Closer Filtering (PCF)
    float texelSize = 1.0 / 2048.0;                                         // dimensione di un texel nella shadow map di dimensioni 2048
    const int n = 2;
    for (int x = -n; x <= n; x++) {
      for (int y = -n; y <= n; y++) {
        vec2 newprojectedCoord = projectedCoord.xy + vec2(x, y) * texelSize;
        bool inRange = newprojectedCoord.x >= 0.0 && newprojectedCoord.x <= 1.0 && 
                       newprojectedCoord.y >= 0.0 && newprojectedCoord.y <= 1.0;
        float projectedDepth = texture2D(u_projectedTexture, projectedCoord.xy + vec2(x, y) * texelSize).r;  // campionamento della shadow map
        shadow += (projectedDepth <= currentDepth) ? 0.6 : 0.8;  // applica il peso in base alla profondità
      }
    }
    shadow /= float((2 * n + 1)^2);                                                 // calcolo della media dei campioni
  } else {                                                                  // ombre senza PCF
    bool inRange = projectedCoord.x >= 0.0 && projectedCoord.x <= 1.0 &&    // verifica che le coordinate siano valide
                   projectedCoord.y >= 0.0 && projectedCoord.y <= 1.0;
    float projectedDepth = texture2D(u_projectedTexture, projectedCoord.xy).r; // singolo campione dalla shadow map
    shadow = (inRange && projectedDepth <= currentDepth) ? 0.6 : 0.8;       // applica il peso in base alla profondità
  }
  return shadow;
}


void main () {

  vec3 normal = normalize(v_normal);                                                  // Normalize interpolated normal
  
  //CALCOLO NORMAL MAP
  if (useNormalMap == 1.0) {
    normal = texture2D(normalMap, v_texcoord).rgb * 2.0 - 1.0;                        // recupero il colore della normal map e lo mappo tra [-1,1]
    normal = normalize(v_tbn * normal);                                               // trasformo la normale ottenuta nello spazio mondo e la normalizzo
  }

  //CALCOLO OPACITA
  float effectiveOpacity = opacity * v_color.a;

  vec3 surfaceToLightDirection = u_lightDirection-normalize(v_surfaceToLight);        //direzione che rappresenta l'angolo tra la luce e la superficie
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);                           //vettore dalla superficie (pixel) alla posizione della fotocamera

  //CALCOLO LUCI 
  vec3 ambientColor = diffuse * v_color.rgb;
  
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
  float shadowLight = calculateShadow(v_projectedTexcoord);

  //CALCOLO COLORE con lluminazione di Phong (Blinn-Phong)
  vec3 gCol = v_color.rgb * u_ambientLight +                                          // Luce d'ambiente I=KI
    diffuseColor * useIntensityLight * diffuseLight +                                 // Luce diffusa I=KI(LN)
    specularColor* useIntensityLight * specularLight;                                 // Luce speculare I=KI*(RV)^n

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
