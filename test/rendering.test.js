import { Element } from '../index.js'
import { expect } from './node_modules/chai-5.0.3/index.js'
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

const tests = {
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
};

const config = {
    pixelDensity: 3 // for 200% and 150%
}

let pre = document.createElement("pre");
document.body.appendChild(pre)

class RenderingTester {
  
    constructor(name, fn) {
        this.name = name;
        this.fn = fn;
        this.width = 600;
        this.height = 600;
    }

    async test() {
        const canvas = document.createElement('canvas');
        const svgcanvas = new Element();

        [canvas, svgcanvas].forEach((canvas) => {
            canvas.width = this.width
            canvas.height = this.height
            const ctx = canvas.getContext('2d', {willReadFrequently:true })
            this.fn(ctx)
        })

        // Pixels
        const svg = svgcanvas.toDataURL("image/svg+xml");
        const svgImage = await new Promise((resolve) => {
            var svgImage = new Image();
            svgImage.onload = function () {
                resolve(svgImage)
            }
            svgImage.src = svg;
        })
        const svgPixels = this.getPixels(svgImage);
        const canvasPixels = this.getPixels(canvas);
        const diffPixels = this.diffPixels(svgPixels, canvasPixels);
        const removeThinLinesPixels = this.removeThinLines(this.removeThinLines(diffPixels));
        const svgPixelsCount = this.countPixels(svgPixels);
        const canvasPixelsCount = this.countPixels(canvasPixels)
        const count = Math.max(svgPixelsCount, canvasPixelsCount);
        const diffPixelsCount = this.countPixels(removeThinLinesPixels);
        
        console.log(JSON.stringify({ fn: this.name, count, diffCount: diffPixelsCount, svgPixelsCount, canvasPixelsCount },null,2))
        pre.textContent += this.name+": "+JSON.stringify({ fn: this.name, count, diffCount: diffPixelsCount, svgPixelsCount, canvasPixelsCount },null,2) +'\n'
        
        if (count === 0 && diffPixelsCount === 0) {
            return 0
        }
        const diffRate = diffPixelsCount / count;
        return diffRate;
    }
    

    getPixels(image) {
        const canvas = document.createElement('canvas');
        const width = this.width;
        const height = this.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', {willReadFrequently:true });
        ctx.drawImage(image, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    }

    // count non transparent pixels
    countPixels(imgData) {
        var count = 0;
        for (var i = 3; i < imgData.data.length; i += 4) {
            if (imgData.data[i] > 0) {
                count++;
            }
        }
        return count;
    };


    diffPixels(imgData1, imgData2) {
        const canvas = document.createElement('canvas');
        const width = this.width;
        const height = this.height;
        const diffImgData = canvas.getContext('2d', {willReadFrequently:true }).getImageData(0, 0, width, height);
        for (var i = 0; i < imgData1.data.length; i += 4) {
            var indexes = [i, i + 1, i + 2, i + 3];
            indexes.forEach(function (i) {
                diffImgData.data[i] = 0;
            });
            if (indexes.some(function (i) {
                return Math.abs(imgData1.data[i] - imgData2.data[i]) > 0;
            })) {
                diffImgData.data[i + 3] = 255; // set black
            }
        }
        return diffImgData;
    }

    removeThinLines(imageData) {
        const canvas = document.createElement('canvas');
        const width = this.width;
        const height = this.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', {willReadFrequently:true });
        ctx.putImageData(imageData, 0, 0);
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var imgDataCopy = ctx.getImageData(0, 0, canvas.width, canvas.height);

        var getPixelIndex = function (x, y) {
            return (y * width + x) * 4 + 3;
        };

        var getPixel = function (x, y) {
            var alphaIndex = getPixelIndex(x, y);
            return imgDataCopy.data[alphaIndex];
        };

        var setPixel = function (x, y, value) {
            imgData.data[getPixelIndex(x, y)] = value;
        };

        for (var x = 1; x < width - 1; x++) {
            for (var y = 1; y < height - 1; y++) {
                if (getPixel(x, y) == 0) {
                    continue; // ignore transparents
                }
                var links = [
                    { x: x - 1, y: y - 1 },
                    { x: x, y: y - 1 },
                    { x: x + 1, y: y - 1 },
                    { x: x - 1, y: y },
                    { x: x + 1, y: y },
                    { x: x - 1, y: y + 1 },
                    { x: x, y: y + 1 },
                    { x: x + 1, y: y + 1 }
                ].map(function (p) {
                    return getPixel(p.x, p.y);
                }).filter(function (val) {
                    return val > 0; // not transparent?
                }).length;

                if (links < 5) { // is a thin line
                    setPixel(x, y, 0); // make it transparent
                }
            }
        }
        return imgData;
    }
}
function describe (str, cb) {
  pre.textContent += str  +': \n\n'
  cb()
}

function it(str, cb) {
  cb()
}

describe('RenderTest', () => {
    for (let fn of Object.keys(tests)) {
        it(`should render same results for ${fn}`, async () => {
            const tester = new RenderingTester(fn, tests[fn]);
                     
            const diffRate = await tester.test();
            pre.textContent += 'diffRate: ' + diffRate
            if(diffRate >= 0.05 ) {
              pre.textContent += ' expected < 0.05 \n\n'
            }
            pre.textContent += '\n\n'
            
            expect(diffRate).to.lessThan(0.05);
            
        })
    }
})
