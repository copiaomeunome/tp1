import {configuraTudo, desenhaCena, carregarTextura} from "./scripts/draw.js"
import {Scene, Enemy} from "./scripts/scene.js"

const gl = await configuraTudo(); //"canvas", valor, scale
const texturaAlphonse = await carregarTextura(gl.gl, "./assets/alphonse/alphonse.png");
const texturaShaoMay = await carregarTextura(gl.gl, "./assets/towers/shao may.png");
const envyTexture = await carregarTextura(gl.gl,"./assets/envy/envy.png");
let scene = new Scene;
let enemies = [
    new Enemie({x:0,y:0},{x:0,y:0},{x:112,y:112}), // (pos, velocity, size)
    new Enemie({x:20,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemie({x:40,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemie({x:60,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemie({x:80,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemie({x:100,y:0},{x:0,y:0},{x:112,y:112})
];
scene.enemies = enemies;
// while(dialog.still_dialog){

// let dialog = scene.dialog();
// }
let dtAntigo;

function loopPrincipal(time) {
    const dt = dtAntigo===undefined?0:Math.min((time - dtAntigo) / 1000, 0.05);

    dtAntigo = time;

    const state = scene.update(dt, gl.width, gl.height);
    desenhaCena(gl,[
        {...state.main_tower,texture:texturaShaoMay,totalQuadros:4},
        {...state.protagonista,texture:texturaAlphonse,totalQuadros:25},
        ...state.enemies.map(enemy=>({...enemy,texture:envyTexture,totalQuadros:21}))
    ]);
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);