// 为左侧菜单项绑定点击事件
function bindEvent(){	
	var leftDl = document.querySelector('#left-menu > dl');
	var prev;  //存放上次的点击目标
	//事件委托
	leftDl.addEventListener('click', (e) => {
		//判断标签为 dd 则添加类名
		if(e.target.tagName == 'DD'){
			e.target.classList.add('active');
		}
		//点击目标更改,则移除上次点击目标的类名
		if(prev && e.target != prev){
			prev.classList.remove('active');
		}
		prev = e.target;
	})
}
bindEvent();