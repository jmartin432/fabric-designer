onmessage = (e) => {
    const noise = JSON.parse(e.data[0]);
    const colors = JSON.parse(e.data[1]);
    const forCanvas = e.data[2]
    console.log(`Noise received from main script, min: ${noise.scaledMin} max: ${noise.scaledMax}`);
    console.log("Colors received from main script", colors)
    const pixels = []
    const bandWidth = 1 / (colors.length - 1)
    //console.log(`Spread: ${spread} Bandwidth: ${bandWidth}`)
    for (let i=0; i<noise.values.length; i++) {
        // let x = noise.values[i].x;
        // let y = noise.values[i].y;
        let scaledValue = noise.values[i].scaledValue;
        let band = clamp(Math.floor((colors.length - 1) * scaledValue), 0, colors.length - 2);
        //console.log('band: ', band)
        //let band = clamp(Math.floor((colors.length - 1) * value), 0, this.colors.length - 2);
        let mappedValue = mapNumberRange(scaledValue, band * bandWidth, (band + 1) * bandWidth, 0, 1);
        let r = linearInterpolate(colors[band].r, colors[band + 1].r, mappedValue);
        let g = linearInterpolate(colors[band].g, colors[band + 1].g, mappedValue);
        let b = linearInterpolate(colors[band].b, colors[band + 1].b, mappedValue);
       // console.log(`ScaledValue: ${scaledValue} Band: ${band} MappedValue: ${mappedValue}`)
        pixels.push(r);
        pixels.push(g);
        pixels.push(b);
        pixels.push(255);
        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 0] = r;
        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 1] = g;
        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 2] = b;
        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 3] = 255;
        if ((pixels.length / 4) % 100 === 0) {
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

const mapNumberRange = (x, inMin, inMax, outMin, outMax) => {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}