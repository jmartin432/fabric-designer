<script setup>
    import * as perlinUtils from '../modules/perlinUtils.js';
    import * as utils from '../modules/utils.js';
    import TilingModal from '../components/TilingModal.vue'
</script>

<template>
    <div id="container">
            <div id="message-container">
                <p id="message" :class="showMessage ? 'show' : 'hide'">{{ message }}</p>
            </div>
        <div id="display-container">
            <div id="canvas-container" class="flex-item">
                <canvas id="main-canvas" :width="mainCanvasWidth" :height="mainCanvasWidth"></canvas>
            </div>
            <div class="flex-item">
                <div class="control-item">
                    <label for="x-frequencies">X Frequencies</label>
                    <select name="x-frequencies" id="x-frequencies-selector" class="number-select" v-model="xFrequenciesNumber">
                        <option v-for="index in 7" :value="index" :key="index">
                            {{ index }}
                        </option>
                    </select>
                </div>
                <div id="x-frequencies">
                    <div v-for="(item, index) in xFrequencies" :key="index" class="control-item">
                        <label :for="'x-frequency-' + index">Frequency {{ index + 1 }}: ({{ xFrequencies[index] }})</label>
                        <input 
                            type="range" 
                            :id="'x-frequency-' + index" 
                            :name="'x-frequency-' + index" 
                            v-model="xFrequencies[index]" 
                            @input="handleFrequencyChange"
                            min="1"
                            max="7"
                            step="1"
                        />
                    </div>
                </div>
                <div class="control-item">
                    <label for="y-frequencies">Y Frequencies</label>
                    <select name="y-frequencies" id="y-frequencies-selector" class="number-select" v-model="yFrequenciesNumber">
                        <option v-for="index in 7" :value="index" :key="index">
                            {{ index }}
                        </option>
                    </select>
                </div>
                <div id="y-frequencies">
                    <div v-for="(item, index) in yFrequencies" :key="index" class="control-item">
                        <label :for="'y-frequency-' + index">Frequency {{ index + 1 }}: ({{ yFrequencies[index] }})</label>
                        <input 
                            type="range" 
                            :id="'y-frequency-' + index" 
                            :name="'y-frequency-' + index" 
                            v-model="yFrequencies[index]" 
                            @input="handleFrequencyChange"
                            min="1"
                            max="7"
                            step="1"
                        />                    
                    </div>
                </div>
                <div class="control-item">
                    <label for="color-interpolation">Color Interpolation</label>
                    <select name="color-interpolation" id="color-interpolation" class="text-select" v-model="colorInterpolation">
                        <option v-for="item in colorInterpolationOptions" :value="item.val" :key="item.id">
                            {{ item.val }}
                        </option>
                    </select>
                </div>
                <div class="control-item">
                    <label for="number-of-colors">Number of Colors</label>
                    <select name="number-of-colors" id="number-of-colors" class="number-select" v-model="numberOfColors">
                        <option v-for="index in 10" :value="index + 1" :key="index + 1">
                            {{ index + 1 }}
                        </option>
                    </select>
                </div>
                <div id="color-pickers">
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
                        <!-- <div class="control-item">
                            <label for="file-name-input">File Name<span>{{ fileNameWarning }}</span></label>
                            <input 
                                required 
                                type="text" 
                                id="file-name-input" 
                                placeholder="File Name" 
                                v-model="fileName"
                            />
                        </div> -->
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
                wavesMaker: {},
                waitingForWaves: false,
                pixelMaker: {},
                waitingForPixels: false,
                xFrequenciesNumber: 1,
                xFrequencies: [4],
                yFrequenciesNumber: 1,
                yFrequencies: [4],
                mainWaves: {},
                downloadWaves: {},
                colorInterpolation: 'linear',
                colorInterpolationOptions: {
                    1: {id: 'linear', val: 'linear'},
                    2: {id: 'cosine', val: 'cosine'}
                },
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

            this.wavesMaker = new Worker('SineWavesMaker.js')
            this.pixelMaker = new Worker('pixelMaker.js')
            this.wavesMaker.addEventListener("message", (message) => {
                const type = message.data.type
                if (type === 'percent') {
                   // console.log("MAIN RECIEVED PERCENT MESSAGE FROM NOISEMAKER: ", message.data.data);
                }
                if (type === 'waves') {
                    this.waitingForNoise = false;
                    this.noise = JSON.parse(message.data.data);
                    console.log("MAIN RECIEVED NOISE MESSAGE FROM NOISEMAKER FOR: ", message.data.forCanvas, this.noise.values.length);
                    this.makePixels(this.pixelMaker, this.noise, this.colorInterpolation, message.data.forCanvas);
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
            this.makeWaves(this.wavesMaker, 'main-canvas');
        },
        watch: {
            xFrequenciesNumber: function(value) {
                if (value === this.xFrequencies.length) return;
                if (value < this.xFrequencies.length) {
                    this.xFrequencies = this.xFrequencies.slice(0, value)
                }
                if(value > this.xFrequencies.length) {
                    for (let i=this.xFrequencies.length; i < value; i++) {
                        this.xFrequencies.push(1)
                    }
                }
                this.makeWaves(this.wavesMaker, 'main-canvas');
            },
            yFrequenciesNumber: function(value) {
                if (value === this.yFrequencies.length) return;
                if (value < this.yFrequencies.length) {
                    this.yFrequencies = this.yFrequencies.slice(0, value)
                }
                if(value > this.yFrequencies.length) {
                    for (let i=this.yFrequencies.length; i < value; i++) {
                        this.yFrequencies.push(1)
                    }
                }
                this.makeWaves(this.wavesMaker, 'main-canvas');
            },
            colorInterpolation: function(value) {
                console.log(value)
                this.makePixels(this.pixelMaker, this.noise, this.colorInterpolation, 'main-canvas')
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
                this.makePixels(this.pixelMaker, this.noise, this.colorInterpolation, 'main-canvas')
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

            makeWaves: function(wavesMaker, forCanvas) {
                this.message = 'Making Waves...'
                this.showMessage = true;
                console.log('MAKING WAVES!')
                const canvasWidth = (forCanvas === 'main-canvas') ? this.mainCanvasWidth : this.downloadCanvasWidth
                wavesMaker.postMessage([JSON.stringify(this.xFrequencies), JSON.stringify(this.yFrequencies), canvasWidth, forCanvas])
                this.waitingForWaves = true;
            },

            handleFrequencyChange: function(event) {
                console.log(event.target.id[0])
                let index = event.target.id.split('-')[2]
                if (event.target.id[0] === 'x') {
                    this.xFrequencies[index] = event.target.value;
                    console.log(this.xFrequencies)
                } else {
                    this.yFrequencies[index] = event.target.value;
                    console.log(this.yFrequencies)
                }
                this.makeWaves(this.wavesMaker, 'main-canvas');
            },

            makePixels: function(pixelMaker, waves, colorInterpolation, forCanvas) {
                this.message = 'Making Pixels...';
                this.showMessage = true;
                console.log('MAKING PIXELS!', pixelMaker, waves.values[0]);
                pixelMaker.postMessage([JSON.stringify(waves), JSON.stringify(this.colors), colorInterpolation, forCanvas])
                this.waitingForPixels = true;
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
                this.makePixels(this.pixelMaker, this.noise, this.colorInterpolation, 'main-canvas')
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
                this.makeWaves(this.wavesMaker, 'download-canvas')
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
                let fileName = `(${this.xFrequencies.join('-')})-(${this.yFrequencies.join('-')})-(${this.colors.map((color) => color.value).join('-')})`
                link.download = fileName + '.png';
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