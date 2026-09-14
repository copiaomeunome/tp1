import {configuraTudo, desenhaCena, carregarTextura} from "./scripts/draw.js"
import {Scene, Enemy} from "./scripts/scene.js"

const gl = await configuraTudo(); //"canvas", valor, scale
const texturaAlphonse = await carregarTextura(gl.gl, "./assets/alphonse/alphonse.png"); //carregamento das textures
const texturaShaoMay = await carregarTextura(gl.gl, "./assets/towers/shao may.png");
const envyTexture = await carregarTextura(gl.gl,"./assets/envy/envy.png");
const effectsTexture=await carregarTextura(gl.gl,"./assets/truth, projectiles and effects/projectiles and effects.png");
let scene = new Scene;
const towerTexture=await carregarTextura(gl.gl,"./assets/towers/tower.png");
const canvas=document.getElementById("canvas");     //puta que pariu tem mt config, tenho que colocar isso depois em outro import, penso em um json
const textCanvas=document.getElementById("text-overlay");
const textContext=textCanvas.getContext("2d");
function draw_health(state){
    if(textCanvas.width!==canvas.width || textCanvas.height!==canvas.height){
        textCanvas.width=canvas.width;
        textCanvas.height=canvas.height;
    }
    textContext.clearRect(0,0,textCanvas.width,textCanvas.height);
    textContext.font="bold 16px monospace";
    textContext.fillStyle="black";
    textContext.textAlign="center";
    textContext.textBaseline="top";
    for(const tower of [state.main_tower,...state.towers]){
        const x=tower.pos.x+tower.size.x/2;
        const y=Math.min(textCanvas.height-20,textCanvas.height-tower.pos.y+4);
        textContext.fillText(String(tower.health),x,y);
    }
}
canvas.addEventListener("click",event=>{
    if(event.button!==0)return;
    const rect=canvas.getBoundingClientRect();
    scene.shoot({
        x:(event.clientX-rect.left)*canvas.width/rect.width,
        y:canvas.height-(event.clientY-rect.top)*canvas.height/rect.height
    });
});
const mouse={x:0,y:0,inside:false};
document.addEventListener("mousemove",event=>{
    const rect=canvas.getBoundingClientRect();
    mouse.inside=event.clientX>=rect.left && event.clientX<rect.right && event.clientY>=rect.top && event.clientY<rect.bottom;
    mouse.x=(event.clientX-rect.left)*canvas.width/rect.width;
    mouse.y=canvas.height-(event.clientY-rect.top)*canvas.height/rect.height;
});
document.documentElement.addEventListener("mouseleave",()=>mouse.inside=false);
window.addEventListener("blur",()=>mouse.inside=false);
document.addEventListener("keydown",event=>{
    if(event.key.toLowerCase()!=="e" || event.repeat)return;
    const x=mouse.inside?Math.max(0,Math.min(canvas.width-112,mouse.x-56)):0;
    const y=mouse.inside?Math.max(0,Math.min(canvas.height-112,mouse.y-56)):0;
    scene.start_cast({x,y});
});
let enemies = [
    new Enemy({x:0,y:0},{x:0,y:0},{x:112,y:112}), // (pos, velocity, size)
    new Enemy({x:20,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemy({x:40,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemy({x:60,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemy({x:80,y:0},{x:0,y:0},{x:112,y:112}),
    new Enemy({x:100,y:0},{x:0,y:0},{x:112,y:112})
];
scene.enemies = enemies;
// while(dialog.still_dialog){

// let dialog = scene.dialog();
// }
let dtAntigo;

const startScreen=document.getElementById("start-screen");
const gameOverScreen=document.getElementById("game-over-screen");
const startButton=document.getElementById("start-button");
const tipsButton=document.getElementById("tips-button");
const tips=document.getElementById("tips");
startButton.disabled=false;
startButton.addEventListener("click",()=>{
    if(scene.running || scene.gameOver)return;
    scene.start_game();
    startScreen.hidden=true;
    dtAntigo=undefined;
    startButton.blur();
});
tipsButton.addEventListener("click",()=>{
    tips.hidden=!tips.hidden;
    tipsButton.setAttribute("aria-expanded",String(!tips.hidden));
});

function loopPrincipal(time) {
    if(!scene.running){
        dtAntigo=undefined;
        requestAnimationFrame(loopPrincipal);
        return;
    }
    const dt = dtAntigo===undefined?0:Math.min((time - dtAntigo) / 1000, 0.05);

    dtAntigo = time;

    const state=scene.update(dt,canvas.width,canvas.height);
    desenhaCena(gl,[
        {...state.main_tower,texture:texturaShaoMay,totalQuadros:4},
        {...state.protagonista,texture:texturaAlphonse,totalQuadros:25},
        ...state.enemies.map(enemy=>({...enemy,texture:envyTexture,totalQuadros:21})),
        ...state.summonEffects.map(effect=>({...effect,texture:towerTexture,totalQuadros:7})),
        ...state.towers.flatMap(tower=>{                // desenhando as armas junto
            const sprite={...tower,texture:towerTexture,totalQuadros:7,scale:Math.min(1,tower.spawnTime/0.25)};
            const weaponFrame=(tower.level===2?6:4)+(tower.facing==="left"?1:0);
            return [sprite,{...sprite,quadro:weaponFrame}];
        }),
        ...state.projectiles.map(projectile=>({...projectile,texture:effectsTexture,totalQuadros:6})),
        ...state.enemies.filter(enemy=>enemy.health>0 && enemy.burnTime>0).map(enemy=>({
            pos:enemy.pos,quadro:4+Math.floor(enemy.burnAnimationTime/0.5)%3,
            texture:effectsTexture,totalQuadros:6
        })),
    ]);
    draw_health(state);
    if(scene.gameOver)gameOverScreen.hidden=false;
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);