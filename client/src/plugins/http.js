// 插件模块
import axios from 'axios'
import { Loading, Message } from 'element-ui'
import router from 'vue-router'
const myHttpServer = {}

myHttpServer.install = function (Vue) {

	axios.defaults.baseURL = 'http://localhost:3000/api'
  // 添加实例方法
  Vue.prototype.$http = axios
}

// 

let loading
function startLoading () {
	loading = Loading.service({
		lock: true,
		text: '加载中',
		background: 'rgba(0,0,0,0,7)'
	})
}

function endLoading () {
	loading.close()
}

// 请求拦截
 axios.interceptors.request.use(config => {
	 // 加载动画
	 startLoading()
	// console.log(config)
	 if (localStorage.token) {
		// 设置统一的请求头 header
		config.headers.Authorization = localStorage.token
	 }
	 return config
 }, error => {	
	 	// 
		Message.error('登录已过期，请重新登录！')
		// 跳转到登录页面
		this.$router.push('/login')
	 return Promise.reject(error)
 })

// 响应拦截
axios.interceptors.response.use(response => {
	// 结束加载动画
	endLoading()
	return response
}, error => {
	endLoading()
	Message.error(error.response.data)
	// 获取错误状态码
	const{ status } = error.response;
	if(status == 401) {
		Message.error('登录已过期，请重新登录！')
		// 清除 token
		localStorage.removeItem('token')
		// 跳转到登录页面
		this.$router.push('/login')
	};
	return Promise.reject(error)
	
})
export default myHttpServer