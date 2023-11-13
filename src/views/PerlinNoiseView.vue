<script setup>
    import Vector2 from "../classes/Vector2";
    import Perlin from "../classes/Perlin";
</script>

<!-- https://github.com/joeiddon/perlin/tree/master -->
<!-- https://rtouti.github.io/graphics/perlin-noise-algorithm -->
<!-- https://adrianb.io/2014/08/09/perlinnoise.html -->
<!-- https://sighack.com/post/getting-creative-with-perlin-noise-fields -->
<template>
    <div id="container">
        <div id="canvas-container" class="flex-item">
            <canvas id="main-canvas" :width="numberOfPixels" :height="numberOfPixels"></canvas>
        </div>
        <div class="flex-item">
            <button  class="control-item" @click="seed">Reseed</button>
            <div class="control-item">
                <label for="grid-size">Grid Size</label>
                <select name="grid-size" id="grid-size-selector" v-model="numberOfGrids">
                    <option v-for="item in gridNumberOptions" :value="item.val" :key="item.id">
                        {{ item.val }}
                    </option>
                </select>
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
                perlin: {},
                gridNumberOptions: {
                    1: {id: 1, val: 4},
                    2: {id: 2, val: 8},
                    3: {id: 3, val: 16},
                    4: {id: 4, val: 32},
                    5: {id: 5, val: 64},
                },
                numberOfGrids: 4,
                numberOfPixels: 512,
                vueCanvas: {},
                pixelData: {},
                fileName: '',
                fileNameWarning: ' * '
            }
        },
        watch: {
            numberOfGrids: function(value) {
                // If "pageData" ever changes, then we will console log its new value.
                console.log(value);
                this.seed(value);
                this.getPerlinNoise();
            }
        },
        mounted() {
            this.perlin = new Perlin(this.numberOfGrids, this.numberOfPixels)
            var mainCanvas = document.getElementById("main-canvas");
            console.log(mainCanvas)
            var ctx = mainCanvas.getContext("2d");    
            this.vueCanvas = ctx;
            this.pixelData = this.vueCanvas.createImageData(this.numberOfPixels, this.numberOfPixels);
            console.log(this.pixelData)
            this.getPerlinNoise();
        },
        methods: {
            seed: function() {
                console.log('click')
                this.perlin.seed(this.numberOfGrids);
                this.getPerlinNoise();
            },
            download: function() {
                console.log('download');
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

            hslToRgb: function(hue, sat, light) {
                hue = hue % 360;

                if (hue < 0) {
                    hue += 360;
                }

                sat /= 100;
                light /= 100;

                function f(n) {
                    let k = (n + hue / 30) % 12;
                    let a = sat * Math.min(light, 1 - light);
                    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
                }

                return [f(0) * 255, f(8) * 255, f(4) * 255];
            },
            getPerlinNoise: function() {
                const gridSize = this.numberOfPixels / this.numberOfGrids;
                for (let x = 0; x < this.numberOfPixels; x++){
                    for (let y = 0; y < this.numberOfPixels; y++){
                        let value = (this.perlin.get(x / gridSize, y / gridSize) + 1 / 2);
                        let rgbColor = this.hslToRgb(value * 240 + 20, 100, 50)
                        let redEffect = .4
                        let greenEffect = .99
                        let blueEffect = .4
                        this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 0] = (.3 * (1 - value ) + .7) * redEffect * 255;
                        this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 1] = value * greenEffect * 255;
                        this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 2] = (.5 * (1 - value) + .5) * blueEffect * 255;
                        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 0] = rgbColor[0];
                        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 1] = rgbColor[1];
                        // this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 2] = rgbColor[2];
                        this.pixelData.data[x * (this.numberOfPixels * 4) + y * 4 + 3] = 255;
                    
                    }
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

    #grid-size-selector {
        width: 70px;
    }
</style>