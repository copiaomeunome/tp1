const status = {
    DIALOGO:0,
    CUTSCENE:1,
    GAMEPLAY:2
};

class Protagonista{
    constructor(){
        this.animacao = 1;
        this.size = {x:112, y:112};
        this.tempoAnimacao = 0;
        this.quadro = 1;
        this.pos = {x:10,y:10}; // posição inicial
        this.velocity = {x:10,y:10}; // velocidade
        this.isMoving = {up:false, down:false, left:false, right:false} // está se movendo?
        this.radius = 20; // Circular hitbox radius.
        this.center = {x:this.pos.x+(this.size.x/2), y:this.pos.y+(this.size.y/2)};
    }
}
class Boss{
    constructor(pos, size){
        this.pos = pos;
        this.size = size;
    }
    attack(){
        return {};// bloco de ataque e sprite atual do ataque
    }
}

export class Enemy{
    constructor(pos, velocity, size){
        this.animationStart = 1;
        this.animationTime = 0;
        this.quadro = 1;    // começa no 1, por isso que tava bugando
        this.pos=pos;
        this.velocity=velocity;
        this.size = size;
        this.radius = 20;
        this.center = {x:this.pos.x+(this.size.x/2), y:this.pos.y+(this.size.y/2)};
        this.speed = 40;  //px/s
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
        const speed=Math.min(this.speed,gap/dt);

        this.velocity.x = (dx/distance)*speed;
        this.velocity.y= (dy/distance)*speed;
    }
    update_animation(dt) {
        const {x,y} = this.velocity; //da uma olhada depois
        let start=1;

        if (x!==0 || y!==0) start=Math.abs(x)>Math.abs(y)?(x>0?6:10):(y>0?14:2); // em caso de empate vou escolher o vertical, pq? pq sim
        if(start!==this.animationStart){
            this.animationStart = start;
            this.animationTime = 0;
        }
        this.animationTime += dt;
        const frameCount = start===1?1:4;
        this.quadro = start+Math.floor(this.animationTime/0.25)%frameCount;
    }
}

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

let protagonista = new Protagonista;
export class Scene{
    constructor(){
        this.status = status.DIALOGO;
        this.level = 0;
        this.dialog_position = 0;
        this.enemies = [];
        this.walls = [];
        this.towers = [];
        this.main_tower = {
            pos: {x:0,y:0},
            size: {x:112,y:112},
            center: {x:56,y:56},
            radius: 20,
            tempoAnimacao: 0,
            quadro: 1
        };
    }
    update(dt, width, height){
        this.main_tower.pos.x = (width-this.main_tower.size.x)/2;
        this.main_tower.pos.y = (height-this.main_tower.size.y)/2;
        update_center(this.main_tower);
        for (const enemy of this.enemies) {
            update_center(enemy);
            enemy.update_velocity(this.main_tower, dt);
            enemy.update_position(dt);
            enemy.update_animation(dt);
            update_center(enemy);
        }
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

        this.main_tower.tempoAnimacao += dt;
        this.main_tower.quadro =1+Math.floor(this.main_tower.tempoAnimacao/0.5)% 4;
        update_center(protagonista);
        update_center(this.main_tower);

        for(const tower of this.towers)update_center(tower);
        for(const enemy of this.enemies)update_center(enemy);
        for(const enemy of this.enemies){
            if(collision(protagonista, enemy)){
                // Handle contact with the protagonist.
            }
            if (collision(this.main_tower, enemy)) {
                // Handle contact with Shao May.
            }
            for (const tower of this.towers) {
                if (collision(tower, enemy)) {
                    // Handle contact with the summoned tower.
                }
            }
        }
        return {protagonista: protagonista,walls: this.walls,enemies: this.enemies, towers: this.towers, main_tower: this.main_tower};
    }
    async dialog(){
        const response = await fetch(`./dialogs/dialog${this.level}.json`);
        const json = await response.json();
        let dialog = json.dialogs[this.dialog_position];
        this.dialog_position++;
        let still_dialog = true;
        if(this.dialog_position >= json.dialogs.length){
            this.dialog_position = 0;
            still_dialog = false;
        }
        
        return {dialog:dialog, still_dialog:still_dialog};
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
