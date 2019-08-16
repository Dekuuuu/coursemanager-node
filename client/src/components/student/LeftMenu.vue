<template>
  <el-aside width="200px">
    <el-menu :router="true">
      <el-menu-item index="courselist">
        <div class="aside">
          <i class="el-icon-s-tools"></i>
          <span slot="title">所有课程</span>
        </div>
      </el-menu-item>
      <el-menu-item index="mycourse">
        <div class="aside">
          <i class="el-icon-user-solid"></i>
          <span slot="title">我的课程</span>
        </div>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: "LeftMenu"
};
</script>

<style scoped>
.el-aside {
  /* background-color: #d3dce6; */
  color: #333;
  text-align: center;
  line-height: 200px;
}
.aside {
  margin-left: -50px;
}
</style>
