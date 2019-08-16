<template>
  <el-card id="box-card">
    <el-dialog title="学生信息" :visible.sync="dialogAddStudent" width="600px">
      <el-form :model="dialogForm" label-position="right" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="dialogForm.pid"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="dialogForm.name"></el-input>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="dialogForm.grade" placeholder="请选择年级">
            <el-option label="初一" value="初一"></el-option>
            <el-option label="初二" value="初二"></el-option>
            <el-option label="初三" value="初三"></el-option>
            <el-option label="高一" value="高一"></el-option>
            <el-option label="高二" value="高二"></el-option>
            <el-option label="高三" value="高三"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddStudent = false">取 消</el-button>
        <el-button type="primary" @click="submit_update">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改学生信息" :visible.sync="dialogChangeStudent" width="600px">
      <el-form :model="changeForm" label-position="right" label-width="80px">
        <el-form-item label="学号">
          <el-input v-model="changeForm.pid"></el-input>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="changeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="changeForm.grade" placeholder="请选择年级">
            <el-option label="初一" value="初一"></el-option>
            <el-option label="初二" value="初二"></el-option>
            <el-option label="初三" value="初三"></el-option>
            <el-option label="高一" value="高一"></el-option>
            <el-option label="高二" value="高二"></el-option>
            <el-option label="高三" value="高三"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeStudent = false">取 消</el-button>
        <el-button type="primary" @click="submit_change(changeForm)">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="上传学生清单" :visible.sync="updatestudent" width="600px">
      <el-upload
        name="studentexcel"
        class="upload-demo"
        action="http://localhost:3000/api/users/studentupdate"
        multiple
      >
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip">只能上传 .xlsx 表格文件</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="updatestudent = false">取 消</el-button>
        <el-button type="primary" @click="submit_update">确 定</el-button>
      </div>
    </el-dialog>
    <my-bread level1="用户管理" level2="学生列表"></my-bread>
    <el-row class="search_row">
      <el-col :span="6">
        <el-input placeholder="请输入关键词搜索" v-model="query" class="input-with-search"></el-input>
      </el-col>
      <el-col :span="2" :offset="13">
        <el-button type="success" size="small" @click="updatestudent=true">上传名单</el-button>
      </el-col>
      <el-col :span="2" :offset="0.5">
        <el-button type="primary" size="small" @click="dialogAddStudent=true">添加学生</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <el-table
          :data="tableData"
          stripe
          :height="457"
          size="mini"
          style="width: 100%"
          @sort-change="sortpid"
          :default-sort="{prop: 'pid', order: 'descending'}"
        >
          <el-table-column type="selection" width="60" align="center"></el-table-column>
          <el-table-column type="index" width="60" align="center"></el-table-column>
          <el-table-column prop="pid" label="学号" sortable="custom" width="200" align="center"></el-table-column>
          <el-table-column prop="name" label="姓名" width="200" align="center"></el-table-column>
          <el-table-column prop="grade" label="年级" width="200" align="center"></el-table-column>
          <el-table-column prop="firstpwd" label="初始密码" width="200" align="center"></el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-row style="margin-top:15px">
      <el-col :span="24">
        <div class="pagination">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page.sync="paginations.page_index"
            :page-sizes="paginations.page_sizes"
            :page-size="paginations.page_size"
            :layout="paginations.layout"
            :total="paginations.total"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",	// 模糊搜索
			dialogAddStudent: false, // 增加学生弹框
			dialogChangeStudent: false, // 修改学生弹框
			updatestudent: false, // 上传名单的弹框
			sort: 'descending',   // 排序参数
			searchTimer: null,   // 模糊搜索防抖定时器
      dialogForm: {  //  增加学生默认值
        pid: "",
        name: "",
        grade: ""
			},
			changeForm: {	// 修改学生弹框默认值
				pid: "",
        name: "",
        grade: ""
			},
      paginations: {	// 分页默认参数
        page_index: 1,
        total: 0,
        page_size: 10,
        page_sizes: [10, 15, 20],
        layout: "total, sizes, prev, pager, next, jumper"
      },
      studentData: [], // 获取的学生数据
      tableData: [], // 表格显示的学生数据
      formLabelWidth: "120px", // 宽度
    }
	},
	
  created () {
    this.getStudents('',  this.sort, 'pid')  // 在页面刷新前获得表格数据， 并传默认参数用于排序
	},

	watch: { // 模糊搜索
    query: function(val, oldval) { 
			const that = this
			if(this.searchTimer != null) clearTimeout(this.searchTimer) // 防抖函数
			this.searchTimer = setTimeout(function(){
				that.getStudents(val)
			}, 500)
			
		}
	},
	
  methods: {
    getStudents(keyword, sort, sortItem) { //获取表格数据，排序、模糊搜索共用接口
      this.$http
        .get("/users/allstudent", {
          params: { // 给后台传参，用于数据库分页，再获取相应的数据
            page_index: this.paginations.page_index,  // 当前页
            page_size: this.paginations.page_size,    // 每页显示条数
            keyword, 																	// 是否有搜索关键词
						sort,																			// 排序
            sortItem																	// 排序列
          }
        })
        .then(res => {
          this.tableData = res.data.data  						// 给表格显示的数据赋值
          this.paginations.total = res.data.total 		// 后台数据总数
        })
        .catch(err => console.log(err))
		},
		
    submit_add() { // 单个增加学生
      this.dialogAddStudent = false
      this.$http.post("/users/addstudent", this.dialogForm).then(res => {
				this.$message({
					type: 'success',
					message: '增加成功'
				})
				this.getStudents('', sort, 'pid')             // 刷新表格
			})
		},

		submit_change () {	// 单个修改学生提交事件
			this.dialogChangeStudent = false
			this.$http.post('/users/changestudent', this.changeForm).then(res => {
				this.$message({
					type: 'success',
					message: '修改成功'
				})
				this.getStudents('', this.sort, 'pid')             // 刷新表格
			} )
		},

    submit_update () { // 上传 excel 文件，整体替换学生清单
      this.updatestudent = false
      this.getStudents ('', this.sort, 'pid')
		},
		
    // 分页
    handleSizeChange (page_size) {               //  每页显示数量修改
      this.paginations.page_index = 1						//  跳转回第一页
      this.paginations.page_size = page_size
      this.getStudents('', this.sort, 'pid')
		},
		
    handleCurrentChange (page) {									//  当前页修改
      this.paginations.page_index = page
      this.getStudents('', this.sort, 'pid')
		},
		
    // 排序
    sortpid (data) { 
      this.paginations.page_index = 1
      this.getStudents("", data.order, data.prop)
		},
		
    handleEdit (index, data) { // 编辑单个学生信息
			this.changeForm._id = data._id
      this.changeForm.pid = data.pid
      this.changeForm.name = data.name
      this.changeForm.grade = data.grade
			this.dialogChangeStudent = true	
		},

		handleDelete (index, data) { // 删除单个学生
			if(!confirm('确定删除吗？')){
				return
			}
			this.$http.delete ('/users/deletestu', {
				params:{
					_id: data._id
				}
			}).then(res => {
				this.$message({
						message: '删除成功',
						type: 'success'
				})
				this.getStudents('', this.sort, 'pid')
			})
		},

		debounce (fn, time) {  // 防抖函数
			let timeout = null
			return function () {
				if (timeout != null) clearTimeout(timeout)
				timeout = setTimeout(fn, time)
			}
		}
	}
}
</script>

<style>
#box-card {
  height: 100%;
  border: none;
}

.search_row {
  line-height: 60px;
  margin: 20px 0 20px 0;
}

#dialogAddStudent {
  width: 200px;
}
</style>
