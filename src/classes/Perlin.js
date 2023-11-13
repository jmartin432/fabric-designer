export default class Perlin {
    constructor(numberOfGrids, numberOfPixels) {
        this.numberOfGrids = numberOfGrids;
        this.numberOfPixels = numberOfPixels;
        this.gridSize= numberOfPixels / numberOfGrids;
        this.gradients = this.setGradientVectors(numberOfGrids);
    }

    setGradientVectors(x) {
        console.log('here')
        let xArray = [];
        for (let i=0; i<x; i++) {
            let yArray = []
            for (let j=0; j<x; j++) {
                yArray.push(this.randomUnitVector())
            }
            xArray.push(yArray)       
        }
        return xArray;
    }


    randomUnitVector() {
        const theta = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(theta), 
            y: Math.sin(theta)
        };
    }

    dotProductGrid(x, y, xCorner, yCorner) {
        let gradientVector;
        let directionVector = {x: x - xCorner, y: y - yCorner};
        gradientVector = this.gradients[xCorner % this.numberOfGrids][yCorner % this.numberOfGrids];
        return directionVector.x * gradientVector.x + directionVector.y * gradientVector.y;
    }

    smootherstep(x) {
        return 6*x**5 - 15*x**4 + 10*x**3;
    }

    interpolate(x, a, b) {
        return a + this.smootherstep(x) * (b-a);
    }

    seed(n) {
        console.log('seeding')
        this.numberOfGrids = n;
        this.gradients = this.setGradientVectors(n);
    }

    get(x, y) {
        let xFloor = Math.floor(x);
        let yFloor = Math.floor(y);
        let xCeil = xFloor + 1;
        let yCeil = yFloor + 1;
        //console.log('get1 ', x, xFloor, xCeil, y, yFloor, yCeil)
        //interpolate
        let topLeft = this.dotProductGrid(x, y, xFloor, yFloor);
        let topRight = this.dotProductGrid(x, y, xCeil, yFloor);
        let bottomLeft = this.dotProductGrid(x, y, xFloor, yCeil);
        let bottomRight = this.dotProductGrid(x, y, xCeil, yCeil);
        //console.log('get2 ', topLeft, topRight, bottomLeft, bottomRight)
        let xTop = this.interpolate(x - xFloor, topLeft, topRight);
        let xBottom = this.interpolate(x - xFloor, bottomLeft, bottomRight);
        let value = this.interpolate(y - yFloor, xTop, xBottom);
        //console.log('get3:', xTop, xBottom, value)
        return value;
    }
}