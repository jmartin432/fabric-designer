<template>
    <div>
        <div>
            <h3>Download</h3>
        </div>
        <button class="control-item" @click="handleShowTilingModal">Show Tiling</button>
        <button class="control-item" @click="handleShowDownloadDialogue">Prepare Download</button>
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
                <button class="control-item" @click="handleDownloadClick">Download</button>
            </div>
        </Transition>
    </div>
</template>

<script>
export default {
        data() {
            return {
                
                downloadDpi: 96,
                downloadInches: 4,
                showDownloadDialogue: false,
                dpiOptions: {
                    1: {id: 96, val: 96},
                    2: {id: 150, val: 150},
                    3: {id: 200, val: 200},
                    4: {id: 300, val: 300}
                }
            }
        },
        watch: {
            downloadInches: function(value) {
                //emit change event
                this.downloadCanvasWidth = value * this.downloadDpi;
            },
            downloadDpi: function(value) {
                //emit change event
                this.downloadCanvasWidth = value * this.downloadInches;
            }
        },
        computed: {
            downloadCanvasWidth: function() {
                return this.downloadInches * this.downloadDpi;
            }
        },
        methods: {
            handleShowDownloadDialogue: function() {
                this.showDownloadDialogue = !this.showDownloadDialogue;
                console.log(this.showDownloadDialogue)
            },
            handleDownloadClick: function() {
                this.$emit('downloadClick', this.downloadCanvasWidth);
            },
            handleShowTilingModal: function() {
                this.$emit('showTilingModal', true);
            },
            resetDownloadDialogue: function() {
                this.showDownloadDialogue = false;
                this.downloadDpi = 96;
                this.downloadInches = 4;
            },
        }
    }
</script>

<style>
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

</style>