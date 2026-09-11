const status = {
    DIALOGO:0,
    CUTSCENE:1,
    GAMEPLAY:2
};

class Protagonista{
    constructor(){
        this.pos = {x:10,y:10}; // posição inicial
        this.velocity = {x:10,y:10}; // velocidade
        this.isMoving = {up:false, down:false, left:false, right:false} // está se movendo?
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

export class Enemie{
    constructor(pos, velocity, size){
        this.pos=pos;
        this.velocity=velocity;
        this.size = size;
    }
    update_position(dt){
        this.pos.x=this.velocitiy.x*dt;
        this.pos.y=this.velocitiy.y*dt;
    }
    update_velocity(target, width, height){
        this.velocity.x=(this.pos.x+target.pos.x)/width;
        this.velocity.y=(this.pos.y+target.pos.y)/width;
    }
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
        this.main_tower={};
    }
    update(dt, width, height) {
        for(let enemie of this.enemies){
            enemie.update_position(dt);
            enemie.update_velocity(main_tower,width,height);
        }
        if (protagonista.isMoving.up)
            protagonista.pos.y += protagonista.velocity.y*dt;
        if (protagonista.isMoving.down)
            protagonista.pos.y -= protagonista.velocity.y*dt;
        if (protagonista.isMoving.left)
            protagonista.pos.x -= protagonista.velocity.x*dt;
        if (protagonista.isMoving.right)
            protagonista.pos.x += protagonista.velocity.x*dt;
        return {protagonista: protagonista,walls: this.walls,enemies: this.enemies, towers: this.towers};
    }
    async dialog(){
        const json = await fetch(`../dialogs/dialog${this.level}.json`).json();
        let dialog = json.dialogs[this.dialog_position];
        this.dialog_position++;
        let still_dialog = true;
        if(json.dialogs.size()+1==this.dialog_position){
            this.dialog_position = 0;
            this.still_dialog = false;
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