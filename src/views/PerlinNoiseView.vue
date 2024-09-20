<script setup>
    import * as perlinUtils from '../modules/perlinUtils.js';
    import * as utils from '../modules/utils.js';
    import TilingModal from '../components/TilingModal.vue'
    import ColorComponent from '../components/ColorComponent.vue'
    import DownloadComponent from '../components/DownloadComponent.vue'
    import PerlinControls from '../components/PerlinControls.vue';
</script>

<template>
    <div id="container">
        <div id="message-container">
            <p id="message" :class="showMessage ? 'show' : 'hide'">{{ message }}</p>
        </div>
    <div id="display-container">
            <canvas id="download-canvas" :width="downloadCanvasWidth" :height="downloadCanvasWidth"></canvas>
            <div id="canvas-container" class="flex-item">
                <canvas id="main-canvas" :width="mainCanvasWidth" :height="mainCanvasWidth"></canvas>
            </div>
            <div class="flex-item">
                <PerlinControls 
                    @base-frequency-change="handleBaseFrequencyChange"
                    @octaves-change="handleOctavesChange"
                    @scalar-change="handleScalarChange"
                    @reset-grid="handleResetGrid"/>
            </div>
            <div class="flex-item">
                <ColorComponent 
                    @color-change="(n) => { console.log('COLORS', this.colors); this.colors = n.map(color => color) }"
                    @color-interpolation-change="(n) => { console.log('COLOR INTERP', n); this.colorInterpolation = n }"/>
            </div>
            <div class="flex-item">
                <DownloadComponent 
                    @download-click="(n) => console.log('DOWNLOAD', n)"
                    @show-tiling-modal="(n) => { console.log('MODAL', n); this.showTilingModal = n }"/>
            </div>
        </div>
    </div>
    <TilingModal 
        :show="showTilingModal" 
        :background="modalBackground" 
        @close-tiling-modal="(n) => { this.showTilingModal = n }"/>
</template>

<script>
    export default {
        data() {
            return {
                mainCanvas: {},
                mainCanvasWidth: 512,
                downloadCanvas: {},
                gridMaker: {},
                noiseMaker: {},
                pixelMaker: {},
                waitingForGrid: false,
                waitingForNoise: false,
                waitingForPixels: false,
                gridSize: 256,
                grid: [],
                mainNoise: {},
                downloadNoise: {},
                baseFrequency: 4,
                octaves: 1,
                scalar: 1,
                message: 'Standing By...',
                showMessage: false,                
                showTilingModal: false,
                modalBackground: '',
                colorInterpolation: 'linear',
                colors: [
                    {
                        value: '#000000',
                        rgb: [0, 0, 0]
                    },
                    {
                        value: '#ffffff',
                        rgb: [255, 255, 255]
                    }
                ],

            }
        },
        watch: {
            colors: {
                handler() {
                    console.log("RECEIVED NEW COLORS")
                    this.makePixels('main-canvas')
                },
                deep: true
            }
        },
        computed: {},
        methods: {
            makeGrid: function () {
                console.log('CREATING GRID!')
                this.message = 'Making Grid...'
                this.grid = [];
                this.showMessage = true;
                this.waitingForGrid = true;
                this.gridMaker.postMessage(this.gridSize)
            },

            makeNoise: function(forCanvas) {
                this.message = 'Making Noise...'
                this.showMessage = true;
                this.waitingForNoise = true;
                console.log('MAKING NOISE!')
                const canvasWidth = (forCanvas === 'main-canvas') ? this.mainCanvasWidth : this.downloadCanvasWidth
                this.noiseMaker.postMessage([JSON.stringify(this.grid), this.gridSize, this.baseFrequency, this.octaves, this.scalar, canvasWidth, forCanvas]);
            },

            makePixels: function(forCanvas) {
                this.message = 'Making Pixels...';
                this.showMessage = true;
                this.waitingForPixels = true;
                console.log('MAKING PIXELS!');
                this.pixelMaker.postMessage([JSON.stringify(this.noise), JSON.stringify(this.colors), this.colorInterpolation, forCanvas])
            },

            handleBaseFrequencyChange: function(event) {
                console.log('BASE FREQ', event);
            },

            handleOctavesChange: function(event) {
                console.log('OCTAVES', event);
            },

            handleScalarChange: function(event) {
                console.log('SCALAR', event);
            },

            showHideMessage: async function(value) {
                this.showMessage = value
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
            },

            handleShowTilingModal: function() {
                this.modalBackground = this.makeFile('main-canvas')
                console.log(this.modalBackground)
                this.showTilingModal = true;
            },
            
            makeFile: function(fromCanvas) {
                let canvas = document.getElementById(fromCanvas);
                return canvas.toDataURL('image/png');
            },
            download: function() { 
                console.log('here')  
                const image = this.makeFile('download-canvas')
                image.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
                let link = document.createElement('a');
                const colorString = this.colors.map((color) => color.value).join('-');
                let fileName = `${this.baseFrequency}-${this.octaves}-${this.scalar}-${this.colorInterpolation}-${colorString}`
                link.download = fileName + '.png';
                link.href = image;
                link.click();
                this.resetDownloadDialogue();
            },
            addWorkerEventListeners: function() {
                this.gridMaker.addEventListener("message", (message) => {
                    const type = message.data.type;
                    if (type === 'grid') {
                        this.waitingForGrid = false;
                        this.grid = JSON.parse(message.data.data);
                        console.log('RECEIVED GRID FROM GRIDMAKER', this.grid);
                        this.makeNoise('main-canvas')
                    }
                })
                this.noiseMaker.addEventListener("message", (message) => {
                    const type = message.data.type;
                    if (type === 'percent') {
                    console.log("NOISEMAKER PERCENT: ", message.data.data);
                    }
                    if (type === 'noise') {
                        this.waitingForNoise = false;
                        this.noise = JSON.parse(message.data.data);
                        console.log("RECIEVED NOISE FROM NOISEMAKER FOR: ", message.data.forCanvas, this.noise.values.length);
                        this.makePixels(message.data.forCanvas);
                    }
                })
                this.pixelMaker.addEventListener("message", (message) => {
                    const type = message.data.type
                    if (type === 'percent') {
                    console.log("PIXELMAKER PERCENT: ", message.data.data);
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
                        console.log("RECIEVED PIXELS FROM PIXELMAKER FOR: ", message.data.forCanvas, pixels.slice(100));
                        this.addPixelsToCanvas(Uint8Pixels, message.data.forCanvas);
                    }
                })
            }
        },
        mounted() {
            let c1 = document.getElementById("main-canvas");
            let ctx1 = c1.getContext("2d");    
            this.mainCanvas = ctx1;
            let c2 = document.getElementById("download-canvas");
            let ctx2 = c2.getContext("2d");
            this.downloadCanvas = ctx2;
            this.gridMaker = new Worker('gridMaker.js')
            this.noiseMaker = new Worker('perlinNoiseMaker.js')
            this.pixelMaker = new Worker('pixelMaker.js')
            this.addWorkerEventListeners();
            this.gridMaker.postMessage([this.gridSize])
        },
    }
</script>

<style>
    #display-container {
        display: flex;
        width: 100%;
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
    .control-item {
        margin-bottom: 10px;
    }
</style>