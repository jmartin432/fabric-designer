<script setup>
    import * as perlinUtils from '../modules/perlinUtils.js';
    import * as utils from '../modules/utils';
    import TilingModal from '../components/TilingModal.vue'
</script>

<template>
    <div id="container">
            <div id="message-container">
                <p id="message" :class="showMessage ? 'show' : 'hide'">{{ message }}</p>
            </div>
        <div id="display-container">
            <div id="canvas-container" class="flex-item">
                <!-- This is why the canvas goes blank on pixel change -->
                <canvas id="main-canvas" :width="mainCanvasWidth" :height="mainCanvasWidth"></canvas>
            </div>
            <div class="flex-item">
                <button  class="control-item" @click="handleResetGrid">Reset Grid</button>
                <div class="control-item">
                    <label for="grid-size">Base Frequency</label>
                    <select name="grid-size" id="grid-size-selector" class="number-select" v-model="baseFrequency">
                        <option v-for="item in baseFrequencyOptions" :value="item.val" :key="item.id">
                            {{ item.val }}
                        </option>
                    </select>
                </div>
                <div class="control-item">
                    <label for="octaves">Octaves</label>
                    <select name="octaves" id="octaves-selector" class="number-select" v-model="octaves">
                        <option v-for="item in octaveOptions" :value="item.val" :key="item.id">
                            {{ item.val }}
                        </option>
                    </select>
                </div>
                <div>
                    <div class="control-item">
                        <label for="gradient-scalar-input">Gradient Scalar: {{ scalar }}</label>
                        <input type="range" id="gradient-scalar--input" name="gradient-scalar-input" min=".1" max="9.9" step=".1" v-model="scalar" @change="handleScalarChange">
                    </div>
                </div>
                <div class="control-item">
                    <label for="number-of-colors">Number of Colors</label>
                    <select name="number-of-colors" id="number-of-colors" class="number-select" v-model="numberOfColors" @change="handleNumberOfColorsChange">
                        <option v-for="index in 10" :value="index + 1" :key="index + 1">
                            {{ index + 1 }}
                        </option>
                    </select>
                </div>
                <div id="color=pickers">
                    <div v-for="(item, index) in colors" :key=index class="control-item">
                        <label for="head">Color {{ index }}</label>
                        <input type="color" :id="'color-' + index" :name="'color-' + index" v-model="colors[index].value" @input="handleColorChange"/>
                    </div>
                </div>
            </div>
            <div class="flex-item">
                <canvas id="download-canvas" :width="downloadCanvasWidth" :height="downloadCanvasWidth"></canvas>
                <button class="control-item" @click="handleShowTilingModal">Show Tiling</button>
                <button class="control-item" @click="handlePrepareDownloadClick">Prepare Download</button>
                <Transition name="show-download">
                    <div v-if="showDownloadDialogue" id="download-dialogue">
                        <div class="control-item">
                            <label for="inches-input">Inches</label>
                            <input type="number" id="inches-input" name="inches-input" min="1" max="12" step=".5" v-model="downloadInches">
                        </div>
                        <div class="control-item">
                            <label for="dpi-input">DPI</label>
                            <select name="dpi-input" id="dpi-input" class="number-select" v-model="downloadDpi">
                                <option v-for="item in dpiOptions" :value="item.val" :key="item.id">
                                    {{ item.val }}
                                </option>
                            </select>
                        </div>
                        <p>Pixels: {{ downloadCanvasWidth }}</p>
                        <div class="control-item">
                            <label for="file-name-input">File Name<span>{{ fileNameWarning }}</span></label>
                            <input 
                                required 
                                type="text" 
                                id="file-name-input" 
                                placeholder="File Name" 
                                v-model="fileName"
                            />
                        </div>
                        <button class="control-item" @click="handleDownloadClick">Download</button>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
    <TilingModal :show="showTilingModal" :background="modalBackground" @close-modal="(n) => { console.log(m); showTilingModal = n}"/>
</template>

<script>
    export default {
        data() {
            return {
                mainCanvas: {},
                mainCanvasWidth: 512,
                downloadCanvas: {},
                downloadDpi: 96,
                downloadInches: 4,
                downloadCanvasWidth: 384,
                noiseMaker: {},
                waitingForNoise: false,
                pixelMaker: {},
                waitingForPixels: false,
                gridSize: 256,
                grid: [],
                mainNoise: {},
                downloadNoise: {},
                baseFrequency: 4,
                baseFrequencyOptions: {
                    1: {id: 1, val: 4},
                    2: {id: 2, val: 8},
                    3: {id: 3, val: 16},
                    4: {id: 4, val: 32},
                    5: {id: 5, val: 64},
                    //6: {id: 6, val: 128},
                    //7: {id: 7, val: 256},
                },
                octaves: 1,
                octaveOptions: {
                    1: {id: 1, val: 1},
                    2: {id: 2, val: 2},
                    3: {id: 3, val: 3},
                },
                scalar: 1,
                numberOfColors: 2,
                message: 'Standing By...',
                showMessage: true,
                //mainPixelData: {},
                showDownloadDialogue: false,
                dpiOptions: {
                    1: {id: 96, val: 96},
                    2: {id: 150, val: 150},
                    3: {id: 200, val: 200},
                    4: {id: 300, val: 300}
                },
                //downloadPixelData: {},
                fileName: '',
                fileNameWarning: ' * ',
                colors: [
                    {
                        value: '#000000',
                        r: 0,
                        g: 0,
                        b: 0
                    },
                    {
                        value: '#ffffff',
                        r: 255,
                        g: 255,
                        b: 255
                    }
                ],
                showTilingModal: false,
                modalBackground: ''
            }
        },
        async mounted() {
            let c1 = document.getElementById("main-canvas");
            let ctx1 = c1.getContext("2d");    
            this.mainCanvas = ctx1;
            let c2 = document.getElementById("download-canvas");
            let ctx2 = c2.getContext("2d");
            this.downloadCanvas = ctx2;

            this.noiseMaker = new Worker('perlinNoiseMaker.js')
            this.pixelMaker = new Worker('pixelMaker.js')
            this.noiseMaker.addEventListener("message", (message) => {
                const type = message.data.type
                if (type === 'percent') {
                   // console.log("MAIN RECIEVED PERCENT MESSAGE FROM NOISEMAKER: ", message.data.data);
                }
                if (type === 'noise') {
                    this.waitingForNoise = false;
                    this.noise = JSON.parse(message.data.data);
                    console.log("MAIN RECIEVED NOISE MESSAGE FROM NOISEMAKER FOR: ", message.data.forCanvas, this.noise.values.length);
                    this.makePixels(this.pixelMaker, this.noise, message.data.forCanvas);
                }
            })
            this.pixelMaker.addEventListener("message", (message) => {
                const type = message.data.type
                if (type === 'percent') {
                  //  console.log("MAIN RECIEVED PERCENT MESSAGE FROM PIXELMAKER: ", message.data.data);
                }
                if (type === 'pixels') {
                    this.waitingForPixels = false;
                    this.message = 'Standing By...',
                    this.showMessage = false;
                    const pixels = JSON.parse(message.data.data);
                    const Uint8Pixels = new Uint8ClampedArray(pixels.length);
                    for (let i = 0; i < pixels.length; i++) {
                        Uint8Pixels[i] = Math.round(pixels[i])
                    }
                    console.log("MAIN RECIEVED PIXELS MESSAGE FROM PIXELMAKER FOR: ", message.data.forCanvas, pixels.length);
                    this.addPixelsToCanvas(Uint8Pixels, message.data.forCanvas);
                }
            })
            await this.makeGrid();
            this.makeNoise(this.noiseMaker, 'main-canvas');
        },
        watch: {
            baseFrequency: function() {
                this.makeNoise(this.noiseMaker, 'main-canvas');
            },
            octaves: function() {
                this.makeNoise(this.noiseMaker, 'main-canvas');
            },
            numberOfColors: function(value) {
                if (value === this.colors.length) return;
                if (value < this.colors.length) {
                    this.colors = this.colors.slice(0, value)
                }
                if(value > this.colors.length) {
                    for (let i=this.colors.length; i < value; i++) {
                        this.colors.push({
                            value: (i % 2 === 1) ? '#ffffff' : '#000000',
                            r: (i % 2 === 1) ? 255 : 0,
                            g: (i % 2 === 1) ? 255 : 0,
                            b: (i % 2 === 1) ? 255 : 0
                        })
                    }
                }
                console.log('NEW COLORS: ', this.colors);
                this.makePixels(this.pixelMaker, this.noise, 'main-canvas')
            },
            downloadInches: function(value) {
                this.downloadCanvasWidth = value * this.downloadDpi;
            },
            downloadDpi: function(value) {
                this.downloadCanvasWidth = value * this.downloadInches;
            }
        },
        computed: {},
        methods: {
            makeGrid: async function () {
                console.log('CREATING GRID!')
                this.grid = [];
                // this.showMessage = true;
                // this.showHideMessage(true)
                this.grid = perlinUtils.makeGrid(this.gridSize);
            },

            makeNoise: function(noiseMaker, forCanvas) {
                this.message = 'Making Noise...'
                this.showMessage = true;
                console.log('MAKING NOISE!')
                const canvasWidth = (forCanvas === 'main-canvas') ? this.mainCanvasWidth : this.downloadCanvasWidth
                noiseMaker.postMessage([JSON.stringify(this.grid), this.gridSize, this.baseFrequency, this.octaves, this.scalar, canvasWidth, forCanvas])
                this.waitingForNoise = true;
            },

            handleResetGrid: async function() {
                this.message = 'Resetting Grid...'
                this.showMessage = true;
                await this.makeGrid();
                this.makeNoise(this.noiseMaker, 'main-canvas');
            },

            makePixels: function(pixelMaker, noise, forCanvas) {
                this.message = 'Making Pixels...';
                this.showMessage = true;
                console.log('MAKING PIXELS!', pixelMaker, noise.values[0]);
                pixelMaker.postMessage([JSON.stringify(noise), JSON.stringify(this.colors), forCanvas])
                this.waitingForPixels = true;
            },

            showHideMessage: async function(value) {
                this.showMessage = value
            },

            handleScalarChange: function() {
                this.makeNoise(this.noiseMaker, 'main-canvas');
            },

            addPixelsToCanvas(pixels, forCanvas) {
                console.log('ADDING PIXELS TO CANVAS: ', forCanvas);
                if (forCanvas === 'main-canvas') {
                    let imageData = this.mainCanvas.createImageData(this.mainCanvasWidth, this.mainCanvasWidth);
                    imageData.data.set(pixels);
                    this.mainCanvas.putImageData(imageData, 0, 0);
                } else if (forCanvas === 'download-canvas') {
                    console.log(this.downloadCanvasWidth);
                    let imageData = this.downloadCanvas.createImageData(this.downloadCanvasWidth, this.downloadCanvasWidth);
                    console.log(this.downloadCanvas)
                    console.log(imageData.data.length)
                    console.log(pixels.length)
                    imageData.data.set(pixels);
                    this.downloadCanvas.putImageData(imageData, 0, 0);
                    this.download();
                }

                // console.log("IMAGE DATA: ", imageData);
                // console.log('PIXELS: ', pixels);
        
                //imageData.data = pixels;
            },

            setCanvasSize: async function() {
                this.canvasWidth = this.numberOfPixels;
            },

            handleColorChange: async function(event) {
                let index = event.target.id.split('-')[1]
                let value = event.target.value
                this.colors[index].value = value;
                let rgb = utils.hexToRgb(value)
                this.colors[index].r = rgb[0];
                this.colors[index].g = rgb[1];
                this.colors[index].b = rgb[2];
                this.showHideMessage(true) 
                this.message = 'Making Pixels...'
                this.makePixels(this.pixelMaker, this.noise, 'main-canvas')
                // setTimeout( () => {
                //     this.setPixelData()
                //     .then(() => {
                //         this.updateCanvas()
                //     })
                //     .finally(() => {
                //         this.showHideMessage(false);
                //     })
                // }, 10);
            },

            handlePrepareDownloadClick: function() {
                this.showDownloadDialogue = true;
            },

            handleShowTilingModal: function() {
                this.modalBackground = this.makeFile('main-canvas')
                console.log(this.modalBackground)
                this.showTilingModal = true;
            },

            handleDownloadClick: function() {
                if (this.fileName === '') {
                    this.fileNameWarning = ' * File name is required.';
                    return;
                }
                this.makeNoise(this.noiseMaker, 'download-canvas')
            },

            makeFile: function(fromCanvas) {
                let canvas = document.getElementById(fromCanvas);
                return canvas.toDataURL('image/png');
            },

            download: function() {   
                const image = this.makeFile('download-canvas')
                image.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
                let link = document.createElement('a');
                link.download = this.fileName + '.png';
                console.log(link.download)
                link.href = image;
                link.click();
                this.resetDownloadDialogue();
            },

            resetDownloadDialogue: function() {
                this.showDownloadDialogue = false;
                this.downloadDpi = 96;
                this.downloadInches = 4;
                this.fileName = '';
            },
        }
    }
</script>

<style>
    #display-container {
        display: flex;
        width: 100%;
        /* border: 1px solid red; */
        box-sizing: border-box;
    }

    #message-container {
        display: block;
        text-align: center;
    }

    #message {
        color: white;
    }

    #message.hide {
        transition: opacity 1s linear 1.5s;
        opacity: 0;
    }

    #message.show {
        transition: opacity 1s linear;
        opacity: 1;
    }

    #main-canvas {
        border: 1px solid #CBD175;
        border-radius: 10px;
        width: 512px;
        height: 512px;
    }

    #download-canvas {
        display: none;
        width: 0;
        height: 0;
    }
    
    .flex-item {
        padding: .5rem 2rem;
        /* border: 1px solid red; */
    }

    .show-download-enter-active {
        transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
    }

    .show-download-leave-active {
        transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
    }

    .show-download-enter-from,
    .show-download-leave-to {
        opacity: 0;
    }

    .control-item {
        margin-bottom: 10px;
    }
</style>


<!-- //setTimeout(() => {
    //     return perlin.makeGrid(this.gridSize)
    //     .then(data => {
    //         this.grid = data;
    //         return perlin.makeNoise(this.grid, this.gridSize, this.baseFrequency, this.octaves, this.scalar, this.numberOfPixels)
    //     })
    //     .then(data => {
    //         this.noise = data;
    //         console.log(this.noise.min, this.noise.max, this.noise.scaledMin, this.noise.scaledMax, this.noise.values[10])
    //     })
    //     .then(() => {
    //         this.setPixelData();
    //     })
    //     .then(() => {
    //         this.updateCanvas()
    //     })
    //     .finally(() => {
    //         this.showHideMessage(false)
    //     })
    // }, 10); -->

    <!-- //this.showHideMessage(true) 
                // setTimeout(() => {
                //     perlin.makeNoise(this.grid, this.gridSize, this.baseFrequency, this.octaves, this.scalar, this.numberOfPixels)
                //     .then(data => {
                //         this.noise = data;
                //         console.log(this.noise.min, this.noise.max, this.noise.scaledMin, this.noise.scaledMax, this.noise.values[10]);
                //     })
                //     .then(() => {
                //         this.setPixelData();
                //     })
                //     .then(() => {
                //         this.updateCanvas()
                //     })
                //     .finally(() => {
                //         this.showHideMessage(false);
                //     })
                // }, 10); -->

                <!-- handleNumberOfColorsChange: async function(event) {
                    let value = event.target.value;
                    if (value === this.colors.length) return;
                    if (value < this.colors.length) {
                        this.colors = this.colors.slice(0, value)
                    }
                    if(value > this.colors.length) {
                        for (let i=0; i <= value - this.colors.length; i++) {
                            this.colors.push({
                                value: '#ffffff',
                                r: 255,
                                g: 255,
                                b: 255
                            })
                        }
                    }
                    this.showHideMessage(true) 
                    setTimeout( () => {
                        this.setPixelData()
                        .then(() => {
                            this.updateCanvas()
                        })
                        .finally(() => {
                            this.showHideMessage(false);
                        })
                    }, 10);
                }, -->

                <!-- // setPixelData: async function() {
                    //     this.pixelData = this.mainCanvas.createImageData(this.numberOfPixels, this.numberOfPixels);
                    //     for (let i=0; i<this.noise.values.length; i++) {
                    //         let x = this.noise.values[i].x;
                    //         let y = this.noise.values[i].y;
                    //         let value = this.noise.values[i].scaledValue;
                    //         let band = utils.clamp(Math.floor((this.colors.length - 1) * value), 0, this.colors.length - 2);
                    //         let bandWidth = 1 / (this.colors.length - 1)
                    //         let mappedValue = utils.mapNumberRange(value, band * bandWidth, (band + 1) * bandWidth, 0, 1);
                    //         let r = utils.linearInterpolate(this.colors[band].r, this.colors[band + 1].r, mappedValue);
                    //         let g = utils.linearInterpolate(this.colors[band].g, this.colors[band + 1].g, mappedValue);
                    //         let b = utils.linearInterpolate(this.colors[band].b, this.colors[band + 1].b, mappedValue);
                    //         this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 0] = r;
                    //         this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 1] = g;
                    //         this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 2] = b;
                    //         this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 3] = 255;
                    //     }
                    // }, -->

                    <!-- // updateCanvas: async function() {
                        //     await this.setCanvasSize();
                        //     this.mainCanvas.putImageData(this.pixelData, 0, 0);
                        // },
             -->