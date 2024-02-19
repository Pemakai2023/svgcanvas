import {Element} from '../index.js'
import arc from './tests/arc.js'
import arcTo from './tests/arcTo.js'
import arcTo2 from './tests/arcTo2.js'
import arcToScaled from './tests/arcToScaled.js'
import emptyArc from './tests/emptyArc.js'
import ellipse from './tests/ellipse.js'
import ellipse2 from './tests/ellipse2.js'
import fillstyle from './tests/fillstyle.js'
import globalAlpha from './tests/globalalpha.js'
import gradient from './tests/gradient.js'
import linecap from './tests/linecap.js'
import linewidth from './tests/linewidth.js'
import scaledLine from './tests/scaledLine.js'
import rgba from './tests/rgba.js'
import rotate from './tests/rotate.js'
import saveandrestore from './tests/saveandrestore.js'
import setLineDash from './tests/setLineDash.js'
import text from './tests/text.js'
import tiger from './tests/tiger.js'
import transform from './tests/transform.js'
import pattern from "./tests/pattern.js";

const tests = [
    tiger,
    arc,
    arcTo,
    arcTo2,
    arcToScaled,
    emptyArc,
    ellipse,
    ellipse2,
    fillstyle,
    globalAlpha,
    gradient,
    linecap,
    linewidth,
    scaledLine,
    rgba,
    rotate,
    saveandrestore,
    setLineDash,
    text,
    transform,
    pattern
];

for (let fn of tests) {
    let name = fn.name;
    // Container
    const container = document.createElement('div');
    container.className = 'example';
    container.id = 'example-' + name;
    container.innerHTML = `<h2>${name}</h2><div class="canvas"></div><div class="svg"></div>`
    // Canvas
    const canvas = document.createElement('canvas');
    container.querySelector('.canvas').appendChild(canvas);
    // SVGCanvas
    const svgcanvas = new Element();
    container.querySelector('.svg').appendChild(svgcanvas.getElement());
    document.querySelector('body').appendChild(container);
    // Render
    for (let c of [canvas, svgcanvas]) {
        c.width = 500;
        c.height = 500;
        const ctx = c.getContext('2d');
        fn(ctx);
    }
}
