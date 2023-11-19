
//https://github.com/joeiddon/perlin/tree/master -->
//https://rtouti.github.io/graphics/perlin-noise-algorithm -->
//https://adrianb.io/2014/08/09/perlinnoise.html -->
//https://sighack.com/post/getting-creative-with-perlin-noise-fields -->
//https://gamedev.stackexchange.com/questions/197861/how-to-handle-octave-frequency-in-the-perlin-noise-algorithm -->
///https://thebookofshaders.com/13/ -->
//https://stackoverflow.com/questions/17427461/perlin-noise-value-range -->
//https://rmarcus.info/blog/2018/03/04/perlin-noise.html -->

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