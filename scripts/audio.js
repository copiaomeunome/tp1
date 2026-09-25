const effectNames=["stone_shot","tower_shot","fire_shot","ice_shot","hit","enemy_attack","enemy_death","alchemy_cast","tower_build","tower_upgrade","fire_pickup","ice_pickup","cooldown_ready","victory","game_over"];
const effects=new Map(effectNames.map(name=>[name,{voices:[],lastTime:-Infinity}]));
const music=new Audio(new URL("../audios/background_loop.wav",import.meta.url));
music.loop=true;
music.volume=0.25;

function play(audio){
    audio.play().catch(error=>{
        if(error.name!=="NotAllowedError" && error.name!=="AbortError")console.warn("Audio playback failed:",error);
    });
}
export function play_sound(name){
    const effect=effects.get(name);
    if(!effect)return;
    const now=performance.now();
    if(now-effect.lastTime<70)return;
    effect.lastTime=now;
    let voice=effect.voices.find(audio=>audio.paused || audio.ended);
    if(!voice && effect.voices.length<3){
        voice=new Audio(new URL(`../audios/${name}.wav`,import.meta.url));
        voice.volume=0.5;
        effect.voices.push(voice);
    }
    if(!voice)return;
    voice.currentTime=0;
    play(voice);
}
export function start_audio(){
    stop_audio();
    for(const effect of effects.values())effect.lastTime=-Infinity;
    play(music);
}
export function stop_audio(){
    for(const audio of [music,...Array.from(effects.values()).flatMap(effect=>effect.voices)]){
        audio.pause();
        audio.currentTime=0;
    }
}
