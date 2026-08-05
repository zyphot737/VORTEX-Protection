// =====================================
// VORTEX WEBSITE SCRIPT
// =====================================

console.log("⚡ VORTEX Online");


// =====================================
// LIVE BOT STATS
// =====================================

const STATS_API_URL = "/api/stats";
const STATS_REFRESH_MS = 60000;


function formatStat(number) {
    if (typeof number !== "number") return number;
    return number.toLocaleString("en-GB");
}


async function refreshStats() {

    try {

        const response = await fetch(STATS_API_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API Offline");
        }

        const data = await response.json();


        document.querySelectorAll("[data-stat]")
        .forEach(element => {

            const key = element.dataset.stat;

            if (data[key] !== undefined) {
                element.textContent = formatStat(data[key]);
            }

        });


    } catch(error) {

        console.log(
            "⚡ VORTEX Stats API Offline - Using fallback"
        );

    }

}


refreshStats();

setInterval(
    refreshStats,
    STATS_REFRESH_MS
);



// =====================================
// VORTEX CORE ANIMATION
// =====================================


const canvas = document.getElementById(
    "vortex-canvas"
);


if(canvas){

const ctx = canvas.getContext("2d");


const centerX = canvas.width / 2;
const centerY = canvas.height / 2;


let particles = [];


function random(min,max){
    return Math.random() * (max-min)+min;
}



class Particle {


constructor(){

    this.reset();

}



reset(){

    this.radius = random(80,400);
    this.angle = random(0,Math.PI*2);
    this.speed = random(0.002,0.008);

    this.size = random(1,3);

}



update(){

    this.angle += this.speed;

    this.radius -= 0.5;


    if(this.radius < 50){

        this.reset();

    }


}



draw(){


const x =
centerX +
Math.cos(this.angle)
*
this.radius;


const y =
centerY +
Math.sin(this.angle)
*
this.radius;


ctx.beginPath();


ctx.fillStyle =
"rgba(125,107,255,0.8)";


ctx.arc(
x,
y,
this.size,
0,
Math.PI*2
);


ctx.fill();


}



}



for(let i=0;i<100;i++){

    particles.push(
        new Particle()
    );

}



function animate(time){


ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



ctx.beginPath();


ctx.strokeStyle =
"rgba(52,228,196,0.5)";


ctx.arc(
centerX,
centerY,
130,
0,
Math.PI*2
);


ctx.stroke();



particles.forEach(p=>{

    p.update();
    p.draw();

});



requestAnimationFrame(
animate
);



}



animate();



}




// =====================================
// SCROLL REVEAL
// =====================================


const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){

entry.target.classList.add(
"visible"
);


observer.unobserve(
entry.target
);


}



});


},
{
threshold:0.15
}
);



document
.querySelectorAll(".reveal")
.forEach(element=>{


observer.observe(element);


});




// =====================================
// BUTTON ANIMATIONS
// =====================================


document
.querySelectorAll(".btn")
.forEach(button=>{


button.addEventListener(
"mouseenter",
()=>{

button.style.transform =
"scale(1.05)";

}
);



button.addEventListener(
"mouseleave",
()=>{

button.style.transform =
"scale(1)";

}
);



});
