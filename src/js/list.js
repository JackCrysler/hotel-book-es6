import {Calendar} from '../component/Calendar';
import {getUrlParams,ajax,loading} from './tools';
//初始化日历组件
const calendar = new Calendar({
	callback:function(data){
		console.log(data)
	}
})
//渲染日期
const cid = document.querySelector('.check-in-date');
const cod = document.querySelector('.check-out-date');

cid.innerHTML = getUrlParams('checkInDate');
cod.innerHTML = getUrlParams('checkOutDate');

document.querySelector('.modify-date').onclick=function(){
	calendar.show(document.querySelector('.check-in-date'));
}


//启动loading动画

	loading.startLoading('.container');

//请求列表数据


let wait = new Promise(function(resolve,reject){
	ajax({
		url:'../../server/hotel.json',
		callback:function(data){
			var arr=[0,2,3,4,5];
			function random(max,min){
				return Math.floor(Math.random()*(max-min+1))+min
			}

			data.data = data.data.map((value,index)=>{
				value.rank = arr[random(4,0)];
				return value;
			})
			
			resolve(data)
		}
	})
})


//列表模板
function tpl(name,price,addr,district,rank){
	return `<dl data-region="${district}" data-rank="${rank}">
				<dt><img src="../img/fullimage1.jpg" alt=""></dt>
				<dd>
					<h4>${name}</h4>
					<p>
						<span class="point">4.7分</span>
						<span class="price"><em>￥${price}</em><small>起</small></span>
					</p>
					<p>
						<span class="rank">${rank}星</span>
						<span class="icon iconfont icon-wifi"></span>
						<span class="icon iconfont icon-p"></span>
					</p>
					<p>
						<span class="location">${addr}</span>
						<span class="distance"> </span>
					</p>
				</dd>
			</dl>`	
}

wait.then(function(data){
	
	let data_list = data.data;

	data_list = data_list.map((value,index)=>{
		return tpl(value.name,value.price,value.addr,value.district,value.rank)
	})
	//数据返回停止加载动画
	loading.stopLoading();
	//将渲染完成的list数据添加至列表
	document.querySelector('.hotel-list').innerHTML = data_list.join('');
})

//filter区域的显示和隐藏
let filterWrap = document.querySelector('.filter');
let filter_area = document.querySelector('.filter-area');
let filter_nav = document.querySelector('.filter-nav');
let filter_nav_li = filter_nav.querySelectorAll('li');
let masker = document.querySelector('.masker');
function resetArrow(target){

	if(target && target.classList.contains('icon-icon05-copy-copy')) return;
	for(let i=0; i<filter_nav_li.length;i++){
		filter_nav_li[i].classList.add('icon-icon05-copy-copy-copy')
		
		filter_nav_li[i].classList.remove('icon-icon05-copy-copy');
	}	
}

filter_nav.addEventListener('click',(e)=>{
		
	let target = e.target;
	
	if(target.tagName=='LI'){
		resetArrow(target);
		if(target.classList.contains('icon-icon05-copy-copy-copy')){

			target.classList.remove('icon-icon05-copy-copy-copy');
			target.classList.add('icon-icon05-copy-copy');
			masker.classList.add('masker-show');

		}else{
			target.classList.remove('icon-icon05-copy-copy');
			target.classList.add('icon-icon05-copy-copy-copy');
			masker.classList.remove('masker-show');
		}

		filter_area.style.transform=`translateX(${-(target.getAttribute('index')*25)}%)`

	}
},false)

masker.addEventListener('click',(e)=>{
	let target = e.target;
	//控制CheckBox的功能
	switch (target.tagName){
		case "SPAN":target = target.parentNode;
			break;
		case "DIV":
			if(target.classList.contains('masker')){
				masker.classList.remove('masker-show');
				resetArrow();
			}
			
			return;//不再执行后面语句
			break;
		case "P":
			break;
		default: console.log('我不知你点哪里了...')						
	}

	if(target.classList.contains('checkbox')){
		target.className='checkbox-checked';
	}else{
		target.className='checkbox';
	}
	//collector()收集所有CheckBox选中的信息,返回筛选信息
	//调用过滤逻辑
	screen(collector());
},false)

function collector(){
	let region = document.querySelector('.masker .region').querySelectorAll('p.checkbox-checked');
	let rank = document.querySelector('.masker .rank').querySelectorAll('p.checkbox-checked');
	let screenItems = {
		region:[],
		rank:[]
	};
	for(let i=0;i<region.length;i++){
		screenItems.region.push(region[i].getAttribute('region'))
	}
	for(let i=0;i<rank.length;i++){
		screenItems.rank.push(rank[i].getAttribute('rank'))
	}

	for(let j in screenItems){
		if(screenItems[j].length==0){
			delete screenItems[j]
		}
	}
	
	return screenItems;
}

//筛选逻辑的实现
function screen(obj){
	console.log(obj);
	//Object {region: Array[1], rank: Array[1]}
	let wrap = document.querySelector('.hotel-list');
	let dls = wrap.querySelectorAll('dl');
	for(let i=0; i<dls.length;i++){
		dls[i].classList.remove('none')
	}

	//把符合条件的项筛选出来;
	for(let i=0; i<dls.length; i++){
		for(let k in obj){
			if(obj[k].indexOf(dls[i].getAttribute('data-'+k))==-1){
				dls[i].classList.add('none')
			}	
		}
	}
}

