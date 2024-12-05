//https://github.com/joeiddon/perlin/tree/master -->
//https://rtouti.github.io/graphics/perlin-noise-algorithm -->
//https://adrianb.io/2014/08/09/perlinnoise.html -->
//https://sighack.com/post/getting-creative-with-perlin-noise-fields -->
//https://gamedev.stackexchange.com/questions/197861/how-to-handle-octave-frequency-in-the-perlin-noise-algorithm -->
//https://thebookofshaders.com/13/ -->
//https://stackoverflow.com/questions/17427461/perlin-noise-value-range -->
//https://rmarcus.info/blog/2018/03/04/perlin-noise.html -->
//https://eev.ee/blog/2016/05/29/perlin-noise/ -->
//https://joeiddon.github.io/projects/javascript/perlin.html -->
//https://we.copernicus.org/articles/22/1/2022/we-22-1-2022.html -->

onmessage = (e) => {
    const gridData = JSON.parse(e.data[0]);
    console.log("Grid received from main script", gridData[0][0]);
    console.log("Other info: ", e.data.slice(1))
    const gridSize = e.data[1];
    const baseFrequency = e.data[2];
    const octaves = e.data[3];
    const scalar = e.data[4];
    const numberOfPixels = e.data[5];
    const forCanvas = e.data[6];
    const halfDrop = true;
    const persistence = .7;

    console.log('WORKER IS STARTING NOISE.');
    const noise = {
        min: null,
        max: null,
        scaledMin: null,
        scaledMax: null,
        values: []
    }
    for (let y = 0; y < numberOfPixels; y++){
        for (let x = 0; x < numberOfPixels; x++) {
            let frequency = baseFrequency;
            let value = 0;
            let amplitude = 1;
            for (let i = 0; i < octaves; i++) {
                let binSize = gridSize / frequency;
                //console.log('bin Size', binSize)
                let xMapped = mapNumberRange(x, 0, numberOfPixels, 0, frequency);
                let yMapped = mapNumberRange(y, 0, numberOfPixels, 0, frequency);
                let bin = [Math.floor(xMapped), Math.floor(yMapped)];
               // console.log(xMapped, yMapped, bin)
                let tlGradient = getCornerGradients(gridData, frequency, binSize, bin, 0, 0, scalar, halfDrop)
                let trGradient = getCornerGradients(gridData, frequency, binSize, bin, 1, 0, scalar, halfDrop)
                let blGradient = getCornerGradients(gridData, frequency, binSize, bin, 0, 1, scalar, halfDrop)
                let brGradient = getCornerGradients(gridData, frequency, binSize, bin, 1, 1, scalar, halfDrop)
                //console.log('MAKE NOISE: ', xGrid, yGrid, tlGradient, trGradient, blGradient, brGradient)
                value += amplitude * clamp(getValue(xMapped, yMapped, bin, tlGradient, trGradient, blGradient, brGradient), -1, 1);
                amplitude *= persistence;
                //console.log(i, amplitude, value)
                frequency *= 2;
            }
        
            noise.min = (noise.min) ? Math.min(value, noise.min) : value;
            noise.max = (noise.max) ? Math.max(value, noise.max) : value;
            noise.values.push({
                x: x,
                y: y,
                value: value,
                //scaledValue: utils.mapNumberRange(value, -1, 1, 0, 1)
            })
            if (noise.values.length % 10000 === 0) {
                postMessage({
                    type: 'percent',
                    data: noise.values.length / (numberOfPixels**2)
                })
            }
        }
    }
    noise.values.forEach((item) => item.scaledValue = mapNumberRange(item.value, noise.min, noise.max, 0, 1))
    noise.scaledMin = mapNumberRange(noise.min, noise.min, noise.max, 0, 1);
    noise.scaledMax = mapNumberRange(noise.max, noise.min, noise.max, 0, 1)
    console.log('WORKER FINISHED NOISE.', noise.values[0])
    postMessage({
        type: 'noise',
        forCanvas: forCanvas,
        data: JSON.stringify(noise)
    })
};

const clamp = (n, min, max) => {
    return Math.max( min, Math.min(n, max) )
}

const mapNumberRange = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
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

const getCornerGradients = (gridData, frequency, binSize, bin, xIncrement, yIncrement, scalar, halfDrop) => {
    const halfDropAdd = (halfDrop) ? frequency / 2 : 0;
    let x = ((bin[0] + xIncrement)  % frequency) * binSize;
    let y = ((bin[0] + xIncrement) % frequency === 0) 
        ? ((bin[1] + halfDropAdd + yIncrement) % frequency) * binSize
        : ((bin[1] + yIncrement) % frequency) * binSize
    
    return {
        x: gridData[x][y].gradient.x * scalar,
        y: gridData[x][y].gradient.y * scalar,
        theta: gridData[x][y].theta
    }
}