import * as utils from './utils.js'

const makeGrid = async (num) => {
    let yArray = [];
    for (let i=0; i<num; i++) {
        let xArray = [];
        for (let j=0; j<num; j++) {
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

const makeNoise = async (gridData, scalar, numberOfPixels) => {
    const noise = [];
    const numberOfGrids = Math.round(Math.sqrt(gridData.length))
    const gridSize = numberOfPixels / numberOfGrids;
    for (let y = 0; y < numberOfPixels; y++){
        let yGrid = y / gridSize;
        for (let x = 0; x < numberOfPixels; x++) {
            let xGrid = x / gridSize;
            let tlGradient = {
                x: gridData[Math.floor(yGrid) % numberOfGrids][Math.floor(xGrid) % numberOfGrids].gradient.x * scalar,
                y: gridData[Math.floor(yGrid) % numberOfGrids][Math.floor(xGrid) % numberOfGrids].gradient.y * scalar,
            }
            let trGradient = {
                x: gridData[Math.floor(yGrid) % numberOfGrids][(Math.floor(xGrid) + 1) % numberOfGrids].gradient.x * scalar,
                y: gridData[Math.floor(yGrid) % numberOfGrids][(Math.floor(xGrid) + 1) % numberOfGrids].gradient.y * scalar,
            }
            let blGradient = {
                x: gridData[(Math.floor(yGrid) + 1) % numberOfGrids][Math.floor(xGrid) % numberOfGrids].gradient.x * scalar,
                y: gridData[(Math.floor(yGrid) + 1) % numberOfGrids][Math.floor(xGrid) % numberOfGrids].gradient.y * scalar,
            }
            let brGradient = {
                x: gridData[(Math.floor(yGrid) + 1) % numberOfGrids][(Math.floor(xGrid) + 1) % numberOfGrids].gradient.x * scalar,
                y: gridData[(Math.floor(yGrid) + 1) % numberOfGrids][(Math.floor(xGrid) + 1) % numberOfGrids].gradient.y * scalar,
            }
            //console.log('MAKE NOISE: ', xGrid, yGrid, tlGradient, trGradient, blGradient, brGradient)
            let value = utils.clamp(getValue(xGrid, yGrid, tlGradient, trGradient, blGradient, brGradient), -1, 1);
            noise.push({
                x: x,
                y: y,
                value: value,
                scaledValue: (value + 1) / 2
            })
        }
    }
    return noise;
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

const getValue = (x, y, tlGradient, trGradient, blGradient, brGradient) => {
    let xFloor = Math.floor(x);
    let yFloor = Math.floor(y);
    let xCeil = xFloor + 1;
    let yCeil = yFloor + 1;
    //interpolate
    let topLeft = dotProductGrid(x, y, xFloor, yFloor, tlGradient);
    let topRight = dotProductGrid(x, y, xCeil, yFloor, trGradient);
    let bottomLeft = dotProductGrid(x, y, xFloor, yCeil, blGradient);
    let bottomRight = dotProductGrid(x, y, xCeil, yCeil, brGradient);
    let xTop = interpolate(x - xFloor, topLeft, topRight);
    let xBottom = interpolate(x - xFloor, bottomLeft, bottomRight);
    let value = interpolate(y - yFloor, xTop, xBottom);
    return value;
}


export { makeGrid, makeNoise };