<script setup>
    import * as perlin from '../modules/perlin.js';
    import * as utils from '../modules/utils';
</script>

<template>
    <div id="container">
        <div id="canvas-container" class="flex-item">
            <canvas id="main-canvas" :width="numberOfPixels" :height="numberOfPixels"></canvas>
        </div>
        <div class="flex-item">
            <button  class="control-item" @click="resetGrid">Reseed</button>
            <div class="control-item">
                <label for="grid-size">Base Frequency</label>
                <select name="grid-size" id="grid-size-selector" class="number-select" v-model="baseFrequency">
                    <option v-for="item in baseFrequencyOptions" :value="item.val" :key="item.id">
                        {{ item.val }}
                    </option>
                </select>
            </div>
            <div class="control-item">
                <label for="number-of-colors">Number of Colors</label>
                <select name="number-of-colors" id="number-of-colors" class="number-select" :value="colors.length" @change="updateNumberOfColors">
                    <option v-for="index in 10" :value="index + 1" :key="index + 1">
                        {{ index + 1 }}
                    </option>
                </select>
            </div>
            <div id="color=pickers">
                <div v-for="(item, index) in colors" :key=index class="control-item">
                    <label for="head">Color {{ index }}</label>
                    <input type="color" :id="'color-' + index" :name="'color-' + index" v-model="colors[index].value" @input="changeColor"/>
                </div>
            </div>
        </div>
        <div class="flex-item">
            <div class="control-item">
                <div class="input-label">
                    <label for="file-name-input">File Name<span>{{ fileNameWarning }}</span></label>
                </div>
                <input 
                    required 
                    type="text" 
                    id="file-name-input" 
                    placeholder="File Name" 
                    v-model="fileName"
                />
            </div>
            <button class="control-item" @click="download">Download</button>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                grid: [],
                noise: [],
                gridSize: 16,
                baseFrequencyOptions: {
                    1: {id: 1, val: 4},
                    2: {id: 2, val: 8},
                    3: {id: 3, val: 16},
                    4: {id: 4, val: 32},
                    5: {id: 5, val: 64},
                    6: {id: 6, val: 128},
                    // 7: {id: 7, val: 256},
                },
                scalar: 1,
                baseFrequency: 4,
                octaves: 1,
                numberOfPixels: 512,
                vueCanvas: {},
                pixelData: {},
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
                ]
            }
        },
        mounted() {
            var mainCanvas = document.getElementById("main-canvas");
            var ctx = mainCanvas.getContext("2d");    
            this.vueCanvas = ctx;
            this.pixelData = this.vueCanvas.createImageData(this.numberOfPixels, this.numberOfPixels);
            this.resetGrid();
        },
        watch: {
            baseFrequency: function(value) {
                perlin.makeNoise(this.grid, this.gridSize, value, this.octaves, this.scalar, this.numberOfPixels, ).then(data => {
                    this.noise.data = data;
                    this.setPixelData();
                })
            }
        },
        computed: {
            numberOfColors: function() {
                return this.colors.length;
            }
        },
        methods: {
            resetGrid: function () {
                perlin.makeGrid(this.gridSize).then(data => {
                    this.grid = data;
                    console.log(data)
                    perlin.makeNoise(data, this.scalar, this.numberOfPixels).then(data => {
                        this.noise.data = data;
                        this.setPixelData();
                    })
                })
            },

            resetNoise: function() {
                console.log('click')
                perlin.makeNoise(this.noise.grid, this.scalar, this.numberOfPixels).then(data => {
                    this.noise.data = data;
                    this.setPixelData();
                })
            },

            download: function() {
                if (this.fileName === '') {
                    this.fileNameWarning = ' * File name is required.';
                    return;
                }
                let canvas = document.getElementById("main-canvas");
                let image = canvas.toDataURL('image/png');
                image = image.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
                var link = document.createElement('a');
                link.download = this.fileName + '.png';
                link.href = image;
                link.click();
            },

            changeColor: function(event) {
                let index = event.target.id.split('-')[1]
                let value = event.target.value
                this.colors[index].value = value;
                let rgb = utils.hexToRgb(value)
                this.colors[index].r = rgb[0];
                this.colors[index].g = rgb[1];
                this.colors[index].b = rgb[2];
                this.setPixelData();
            },

            updateNumberOfColors: function(event) {
                let value = event.target.value;
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
                this.setPixelData();
            },

            setPixelData: function() {
                for (let i=0; i<this.noise.data.length; i++) {
                    let x = this.noise.data[i].x;
                    let y = this.noise.data[i].y;
                    let value = this.noise.data[i].scaledValue;
                    let band = utils.clamp(Math.floor((this.colors.length - 1) * value), 0, this.colors.length - 2);
                    let bandWidth = 1 / (this.colors.length - 1)
                    let mappedValue = utils.mapNumberRange(value, band * bandWidth, (band + 1) * bandWidth, 0, 1);
                    let r = utils.linearInterpolate(this.colors[band].r, this.colors[band + 1].r, mappedValue);
                    let g = utils.linearInterpolate(this.colors[band].g, this.colors[band + 1].g, mappedValue);
                    let b = utils.linearInterpolate(this.colors[band].b, this.colors[band + 1].b, mappedValue);
                    this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 0] = r;
                    this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 1] = g;
                    this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 2] = b;
                    this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 3] = 255;
                }
                this.vueCanvas.putImageData(this.pixelData, 0, 0);
            }
        }
    }
</script>

<style>
    #container {
        display: flex;
        width: 100%;
        /* border: 1px solid red; */
        box-sizing: border-box;
    }

    #main-canvas {
        border: 1px solid black;
        width: 512px;
        height: 512px;
    }
    
    .flex-item {
        padding: .5rem 2rem;
        /* border: 1px solid red; */
    }

    .control-item {
        margin-bottom: 10px;
    }
</style>