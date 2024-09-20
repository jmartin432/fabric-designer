onmessage = (e) => {
    const noise = JSON.parse(e.data[0]);
    const colors = JSON.parse(e.data[1]);
    const interpolation = e.data[2];
    const forCanvas = e.data[3]
    console.log(`Noise received from main script, min: ${noise.scaledMin} max: ${noise.scaledMax}`);
    console.log("Colors received from main script", colors)
    const pixels = []
    const bandWidth = 1 / (colors.length - 1)
    const interpolationFunction = (interpolation === 'linear') ? linearInterpolate : cosineInterpolate
    for (let i=0; i<noise.values.length; i++) {
        // let x = noise.values[i].x;
        // let y = noise.values[i].y;
        let scaledValue = noise.values[i].scaledValue;
        let band = clamp(Math.floor((colors.length - 1) * scaledValue), 0, colors.length - 2);
        //console.log('band: ', band)
        //let band = clamp(Math.floor((colors.length - 1) * value), 0, this.colors.length - 2);
        let mappedValue = mapNumberRange(scaledValue, band * bandWidth, (band + 1) * bandWidth, 0, 1);
        let r = interpolationFunction(colors[band].rgb[0], colors[band + 1].rgb[0], mappedValue);
        let g = interpolationFunction(colors[band].rgb[1], colors[band + 1].rgb[1], mappedValue);
        let b = interpolationFunction(colors[band].rgb[2], colors[band + 1].rgb[2], mappedValue);
       // console.log(`ScaledValue: ${scaledValue} Band: ${band} MappedValue: ${mappedValue}`)
        pixels.push(r, g, b, 255);
        if ((pixels.length / 4) % 10000 === 0) {
            postMessage({
                type: 'percent',
                data: i / noise.values.length
            })
        }
    }
    postMessage({
        type: 'pixels',
        forCanvas: forCanvas,
        data: JSON.stringify(pixels)
    })
}

const clamp = (n, min, max) => {
    return Math.max( min, Math.min(n, max) )
}

const linearInterpolate = (a, b, v) => {
    return (b - a) * v + a;
}

const cosineInterpolate = (a, b, v) => {
    let v2 = (1 - Math.cos(v * Math.PI))/2
    return (a * (1 - v2)) + (b * v2)
}

const mapNumberRange = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}