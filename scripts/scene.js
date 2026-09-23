class Protagonista{
    constructor(){
        this.animacao = 1;
        this.size = {x:112, y:112};
        this.tempoAnimacao = 0;
        this.quadro = 1;
        this.pos = {x:10,y:10}; // posição inicial
        this.velocity={x:120,y:120}; // velocidade
        this.isMoving = {up:false, down:false, left:false, right:false} // está se movendo?
        this.radius = 20; // Circular hitbox radius.
        this.fireShot=false;
        this.iceCollected=false;
        this.center = {x:this.pos.x+(this.size.x/2), y:this.pos.y+(this.size.y/2)};
        
    }
}
// bloco de ataque e sprite atual do ataque
const enemyTypes={
    envy:{totalQuadros:25,idle:1,idleCount:1,left:10,right:6,up:14,down:2,death:18,attackCount:1,attack:{down:1,right:1,left:1,up:1}},
    immortal_soldier:{totalQuadros:32,idle:1,idleCount:4,left:9,right:5,up:13,down:17,death:null,attack:{down:21,right:29,left:25,up:21}}
};
const stages=[
    {count:20,spawnInterval:5,enemyHealth:10,boss:"envy",bossHealth:20},
    {count:20,spawnInterval:5,enemyHealth:10,boss:"envy",bossHealth:20}
];
export class Enemy{
    constructor(pos,velocity,size,type="immortal_soldier"){
        this.type=type;
        this.frames=enemyTypes[type];
        this.totalQuadros=this.frames.totalQuadros;
        this.attackTime=0;
        this.attackTarget=null;
        this.isAttacking=false;
        this.facing="down";
        this.animationStart = 1;
        this.animationTime = 0;
        this.quadro = 1;    // começa no 1, por isso que tava bugando
        this.pos=pos;
        this.velocity=velocity;
        this.size = size;
        this.radius = 20;
        this.center = {x:this.pos.x+(this.size.x/2), y:this.pos.y+(this.size.y/2)};
        this.speed = 40;  //px/s
        this.health=type==="envy"?20:10;
        this.maxHealth=this.health;
        this.damage=type==="envy"?2:1;
        this.burnTime=0;
        this.slowTime=0;
        this.burnAnimationTime=0;
        this.deathTime=0;
        this.burnDamageTime=0;
    }
    take_damage(amount){
        if(this.health<=0)return;
        this.health=Math.max(0,this.health-amount);
        if(this.health===0){
            this.velocity.x=0;
            this.velocity.y=0;
            this.quadro=this.frames.death??this.frames.idle;
            this.deathTime=0;
            this.burnTime=0;
            this.slowTime=0;
            this.isAttacking=false;
            this.attackTarget=null;
            this.attackTime=0;
        }
    }
    update_position(dt){
        
        this.pos.x += this.velocity.x*dt;
        this.pos.y += this.velocity.y*dt;
    }

    update_velocity(target, dt){
        const dx = target.center.x-this.center.x;
        const dy = target.center.y-this.center.y;
        const distance = Math.hypot(dx, dy);
        const gap = distance-(this.radius+target.radius);   //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

        if (gap<=0 || dt<=0){
            this.velocity.x=0;
            this.velocity.y=0;
            return;
        }
        // stop when hit the target without overshooting
        const speed=Math.min(this.speed*(this.slowTime>0?0.5:1),gap/dt);

        this.velocity.x = (dx/distance)*speed;
        this.velocity.y= (dy/distance)*speed;
    }
    update_facing(x,y){
        if(x===0 && y===0)return;
        this.facing=Math.abs(x)>Math.abs(y)?(x>0?"right":"left"):(y>0?"up":"down"); // em caso de empate vou escolher o vertical, pq? pq sim
    }
    attack_effect(){
        const directions={right:{x:1,y:0},left:{x:-1,y:0},up:{x:0,y:1},down:{x:0,y:-1}};
        const direction=directions[this.facing];
        return {
            pos:{x:this.center.x+direction.x*40-56,y:this.center.y+direction.y*40-56},
            quadro:1+Math.floor(this.animationTime/0.25)%4,
            angle:Math.atan2(direction.y,direction.x)
        };
    }
    update_animation(dt) {
        if(this.health<=0)return;
        const {x,y} = this.velocity; //da uma olhada depois
        let start=this.frames.idle;

        if(this.isAttacking){
            start=this.frames.attack[this.facing];
        }else if(x!==0 || y!==0){
            this.update_facing(x,y);
            start=this.frames[this.facing];
        }
        if(start!==this.animationStart){
            this.animationStart = start;
            this.animationTime = 0;
        }
        this.animationTime=this.isAttacking?this.attackTime:this.animationTime+dt;
        const frameCount = this.isAttacking?(this.frames.attackCount??4):start===this.frames.idle?this.frames.idleCount:4;
        this.quadro = start+Math.floor(this.animationTime/0.25)%frameCount;
    }
}
// PQ NAO EXISTE NAMESPACE NESSA LINGUAGEEEEMMMM VO ME MATAR
function update_center(entity) {
    entity.center.x = entity.pos.x + entity.size.x / 2;
    entity.center.y = entity.pos.y + entity.size.y / 2;
}
function collision(a, b) {
    const dx = a.center.x - b.center.x;
    const dy = a.center.y - b.center.y;
    const sumRadii = a.radius + b.radius;
    // Circles collide when the distance between their centers is at most the sum of their radii.
    return dx ** 2 + dy ** 2 <= sumRadii ** 2;
}
function projectile_hit(start,end,enemy,radius){
    const dx=end.x-start.x,dy=end.y-start.y;
    const ox=start.x-enemy.center.x,oy=start.y-enemy.center.y;
    const sum=radius+enemy.radius;
    const c=ox*ox+oy*oy-sum*sum;
    if(c<=0)return 0;
    const a=dx*dx+dy*dy;
    if(a===0)return Infinity;
    const b=2*(ox*dx+oy*dy);
    const discriminant=b*b-4*a*c;
    if(discriminant<0)return Infinity;
    const t=(-b-Math.sqrt(discriminant))/(2*a);
    return t>=0 && t<=1?t:Infinity;
}

let protagonista = new Protagonista;
export class Scene{
    constructor(){
        this.running=false;
        this.gameOver=false;
        this.victory=false;
        this.stageIndex=0;
        this.wave="swarm";
        this.waveTime=0;
        this.spawnTimes=[];
        this.spawnIndex=0;
        this.buildCooldown=0;
        this.playerShotCooldown=0;
        this.enemies = [];
        this.drops=[];
        this.towers = [];
        this.main_tower = {
            health:10,
            maxHealth:10,
            pos: {x:0,y:0},
            size: {x:112,y:112},
            center: {x:56,y:56},
            radius: 20,
            tempoAnimacao: 0,
            quadro: 1
        };
        this.cast=null;
        this.projectiles=[];
    }
    start_stage(index){
        this.stageIndex=index;
        this.wave="swarm";
        this.waveTime=0;
        this.spawnIndex=0;
        const stage=stages[index];
        this.spawnTimes=Array.from({length:stage.count},(_,i)=>i*stage.spawnInterval);
    }
    spawn_enemy(pos,type,health){
        const enemy=new Enemy(pos,{x:0,y:0},{x:112,y:112},type); // (pos, velocity, size)
        enemy.health=health;
        enemy.maxHealth=health;
        if(type==="envy")enemy.dropType=this.stageIndex===0?"fire":"ice";
        this.enemies.push(enemy);
    }
    update_spawns(dt,width,height){
        if(this.wave!=="swarm" && this.wave!=="endless")return;
        this.waveTime+=dt;
        const stage=stages[this.stageIndex];
        while(this.wave==="endless"?this.waveTime>=3:this.spawnIndex<this.spawnTimes.length && this.waveTime>=this.spawnTimes[this.spawnIndex]){
            const side=Math.floor(Math.random()*4);
            let pos;
            if(side===0)pos={x:-144,y:Math.random()*Math.max(0,height-112)};
            else if(side===1)pos={x:width+32,y:Math.random()*Math.max(0,height-112)};
            else if(side===2)pos={x:Math.random()*Math.max(0,width-112),y:-144};
            else pos={x:Math.random()*Math.max(0,width-112),y:height+32};
            this.spawn_enemy(pos,"immortal_soldier",stage.enemyHealth);
            if(this.wave==="endless")this.waveTime-=3;
            else this.spawnIndex++;
        }
    }
    update_stage_progress(width,height){
        if(!this.running || this.wave==="endless" || this.spawnIndex<this.spawnTimes.length || this.enemies.some(enemy=>enemy.health>0))return;
        if(this.wave==="swarm"){
            this.wave="boss";
            const stage=stages[this.stageIndex];
            for(let i=0;i<5;i++){
                this.spawn_enemy({x:width+32,y:(i+1)*Math.max(0,height-112)/6},"immortal_soldier",stage.enemyHealth);
            }
            this.spawn_enemy({x:width+256,y:Math.max(0,(height-112)/2)},stage.boss,stage.bossHealth);
        }else if(this.stageIndex+1<stages.length){
            this.start_stage(this.stageIndex+1);
        }else{
            this.wave="endless";
            this.waveTime=0;
        }
    }
    restart_game(){
        Object.assign(this,new Scene());
        protagonista=new Protagonista();
        this.start_game();
    }
    start_game(){
        if(this.running || this.gameOver || this.victory)return;
        for(const direction of Object.keys(protagonista.isMoving)){
            protagonista.isMoving[direction]=false;
        }
        this.running=true;
        this.start_stage(0);
    }
    start_cast(pos,type="basic"){        //castar alquimia nao pode se sobrepor
        if(!this.running || this.cast)return;
        if(!["basic","fire","ice"].includes(type))return;
        if(type==="fire" && !protagonista.fireShot)return;
        if(type==="ice" && !protagonista.iceCollected)return;
        const candidate={center:{x:pos.x+56,y:pos.y+56},radius:20};
        if(type==="basic" && [this.main_tower,...this.towers].some(tower=>Math.hypot(candidate.center.x-tower.center.x,candidate.center.y-tower.center.y)<112))return;
        
        if(collision(candidate,this.main_tower))return;
        const target=this.towers.find(tower=>collision(candidate,tower));
        if(type==="basic"?target:!target || target.level!==1)return;
        if(this.buildCooldown>0)return;
        this.cast={pos:{...(target?target.pos:pos)},time:0,target,type};
        protagonista.quadro=21;
    }
    spawn_projectile(origin,target,frame){
        const dx=target.x-origin.x,dy=target.y-origin.y;
        const distance=Math.hypot(dx,dy);
        if(distance===0)return;
        this.projectiles.push({
            angle:frame===1?0:Math.atan2(dy,dx),
            center:{...origin},pos:{x:origin.x-56,y:origin.y-56},
            velocity:{x:dx/distance*300,y:dy/distance*300},
            radius:6,quadro:frame,damage:1,burning:frame===2 || frame===4,slowing:frame===5
        });
    }
    shoot(target){
        if(!this.running || this.cast || this.playerShotCooldown>0)return;
        update_center(protagonista);
        if(target.x===protagonista.center.x && target.y===protagonista.center.y)return;
        this.spawn_projectile(protagonista.center,target,protagonista.fireShot?2:1);
        this.playerShotCooldown=0.3;
    }
    update_combat(dt,width,height){
        for(const tower of this.towers){
            tower.shotCooldown=Math.max(0,(tower.shotCooldown??0)-dt);
            if(tower.spawnTime<0.25)continue;
            let target=null,nearest=300;
            for(const enemy of this.enemies){
                if(enemy.health<=0)continue;
                const distance=Math.hypot(enemy.center.x-tower.center.x,enemy.center.y-tower.center.y);
                if(distance<=nearest){
                    nearest=distance;
                    target=enemy;
                }
            }
            if(!target)continue;
            tower.facing=target.center.x<tower.center.x?"left":"right";
            if(tower.shotCooldown===0){
                this.spawn_projectile(tower.center,target.center,tower.type==="ice"?5:tower.type==="fire"?4:3);
                tower.shotCooldown=1;
            }
        }
        this.projectiles=this.projectiles.filter(projectile=>{
            const end={
                x:projectile.center.x+projectile.velocity.x*dt,
                y:projectile.center.y+projectile.velocity.y*dt
            };
            let target=null,firstHit=Infinity;
            for(const enemy of this.enemies){
                if(enemy.health<=0)continue;
                const hit=projectile_hit(projectile.center,end,enemy,projectile.radius);
                if(hit<firstHit){
                    firstHit=hit;
                    target=enemy;
                }
            }
            if(target){
                target.take_damage(projectile.damage);
                if(projectile.slowing && target.health>0)target.slowTime=3;
                if(projectile.burning && target.health>0 && target.burnTime===0){
                    target.burnTime=Infinity;
                    target.burnAnimationTime=0;
                    target.burnDamageTime=0;
                }
                return false;
            }
            projectile.center=end;
            projectile.pos.x=end.x-56;
            projectile.pos.y=end.y-56;
            return end.x>=-56 && end.x<=width+56 && end.y>=-56 && end.y<=height+56;
        });
    }
    update_drops(dt,width,height){
        for(const enemy of this.enemies){
            if(enemy.type!=="envy" || enemy.health>0 || enemy.dropped)continue;
            enemy.dropped=true;
            this.drops.push({center:{
                x:Math.max(16,Math.min(width-16,enemy.center.x)),
                y:Math.max(18,Math.min(height-18,enemy.center.y))
            },radius:16,type:enemy.dropType??"fire",angle:0});
        }
        this.drops=this.drops.filter(drop=>{
            drop.angle=(drop.angle+dt*Math.PI)%(Math.PI*2);
            if(!collision(protagonista,drop))return true;
            if(drop.type==="fire")protagonista.fireShot=true;
            else protagonista.iceCollected=true;
            return false;
        });
    }
    update_enemy_attacks(dt){
        for(const enemy of this.enemies){
            enemy.isAttacking=false;
            const target=enemy.target;
            if(enemy.health<=0 || !target || target.health<=0){
                enemy.attackTime=0;
                enemy.attackTarget=null;
                continue;
            }
            const distance=Math.hypot(enemy.center.x-target.center.x,enemy.center.y-target.center.y);
            if(distance>enemy.radius+target.radius+0.001){
                enemy.attackTime=0;
                enemy.attackTarget=null;
                continue;
            }
            if(enemy.attackTarget!==target){
                enemy.attackTarget=target;
                enemy.attackTime=0;
                enemy.animationStart=-1;
            }
            enemy.update_facing(target.center.x-enemy.center.x,target.center.y-enemy.center.y);
            enemy.velocity.x=0;
            enemy.velocity.y=0;
            const previousTime=enemy.attackTime;
            enemy.attackTime+=dt;
            // Hit once halfway through the animation, then rest before attacking again.
            if(previousTime<0.5 && enemy.attackTime>=0.5){
                target.health=Math.max(0,target.health-enemy.damage);
            }
            enemy.attackTime%=1.5;
            enemy.isAttacking=enemy.attackTime<1;
        }
        this.towers=this.towers.filter(tower=>tower.health>0);
    }
    update(dt, width, height){
        this.update_spawns(dt,width,height);
        this.playerShotCooldown=Math.max(0,this.playerShotCooldown-dt);
        this.buildCooldown=Math.max(0,this.buildCooldown-dt);
        this.main_tower.pos.x = (width-this.main_tower.size.x)/2;
        this.main_tower.pos.y = (height-this.main_tower.size.y)/2;
        update_center(this.main_tower);
        const targets=[this.main_tower,...this.towers].filter(tower=>tower.health>0);
        for(const tower of targets)update_center(tower);
        for(const enemy of this.enemies){
            if(enemy.health<=0){
                enemy.deathTime+=dt;
                if(enemy.frames.death!==null)enemy.quadro=enemy.frames.death+Math.min(3,Math.floor(enemy.deathTime/0.25));
                continue;
            }
            enemy.slowTime=Math.max(0,enemy.slowTime-dt);
            if(enemy.burnTime>0){
                enemy.burnAnimationTime+=dt;
                enemy.burnDamageTime+=dt;
                while(enemy.burnDamageTime>=1 && enemy.health>0){
                    enemy.burnDamageTime-=1;
                    enemy.take_damage(1);
                }
                if(enemy.health<=0)continue;
            }
            update_center(enemy);
            let target=null,nearest=Infinity;
            for(const tower of targets){
                const distance=Math.hypot(tower.center.x-enemy.center.x,tower.center.y-enemy.center.y);
                if(distance<nearest){
                    nearest=distance;
                    target=tower;
                }
            }
            enemy.target=target;
            if(!target){
                enemy.velocity.x=0;
                enemy.velocity.y=0;
                continue;
            }
            enemy.update_velocity(target,dt);
            enemy.update_position(dt);
            update_center(enemy);
        }
        this.enemies=this.enemies.filter(enemy=>enemy.health>0 || (enemy.frames.death!==null && enemy.deathTime<1));
        for(const tower of this.towers)tower.spawnTime+=dt;
        if(this.cast?.target && this.cast.target.health<=0){
            this.cast=null;
            protagonista.animacao=1;
            protagonista.tempoAnimacao=0;
            protagonista.quadro=1;
        }
        if(this.cast){
            this.cast.time+=dt;
            protagonista.quadro=21+Math.min(4,Math.floor(this.cast.time/0.25));
            if(this.cast.time>=1.25){
                const target=this.cast.target;
                if(target){
                    target.level=2;
                    target.type=this.cast.type;
                    target.health=15;
                    target.maxHealth=15;
                    target.quadro=target.type==="ice"?3:2;
                    target.spawnTime=0;
                }else{
                    const pos={...this.cast.pos};
                    this.towers.push({
                        pos,size:{x:112,y:112},center:{x:pos.x+56,y:pos.y+56},
                        radius:20,level:1,type:"basic",health:10,maxHealth:10,facing:"right",quadro:1,spawnTime:0
                    });
                    
                }
                this.cast=null;
                this.buildCooldown=20;
                protagonista.animacao=1;
                protagonista.tempoAnimacao=0;
                protagonista.quadro=1;
            }
        }else{ // protagonista se move
            if (protagonista.isMoving.up)
                protagonista.pos.y += protagonista.velocity.y*dt;
            if (protagonista.isMoving.down)
                protagonista.pos.y -= protagonista.velocity.y*dt;
            if (protagonista.isMoving.left)
                protagonista.pos.x -= protagonista.velocity.x*dt;
            if (protagonista.isMoving.right)
                protagonista.pos.x += protagonista.velocity.x*dt;
        

            const movimentoX =(protagonista.isMoving.right)-(protagonista.isMoving.left); // apenas setando prioridade de animação
            const movimentoY =(protagonista.isMoving.up)-(protagonista.isMoving.down);
            const inicio = movimentoX>0?5: movimentoX<0?9: movimentoY<0?13: movimentoY>0?17: 1;

            if(protagonista.animacao != inicio){
                protagonista.animacao = inicio;
                protagonista.tempoAnimacao = 0;
            }
            protagonista.tempoAnimacao += dt;
            protagonista.quadro =inicio+Math.floor(protagonista.tempoAnimacao*4) % 4; // um frame a cada 0.25s, 4 frames de anmacao, a animacao completa dura 1s
        }
        this.main_tower.tempoAnimacao += dt;
        this.main_tower.quadro =1+Math.floor(this.main_tower.tempoAnimacao/0.5)% 4;
        protagonista.pos.x=Math.max(0,Math.min(width-protagonista.size.x,protagonista.pos.x));
        protagonista.pos.y=Math.max(0,Math.min(height-protagonista.size.y,protagonista.pos.y));
        update_center(protagonista);
        // Handle contact with the protagonist.
        // Handle contact with Shao May.
        // Handle contact with the summoned tower.
        this.update_enemy_attacks(dt);
        if(this.main_tower.health<=0){
            this.running=false;
            this.victory=this.wave==="endless";
            this.gameOver=!this.victory;
            this.cast=null;
        }else{
            this.update_combat(dt,width,height);
            this.update_drops(dt,width,height);
        }
        for(const enemy of this.enemies){
            if(enemy.isAttacking && enemy.attackTarget.health<=0){
                enemy.isAttacking=false;
                enemy.attackTarget=null;
                enemy.attackTime=0;
            }
            enemy.update_animation(dt);
        }
        this.update_stage_progress(width,height);
        const attackEffects=this.enemies.filter(enemy=>enemy.health>0 && enemy.isAttacking).map(enemy=>enemy.attack_effect());
        const summonEffects=this.towers.filter(tower=>tower.spawnTime<0.5).map(tower=>({pos:tower.pos,quadro:4}));
        if(this.cast?.target && this.cast.target.health<=0){
            this.cast=null;
            protagonista.animacao=1;
            protagonista.tempoAnimacao=0;
            protagonista.quadro=1;
        }
        if(this.cast)summonEffects.push({pos:this.cast.pos,quadro:4});
        return {protagonista,enemies:this.enemies,towers:this.towers,main_tower:this.main_tower,summonEffects,projectiles:this.projectiles,attackEffects,drops:this.drops};
    }
}
document.addEventListener("keydown", (event) => {
    if(event.key.toLowerCase() === "w")protagonista.isMoving.up = true;
    if(event.key.toLowerCase() === "s")protagonista.isMoving.down = true;
    if(event.key.toLowerCase() === "a")protagonista.isMoving.left = true;
    if(event.key.toLowerCase() === "d")protagonista.isMoving.right = true;
});

document.addEventListener("keyup", (event) => {
    if(event.key.toLowerCase() === "w")protagonista.isMoving.up = false;
    if(event.key.toLowerCase() === "s")protagonista.isMoving.down = false;
    if(event.key.toLowerCase() === "a")protagonista.isMoving.left = false;
    if(event.key.toLowerCase() === "d")protagonista.isMoving.right = false;
});
