import {configuraTudo, desenhaCena, carregarTextura} from "./scripts/draw.js"
import {Scene} from "./scripts/scene.js"

const gl = await configuraTudo(); //"canvas", valor, scale
const texturaAlphonse = await carregarTextura(gl.gl, "./assets/alphonse/alphonse.png"); //carregamento das textures
const texturaShaoMay = await carregarTextura(gl.gl, "./assets/towers/shao may.png");
const envyTexture = await carregarTextura(gl.gl,"./assets/enemies/envy.png");
const soldierTexture=await carregarTextura(gl.gl,"./assets/enemies/immortal_soldier.png");
const enemyTextures={envy:envyTexture,immortal_soldier:soldierTexture};
const effectsTexture=await carregarTextura(gl.gl,"./assets/truth, projectiles and effects/projectiles and effects.png");
const attackTexture=await carregarTextura(gl.gl,"./assets/truth, projectiles and effects/attack.png");
let scene = new Scene;
const towerTexture=await carregarTextura(gl.gl,"./assets/towers/tower.png");
const canvas=document.getElementById("canvas");     //puta que pariu tem mt config, tenho que colocar isso depois em outro import, penso em um json
const textCanvas=document.getElementById("text-overlay");
const textContext=textCanvas.getContext("2d");
const healthBarImage=new Image();
healthBarImage.src="./assets/truth, projectiles and effects/health_bar.png";
await healthBarImage.decode();
function draw_health(state){
    if(textCanvas.width!==canvas.width || textCanvas.height!==canvas.height){
        textCanvas.width=canvas.width;
        textCanvas.height=canvas.height;
    }
    textContext.clearRect(0,0,textCanvas.width,textCanvas.height);
    textContext.imageSmoothingEnabled=false;
    textContext.font="bold 12px monospace";
    textContext.fillStyle="black";
    textContext.textAlign="center";
    textContext.textBaseline="middle";
    for(const entity of [state.main_tower,...state.towers,...state.enemies,state.protagonista]){
        if(!Number.isFinite(entity.health) || entity.health<=0)continue;
        if(entity.pos.x+entity.size.x<=0 || entity.pos.x>=canvas.width || entity.pos.y+entity.size.y<=0 || entity.pos.y>=canvas.height)continue;
        const burning=entity.burnTime>0;
        const x=Math.round(Math.max(0,Math.min(canvas.width-(burning?140:112),entity.pos.x+entity.size.x/2-56)));
        const y=Math.round(Math.max(0,Math.min(canvas.height-56,canvas.height-entity.pos.y+4)));
        const ratio=Math.max(0,Math.min(1,entity.health/entity.maxHealth));
        // Crop the heart, empty bar and fill from their original pixel bounds.
        textContext.drawImage(healthBarImage,0,25,112,40,x,y,112,40);
        if(ratio>0)textContext.drawImage(healthBarImage,117,37,102*ratio,23,x+5,y+12,102*ratio,23);
        if(burning)textContext.drawImage(healthBarImage,244,1,67,78,x+116,y+9,24,28);
        textContext.fillText(String(entity.health),x+56,y+49);
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
const restartButton=document.getElementById("restart-button");
restartButton.addEventListener("click",()=>{
    if(!scene.gameOver && !scene.victory)return;
    scene.restart_game();
    gameOverScreen.hidden=true;
    startScreen.hidden=true;
    tips.hidden=true;
    tipsButton.setAttribute("aria-expanded","false");
    mouse.x=0;
    mouse.y=0;
    mouse.inside=false;
    dtAntigo=undefined;
    textContext.clearRect(0,0,textCanvas.width,textCanvas.height);
    restartButton.blur();
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
        ...state.enemies.filter(enemy=>enemy.health>0 || enemy.frames.death!==null).map(enemy=>({...enemy,texture:enemyTextures[enemy.type],totalQuadros:enemy.totalQuadros})),
        ...state.summonEffects.map(effect=>({...effect,texture:towerTexture,totalQuadros:7})),
        ...state.towers.flatMap(tower=>{                // desenhando as armas junto
            const sprite={...tower,texture:towerTexture,totalQuadros:7,scale:Math.min(1,tower.spawnTime/0.25)};
            const weaponFrame=(tower.level===2?6:4)+(tower.facing==="left"?1:0);
            return [sprite,{...sprite,quadro:weaponFrame}];
        }),
        ...state.projectiles.map(projectile=>({...projectile,texture:effectsTexture,totalQuadros:6})),
        ...state.attackEffects.map(effect=>({...effect,texture:attackTexture,totalQuadros:4})),
        ...state.enemies.filter(enemy=>enemy.health>0 && enemy.burnTime>0).map(enemy=>({
            pos:enemy.pos,quadro:4+Math.floor(enemy.burnAnimationTime/0.5)%3,
            texture:effectsTexture,totalQuadros:6
        })),
    ]);
    draw_health(state);
    if(scene.gameOver || scene.victory){
        gameOverScreen.querySelector("h1").textContent=scene.victory?"Vitória!":"Game Over";
        gameOverScreen.querySelector("p").textContent=scene.victory?"Você completou as duas fases.":"Shao May foi destruída.";
        gameOverScreen.hidden=false;
    }
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);
