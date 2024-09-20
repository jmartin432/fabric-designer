onmessage = (e) => {
    console.log('GRIDMAKER IS STARTING.');
    const gridSize = e.data[0];


    
    let yArray = [];
    for (let i=0; i<gridSize; i++) {
        let xArray = [];
        for (let j=0; j<gridSize; j++) {
            xArray.push({
                x: j,
                y: i,
                gradient: randomUnitVector()
            })
        }
        yArray.push(xArray)
    }
    console.log('GRIDMAKER FINISHED.')
    postMessage({
        type: 'grid',
        data: JSON.stringify(yArray)
    })
};

const randomUnitVector = () => {
    const theta = Math.random() * 2 * Math.PI;
    return {
        theta: theta,
        x: Math.cos(theta), 
        y: Math.sin(theta)
    };
}