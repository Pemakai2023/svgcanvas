export default function text(ctx) {
    ctx.font = "normal 36px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText("A Text Example", 50, 50);
    ctx.font = "normal 36px Arial";
    ctx.strokeStyle = "#000000";
    ctx.strokeText("A Text Example", 50, 90);
};
