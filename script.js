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
const bushTexture=await carregarTextura(gl.gl,"./assets/truth, projectiles and effects/arbusto.png");
const bushes=[
    {x:0.12,y:0.28,quadro:1},{x:0.3,y:0.78,quadro:1},{x:0.7,y:0.18,quadro:1},
    {x:0.86,y:0.63,quadro:1},{x:0.53,y:0.88,quadro:1},
    {x:0.08,y:0.72,quadro:1},{x:0.37,y:0.16,quadro:1},{x:0.8,y:0.88,quadro:1}
];
const scene = new Scene;
const towerTexture=await carregarTextura(gl.gl,"./assets/towers/tower.png");
const canvas=document.getElementById("canvas");     //puta que pariu tem mt config, tenho que colocar isso depois em outro import, penso em um json
let grassTiles=[],grassWidth=0,grassHeight=0;
function get_grass(){
    if(grassWidth===canvas.width && grassHeight===canvas.height)return grassTiles;
    grassWidth=canvas.width;
    grassHeight=canvas.height;
    grassTiles=[];
    for(let y=0;y<canvas.height;y+=112){
        for(let x=0;x<canvas.width;x+=112){
            const seed=(Math.imul(x/112+1,73856093)^Math.imul(y/112+1,19349663))>>>0;
            grassTiles.push({pos:{x,y},quadro:2+seed%3,texture:bushTexture,totalQuadros:5});
        }
    }
    return grassTiles;
}
const textCanvas=document.getElementById("text-overlay");
const textContext=textCanvas.getContext("2d");
const healthBarImage=new Image();
healthBarImage.src="./assets/truth, projectiles and effects/health_bar.png";
await healthBarImage.decode();
const cooldownBarImage=new Image();
cooldownBarImage.src="./assets/truth, projectiles and effects/cooldown_bar.png";
await cooldownBarImage.decode();
function draw_build_cooldown(){
    const x=16,y=Math.max(0,canvas.height-80);
    const progress=Math.max(0,Math.min(1,1-scene.buildCooldown/20));
    textContext.drawImage(cooldownBarImage,0,16,112,49,x,y,112,49);
    if(progress>0)textContext.drawImage(cooldownBarImage,117,37,102*progress,23,x+5,y+21,102*progress,23);
    textContext.fillText(scene.buildCooldown>0?`${Math.ceil(scene.buildCooldown)}s`:"Pronto",x+56,y+58);
}
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
    for(const drop of state.drops){
        textContext.save();
        textContext.translate(drop.center.x,canvas.height-drop.center.y);
        textContext.rotate(drop.angle);
        if(drop.type==="ice")textContext.drawImage(healthBarImage,336,17,103,73,-20,-14,40,28);
        else textContext.drawImage(healthBarImage,244,1,67,78,-16,-18,32,36);
        textContext.restore();
    }
    for(const entity of [state.main_tower,...state.towers,...state.enemies]){
        if(!Number.isFinite(entity.health) || entity.health<=0)continue;
        const boss=entity.type==="envy";
        if(!boss && (entity.pos.x+entity.size.x<=0 || entity.pos.x>=canvas.width || entity.pos.y+entity.size.y<=0 || entity.pos.y>=canvas.height))continue;
        const burning=entity.burnTime>0;
        const slowed=entity.slowTime>0;
        const scaleY=boss?1:0.5;
        const iconWidth=((burning?28:0)+(slowed?36:0))*scaleY;
        const width=boss?Math.max(1,Math.min(336,canvas.width-iconWidth-16)):56;
        const scaleX=width/112;
        const barWidth=width+iconWidth;
        const x=Math.round(Math.max(0,Math.min(canvas.width-barWidth,boss?(canvas.width-width)/2:entity.pos.x+entity.size.x/2-width/2)));
        const y=boss?24:Math.round(Math.max(0,Math.min(canvas.height-41,canvas.height-entity.pos.y+4)));
        const ratio=Math.max(0,Math.min(1,entity.health/entity.maxHealth));
        // Crop the heart, empty bar and fill from their original pixel bounds.
        textContext.drawImage(healthBarImage,0,15,112,50,x,y,width,50*scaleY);
        if(ratio>0)textContext.drawImage(healthBarImage,117,37,102*ratio,23,x+5*scaleX,y+22*scaleY,102*ratio*scaleX,23*scaleY);
        if(burning)textContext.drawImage(healthBarImage,244,1,67,78,x+width+4*scaleY,y+19*scaleY,24*scaleY,28*scaleY);
        if(slowed)textContext.drawImage(healthBarImage,336,17,103,73,x+width+(4+(burning?28:0))*scaleY,y+22*scaleY,32*scaleY,23*scaleY);
        textContext.fillText(String(entity.health),x+width/2,y+50*scaleY+9);
        if(boss)textContext.fillText("Envy",x+width/2,12);
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
    const type={e:"basic","1":"fire","2":"ice"}[event.key.toLowerCase()];
    if(!type || event.repeat || (type!=="basic" && !mouse.inside))return;
    const x=mouse.inside?Math.max(0,Math.min(canvas.width-112,mouse.x-56)):0;
    const y=mouse.inside?Math.max(0,Math.min(canvas.height-112,mouse.y-56)):0;
    scene.start_cast({x,y},type);
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
        ...get_grass(),
        ...Array.from({length:9},(_,i)=>({
            pos:{x:state.main_tower.pos.x+(i%3-1)*112,y:state.main_tower.pos.y+(Math.floor(i/3)-1)*112},
            quadro:5,texture:bushTexture,totalQuadros:5
        })),
        ...bushes.map(bush=>({
            pos:{x:bush.x*Math.max(0,canvas.width-112),y:bush.y*Math.max(0,canvas.height-112)},
            quadro:bush.quadro,texture:bushTexture,totalQuadros:5
        })),
        {...state.main_tower,texture:texturaShaoMay,totalQuadros:4},
        {...state.protagonista,texture:texturaAlphonse,totalQuadros:25},
        ...state.enemies.filter(enemy=>enemy.health>0 || enemy.frames.death!==null).map(enemy=>({...enemy,texture:enemyTextures[enemy.type],totalQuadros:enemy.totalQuadros})),
        ...state.summonEffects.map(effect=>({...effect,texture:towerTexture,totalQuadros:10})),
        ...state.towers.flatMap(tower=>{                // desenhando as armas junto
            const sprite={...tower,texture:towerTexture,totalQuadros:10,scale:Math.min(1,tower.spawnTime/0.25)};
            const weaponFrame=tower.type==="ice"?(tower.facing==="left"?9:10):(tower.type==="fire"?7:5)+(tower.facing==="left"?1:0);
            return [sprite,{...sprite,quadro:weaponFrame}];
        }),
        ...state.projectiles.map(projectile=>({...projectile,texture:effectsTexture,totalQuadros:8})),
        ...state.attackEffects.map(effect=>({...effect,texture:attackTexture,totalQuadros:4})),
        ...state.enemies.filter(enemy=>enemy.health>0 && enemy.burnTime>0).map(enemy=>({
            pos:enemy.pos,quadro:6+Math.floor(enemy.burnAnimationTime/0.5)%3,
            texture:effectsTexture,totalQuadros:8
        })),
    ]);
    draw_health(state);
    draw_build_cooldown();
    if(scene.gameOver || scene.victory){
        gameOverScreen.querySelector("h1").textContent=scene.victory?"Vitória!":"Game Over";
        gameOverScreen.querySelector("p").textContent=scene.victory?"Você completou as duas fases.":"Shao May foi destruída.";
        gameOverScreen.hidden=false;
    }
    requestAnimationFrame(loopPrincipal);
}
requestAnimationFrame(loopPrincipal);
