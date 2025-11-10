// main.js/ts
import {createApp} from 'vue'
import {createBootstrap} from 'bootstrap-vue-next'

import facture from './facture.vue'
import table2 from './table2.vue'
import gpt from './gpt.vue'
import apk from './App.vue'

// Add the necessary CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

const app = createApp(apk)
app.use(createBootstrap()) // Important
app.mount('#app')