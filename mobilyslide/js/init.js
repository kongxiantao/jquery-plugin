$(function(){
	
	$('.slider').mobilyslider({
		//������class
		content: '.sliderContent',
		//�������ӵı�ǩ
		children: 'div',
		//�����ķ���  ˮƽ��horizontal����ֱ��vertical
		transition: 'vertical',
		
		animationSpeed: 500,
		//�Ƿ��Զ�����
		autoplay: false,
		//�Զ�������ʱ��
		autoplaySpeed: 3000,
		//�����ͣ��ֹͣ����
		pauseOnHover: false,
		bullets: true,
		//�Ƿ������Ҽ�ͷ
		arrows: true,
		//δ�������Ƿ���ʾ��ͷ
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
