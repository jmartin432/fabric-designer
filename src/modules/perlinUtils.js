

const makeGrid = (n) => {
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

export { makeGrid };