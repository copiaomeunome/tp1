import {configuraTudo, desenhaCubos,  atualizaVertices} from "./scripts/draw.js"
import {Scene, Enemie, Boss} from "./scripts/scene.js"

const gl = await configuraTudo("canvas", valor, scale);
const textura1 = await carregarTextura(gl, "./imagens/alphonse.png");
let scene = new Scene;
let enemies = [
    new Enemie({x:0,y:0},{x:0,y:0},{x:30,y:30}), // (pos, velocity, size)
    new Enemie({x:20,y:0},{x:0,y:0},{x:30,y:30}),
    new Enemie({x:40,y:0},{x:0,y:0},{x:30,y:30}),
    new Enemie({x:60,y:0},{x:0,y:0},{x:30,y:30}),
    new Enemie({x:80,y:0},{x:0,y:0},{x:30,y:30}),
    new Enemie({x:100,y:0},{x:0,y:0},{x:30,y:30})
];
scene.enemies = enemies;
while(dialog.still_dialog){

let dialog = scene.dialog();
}

async function loopPrincipal(dt){
    scene.update(dt, gl.width, gl.height);
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);