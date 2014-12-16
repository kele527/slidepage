

/**
 * 通用全屏滑动切换动画组件
 * @method slidepage.init
 * @param {string} 
 * @return 
 * @example

    slidepage.init({
        container:'#demo1',
        onSlide:function () {
            console.info(this.index)
        },
        loadingId:'#loading',
        loadingImgs:[
            'http://imgcache.gtimg.cn/mediastyle/mobile/event/20141118_ten_jason/img/open_cover.jpg?max_age=2592000',
            'http://imgcache.gtimg.cn/mediastyle/mobile/event/20141118_ten_jason/img/im_cover.jpg?max_age=2592000',
            'http://imgcache.gtimg.cn/mediastyle/mobile/event/20141118_ten_jason/img/bg1.jpg?max_age=2592000',
            'http://imgcache.gtimg.cn/mediastyle/mobile/event/20141118_ten_jason/img/bg2.jpg?max_age=2592000'
        ],
        preLoadingImgs:[],
        onLoading:function (complete,total) {
            this.$('#loading div').style.width=complete/total*100+'%';
        }
    });
 * 
 * 
 * 没有依赖
 * @date 2014/11/3 星期一
 * @author rowanyang
 * 
 */

;(function (win) {

function extend(a,b) {
    for (var i in b) {
        a[i]=b[i];
    }
    return a;
}

var slidepage = {
    opts:{
        speed:400,
        isVertical:true,
        loadingImgs:[],
        preLoadingImgs:[],
        onSlide:function () {},
        onLoading:function () {}
    },
    wrap:null,
    tplNum:0,
    tpl:[],
    index : 0,
    $:function (o) {
        return document.querySelector(o);
    },
    $$:function (o) {
        return document.querySelectorAll(o);
    },

	init:function (opts) {
		var self = this;
        extend(this.opts,opts);
        this.wrap=this.$(this.opts.container);
        this.tpl=this.wrap.cloneNode(true).children;
        this.tplNum=this.tpl.length; //总页数数据

		this.touchInitPos = 0;//手指初始位置
		this.startPos = 0;//移动开始的位置
		this.totalDist = 0,//移动的总距离
		this.deltaX1 = 0;//每次移动的正负
		this.deltaX2 = 0;//每次移动的正负
        
        this.displayWidth = document.documentElement.clientWidth; //图片区域最大宽度
        this.displayHeight = document.documentElement.clientHeight; //图片区域最大高度

        this.scrollDist=this.opts.isVertical?this.displayHeight:this.displayWidth;//滚动的区域尺寸 
        
        this.wrap.innerHTML='';
        this.wrap.style.display="block"
        
        if (this.opts.loadingImgs && this.opts.loadingImgs.length) {
            this.loading();
        }else {
            this.pageInit();
        }

		this.$('body').addEventListener('touchstart',function (e) {
			self.touchstart(e);
		},false);
		this.$('body').addEventListener('touchmove',function (e) {
			self.touchmove(e);
		},false);
		this.$('body').addEventListener('touchend',function (e) {
			self.touchend(e);
		},false);
		this.$('body').addEventListener('touchcancel',function (e) {
			self.touchend(e);
		},false);

        document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
	},
    pageInit:function () {
        var self = this;
        this.wrap.innerHTML='<div id="current" class="item '+this.tpl[0].className+'" style="-webkit-transform:translate3d(0,0,0)">'+this.tpl[0].innerHTML+'</div><div id="next" class="item item-1" style="-webkit-transform:translate3d('+this.getDist('100%')+')">'+this.tpl[1].innerHTML+'</div>';

        setTimeout(function () {
            self.$('#current').className+=' play'
        });
    },
	touchstart : function (e) {
		if(e.touches.length !== 1){return;}//如果大于1个手指，则不处理
		this.touchInitPos = this.opts.isVertical ? e.touches[0].pageY:e.touches[0].pageX; // 每次move的触点位置
		this.deltaX1 = this.touchInitPos;//touchstart的时候的原始位置

		this.startPos = 0;
		this.startPosPrev = -this.scrollDist;
		this.startPosNext = this.scrollDist;
		this.hasPrev = !!this.$('#prev');
		this.hasNext = !!this.$('#next');
		//手指滑动的时候禁用掉动画
		if (this.hasNext) {
			this.$('#next').style.cssText+='-webkit-transition-duration:0;'
		}
		this.$('#current').style.cssText+='-webkit-transition-duration:0;'
		if (this.hasPrev) {
			this.$('#prev').style.cssText+='-webkit-transition-duration:0;'
		}
	},
	touchmove : function (e) {
		if(e.touches.length !== 1){return;}

		var currentX = this.opts.isVertical ? e.touches[0].pageY:e.touches[0].pageX;
		this.deltaX2 = currentX - this.deltaX1;//记录当次移动的偏移量
		this.totalDist = this.startPos + currentX - this.touchInitPos;

		this.$('#current').style.WebkitTransform='translate3d('+this.getDist(this.totalDist+'px')+')';
		this.startPos = this.totalDist;
		
		//处理上一张和下一张
		if (this.totalDist<0) {//露出下一张
			if (this.hasNext) {
				this.totalDist2 = this.startPosNext + currentX - this.touchInitPos;

				this.$('#next').style.WebkitTransform='translate3d('+this.getDist(this.totalDist2+'px')+')';
				this.startPosNext = this.totalDist2;
			}
		}else {//露出上一张
			if (this.hasPrev) {
				this.totalDist2 = this.startPosPrev + currentX - this.touchInitPos;

				this.$('#prev').style.WebkitTransform='translate3d('+this.getDist(this.totalDist2+'px')+')';
				this.startPosPrev = this.totalDist2;
			}
		}

		this.touchInitPos = currentX;
	},
	touchend : function (e) {
		if(this.deltaX2<-15){
			this.next();
		}else if(this.deltaX2 > 15){
			this.prev();
		}else{
			this.itemReset();
		}
		this.deltaX2 = 0;
	},
    getDist:function (dist) {
        return (this.opts.isVertical? '0,'+dist : dist+',0')+',0' ;
    },
    itemReset:function () {
        this.$('#current').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d(0,0,0)';
        if (this.$('#prev')) {
            this.$('#prev').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d('+this.getDist('-'+this.scrollDist+'px')+')';
        }
        if (this.$('#next')) {
           this.$('#next').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d('+this.getDist(this.scrollDist+'px')+')';
        }
		this.deltaX2 = 0;
    },

    prev:function () {
        var self = this;
        if (this.index > 0) {
            this.index--;
        }else {
            this.itemReset();
            return false;
        }

        var nextIndex = this.index+1 > this.tplNum-1 ? 0 : this.index+1;

        this.$('#current').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d('+this.getDist(this.scrollDist+'px')+')';
        if (this.$('#next')) {
            this.wrap.removeChild(this.$('#next'));
        }
        this.$('#current').id='next';
        this.$('#prev').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d(0,0,0)';
        this.$('#prev').id='current';

        setTimeout(function () {
            self.$('#current').innerHTML=self.tpl[self.index].innerHTML;
            if (self.$('.play')) {
                self.$('.play').className=self.$('.play').className.replace(/\s*\bplay\b/g,'');
            }
            self.$('#current').className +=' play';
        },400)

        this.opts.onSlide.call(this);

        var prevIndex = this.index-1;
        if (prevIndex < 0) {
            prevIndex =  this.tplNum-1;
            return false;
        }

        var addItem = document.createElement('div');
        addItem.className='item item-'+prevIndex;
        addItem.id='prev';
        addItem.style.cssText+='-webkit-transition-duration:0ms;-webkit-transform:translate3d('+this.getDist('-'+this.scrollDist+'px')+')';

        addItem.innerHTML=self.tpl[prevIndex].innerHTML;

        this.wrap.insertBefore(addItem,this.$('#current'));

    },

    next:function () {

        var self = this;
        if (this.index < this.tplNum-1) {
            this.index++;
        }else {
            this.itemReset();
            return false;
        }
        

        var prevIndex = this.index===0 ? this.tplNum-1 : this.index-1;

        this.$('#current').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d('+this.getDist('-'+this.scrollDist+'px')+')';
        if (this.$('#prev')) {
            this.wrap.removeChild(this.$('#prev'));
        }
        this.$('#current').id='prev';
        this.$('#next').style.cssText+='-webkit-transition-duration:'+this.opts.speed+'ms;-webkit-transform:translate3d(0,0,0)';
        this.$('#next').id='current';

        window.t1=Date.now();

        setTimeout(function () {
            if (self.$('.play')) {
                self.$('.play').className=self.$('.play').className.replace('play','');
            }
            self.$('#current').className +=' play';
        },400);


        setTimeout(function () {
            self.opts.onSlide.call(self);
            var nextIndex = self.index+1;
            if (nextIndex >= self.tplNum) {
        //        $('#arr').style.display='none';
                return false;
            }

            var addItem = document.createElement('div');
            addItem.className='item item-'+nextIndex;
            addItem.id='next';
            addItem.style.cssText+='-webkit-transition-duration:0ms;-webkit-transform:translate3d('+self.getDist(self.scrollDist+'px')+')';
            addItem.innerHTML=self.tpl[nextIndex].innerHTML;
            self.wrap.appendChild(addItem);
        },this.opts.speed)

            log(Date.now()-t1)
    },
    loading:function () {
        var self = this;
        var imgurls=this.opts.loadingImgs;
        var fallback=setTimeout(this.pageInit,15*1000);//超时时间  万一进度条卡那了 15秒后直接显示

	    this.wrap.appendChild(this.$(this.opts.loadingId));
        
        var imgs=[], loaded=1;
        var total=imgurls.length+1;
        for (var i=0; i<imgurls.length; i++) {
            imgs[i]=new Image();
            imgs[i].src=imgurls[i];
            imgs[i].onload=imgs[i].onerror=imgs[i].onabort=function (e) {
                loaded++;
                if (this.src === imgurls[0] && e.type === 'load') {
                    clearTimeout(fallback)
//                    ct_cover.init(this, function(cover) {
//                        ct_cover.remove();
//                    });
                }
                checkloaded();
            }
        }

        self.opts.onLoading.call(self,1,total);


        function checkloaded() {
            self.opts.onLoading.call(self,loaded,total);
            if (loaded==total) {
                if (fallback) {
                    clearTimeout(fallback)
                }
                self.pageInit();

                imgs=null;
                if (self.opts.preLoadingImgs && self.opts.preLoadingImgs.length) {
                    self.preloading();
                }
            }
        }
    },
    preloading:function () {
    }

}

if (typeof module == 'object') {
    module.exports=slidepage;
}else {
    win.slidepage=slidepage;
}

})(window);
