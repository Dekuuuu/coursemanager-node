<template>
	<div class="index">
			<HeadNav></HeadNav>
		<el-container>
			<LeftMenu></LeftMenu>	
      <el-main>
				 <router-view></router-view>
			</el-main>
  	</el-container>
	</div>
  
</template>

<script>
import HeadNav from './HeadNav'
import LeftMenu from './LeftMenu'

export default {
	name: 'student',
	components: {
		HeadNav,
		LeftMenu
	},
	data () {
		return {

		}
	},
	beforeCreate () {
		// 获取 token
		const token = localStorage.getItem('token')
		// if token 有 -> 继续渲染组件
		if(!token) {
			this.$router.push({name: 'login'})
		}

	},
	methods: {
		
	}
	
};
</script>

<style scoped>


.el-main {
  background-color: #e9eef3;
  color: #333;
  /* text-align: center; */
  /* line-height: 160px; */
}

.el-container {
  height: 729px;
}

.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}







/* aside */


</style>
