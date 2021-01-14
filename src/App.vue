<template>
  <div id="app">
    <h1 class="text-2xl text-center">
        Vue.js, d3.js and tailwind CSS Sample Group selection demo
    </h1>

    <div class="mb-4">
        <h1 class="text-xl">Description</h1>
        <div class="ml-4">
            <p>This demo combines a couple of things.</p>
            <p>Use of SVG to draw plates, edit the plate geometry and click "Update Plate Geometry" to see changes.</p>
            <p>Drop width and height are scaling factors 0-1 to accurately reflect different plate types).</p>
            <p>Clicking on each cell shows how we could add sample to a SampleGroup. Selected sample ids shown above the plate view.</p>
            <p>Changing the colour scale demonstrates the use of different filters (viridis, rgb, threshold).</p>
            <p>Threshold is shown as a percentage and filters "scores" from 0.0 - 1.0 (100%).</p>    
        </div>
    </div>
    <containers-view/>
  </div>
</template>

<script>
import './main.css';
import Containers from './components/Containers.vue'

export default {
  name: 'App',
  components: {
    'containers-view': Containers
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
