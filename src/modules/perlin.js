import * as utils from './utils.js'

//https://github.com/joeiddon/perlin/tree/master -->
//https://rtouti.github.io/graphics/perlin-noise-algorithm -->
//https://adrianb.io/2014/08/09/perlinnoise.html -->
//https://sighack.com/post/getting-creative-with-perlin-noise-fields -->
//https://gamedev.stackexchange.com/questions/197861/how-to-handle-octave-frequency-in-the-perlin-noise-algorithm -->
///https://thebookofshaders.com/13/ -->
//https://stackoverflow.com/questions/17427461/perlin-noise-value-range -->

const makeGrid = async (n) => {
    let yArray = [];
    for (let i=0; i<n; i++) {
        let xArray = [];
        for (let j=0; j<n; j++) {
            xArray.push({
                x: j,
                y: i,
                gradient: randomUnitVector()
            })
        }
        yArray.push(xArray)
    }
    return yArray;
}

const randomUnitVector = () => {
    const theta = Math.random() * 2 * Math.PI;
    return {
        theta: theta,
        x: Math.cos(theta), 
        y: Math.sin(theta)
    };
}

const getCornerGradients = (gridData, frequency, binSize, bin, xIncrement, yIncrement) => {
    let x = ((bin[0] + xIncrement)  % frequency) * binSize;
    let y = ((bin[1] + yIncrement) % frequency) * binSize;
    //console.log(' GET CORNERS: ', x, y)
    return gridData[x][y].gradient
}

const makeNoise = async (gridData, gridSize, baseFrequency, octaves, scalar, numberOfPixels) => {
    console.log('here');
    let min = 0;
    let max = 0;
    const noise = [];
    for (let y = 0; y < numberOfPixels; y++){
        for (let x = 0; x < numberOfPixels; x++) {
            let frequency = baseFrequency;
            let value = 0;
            for (let i = 0; i < octaves; i++) {
                let binSize = gridSize / baseFrequency;
                //console.log('bin Size', binSize)
                let xMapped = utils.mapNumberRange(x, 0, numberOfPixels, 0, frequency);
                let yMapped = utils.mapNumberRange(y, 0, numberOfPixels, 0, frequency);
                let bin = [Math.floor(xMapped), Math.floor(yMapped)];
               // console.log(xMapped, yMapped, bin)
                let tlGradient = getCornerGradients(gridData, frequency, binSize, bin, 0, 0)
                let trGradient = getCornerGradients(gridData, frequency, binSize, bin, 1, 0)
                let blGradient = getCornerGradients(gridData, frequency, binSize, bin, 0, 1)
                let brGradient = getCornerGradients(gridData, frequency, binSize, bin, 1, 1)
                //console.log('MAKE NOISE: ', xGrid, yGrid, tlGradient, trGradient, blGradient, brGradient)
                value += utils.clamp(getValue(xMapped, yMapped, bin, tlGradient, trGradient, blGradient, brGradient), -1, 1);
                frequency *= 2;
            }
            min = Math.min(value, min)
            max = Math.max(value, max)
            noise.push({
                x: x,
                y: y,
                value: value,
                //scaledValue: utils.mapNumberRange(value, -1, 1, 0, 1)
            })
        }
    }
    noise.forEach((item) => item.scaledValue = utils.mapNumberRange(item.value, min, max, 0, 1))
    return {
        min: min,
        max: max,
        scaledMin: utils.mapNumberRange(min, min, max, 0, 1),
        scaledMax: utils.mapNumberRange(max, min, max, 0, 1),
        values: noise
    }
}

const dotProductGrid = (x, y, xCorner, yCorner, gradientVector) => {
    let directionVector = {x: x - xCorner, y: y - yCorner};
    return directionVector.x * gradientVector.x + directionVector.y * gradientVector.y;
}

const smootherstep = (x) => {
     return 6*x**5 - 15*x**4 + 10*x**3;
}

const interpolate = (x, a, b) => {
    return a + smootherstep(x) * (b-a);
}

const getValue = (x, y, bin, tlGradient, trGradient, blGradient, brGradient) => {
    let topLeft = dotProductGrid(x, y, bin[0], bin[1], tlGradient);
    let topRight = dotProductGrid(x, y, bin[0] + 1, bin[1], trGradient);
    let bottomLeft = dotProductGrid(x, y, bin[0], bin[1] + 1, blGradient);
    let bottomRight = dotProductGrid(x, y, bin[0] + 1, bin[1] + 1, brGradient);
    let xTop = interpolate(x - bin[0], topLeft, topRight);
    let xBottom = interpolate(x - bin[0], bottomLeft, bottomRight);
    let value = interpolate(y - bin[1], xTop, xBottom);
    return value;
}


export { makeGrid, makeNoise };