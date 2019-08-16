<template>
  <el-aside width="200px">
    <el-menu :router="true" :unique-opened="true">
      <el-submenu index="1">
        <template slot="title">
          <div class="aside">
            <i class="el-icon-user-solid"></i>
            <span>用户管理</span>
          </div>
        </template>
        <el-menu-item index="students">学生列表</el-menu-item>
        <el-menu-item index="teachers">教师列表</el-menu-item>
      </el-submenu>
      <el-submenu index="2">
        <template slot="title">
          <div class="aside">
            <i class="el-icon-s-order"></i>
            <span>权限管理</span>
          </div>
        </template>
        <el-menu-item index="roles">角色列表</el-menu-item>
        <el-menu-item index="accesss">权限列表</el-menu-item>
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">
          <div class="aside">
            <i class="el-icon-s-tools"></i>
            <span>课程管理</span>
          </div>
        </template>
        <el-menu-item index="allcourse">课程列表</el-menu-item>
      </el-submenu>
      <el-submenu index="4">
        <template slot="title">
          <div class="aside">
            <i class="el-icon-s-tools"></i>
            <span>数据统计</span>
          </div>
        </template>
        <el-menu-item index="#">选课情况</el-menu-item>
      </el-submenu>
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
