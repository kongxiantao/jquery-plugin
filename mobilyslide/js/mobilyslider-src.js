/* ==========================================================
 * MobilySlider
 * date: 20.1.2010
 * author: Marcin Dziewulski
 * last update: 02.02.2011
 * web: http://www.mobily.pl or http://playground.mobily.pl
 * email: hello@mobily.pl
 * Free to use under the MIT license.
 * ========================================================== */
 (function($) {
    $.fn.mobilyslider = function(options) {
        var defaults = {
			//������class
            content: ".sliderContent",
			//�������ӵı�ǩ
            children: "div",
			//ͼƬ���ȵķ�ʽ������  ˮƽ���ҹ�����horizontal����ֱ���£�vertical���������ԣ� fade
            transition: "horizontal",
			//����һ��ʱ��ʱ��
            animationSpeed: 300,
			//�Ƿ��Զ�����
            autoplay: false,
			//�Զ��������ٶȣ�Ҳ��˵ʱ�������೤ʱ�䲥����һ��
            autoplaySpeed: 3000,
			//�����ͣ��ֹͣ����
            pauseOnHover: false,
			//�Ƿ���ʾ��ҳ
            bullets: true,
			//�Ƿ������Ҽ�ͷ
            arrows: true,
			//δ�������Ƿ���ʾ��ͷ
            arrowsHide: true,
			//��ť����ʽ
            prev: "prev",
			//���ť����ʽ
            next: "next",
			//ÿһ��������ʼʱҪ������
            animationStart: function() {},
			//ÿһ����������ʱҪ������
            animationComplete: function() {}
        };
        var sets = $.extend({},
        defaults, options);
        return this.each(function() {
			// $t = $('div.slider');
            var $t = $(this),
            item = $t.children(sets.content).children(sets.children),
			//ͼƬ����
            l = item.length - 1,
			//ͼƬ���
            w = item.width(),
			//ͼƬ�߶�
            h = item.height(),
            step = 0,
            play,
            bullets,
            arrows,
            z,
            active,
            bullet,
			//����һ��ͼƬ����û����ɣ����ֶ�δ����¼�
			loadOver = true;
            var slider = {
                init: function() {
					//��ʼ��Ҫ��ʾ��ͼƬ
                    slider.data();
					//�Ƿ���ʾ��ҳ��ť
                    if (sets.bullets) {
                        slider.bullets.create();
                    }
					//�Ƿ���ʾ���Ҽ�ͷ
                    if (sets.arrows) {
                        slider.arrows.create();
                    }
					//�Ƿ��Զ�����
					console.log( sets.autoplay );
                    if (sets.autoplay) {
                        slider.autoplay();
                    }
					//ע���¼�
                    slider.triggers();
                },
                data: function() {
					//ͨ��z-indexֵ����ʾ��ι�ϵ�������ʵ������ġ�
					//��ʾ��ʽ��ˮƽ���ҹ�������ֱ���¹���
                    item.each(function(i) {
                        $(this).css("z-index", -(i - l))
                    });
					//���ȷ�ʽ����������
                    if (sets.transition == "fade") {
                        item.hide().eq(0).show()
                    }
                },
                zindex: {
                    prev: function() {
                        step == l ? item.eq(0).css("z-index", l + 3) : item.css("z-index", l + 1);
                        item.eq(step).css("z-index", l + 4).next(item).css("z-index", l + 2);
                    },
                    next: function() {
                        item.css("z-index", l + 1).eq(step).css("z-index", l + 3).prev(item).css("z-index", l + 2);
                    },
                    bullets: function() {
                        item.css("z-index", l + 1).eq(active).css("z-index", l + 2);
                        item.eq(step).css("z-index", l + 3);
                    },
                    trigger: function() {
                        if (z == 1) {
                            slider.zindex.next();
                        } else {
                            if (z == -1) {
                                slider.zindex.prev();
                            } else {
                                if (z == 0) {
                                    slider.zindex.bullets();
                                }
                            }
                        }
                    }
                },
                slide: {
                    left: function(sign) {
						loadOver = false;
						//�����仯ǰҪִ�еĺ���
                        sets.animationStart.call(this);						
						//����Ѵ���ľ͹�����һ�£����������������
						item.eq(step)
						.animate({ left: sign + "=" + w },sets.animationSpeed,function(){
							loadOver = true;
							slider.zindex.trigger()
						})
						.animate({ left : 0 },sets.animationSpeed + 200,function() {
                            sets.animationComplete.call(this);
                        });
                    },
                    top: function(sign) {
						loadOver = false;
						//ͬ��
                        sets.animationStart.call(this);					
												
                        item.eq(step)
						.animate({ top: sign + "=" + h},sets.animationSpeed,function() {
							loadOver = true;
                            slider.zindex.trigger();
                        })
						.animate({top: 0},sets.animationSpeed + 200,function() {
                            sets.animationComplete.call(this)
                        });
                    },
                    fade: function() {
						loadOver = false;	
                        sets.animationStart.call(this);
                        item.fadeOut(sets.animationSpeed).eq(step).fadeIn(sets.animationSpeed,function() {
							loadOver = true;
                            sets.animationComplete.call(this)
                        })
                    }
                },
                animation: {
                    previous: function() {
                        step == 0 ? step = l: step--;
                        z = -1;
                        switch (sets.transition) {
                        case "horizontal":
                            slider.slide.left("-");
                            break;
                        case "vertical":
                            slider.slide.top("+");
                            break;
                        case "fade":
                            slider.slide.fade();
                            break
                        }
                    },
                    next: function() {
                        step == l ? step = 0: step++;
                        z = 1;
                        switch (sets.transition) {
                        case "horizontal":
                            slider.slide.left("+");
                            break;
                        case "vertical":
                            slider.slide.top("-");
                            break;
                        case "fade":
                            slider.slide.fade();
                            break
                        }
                    }
                },
                autoplay: function() {
                    play = setInterval(function() {
                        slider.animation.next();
                        if (sets.bullets) {
                            setTimeout(function() {
                                slider.bullets.update()
                            },
                            sets.animationSpeed + 300)
                        }
                    },
                    sets.autoplaySpeed );
                },
                pause: function() {
                    clearInterval(play);
                },
				//��ҳ��ť
                bullets: {
                    create: function() {
                        $t.append($("<div />").addClass("sliderBullets"));
                        bullets = $t.find(".sliderBullets");
                        for (i = 0; i <= l; i++) {
                            bullets.append($("<a />").attr({
                                href: "#",
								//�Զ�������
                                rel: i
                            }).text(i));
                        }
                    },
                    trigger: function() {
						//�ҵ�a
                        bullet = bullets.find("a");
						//��һ����������Ӽ�����ʽ
                        bullet.eq(0).addClass("active");
						//���¼�
                        bullet.click(function() {
							
							//�ж��ϴ�ͼƬ�����Ƿ����
							if(!loadOver){ return false; }
                            
							var b = $(this),
                            rel = b.attr("rel");
                            active = bullet.filter(".active").attr("rel");
                            step = rel;
							//sign = rel > active ? "+": "-";
							sign = rel > active ? "-": "+";
							
                            z = 0;
                            if ( !b.hasClass("active") ) {
                                switch (sets.transition) {
                                case "horizontal":
                                    slider.slide.left(sign);
                                    break;
                                case "vertical":
                                    slider.slide.top(sign);
                                    break;
                                case "fade":
                                    slider.slide.fade();
                                    break
                                }
                            }
                            bullet.removeClass("active");
                            b.addClass("active");
							//Ϊɶ����false��
							//ԭ���¼�������Ϊ�˷�ֹĬ�ϵ��¼���Ϊ���ͷ���false����ʾ��ֹ����������true�����ʾִ�з��������ĺ��������ۡ�
                            return false
                        })
                    },
                    update: function() {
                        bullet.removeClass("active").eq(step).addClass("active")
                    }
                },
                arrows: {
                    create: function() {
                        $t.append($("<div />").addClass("sliderArrows"));
                        arrows = $t.find(".sliderArrows");
                        arrows.append($("<a />").attr("href", "#").addClass(sets.prev).text("Previous"));
                        arrows.append($("<a />").attr("href", "#").addClass(sets.next).text("Next"))
                    },
                    trigger: function() {
                        arrows.find("." + sets.prev).click(function() {
							//�ж��ϴ�ͼƬ�����Ƿ����
							if(!loadOver){ return false; }
							
                            slider.animation.previous();
                            if (sets.bullets) {
                                slider.bullets.update()
                            }
                            return false
                        });
                        arrows.find("." + sets.next).click(function() {
							//�ж��ϴ�ͼƬ�����Ƿ����
							if(!loadOver){ return false; }
							
                            slider.animation.next();
                            if (sets.bullets) {
                                slider.bullets.update()
                            }
                            return false
                        });
                        if (sets.arrowsHide) {
                            arrows.hide();
                            $t.hover(function() {
                                arrows.show()
                            },
                            function() {
                                arrows.hide()
                            })
                        }
                    }
                },
                triggers: function() {
                    //ע���¼�
					if (sets.arrows) {
                        slider.arrows.trigger();
                    }
                    if (sets.bullets) {
                        slider.bullets.trigger();
                    }
                    if (sets.pauseOnHover) {
                        $t.hover(function() {
                            slider.pause();
                        },
                        function() {
                            slider.autoplay();
                        })
                    }
                }
            };
            slider.init();
        })
    }
} (jQuery));

/*
 * @author decadeofsword@gmail.com
 * @time 2011-08-05
 * �޸�bug��һ�μ���û����ɣ����е���˶�Ρ�����ͼƬ���Ȳ���Ȼ��
 *
 */
