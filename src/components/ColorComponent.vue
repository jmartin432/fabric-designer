<script setup>
    import * as utils from '../modules/utils.js';
</script>

<template>
    <div>
        <div>
            <h3>Colors</h3>
        </div>
        <div class="control-item">
            <label for="number-of-colors">Number of Colors</label>
            <select name="number-of-colors" id="number-of-colors" class="number-select" v-model="numberOfColors">
                <option v-for="index in 10" :value="index + 1" :key="index + 1">
                    {{ index + 1 }}
                </option>
            </select>
        </div>
        <div class="control-item">
                    <label for="color-interpolation">Color Interpolation</label>
                    <select 
                        name="color-interpolation" 
                        id="color-interpolation" 
                        class="text-select" 
                        v-model="colorInterpolation">
                        <option v-for="item in colorInterpolationOptions" :value="item.val" :key="item.id">
                            {{ item.val }}
                        </option>
                    </select>
                </div>
        <div id="color=pickers">
            <div v-for="(item, index) in colors" :key=index class="control-item">
                <label for="head">Color {{ index }}</label>
                <input 
                    type="color" 
                    :id="'color-' + index" 
                    :name="'color-' + index" 
                    v-model="colors[index].value" 
                    @input="handleColorChange"/>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        emits: ['colorChange', 'colorInterpolationChange'],
        data() {
            return {
                numberOfColors: 2,
                colorInterpolation: 'linear',
                colorInterpolationOptions: {
                    1: {id: 'linear', val: 'linear'},
                    2: {id: 'cosine', val: 'cosine'}
                },
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
            numberOfColors: function(value) {
                if (value === this.colors.length) return;
                if (value < this.colors.length) {
                    this.colors = this.colors.slice(0, value)
                }
                if(value > this.colors.length) {
                    for (let i=this.colors.length; i < value; i++) {
                        this.colors.push({
                            value: (i % 2 === 1) ? '#ffffff' : '#000000',
                            rgb: (i % 2 === 1) ? [255, 255, 255] : [0, 0, 0],
                        })
                    }
                }
                console.log('NEW COLORS: ', this.colors);
            },
            colorInterpolation: function(value) {
                this.$emit('colorInterpolationChange', value)
            }
        },
        methods: {
            handleColorChange: async function(event) {
                let index = event.target.id.split('-')[1]
                let value = event.target.value
                this.colors[index].value = value;
                this.colors[index].rgb = utils.hexToRgb(value);
                console.log('NEW COLORS: ', this.colors);
                this.$emit('colorChange', this.colors.map(color => color) )
            }
        }
    }
</script>

<style>
</style>