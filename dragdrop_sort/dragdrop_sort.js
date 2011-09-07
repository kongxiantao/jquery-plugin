/*
new K.DragdropSorter({
			'multiple' : true,
			'container' : $j( '#photolist' ),
			'items' : $j( '#photolist li' )
		});

*/




(function() {
    window.K = window.K || {};
    var $ = jQuery,
    lastItem;
    function DragdropSorter(options) {
        this.options = options || {};
        this.container = $(options.container || document.body);
        this.items = options.items;
        this.vSpace = options.vSpace || 20;
        this.hSpace = options.hSpace || 20;
        this.isMultiple = options.multiple || false;
        this.pickedClassName = options.classPicked || DragdropSorter.CLASS_PICKED;
        this.dragonClassName = options.classDragon || DragdropSorter.CLASS_DRAGON;
        this.itemClassName = options.classItem || DragdropSorter.CLASS_ITEM;
        this.init();
    }
    DragdropSorter.prototype = {
        'init': function() {
            this.bindEvents();
        },
        'setContainerInfo': function() {
            if (this.containerOffset) {
                return;
            }
            this.containerOffset = this.container.offset();
            this.containerOuterWidth = this.container.outerWidth();
        },
        'bindEvents': function() {
            this.bindMarkEvent();
            this.bindDragEvent();
        },
        'getDragItem': function(event) {
            var node = $(event.target);
            while (node[0] && $.contains(this.container[0], node[0])) {
                if (node.is('li')) {
                    return node;
                }
                node = node.parent();
            }
            return false;
        },
        'markItem': function(el, ctrlKey,shiftKey) {
			//edit kong
            var pickedClassName = this.pickedClassName;
            
			//按下ctrl键
			if (this.isMultiple && ctrlKey) {
                el.toggleClass(pickedClassName);
                return;
            }
			//按下shift键 add kong
			var me = this;
			if(this.isMultiple && shiftKey){
				//查找前一个选中的el
				var container = me.options.container, 
					pre_index = container.find('.' + pickedClassName).index()-0,
					curr_index = $(el).index()-0;
				container.find('li').filter(function(index){
					return ( index > pre_index && index <=  curr_index ) || ( index < pre_index && index >=  curr_index );
				}).addClass(pickedClassName);
				return;
			}
            this.container.find('.' + pickedClassName).removeClass(pickedClassName);
            el.addClass(pickedClassName);
        },
        'getScrollPos': function() {
            return {
                'left': Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
                'top': Math.max(document.documentElement.scrollTop, document.body.scrollTop)
            };
        },
        'bindMarkEvent': function() {
            var me = this,
            pickedClassName = this.pickedClassName;
            this.container.click(function(event) {
                var target = me.getDragItem(event);
                if (target) {
                    me.markItem(target, event.ctrlKey,event.shiftKey);
                }
            });
            $(document).click(function(event) {
                var target = event.target;
                if (!me.isDrawing) {
                    if (target == me.container[0] || !$.contains(me.container[0], target)) {
                        me.container.find('.' + pickedClassName).removeClass(pickedClassName);
                    }
                }
            });
            if (this.isMultiple) {
                this.container.mousedown(function(event) {
                    if (event.target == me.container[0]) {
                        me.setupBoxMark(event);
                    }
                });
            }
        },
        'setupBoxMark': function(event) {
            this.boxOrigin = this.getMousePos(event);
            this.drawBoxProxy = $.proxy(this.drawBox, this);
            this.finishDrawBoxProxy = $.proxy(this.finishDrawBox, this);
            $(document).bind('mousemove', this.drawBoxProxy);
            $(document).bind('mouseup', this.finishDrawBoxProxy);
        },
        'disableSelect': function() {
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            document.body.onselectstart = function() {
                return false;
            }
        },
        'enableSelect': function() {
            document.body.onselectstart = null;
        },
        'drawBox': function(event) {
            var scroll = this.getScrollPos(),
            dx = event.clientX + scroll.left - this.boxOrigin.x,
            dy = event.clientY + scroll.top - this.boxOrigin.y;
            this.disableSelect();
            this.isDrawing = true;
            if (!this.rectangle) {
                this.rectangle = $('<div></div>');
                this.rectangle.css({
                    'position': 'absolute',
                    'display': 'none',
                    'border': '1px solid blue',
                    'background': '#5eb3f5',
                    'opacity': 0.2,
                    'filter': 'alpha(opacity=20)',
                    'z-index': 888
                });
                this.rectangle.appendTo(document.body);
            }
            var left,
            top,
            width,
            height;
            left = dx > 0 ? this.boxOrigin.x: this.boxOrigin.x + dx;
            top = dy > 0 ? this.boxOrigin.y: this.boxOrigin.y + dy;
            width = Math.abs(dx);
            height = Math.abs(dy);
            this.setContainerInfo();
            left = Math.max(left, this.containerOffset.left);
            top = Math.max(top, this.containerOffset.top);
            if (dx < 0) {
                width = Math.min(width, this.boxOrigin.x - this.containerOffset.left);
            } else {
                width = Math.min(width, this.containerOffset.left + this.container.outerWidth() - this.boxOrigin.x);
            }
            if (dy < 0) {
                height = Math.min(height, this.boxOrigin.y - this.containerOffset.top);
            } else {
                height = Math.min(height, this.containerOffset.top + this.container.outerHeight() - this.boxOrigin.y);
            }
            this.rectangle.css({
                'left': left + 'px',
                'top': top + 'px',
                'width': width + 'px',
                'height': height + 'px',
                'display': 'block'
            });
            this.rectangleInfo = {
                'left': left,
                'top': top,
                'width': Math.abs(dx),
                'height': Math.abs(dy)
            };
            this.selectItem();
        },
        'getScopeValue': function(value, min, max) {
            return Math.max(min, Math.min(value, max));
        },
        'selectItem': function() {
            if (!this.hiliteItemTimer) {
                this.hiliteItemTimer = setInterval($.proxy(this.hiliteItem, this), 200);
            }
        },
        'hiliteItem': function() {
            if (!this.isDrawing) {
                return;
            }
            var pickedClassName = this.pickedClassName;
            this.options.container.find('.' + pickedClassName).removeClass(pickedClassName);
            var allItems = this.options.container.find('.' + this.itemClassName),
            info = this.rectangleInfo;
            for (var i = 0, len = allItems.size(); i < len; i++) {
                var item = allItems.eq(i),
                offset = item.offset(),
                left = offset.left,
                top = offset.top,
                width = item.outerWidth(),
                height = item.outerHeight();
                if (this._hitTest([left, top, width, height], [info.left, info.top, info.width, info.height])) {
                    item.parent().addClass(pickedClassName);
                }
            }
        },
        '_hitTest': function(r1, r2) {
            return (r1[0] + r1[2]) > r2[0] && r1[0] < (r2[0] + r2[2]) && (r1[1] + r1[3]) > r2[1] && r1[1] < r2[1] + r2[3]
        },
        'finishDrawBox': function(event) {
            $(document).unbind('mousemove', this.drawBoxProxy);
            $(document).unbind('mouseup', this.finishDrawBoxProxy);
            this.clear();
        },
        'clear': function() {
            var me = this;
            this.rectangle && this.rectangle.hide();
            this.enableSelect();
            setTimeout(function() {
                me.isDrawing = false;
            },
            10);
            clearInterval(this.hiliteItemTimer);
            this.hiliteItemTimer = null;
        },
        'bindDragEvent': function() {
            this.container.mousedown($.proxy(this.startDrag, this));
            this.container.click($.proxy(this.unloadDrag, this));
        },
        'startDrag': function(event) {
            var item = this.getDragItem(event),
            clsName = this.dragonClassName;
            if (!item[0]) {
                return;
            }
		
			//处理 用户没有按住ctrl和shifht键
            if (!item.hasClass(clsName) && !event.ctrlKey && !event.shiftKey) {
                this.container.find('.' + clsName).removeClass(clsName);
                item.addClass(clsName);
            }
					
            this.dragTarget = item;
            this.setDragStartInfo(event);
            this.inplaceItems = this.container.find('li').not('.' + this.dragonClassName + ', .placeholder');
            this.dragProxy = $.proxy(this.drag, this);
            this.endDragProxy = $.proxy(this.endDrag, this);
            $(document).mousemove(this.dragProxy).mouseup(this.endDragProxy);		
			
        },
        'getMousePos': function(event) {
            var scroll = this.getScrollPos();
            return {
                'x': event.clientX + scroll.left,
                'y': event.clientY + scroll.top
            };
        },
		//按住鼠标开始拖动的时候触发
        'drag': function(event) {
			//edit kong
            if (event.ctrlKey || event.shiftKey) {
                return;
            }
            this.disableSelect();
            this.isDragging = true;
            if (!this.setupDrag) {
                this.setupDrag = true;
                this.dragItems = this.container.find('.' + this.dragonClassName);
				this.dragItems.hide();
				
				
				//add kong
				
				//回去选取的总数：this.dragItems.size()
				//console.log("size:"+this.dragItems.size());
				
                if (this.dragItems.size() > 1) {
                    this.dragTarget.addClass('multiple');
                }
				
				
                this.dragTarget.show().css({
                    'position': 'absolute',
                    'z-index': 1000
                });
                this.dragTargetWidth = this.dragTarget.outerWidth();
                this.dragTargetHeight = this.dragTarget.outerHeight();
                if (!this.placeHolder) {
                    this.placeHolder = $('<li class="placeholder" style="display:none"></li>');
                }
                var node = this.dragTarget;
				//这段好像也没有什么用
                // for (var index = 0, len = this.dragItems.size(); index < len; index++) {
                    // if (this.dragItems[index] == this.dragTarget[0]) {
                        // break;
                    // }
                // }
				
				//edit kong 好像没有什么用，也不只是干什么的，所以就注释了
                //var tempNode;
                // while (index > 0 && (tempNode = node.next())[0]) {
                    // node = tempNode;
                    // if (tempNode.is('.' + this.dragonClassName)) {
                        // continue;
                    // }
                    // index--;
                // }
				
				
				//显示占位符
				//console.log($(node).index());
                this.placeHolder.insertAfter(node).show();
                // this.placeHolder.insertBefore(node).show();
                this.updatePlaceHolderOffset();
            }
            var curClient = this.getMousePos(event),
            dx = curClient.x - this.dragStartClient.x,
            dy = curClient.y - this.dragStartClient.y,
            left = this.dragTargetStartOffset.left + dx,
            top = this.dragTargetStartOffset.top + dy;
            this.setContainerInfo();
            left = this.getScopeValue(left, this.containerOffset.left, this.containerOffset.left - this.dragTargetWidth + this.containerOuterWidth);
            top = this.getScopeValue(top, this.containerOffset.top, this.containerOffset.top - this.dragTargetHeight + this.container.outerHeight());
            this.dragTarget.css({
                'left': left,
                'top': top
            });
            this.layoutPlaceHolder(left, top, event);
        },
        'setDragStartInfo': function(event) {
            this.dragStartClient = this.getMousePos(event);
            this.dragTargetStartOffset = this.dragTarget.offset();
        },
        'updatePlaceHolderOffset': function() {
            this.placeHolderOffset = this.placeHolder.offset();
        },
        'updateInitPosInfo': function(event) {
            this.updatePlaceHolderOffset();
            this.setDragStartInfo(event);
        },
        'movePlaceHolder': function(startNode, dir, dragItemLeft, dragItemTop, isSameRow) {
			// console.log('dir:'+dir);
            dir = dir == 'prev' ? dir: 'next';
            var node = startNode,
            initTop = startNode.offset().top,
            itemWidth = this.dragTargetWidth,
            itemHeight = this.dragTargetHeight,
            dragItemClsName = '.' + this.dragonClassName + ', .placeholder',
            offset,
            middle,
            end;
            while (node[0]) {
                if (!node.is(dragItemClsName) && node.offset().top != initTop) {
                    break;
                }
                if (node.is(dragItemClsName)) {
                    node = node[dir]();
                    continue;
                }
                offset = node.offset();
                middle = offset.left + itemWidth / 2;
                if (dragItemLeft < middle && (dragItemLeft + itemWidth) > middle) {
                    this.placeHolder[dir == 'next' ? 'insertAfter': 'insertBefore'](node);
                    this.updatePlaceHolderOffset();
                    break;
                }
                node = node[dir]();
            }
        },
        'layoutPlaceHolder': function(dragItemLeft, dragItemTop, event) {
            var itemWidth = this.dragTargetWidth,
            itemHeight = this.dragTargetHeight,
            halfWidth = itemWidth / 2,
            halfHeight = itemHeight / 2,
            startNode = this.placeHolder,
            placeHolderOffset = this.placeHolderOffset,
            dragTargetStartOffset = this.dragTargetStartOffset,
            find = false,
            me = this,
            node,
            offset,
            targetTop,
            isLeftSide,
            isRightSide,
            isDown;
            targetTop = placeHolderOffset.top - halfHeight - this.vSpace;
            isDown = (dragItemTop < placeHolderOffset.top + halfHeight) && (dragItemTop > placeHolderOffset.top - halfHeight);
            isLeftSide = isDown && dragItemLeft < (placeHolderOffset.left - this.hSpace);
            isRightSide = isDown && dragItemLeft > (placeHolderOffset.left + this.hSpace);
            function findFirstLocationNode(startNode, dir, fn, isSameRow) {
                dir = (dir == 'prev') ? dir: 'next';
                var node = startNode[dir](),
                offset;
                while (node[0]) {
                    offset = node.offset();
                    if (fn(node)) {
                        return node;
                    } else {
                        node = node[dir]();
                    }
                }
                return false;
            }
            var classNameStr = '.' + this.dragonClassName + ',placeholder',
            dir,
            locationNode;
            if (dragItemTop <= targetTop || isLeftSide) {
                dir = 'prev';
                locationNode = findFirstLocationNode(startNode, dir, 
                function(node) {
                    var offset = node.offset();
                    return (dragItemTop < offset.top + halfHeight && (dragItemTop + itemHeight) > offset.top + halfHeight || (isLeftSide && offset.top == placeHolderOffset.top)) && !node.is(classNameStr);
                },
                isLeftSide);
            } else if (dragItemTop >= (placeHolderOffset.top + halfHeight + this.vSpace) || isRightSide) {
                dir = 'next';
                locationNode = findFirstLocationNode(startNode, dir, 
                function(node) {
                    var offset = node.offset();
                    return ((dragItemTop + halfHeight) >= offset.top && dragItemTop <= offset.top || (isRightSide && offset.top == placeHolderOffset.top)) && !node.is(classNameStr);
                },
                isRightSide);
            }
            if (dir && locationNode) {
                var isSameRow = dir == 'next' && isRightSide || dir == 'prev' && isLeftSide;
                this.movePlaceHolder(locationNode, dir, dragItemLeft, dragItemTop, isSameRow);
            }
            return;
        },
        'unloadDrag': function() {
            $(document).unbind('mousemove', this.dragProxy).unbind('mouseup', this.endDragProxy);
        },
        'endDrag': function(event) {
            if (!this.isDragging) {
                return;
            }
            this.unloadDrag();
            var me = this;
            this.dragItems.css({
                'position': 'relative',
                'left': 0,
                'top': 0,
                'z-index': 0
            }).each(function() {
                $(this).insertBefore(me.placeHolder);
            }).fadeIn(3000);
            setTimeout($.proxy(function() {
                this.dragItems.removeClass(this.dragonClassName);
            },
            this), 10);
            this.dragClear();
        },
        'dragClear': function() {
            this.enableSelect();
            this.dragTarget.removeClass('multiple');
            this.setupDrag = false;
            this.isDragging = false;
            this.placeHolder.remove();
            this.placeHolder = null;
            clearInterval(this.layoutTimer);
            this.layoutTimer = null;
        }
    };
    DragdropSorter.CLASS_DRAGON = 'ondrag';
    DragdropSorter.CLASS_PICKED = 'ondrag';
    DragdropSorter.CLASS_ITEM = 'photobg';
	/*
	//K.DragdropSorter.picSortByTime(1);逆时间
	//K.DragdropSorter.picSortByTime(-1);顺时间
    DragdropSorter.picSortByTime = function(direct) {
        var divAllPic = $('#div_all_pic'),
        me = this;
        setTimeout(function() {
            var list = [],
            listDom = divAllPic.find('a[data-pid]'),
            docFrag = document.createDocumentFragment();
            listDom.each(function(k, item) {
                list.push($(item));
            });
            list.sort(function(link1, link2) {
                if (direct > 0) {
                    return link2.attr('data-pid') - link1.attr('data-pid');
                } else {
                    return link1.attr('data-pid') - link2.attr('data-pid');
                }
            });
            for (var i = 0, len = list.length; i < len; i++) {
                docFrag.appendChild(list[i].parent()[0]);
            }
            $('#photolist').html('').append(docFrag);
        },
        10);
    };
	*/
    K.DragdropSorter = DragdropSorter;
})();

