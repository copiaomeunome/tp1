

export function createShader(gl, type, source){
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}
// ----------------------
// ------- CONFIG -------
// ----------------------
const canvas = document.getElementById('canvas');
export async function configuraTudo(){                                               // instanciando canvas e webGL
    const projection = ortho(0,canvas.width,0,canvas.height,-1,1);
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('WebGL2 não está disponível');
        throw new Error('WebGL2 não suportado');
    }
    const vertexShaderCode = await (await fetch("./shaders/vertexShader.glsl")).text();             // dá fetch no código dos shaders
    const fragmentShaderCode = await (await fetch("./shaders/fragmentShader.glsl")).text();

    const program = gl.createProgram();                                                             // compilando e linkando programa
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderCode));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode));
    gl.linkProgram(program);
    gl.useProgram(program);
    // const vertices = new Float32Array([                                                          // define os vértices de um quadrilátero
    //     20,  80,    // topo
    //     20, 20,     // baixo esquerda
    //     500, 20,    // baixo direita
    //     500, 80     // cima direita
    // ]);
    // let vetor = [];                                                                              // define um vetor de quadrados com a posição mockada
    // let larguraQuadrado = canvas.width/3.0;
    // let alturaQuadrado = canvas.height/3.0;
    // for(let i=0;i<3;i++){
    //     for(let j=0;j<3;j++){
    //         vetor.push(i*larguraQuadrado);  //baixo esquerda
    //         vetor.push(j*alturaQuadrado);
    //         vetor.push((i+1)*larguraQuadrado);  //baixo direita
    //         vetor.push(j*alturaQuadrado);
    //         vetor.push((i+1)*larguraQuadrado);  //cima direita
    //         vetor.push((j+1)*alturaQuadrado);
    //         vetor.push(i*larguraQuadrado);  //cima esquerda
    //         vetor.push((j+1)*alturaQuadrado);
    //     }
    // }
    // const vertices = new Float32Array(vetor);
    const menorDim = Math.min(canvas.width, canvas.height);                                          // define o quadrado do centro e as posições centrais
    const lQuadrado = menorDim/3;

    const vertices = new Float32Array([
        lQuadrado,  lQuadrado,
        lQuadrado, 0,
        0,  lQuadrado,
        0, 0,
    ]);
    

    const vao = gl.createVertexArray();                                                             // cria e binda o VAO (pedaço de código responsável pelo VBO)
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();                                                                  // cria o VBO como ESTÁTICO e binda os vértices nele (joga na GPU)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'position');                    // pega o atributo 'position' dentro do GLSL do vertexShader e seta ele como (posição, tamanho, float, normalizado?, stride (se tem intervalo entre o fim de um vértice e o início do próximo), offset)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);                                                              // fundo branco

    const texCoords = new Float32Array([
        1, 0,
        1, 1,
        0, 0,
        0, 1
    ]);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,texCoords,gl.STATIC_DRAW);
    const texCoordLocation =gl.getAttribLocation(program, "a_texcoord");

    gl.vertexAttribPointer(texCoordLocation,2,gl.FLOAT,false,0,0);

    gl.enableVertexAttribArray(texCoordLocation);

    const projectionLocation = gl.getUniformLocation(program, "projection");                        // projeção ortogonal das posições
    gl.uniformMatrix4fv(projectionLocation,false,projection);

    const modelLocation = gl.getUniformLocation(program, "model");                                  // translação e rotação das posições

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);

    return {gl,modelLocation, vboColor};
}

export function desenhaCena({gl,modelLocation, vboColor}, squares_vector) {
    const menorDim = Math.min(canvas.width, canvas.height);                                          // define o quadrado do centro e as posições centrais
    const lQuadrado = menorDim/3;
    for(let square of squares_vector){
        const color = square.texture;
        gl.bindbuffer(gl.ARRAY_BUFFER,vboColor)
        gl.bufferData(gl.ARRAY_BUFFER,color,gl.STATIC_DRAW);
        const tx = quadrado.tx;
        const ty = square.ty;
        const model = new Float32Array([
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, 0,  1
        ]);
        gl.uniformMatrix4fv(modelLocation,false,model);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
}
function ortho(left, right, bottom, top, near, far) {                                               // função de projeção ortográfica, transforma o sistema de coordenadas de [-1,1] [-1,1] nos valores passados
  const tx = -(right+left)/(right-left)
  const ty = -(top+bottom)/(top-bottom)
  const tz = -(far+near)/(far-near)

  return new Float32Array([ // column-major
    2/(right-left), 0, 0, 0,
    0, 2/(top-bottom), 0, 0,
    0, 0, -2/(far-near),  0,
    tx, ty, tz,           1
  ])
}