<template>
  <div class="login">
    <div class="manage_tip">
      <h1 class="title">后台管理系统</h1>
    </div>
    <div class="form_container">
      <el-form
        label-position="right"
        label-width="80px"
        :model="formUser"
        :rules="rules"
        ref="formData"
        class="loginForm"
      >
        <el-form-item style="margin-left: -40px">
          <span class="title">用户登录</span>
        </el-form-item>
        <div class="grid-content bg-purple-dark">
          <el-form-item label="账号" prop="pid">
            <el-input v-model="formUser.pid" placeholder="请输入学号/工号"></el-input>
          </el-form-item>
        </div>

        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="formUser.password" placeholder="请输入密码"></el-input>
        </el-form-item>

        <el-form-item label="身份" prop="identity">
          <el-select v-model="formUser.identity" placeholder="请选择身份" style="width:100%">
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="学生" value="student"></el-option>
            <el-option label="管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-left:-40px">
          <el-button @click="handleLogin('formData')" type="primary" class="submit_btn">登 录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      formUser: {
        pid: "",
        password: "",
        identity: ""
      },
      rules: {
        pid: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur"
          }
        ],
        identity: [
          {
            required: true,
            message: "请选择身份",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    // 登录请求
    handleLogin(formName) {
      let path
      		switch (this.formUser.identity) {
      			case 'student':
      				path = '/users/studentlogin'
      				break
      			case 'teacher':
      				path = '/users/teacherlogin'
      				break
      			case 'admin':
      				path = '/users/adminlogin'
      				break
      		}
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http.post(path, this.formUser).then(res => {
						console.log(res)
						// token
						const { token } = res.data;
						window.localStorage.setItem('token', token)

            this.$message({
              message: "登录成功",
              type: "success"
						})
						this.$router.push({name: 'index'})
          }).catch(error => {
						this.$message({
              message: "登录失败，请检查账号密码",
              type: "warning"
						})
					})
        }
      });
    }
  }
};
</script>

<style scoped>
.login {
  position: relative;
  width: 100%;
  height: 100%;
  background: #324152;
  background-size: 100% 100%;
}
.form_container {
  width: 370px;
  height: 210px;
  position: absolute;
  top: 20%;
  left: 34%;
  padding: 25px;
  border-radius: 5px;
  /* text-align: center; */
}
.form_container {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  font-size: 30px;
  color: #fff;
}
.title {
  font-family: "Microsoft YaHei";
  font-weight: bold;
  font-size: 18px;
  color: black;
}
.loginForm {
  margin-top: 20px;
  background-color: #fff;
  padding: 20px 40px 20px 0;
  border-radius: 5px;
  box-shadow: 0px 5px 10px #cccc;
}

.submit_btn {
  width: 100%;
}
</style>
