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
			//容器的class
            content: ".sliderContent",
			//容器孩子的标签
            children: "div",
			//图片过度的方式有三种  水平向右滚动：horizontal，垂直向下：vertical，淡隐淡显： fade
            transition: "horizontal",
			//播放一张时的时间
            animationSpeed: 300,
			//是否自动滚动
            autoplay: false,
			//自动滚动的速度，也就说时间间隔，多长时间播放下一张
            autoplaySpeed: 3000,
			//鼠标悬停后停止滚动
            pauseOnHover: false,
			//是否显示分页
            bullets: true,
			//是否有左右箭头
            arrows: true,
			//未触发是是否显示箭头
            arrowsHide: true,
			//向按钮的样式
            prev: "prev",
			//向后按钮的样式
            next: "next",
			//每一个动画开始时要做的事
            animationStart: function() {},
			//每一个动画结束时要做的事
            animationComplete: function() {}
        };
        var sets = $.extend({},
        defaults, options);
        return this.each(function() {
			// $t = $('div.slider');
            var $t = $(this),
            item = $t.children(sets.content).children(sets.children),
			//图片个数
            l = item.length - 1,
			//图片宽度
            w = item.width(),
			//图片高度
            h = item.height(),
            step = 0,
            play,
            bullets,
            arrows,
            z,
            active,
            bullet,
			//处理一次图片过渡没有完成，而又多次触发事件
			loadOver = true;
            var slider = {
                init: function() {
					//初始化要显示的图片
                    slider.data();
					//是否显示分页按钮
                    if (sets.bullets) {
                        slider.bullets.create();
                    }
					//是否显示左右箭头
                    if (sets.arrows) {
                        slider.arrows.create();
                    }
					//是否自动播放
					console.log( sets.autoplay );
                    if (sets.autoplay) {
                        slider.autoplay();
                    }
					//注册事件
                    slider.triggers();
                },
                data: function() {
					//通过z-index值来显示层次关系，这个真实够巧妙的。
					//显示方式：水平向右滚动，垂直向下滚动
                    item.each(function(i) {
                        $(this).css("z-index", -(i - l))
                    });
					//过度方式：淡隐淡显
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
						//动画变化前要执行的函数
                        sets.animationStart.call(this);						
						//这里把代码的就够变了一下，这样看着舒服多了
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
						//同上
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
				//分页按钮
                bullets: {
                    create: function() {
                        $t.append($("<div />").addClass("sliderBullets"));
                        bullets = $t.find(".sliderBullets");
                        for (i = 0; i <= l; i++) {
                            bullets.append($("<a />").attr({
                                href: "#",
								//自定义属性
                                rel: i
                            }).text(i));
                        }
                    },
                    trigger: function() {
						//找到a
                        bullet = bullets.find("a");
						//第一个被激活添加激活样式
                        bullet.eq(0).addClass("active");
						//绑事件
                        bullet.click(function() {
							
							//判断上次图片过渡是否完成
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
							//为啥返回false？
							//原因：事件处理函数为了防止默认的事件行为，就返回false，表示终止符，而返回true，则表示执行符。其它的函数另当别论。
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
							//判断上次图片过度是否完成
							if(!loadOver){ return false; }
							
                            slider.animation.previous();
                            if (sets.bullets) {
                                slider.bullets.update()
                            }
                            return false
                        });
                        arrows.find("." + sets.next).click(function() {
							//判断上次图片过度是否完成
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
                    //注册事件
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
 * 修复bug：一次加载没有完成，而有点击了多次。导致图片过度不自然。
 *
 */
