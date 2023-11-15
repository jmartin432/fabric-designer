<template>
    <Transition name="show">
        <div v-if="show" id="tiling-modal-container" :style="styles">
            <button  class="control-item" @click="$emit('closeModal', false)">Close</button>
        </div>
    </Transition>
</template>

<script>;
    export default {
        props: {
            show: {
                type: Boolean,
                default: false
            },
            background: {
                type: String,
            }
        },
        data: function() {
            return {
                tileWidth: window.innerWidth * .2
            }
        },
        mounted() {},
        computed: {
            styles: function() {
                return {
                    display: this.show ? 'block' : 'none',
                    backgroundImage: 'url(' + this.background + ')',
                    backgroundRepeat: 'repeat',
                    backgroundSize: this.tileWidth + 'px ' + this.tileWidth + 'px'

                }
            }
        },
        watch : {
            background: function () {
                let image = new Image;
                image.src = this.background;
                console.log(image.url)
            }
        }
    }
</script>
<style>
    #tiling-modal-container{
        z-index: 10;
        box-sizing: border-box;
        position: absolute;
        top: 5%;
        left: 5%;
        border: 1px solid black;
        border-radius: 10px;
        width: 90%;
        height: 90%;
        margin: auto;
        padding: 1rem;
    }

    .show-enter-active,
    .show-leave-active {
        transition: opacity 0.5s ease;
    } 

    .show-enter-from,
    .show-leave-to {
        opacity: 0;
    }
</style>