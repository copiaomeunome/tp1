import {configuraTudo, desenhaCubos,  atualizaVertices} from "./scripts/draw.js"
import {atualizaCena} from "./scripts/scene.js"

const inputv = document.getElementById("vert");
let valor = Number(inputv.value);

const inputs = document.getElementById("scale");
let scale = Number(inputs.value);

const gl = await configuraTudo("canvas", valor, scale);
async function loopPrincipal(){
    valor = Number(inputv.value);
    scale = Number(inputs.value);
    atualizaVertices(gl, valor, scale);
    if(valor>1) desenhaLinhas(gl, valor);
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);