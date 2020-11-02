// http://open.duyiedu.com
var appkey='junlove2020_1602508118320';
init();

//初始化
function init(){
	var allData; //所以学生信息 json格式
	render();
	bindEvent();
	changeClass();
}

//绑定事件
function bindEvent(){
	var form = document.querySelector('.student-add-form');
	var addBtns = form.querySelector('input[type=submit]');
	var toList = document.querySelector('#left-menu dd[data-id="student-list"]');
	addBtns.onclick = (e) => {
		//添加学生
		addStudent(e,form,toList);
	}
	var tBody = document.querySelector('.student-list > table tbody');
	// 事件委托,为页面中不会变化的元素tbody绑定事件
	tBody.onclick = (e) => {
		if(!e.target.classList.contains('btn')){
			return;
		}else{
			//点击的是编辑按钮
			if(e.target.classList.contains('edit')){
				editStudent(e.target);
			//点击的是删除按钮
			}else if(e.target.classList.contains('remove')){
				removeStudent(e.target);
			}
		}
	}
}

// 渲染学生列表
// 在添加增\删\改学生信息时调用,即可刷新结构
function render(){
	var contanier = document.querySelector('.student-list tbody');
	ajax('get', 'http://open.duyiedu.com/api/student/findAll', 'appkey=' + appkey, (resp) => {
		// console.log(resp);
		if(resp.status == 'success'){
			// console.log('resp.data',resp.data);
			allData = resp.data;
		}
	}, false);
	var str = ``;
	for(var i = 0;i < allData.length;i ++){
		str += `
					<tr>
						<td>${allData[i].sNo}</td>
						<td>${allData[i].name}</td>
						<td>${allData[i].sex == 0 ? '男' : '女'}</td>
						<td>${allData[i].email}</td>
						<td>${ new Date().getFullYear() - allData[i].birth }</td>
						<td>${allData[i].phone}</td>
						<td>${allData[i].address}</td>
						<td>
							<button class="btn edit" data-index=${i}>编辑</button>
							<button class="btn remove" data-index=${i}>删除</button>
						</td>
					</tr>`;
	}
	contanier.innerHTML = str;
}

// 编辑学生信息

// 难点:弹框表单数据回填
// 思路:
// 渲染页面时获取到的所有学生信息allData保存到全局,为每个编辑和删除按钮添加data-index属性,
// 循环生成tr结构时将其设置为索引i,后面通过dataset.index获取index值,对应到allData[index]条学生数据
// 然后遍历此条数据中的属性,并不一定和form(form.name属性值.value获取具有对应name属性的input的值)中一一对应,
// 若form表单中有此属性,则匹配相等
function editStudent(target){
	var editDiv = document.querySelector('.student-edit');
	var form = editDiv.querySelector('.student-edit-form');
	editDiv.style.display = 'block';
	var index = target.dataset.index;

	//表单数据回填
	var oldData = allData[index];
	for(var prop in oldData){
		if(form[prop]){
			form[prop].value = oldData[prop];
		}
	}

	var submitBtn = form.querySelector('.btn');
	submitBtn.onclick = (e) => {
		editDiv.style.display = 'none';
		submit(e,form,'/api/student/updateStudent',(data,resp) => {
			alert('修改成功');
			render();
		})
	}

	//点击蒙版取消编辑
    editDiv.onclick = function(e) {
        if (e.target === this) {
            editDiv.style.display = 'none';
        }
    }
}

//删除学生信息 tBody:容器 target:点击目标
function removeStudent(target){
	var num = allData[target.dataset.index].sNo;
	var data = 'appkey='+ appkey +'&sNo=' + num;
	var isDelete = confirm('确认删除学号为' + num + '的学生吗');
	if(isDelete){
		ajax('get','http://open.duyiedu.com/api/student/delBySno', data ,(resp) => {
			if(resp.status == 'success'){
				alert('删除成功');
				render();
			}else{
				alert(resp.msg);
			}
		});
	}else{
		return;
	}
}

//添加学生信息
function addStudent(e,form,toList){
	submit(e,form,'/api/student/addStudent',(data,resp) => {
		toList.click();  //手动跳转到学生列表
		alert('添加成功');
		render(); //重新渲染页面
	})
}

// 提交学生信息到服务器端   e:事件对象 form:表单 successCb:成功时的处理
// 添加学生时的提交 和 编辑学生信息的提交
function submit(e,form,url,successCb){
	//阻止默认行为(刷新页面)
	e.preventDefault();
	var data = {
		appkey: appkey,
		sNo: form.sNo.value,
		name: form.name.value,
		sex: form.sex.value,
		birth: form.birth.value,
		phone: form.phone.value,
		address: form.address.value,
		email: form.email.value
	};
	//拼接字符串
	var parms = getParmStr(data);

	ajax('get', 'http://open.duyiedu.com' + url,parms,(resp) => {
		// console.log(resp);
		if(resp.status == 'success'){
			successCb(data,resp);
		}else{
			alert(resp.msg);
		}
	}, true);
}

//拼接学生信息字符串,含表单验证
function getParmStr(data) {
	var err = {
		name: ['姓名不能为空'],
		sNo: ['学号不能为空','学号必须为4-16位的数字组成'],
		email: ['邮箱不能为空','邮箱格式不正确'],
		birth: ['出生年不能为空','仅接收6-60岁的学生'],
		phone: ['手机号不能为空','手机号格式不正确'],
		address: ['地址不能为空']
	};

	var emailReg = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/;
	var sNoReg = /^\d{4,16}$/;
	var phoneReg = /1[3456789]\d{9}/;

	var parms = '';
	for(var k in data){
		//排除原型链上的属性
		if(data.hasOwnProperty(k)){
			if(!data[k]){
				alert(err[k][0]);
				return;
			}
			if(k == 'email' && !emailReg.test(data[k]) || k == 'sNo' && !sNoReg.test(data[k]) || k == 'phone' && !phoneReg.test(data[k]) || k == 'birth' && (new Date().getFullYear() - data[k] > 60 || new Date().getFullYear() - data[k] < 6) ){	
				alert(err[k][1]);
				return;
			}
			parms += `${k}=${data[k]}&`;
			}
	}
	parms = parms.slice(0,parms.length - 1);
	return parms;
}

//切换导航栏样式和右侧页面
function changeClass(){

	var leftDl = document.querySelector('#left-menu > dl');
	var rightContent = document.querySelector('#right-content');
	var prev;  //存放上次的点击目标
	//事件委托
	leftDl.addEventListener('click', (e) => {
		
		//判断这次点击对象和上次是否为一个,是则return
		if(e.target == prev){ 
			return;
		}
		//判断标签为 dd
		if(e.target.tagName == 'DD'){
			//添加类名之前先获取之前active对象,移除类名
			leftDl.querySelector('.active').classList.remove('active');
			rightContent.querySelector('.active-content').classList.remove('active-content');

			e.target.classList.add('active');
			var ddId = e.target.dataset.id;
			rightContent.getElementsByClassName(ddId)[0].classList.add('active-content');
		}
		prev = e.target;
	})
}

function ajax(method, url, data, cb, isAsync){
	// console.log(data);
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject(Microsoft.XMLHTTP);

	xhr.onreadystatechange = () => {
		if(xhr.readyState == 4){
			if(xhr.status >= 200 || xhr.status < 300 ||xhr.status == 400){
				cb(JSON.parse(xhr.responseText));
			}
		}
	}
	if(method == 'get' || method == 'GET'){
		xhr.open('get', url + '?' + data, isAsync);
		xhr.send();
	}
	if(method == 'post' || method == 'POST'){
		xhr.open('post', url, async);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	}
}
