onmessage = (e) => {
    console.log(e.data)
    const xFrequencies = JSON.parse(e.data[0]);
    const yFrequencies = JSON.parse(e.data[1]);
    const numberOfPixels = e.data[2];
    const forCanvas = e.data[3];

    console.log('WORKER IS STARTING WAVES.');
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
            for (let i = 0; i < xFrequencies.length; i++) {
                value += Math.sin(xFrequencies[i] * (xMapped));
            }
            for (let j = 0; j < yFrequencies.length; j++) {
                value += Math.sin(yFrequencies[j] * (yMapped));
            }
            waves.min = (waves.min) ? Math.min(value, waves.min) : value;
            waves.max = (waves.max) ? Math.max(value, waves.max) : value;
            waves.values.push({
                x: x,
                y: y,
                value: value,
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
        type: 'waves',
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