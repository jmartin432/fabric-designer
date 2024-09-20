<script setup>
</script>

<template>
     <div>
        <div>
            <h3>Controls</h3>
        </div>
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
    </div>
</template>

<script>
    export default {
        data() {
            return {  
                baseFrequency: 4,
                baseFrequencyOptions: {
                    1: {id: 1, val: 4},
                    2: {id: 2, val: 8},
                    3: {id: 3, val: 16},
                    4: {id: 4, val: 32},
                    5: {id: 5, val: 64},
                },
                octaves: 1,
                octaveOptions: {
                    1: {id: 1, val: 1},
                    2: {id: 2, val: 2},
                    3: {id: 3, val: 3},
                },
                scalar: 1
            }
        },
        watch: {
            baseFrequency: function(value) {
                this.$emit("baseFrequencyChange", value)
            },
            octaves: function(value) {
                this.$emit("octavesChange", value);
            },
            scalar: function(value) {
                this.$emit("scalarChange", value);
            }
        }, 
        methods: {
            handleResetGrid: function() {
                this.$emit("resetGrid")
            }
        }  
    }
</script>

<style>
</style>