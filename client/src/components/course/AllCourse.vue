<template>
  <el-card id="box-card">
    <el-dialog title="课程信息" :visible.sync="dialogAddCourse" width="600px">
      <el-form :model="dialogForm" label-position="right" label-width="80px">
        <el-form-item label="课程代码">
          <el-input v-model="dialogForm.pid"></el-input>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="dialogForm.name"></el-input>
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="dialogForm.tname"></el-input>
        </el-form-item>
        <el-form-item label="开课时间">
          <el-input v-model="dialogForm.time"></el-input>
        </el-form-item>
        <el-form-item label="报名人数">
          <el-input v-model="dialogForm.num"></el-input>
        </el-form-item>
				<el-form-item label="报名年级">
          <el-input v-model="dialogForm.grade"></el-input>
        </el-form-item>
			</el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAddCourse = false">取 消</el-button>
        <el-button type="primary" @click="submit_add">确 定</el-button>
      </div>
			
    </el-dialog>
    <el-dialog title="修改教师信息" :visible.sync="dialogChangeCourse" width="600px">
      <el-form :model="changeForm" label-position="right" label-width="80px">
        <el-form-item label="课程代码">
          <el-input v-model="changeForm.pid"></el-input>
        </el-form-item>
        <el-form-item label="课程名称">
          <el-input v-model="changeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="授课教师">
          <el-input v-model="changeForm.tname"></el-input>
        </el-form-item>
        <el-form-item label="开课时间">
          <el-input v-model="changeForm.time"></el-input>
        </el-form-item>
        <el-form-item label="报名人数">
          <el-input v-model="changeForm.num"></el-input>
        </el-form-item>
				<el-form-item label="报名年级">
          <el-input v-model="changeForm.grade"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogChangeCourse = false">取 消</el-button>
        <el-button type="primary" @click="submit_change(changeForm)">确 定</el-button>
      </div>
    </el-dialog>
    <my-bread level1="课程管理" level2="课程列表"></my-bread>
    <el-row class="search_row">
      <el-col :span="6">
        <el-input placeholder="请输入关键词搜索" v-model="query" class="input-with-search"></el-input>
      </el-col>
      <el-col :span="2" :offset="15">
        <el-button type="primary" size="small" @click="dialogAddCourse = true">添加课程</el-button>
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
          <el-table-column type="index" width="50" align="center"></el-table-column>
          <el-table-column prop="pid" label="课程代码" sortable="custom" width="100" align="center"></el-table-column>
          <el-table-column prop="name" label="课程名称" width="150" align="center"></el-table-column>
          <el-table-column prop="tname" label="授课教师" width="120" align="center"></el-table-column>
          <el-table-column prop="time" label="开课时间" width="150" align="center"></el-table-column>
					<el-table-column prop="num" label="可报名人数" width="120" align="center"></el-table-column>
          <el-table-column prop="lnum" label="剩余人数" width="120" align="center"></el-table-column>
					<el-table-column prop="grade" label="报名年级" width="200" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="150">
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
      query: "", // 模糊搜索
      dialogAddCourse: false, // 增加课程弹框
      dialogChangeCourse: false, // 修改课程弹框
      sort: "descending", // 排序参数
      searchTimer: null, // 模糊搜索防抖定时器
      dialogForm: {
        //  增加课程默认值
        pid: "",
        name: "",
				tname: "",
				grade: "",
				time:"",
				num: "",
				lnum: ""
      },
      changeForm: {
        // 修改课程弹框默认值
        pid: "",
        name: "",
				tname: "",
				grade: "",
				time:"",
				num: "",
				lnum: ""
      },
      paginations: {
        // 分页默认参数
        page_index: 1,
        total: 0,
        page_size: 10,
        page_sizes: [10, 15, 20],
        layout: "total, sizes, prev, pager, next, jumper"
      },
      course: [], // 获取的课程数据
      tableData: [], // 表格显示的课程数据
      formLabelWidth: "120px" // 宽度
    };
  },

  created() {
    this.getCourses("", this.sort, "pid"); // 在页面刷新前获得表格数据， 并传默认参数用于排序
  },

  watch: {
    // 模糊搜索
    query: function(val, oldval) {
      const that = this;
      if (this.searchTimer != null) clearTimeout(this.searchTimer); // 防抖函数
      this.searchTimer = setTimeout(function() {
        that.getCourses(val);
      }, 500);
    }
  },

  methods: {
    getCourses(keyword, sort, sortItem) {
      //获取表格数据，排序、模糊搜索共用接口
      this.$http
        .get("/users/allcourses", {
          params: {
            // 给后台传参，用于数据库分页，再获取相应的数据
            page_index: this.paginations.page_index, // 当前页
            page_size: this.paginations.page_size, // 每页显示条数
            keyword, // 是否有搜索关键词
            sort, // 排序
            sortItem // 排序列
          }
        })
        .then(res => {
          this.tableData = res.data.data; // 给表格显示的数据赋值
          this.paginations.total = res.data.total; // 后台数据总数
        })
        .catch(err => console.log(err));
    },

    submit_add() {
      // 单个增加课程
      this.dialogAddCourse = false;
      this.$http.post("/users/addcourse", this.dialogForm).then(res => {
        this.$message({
          type: "success",
          message: "增加成功"
        });
        this.getCourses("", this.sort, "pid"); // 刷新表格
      });
    },

    submit_change() {
      // 单个修改课程提交事件
      this.dialogChangeCourse = false;
      this.$http.post("/users/changecourse", this.changeForm).then(res => {
        this.$message({
          type: "success",
          message: "修改成功"
        });
        this.getCourses("", this.sort, "pid"); // 刷新表格
      });
    },

    // 分页
    handleSizeChange(page_size) {
      //  每页显示数量修改
      this.paginations.page_index = 1; //  跳转回第一页
      this.paginations.page_size = page_size;
      this.getCourses("", this.sort, "pid");
    },

    handleCurrentChange(page) {
      //  当前页修改
      this.paginations.page_index = page;
      this.getCourses("", this.sort, "pid");
    },

    // 排序
    sortpid(data) {
      this.paginations.page_index = 1;
      this.getCourses("", data.order, data.prop);
    },

    handleEdit(index, data) {
			// 编辑单个课程信息
      this.changeForm._id = data._id;
      this.changeForm.pid = data.pid;
      this.changeForm.name = data.name;
			this.changeForm.tname = data.tname;
			this.changeForm.num = data.num;
			this.changeForm.grade = data.grade;
			this.changeForm.time = data.time;
      this.dialogChangeCourse = true;
    },

    handleDelete(index, data) {
      // 删除单个课程
      if (!confirm("确定删除吗？")) {
        return;
			}
      this.$http
        .delete("/users/deletecou", {
          params: {
            _id: data._id
          }
        })
        .then(res => {
          this.$message({
            message: "删除成功",
            type: "success"
          });
          this.getCourses("", this.sort, "pid");
        });
    },

    debounce(fn, time) {
      // 防抖函数
      let timeout = null;
      return function() {
        if (timeout != null) clearTimeout(timeout);
        timeout = setTimeout(fn, time);
      };
    }
  }
};
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

#bold {
  color: black;
  font-weight: bold;
}
</style>