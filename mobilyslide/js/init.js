$(function(){
	
	$('.slider').mobilyslider({
		//容器的class
		content: '.sliderContent',
		//容器孩子的标签
		children: 'div',
		//滚动的方向  水平：horizontal，垂直：vertical
		transition: 'vertical',
		
		animationSpeed: 500,
		//是否自动滚动
		autoplay: false,
		//自动滚动的时间
		autoplaySpeed: 3000,
		//鼠标悬停后停止滚动
		pauseOnHover: false,
		bullets: true,
		//是否有左右箭头
		arrows: true,
		//未触发是是否显示箭头
		arrowsHide: true,
		prev: 'prev',
		next: 'next',
		animationStart: function(){
			//console.log('start');
		},
		animationComplete: function(){
			//console.log('complete');
		}
	});
	
});
