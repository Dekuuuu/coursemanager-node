import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import myServerHttp from '@/plugins/http.js'
import MyBread from '@/components/cuscom/MyBread.vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 使用 vue 插件
Vue.use(ElementUI)
// 使用 axios
Vue.use(myServerHttp)

Vue.config.productionTip = false

// 全局定义面包屑组件
Vue.component(MyBread.name, MyBread)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
