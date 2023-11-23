onmessage = (e) => {
    console.log(e.data)
    const xFrequency = e.data[0];
    const xAmplitude = e.data[1];
    const xPhaseShift = e.data[2];
    const xVerticalShift = e.data[3];
    const yFrequency = e.data[4];
    const yAmplitude = e.data[5];
    const yPhaseShift = e.data[6];
    const yVerticalShift = e.data[7];
    const numberOfPixels = e.data[8];
    const forCanvas = e.data[9];
    const octaves = 1;

    console.log('WORKER IS STARTING NOISE.');
    const waves = {
        min: null,
        max: null,
        scaledMin: null,
        scaledMax: null,
        values: []
    }
    for (let y = 0; y < numberOfPixels; y++){
        for (let x = 0; x < numberOfPixels; x++) {
            let xMapped = mapNumberRange(x, 0, numberOfPixels, 0, 2 * Math.PI)
            let yMapped = mapNumberRange(y, 0, numberOfPixels, 0, 2 * Math.PI)
            let value = 0;
            for (let i = 0; i < octaves; i++) {
                value += xAmplitude * Math.sin(xFrequency * (xMapped + xPhaseShift)) + xVerticalShift;
                value += yAmplitude * Math.cos(yFrequency * (yMapped + yPhaseShift)) + yVerticalShift;
            }
            //console.log(value)
            waves.min = (waves.min) ? Math.min(value, waves.min) : value;
            waves.max = (waves.max) ? Math.max(value, waves.max) : value;
            waves.values.push({
                x: x,
                y: y,
                value: value,
                //scaledValue: utils.mapNumberRange(value, -1, 1, 0, 1)
            })
            if (waves.values.length % 100 === 0) {
                postMessage({
                    type: 'percent',
                    data: waves.values.length / (numberOfPixels**2)
                })
            }
        }
    }
    console.log(waves.min, waves.max)
    waves.values.forEach((item) => item.scaledValue = mapNumberRange(item.value, waves.min, waves.max, 0, 1))
    waves.scaledMin = mapNumberRange(waves.min, waves.min, waves.max, 0, 1);
    waves.scaledMax = mapNumberRange(waves.max, waves.min, waves.max, 0, 1)
    console.log('WORKER FINISHED WAVES.', waves)
    postMessage({
        type: 'noise',
        forCanvas: forCanvas,
        data: JSON.stringify(waves)
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