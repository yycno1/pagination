  /**
	 *@param{String || Dom Object || jQuery Object} ele 存放分页组件的容器
	 *@param{Object} options 配置参数
	 *options.pageTot {Int}总页数
	 *options.curpage {Int}当前页
	 *options.pageListener {Function} 页码点击事件监听 参数(pageNum) 上下文(page实例)
	 *options.showPageDetail {Boolean} 是否显示当前页码和总页码 default(true)
	 *options.showJumpBtn {Boolean} 是否显示跳转具体页面的按钮 default(false)
	 *options.pageBtnsNum {Int} 显示页码按钮的数量 default(7)
	 *options.alias {Object} 按钮别名
	 *
	 *实例方法
	 *go(page) 定位到指定页面 触发pageListener
	 *goNext 定位到下个页面 触发pageListener
	 *goPrev 定位到上个页面 触发pageListener
	 *
	 *setCurPage 重新设置当前页,并立即重绘组件,不触发pageListener
	 *setPageTot 重新设置总页数,并立即重绘组件,不触发pageListener
	 *setPage 重新设置当前页和总页数,并立即重绘组件,不触发pageListener
	 */

(function(root,factory){
	if(typeof define === 'function' && define.amd){
		define(['jquery'],factory);
	}else if(typeof exports === 'object'){
		module.exports = factory(require('jquery'));
	}else{
		root.Page = factory(root.jQuery);
	}
}(this,function($){
	function Page(ele,options){
		this.options = $.extend(true,Page.defaultOptions,options);
		if(this.options.pageBtnsNum < 5){
			this.options.pageBtnsNum = 5;
		}
		this.ele = $(ele);

		this.render();
		this.listen();
	}

	Page.defaultOptions = {
		pageTot: 0,
		curPage: 0,
		pageListener: null,
		showPageDetail: true,
		showJumpBtn: false,
		pageBtnsNum: 7,
		alias: {
			firstPage: "&lt;&lt;",
			lastPage: "&gt;&gt;",
			prevPage: "&lt;",
			nextPage: "&gt;",
			jumpBtn: "跳转"
		}
	}

	Page.prototype = {
		render : function(){
			var pageTot = this.options.pageTot,
				curPage = this.options.curPage,
				html = '';

			if(pageTot === 0){
				this.ele.html("");
				return;
			}
			
			html = "<ul class='pagination' style='vertical-align:middle'>" 
				+ this._getPageDetailHtml()
				+ this._getPrevBtnHtml()
				+ this._getPageBtnsHtml()
				+ this._getNextBtnHtml()
				+ "</ul>"
				+ this._getJumpBtnHtml();

			this.ele.html(html);
		},

		_getPageDetailHtml: function(){
			var options = this.options,
				showPageDetail = options.showPageDetail;

			return showPageDetail 
				? "<li class='disabled page-detail'><span>第" + options.curPage + "页/共" + options.pageTot + "页</span></li>"
				: "";
		},
		_getJumpBtnHtml: function(){
			return this.options.showJumpBtn
				? "<div style='display:inline-block;margin-left:10px;' class='page-jump-btn'>第<input id='pageInput' style='width:36px;'>页<button class='btn btn-default btn-sm'>"+this.options.alias.jumpBtn+"</button></div>"
				: "";
		},

		_getPrevBtnHtml: function(){
			var options = this.options,
				curPage = options.curPage,
				firstPageAlias = options.alias.firstPage,
				prevPageAlias = options.alias.prevPage;

			return curPage > 1 
				? "<li class='first-page' data-page='first'><a href='javascript:;'>"+firstPageAlias+"</a></li>" +
					"<li class='prev-page' data-page='prev'><a href='javascript:;'>"+prevPageAlias+"</a></li>"
				: "<li class='first-page disabled' data-page='first'><a href='javascript:;'>"+firstPageAlias+"</a></li>" +
					"<li class='prev-page disabled' data-page='prev'><a href='javascript:;'>"+prevPageAlias+"</a></li>";
		},

		_getNextBtnHtml: function(){
			var options = this.options,
				curPage = options.curPage,
				pageTot = options.pageTot,
				lastPageAlias = options.alias.lastPage,
				nextPageAlias = options.alias.nextPage;

			return curPage < pageTot 
				? "<li class='next-page' data-page='next'><a href='javascript:;'>"+nextPageAlias+"</a></li>" +
					"<li class='last-page' data-page='last'><a href='javascript:;'>"+lastPageAlias+"</a></li>"
				: "<li class='next-page disabled' data-page='next'><a href='javascript:;'>"+nextPageAlias+"</a></li>" +
					"<li class='last-page disabled' data-page='last'><a href='javascript:;'>"+lastPageAlias+"</a></li>";
		},

		_getPageBtnsHtml: function(){
			var options = this.options,
				pageBtnsNum = options.pageBtnsNum,
				curPage = options.curPage,
				pageTot = options.pageTot,
				median = Math.ceil(pageBtnsNum/2),
				sideBtnsNum = Math.floor(pageBtnsNum/2) - 1,
				left = '',
				right = '',
				btns = '';

			if(pageTot <= pageBtnsNum){
				btns = this._cancatBtns(1,pageTot);
			}else if(curPage <= median){
				btns = this._cancatBtns(1,pageBtnsNum - 1);
				right = this._getEllipsis();
			}else if(curPage >= pageTot - median + 1){
				btns = this._cancatBtns(pageTot - pageBtnsNum + 2,pageTot);
				left = this._getEllipsis();
			}else{
				btns = this._cancatBtns(curPage - sideBtnsNum,curPage + sideBtnsNum);
				left = right = this._getEllipsis();
			}

			return left + btns + right;
		},

		_cancatBtns : function(beginIndex,endIndex){
			var btnsHtml = "";
			for(var i=beginIndex;i<=endIndex;i++){
				if(i === this.options.curPage){
					btnsHtml += "<li class='active' data-page='"+i+"'><a href='javascript:;'>"+i+"</a></li>";
				}else{
					btnsHtml += "<li data-page='"+i+"'><a href='javascript:;'>"+i+"</a></li>";
				}
			}
			return btnsHtml;
		},
		_getEllipsis : function(){
			return "<li class='disabled'><span>...</span></li>";
		},

		listen : function(){
			var self = this;
			this.ele.on("click","li",function(e){
				var $this = $(this),
					page = '';
				if($this.hasClass("disabled")){
					return;
				}
				page = $this.data("page");
				self.go(page);
			});
			this.ele.on("click","button",function(e){
				var pageInput = parseInt($("#pageInput").val());
				if(!pageInput || pageInput < 1 || pageInput > self.options.pageTot){
					console.info('illegal page');
					return;
				}
				self.go(pageInput); 
			})
		},

		go : function(page){
			var options = this.options,
				curPage = options.curPage,
				pageTot = options.pageTot;
			if(page == "first"){
				options.curPage = 1;
			}else if(page == "prev"){
				if(curPage === 1){
					console.info("can not go page %d",curPage - 1);
					return;
				}
				options.curPage = curPage - 1;
			}else if(page == "last"){
				options.curPage = pageTot;
			}else if(page == "next"){
				if(curPage === pageTot){
					console.info("can not go page %d",pageTot + 1);
					return;
				}
				options.curPage = curPage + 1;
			}else{
				page = Math.round(page);
				if(!page || page > pageTot || page < 1){
					console.info("illegal page");
					return;
				}
				options.curPage = page;
			}

			this.render();

			if(options.pageListener){
				options.pageListener.call(this,options.curPage);
			}
		},

		goNext : function(){
			this.go('next');
		},

		goPrev : function(){
			this.go('prev');
		},

		setCurPage : function(page){
			var options = this.options;
			page = Math.round(page);
			if(!page || page > options.pageTot || page < 1){
				console.info("illegal page");
				return;
			}
			options.curPage = page;
			this.render();
		},

		setPageTot : function(pageTot){
			var options = this.options;
			pageTot = Math.round(pageTot);
			if(!pageTot || pageTot < options.curPage){
				console.info("illegal pageTot");
				return;
			}
			options.pageTot = pageTot;
			this.render();
		},

		setPage : function(curPage,pageTot){
			var options = this.options;
			curPage = Math.round(curPage);
			pageTot = Math.round(pageTot);
			if(!curPage || !pageTot || curPage > pageTot || curPage < 0){
				console.info("illegal page");
				return;
			}
			options.curPage = curPage;
			options.pageTot = pageTot;
			this.render();
		},

		destroy : function(){
			this.ele.off("click");
			this.ele.remove();
		}
	}
	
	return Page;
}));