var Detail = {

	init: function(wrap) {
		/*SEO显示 隐藏*/
		var $links_label = $('.links label');

		// alading 第一次进入
		Detail.firstIn = true;
		if($links_label.length != 0){
			var isshow  = false;
			var $links = $('.links');
			$links_label.click(function(){
				if(!isshow){
					$links.css('height','auto');
					isshow = true;
					$links_label.html('<span>收起</span><i class="fz fz-slideup"></i>');
				}else{
					$links.css('height','70px');
					isshow = false;
					$links_label.html('<span>展开</span><i class="fz fz-slidedown"></i>')
				}
			})
		}
		
		/*首页底部的快速注册按钮*/
		$('.btn-signup').on('click', function() {
			Detail.showSign(1);
		})
		
		/*展开更多文字*/
		$('.fold-text .more-view').on('click', function() {
			if ($(this).find('.fz-slidedown').length) {
				$(this).parent().css({
					'max-height': 'none',
					'overflow': 'visible'
				});
				//$(this).hide();
				$(this).css('bottom','-20px');
				$(this).html('收起<i class="fz fz-slideup"></i></a>').show();
			} else {
				$(this).parent().removeAttr('style');
				$(this).removeAttr('style');
				$(this).html('...展开<i class="fz fz-slidedown"></i></a>').show();
			}
			
		})
		
		/*搜索结果公司卡片整个可点击*/
		$('.company-card').on('click', function(e) {
			if (!$(e.target).hasClass('btn')) {
				window.location.href = $(this).find('.btn').eq(0).attr('href');
			}
		})
		
		if ($('.detail-content .job-sec .fold-text').text().length > 275) {
			$('.detail-content .job-sec .more-view').show();
		}
		$('.manager-list .fold-text').each(function() {
			if ($(this).text().length > 69) {
				$(this).find('.more-view').show();
			} else {
				$(this).find('.more-view').remove();
			}
		})
		
		/*右侧注册框初始化*/
		/*测试注意改回事件绑定方式*/
		$('.detail-op').on('click','.btn', function(e) {
			var el = $(this);
			if (el.hasClass('btn-outline')) {
				Detail.deliveResume(el);
				e.preventDefault();
			} else if(el.hasClass('btn-startchat')) {
				Detail.startChat(el);
				e.preventDefault();
			}
			/*继续沟通的情况不阻止，用链接跳转*/
		})
		
		/*阿拉丁相关逻辑*/
		if (typeof _userInfo != 'undefined') {
			this.showMes();
			//this.showTip();
			var that = this;
		
			if(!_userInfo.isLogin){
				//未登录 弹注册
				var conTip = $('.container-tip');
				setTimeout(function(){
					Detail.canClick = true;	
					$('.avatar img').on('click',function(){
						if ($('.jconfirm').length) {
							$('.jconfirm').remove();
						}
						if(Detail.canClick){
							that.showGuide();
						}
					})
				},4000)

				$('.container-tip .tip-box>a').on('click',function(){
					if ($('.jconfirm').length) {
						$('.jconfirm').remove();
					}
					if($(this).data('load')  != true) {
						var _that = $(this);
						_that.data('load',true);
						$('.container-tip').fadeOut(function(){
							$.confirm({
								content: $('#pop-hide-container').html(),
								title: false,
								confirmButton: false,
								cancelButton: false,
								closeIcon: true,
								columnClass:'pop-sign-box',
								onOpen: function() {
									Singup.init();
								},
								onClose: function() {
									if(Singup.cdAni){
										clearInterval(Singup.cdAni);
										Singup.cdAni=null;
									}
									that.showMes();
								}
							})
							_that.data('load',false);
						});
					}
				})
			}else if(!_userInfo.isPerfect){
				//已登录  未完善
				var conTip = $('.container-tip');
				setTimeout(function() {
					Detail.canClick = true;	
					$('.avatar img').on('click',function(){
						that.showGuide();
					})
				},4000)
				$('.tip-box a').attr('href','/niurenweb/complete/guide.html');
			}
			/*hasKaAnotherS为true时JS上报一个特殊的PV统计*/
			/*上报KA*/
			if (_userInfo.hasKaAnotherS) {
				try {
					_T.sendEvent('detail_with_another_s_from_same_boss');//JS触发上报事件
					//_T.sendPageView();//JS触发上报PV
				} catch(e) {}
			}
			
		}
		
		//滚动屏幕时 大banner消失  小banner出现
		var Banner = $('.job-banner');
		var smallBanner = $('.smallbanner');
		//是否在滚动 
		var isSliding = false;
		function showBanner(){
			
			if ($(this).scrollTop() >= ($('.job-box').offset().top - 80)){
				if (!isSliding) {
					isSliding = true;
					smallBanner.slideDown(300,function(){
						isSliding = false;
					});
				}
			} else {
				smallBanner.hide();
			}
		}
		if($(document).height() - $(window).height() < 260) {
			return;
		}else{
			
			if($('.job-banner').length ==  0){
				return false;
			}else{
				showBanner();
				$(window).scroll(function(){
					showBanner();
				})
				
			}
		}
	},


	/*投递简历*/
	deliveResume: function(el) {
		var url = el.attr('data-url'),
			redirectUrl = el.attr('redirect-url');
		if (el.hasClass('btn-loading') ||　el.hasClass('btn-disabled')) return;
		el.html('<i class="icon-loading"></i>投递中').addClass('btn-loading');
		$.ajax({
            url: url,
            type: 'post',
            dataType:'json',
            data: {},
            success:function(result){
				var result = result;
				if (result.rescode) {
					if (result.rescode == 1) {//投递成功
						$.confirm({
							content: '<div class="deliver-pop"><p class="text">您的附件简历已经发送给Boss，请静候佳音。</p></div>',
							title: '投递成功',
							confirmButton: '确定',
							cancelButton: false,
							closeIcon: true,
							autoClose: 'confirm|3000',
							columnClass:'pop-tip-box pop-detail',
							onOpen: function() {
								var _self = this;
								$('.btn-sendresume').text('已投递');
								_self.$content.find('.btn').on('click', function() {
									$('.btn-sendresume').removeClass('btn-loading').addClass('btn-disabled');
									_self.close();
								})
							},
							onClose: function() {
								
							}
						})
						
					} else if (result.rescode == 3 || result.rescode == 4) {//登录用户身份为Boss，当未登录处理，牛人未完善简历
						Detail.showSign(result.rescode);
						el.text('投递简历').removeClass('btn-loading');
					} else if (result.rescode == 5) {
						el.text('已投递').removeClass('btn-loading').addClass('btn-disabled');
					} else if (result.rescode == 6) {//未上传附件简历
						$.confirm({
							content: '<div class="deliver-pop"><p class="text">请您上传附件简历，即可完成投递。</p><div class="resume-attachment"></div><div class="btns"><input id="fileupload" type="file" name="file" class="file" /><button type="button" class="btn">立即上传</button><button type="button" class="btn btn-outline">先聊聊</button></div></div>',
							title: '上传附件简历',
							confirmButton: false,
							cancelButton: false,
							closeIcon: true,
							columnClass:'pop-tip-box pop-detail',
							onOpen: function() {
								var _self = this;
								_self.$content.find('.btn').on('click', function() {
									if ($(this).text() == '确定') {
										$('.job-detail .btn-sendresume').click();
										_self.close();
									}
									if ($(this).text() == '先聊聊') {
										$('.job-detail .btn-startchat').click();
										_self.close();
									}
								})
								Resume.setUpload();
							},
							onClose: function() {
								
							}
						})
						el.text('投递简历').removeClass('btn-loading');
					} else if (result.rescode == 7) {//不符合Boss要求
						$.confirm({
							content: '<div class="deliver-pop"><p class="text">'+ result.resmsg +'</p><div class="btns"><button type="button" class="btn">再看看</button><button type="button" class="btn btn-outline" data-url="'+ el.attr('data-url') + '&isSureSend=1' +'" redirect-url="'+ el.attr('redirect-url') +'">继续投递</button></div></div>',
							title: '您不太符合该boss的要求',
							confirmButton: false,
							cancelButton: false,
							closeIcon: true,
							columnClass:'pop-tip-box pop-detail',
							onOpen: function() {
								var _self = this;
								_self.$content.find('.btn').on('click', function() {
									if ($(this).text() == '再看看') {
										_self.close();
									}
									if ($(this).text() == '继续投递') {
										Detail.deliveResume($(this));
										_self.close();
									}
								})
							},
							onClose: function() {
								
							}
						})
						el.text('投递简历').removeClass('btn-loading');
					} else if (result.rescode == 8) {//职位不支持投递
						$.confirm({
							content: '<div class="deliver-pop"><p class="text">此职位不支持投递，请与Boss直接沟通</p><div class="btns"><button type="button" class="btn">确定</button></div></div>',
							title: '提示',
							confirmButton: false,
							cancelButton: false,
							closeIcon: true,
							columnClass:'pop-tip-box pop-detail',
							onOpen: function() {
								var _self = this;
								_self.$content.find('.btn').on('click', function() {
									if ($(this).text() == '确定') {
										_self.close();
									}
								})
							},
							onClose: function() {
								
							}
						})
						el.text('投递简历').removeClass('btn-loading');
					}
				} else if(result.code == 1011) {//未登录
					Detail.showSign(1011);
					el.text('投递简历').removeClass('btn-loading');
				} else {
					alert(result.resmsg);
					el.text('投递简历').removeClass('btn-loading');
				}
                
            },
            error:function(e){
                el.text('投递简历').removeClass('btn-loading');
            }
        })
	},
	/*立即沟通*/
	startChat: function(el) {
		var el = el,
			url = el.attr('data-url');
		if (el.attr('href') != 'javascript:;') return;
		el.addClass('btn-disabled');
		$.ajax({
			type: 'POST',
			url: url,
			dataType:'JSON',
			data: null,
			success: function(result) {
				if (result.rescode) {
					if (result.rescode == 1) {//投递成功
						window.location.href = el.attr('redirect-url');
						el.attr('href', el.attr('redirect-url')).text('继续沟通');
						el.removeClass('btn-disabled');
					} else if (result.rescode == 3 || result.rescode == 4) {//登录用户身份为Boss，当未登录处理，牛人未完善简历
						Detail.showSign(result.rescode);
						el.removeClass('btn-disabled');
					}
				} else if(result.code == 1011) {//未登录
					Detail.showSign(1011);
					el.removeClass('btn-disabled');
				} else {
					alert(result.resmsg);
					el.removeClass('btn-disabled');
				}
			},
			error: function(e) {
				el.removeClass('btn-disabled');
			}
		})
	},
	showSign: function(type) {
		$.confirm({
			content: $('.sign-wrap').html(),
			title: false,
			confirmButton: false,
			cancelButton: false,
			closeIcon: true,
			columnClass:'pop-sign-box',
			onOpen: function() {
				var _self = this;
				Sign.init(_self.$content);
				if (type == 4) {
					_self.$content.find('.sign-welcome').show();
					Sign.countDown(_self.$content.find('.sign-welcome .welcome-box .count-down'), function() {
						window.location.href = _self.$content.find('.sign-welcome .welcome-box .btn').attr('href');
					});
				} else {
					_self.$content.find('.sign-pwd').show();
				}
			},
			onClose: function() {
				if(Sign.interCount){
					clearInterval(Sign.interCount);
					Sign.interCount=null;
				}
			}
		})
	},
	//显示模拟聊天模块
	showMes:function() {
		if(!_userInfo.isLogin || !_userInfo.isPerfect){
			var Mes = $('.message');
			
			Detail.canClick = false;	
			$.each(_userInfo.text,function(i,value){
				Mes.find('.text').eq(i).html(value);
			});

			if(Detail.firstIn){
				//头像出现
				setTimeout(function(){
					$('.container-mes').fadeIn();
					$('.container-mes').find('.avatar').css('display','block');
				},1000)
				//3句话依次出现
				setTimeout(function(){
					Mes.css('top','40px');
					Mes.fadeIn();
					Mes.find('li').eq(0).fadeIn();
				},1800)
				setTimeout(function(){
					Mes.find('li').eq(1).fadeIn();
				},2600)
				setTimeout(function(){
					Mes.find('li').eq(2).fadeIn();
					Detail.canClick = true;
				},3400)
				Detail.firstIn = false;
			}else{
				Mes.css('top','40px');
				Mes.fadeIn(200);
				$('.container-mes').find('.avatar').fadeIn(200);
				Detail.canClick = true;
			}
		}
		
	},
	//阿拉丁蒙层
	showTip:function(){
		if((!_userInfo.isLogin || !_userInfo.isPerfect) && _userInfo.showTip){
			var Ele = $('.avatar img');
			Detail.canClick = false;
			setTimeout(function(){
				$('.message').css('z-index','101');
				$('.aladingtip').fadeIn();
				Ele.addClass('avatar-ani')
				Ele.mouseover(function(){
					$(this).removeClass('avatar-ani');
				});
				Ele.mouseout(function(){
					$(this).addClass('avatar-ani');
				})
			},3400)
			$('.aladingtip').click(function(){
				$(this).fadeOut(function(){
					Ele.removeClass('avatar-ani');
					Ele.unbind('mouseover mouseout');
				});
			})
		}
	},
	// 完善引导 完善引导出现 阿拉丁和对话框都消失
	showGuide:function(){
		var conTip = $('.container-tip'),
			conMes = $('.container-mes'),
			that  = this;
		// 阿拉丁和对话框都消失
		conMes.find('.message').css({'top':'20px','-webkit-transition':'all linear .2s','transition':'all linear .2s'}).fadeOut();
		conMes.find('.avatar').fadeOut();
		$('.aladingtip').fadeOut();

		//完善引导框出现	
		conTip.fadeIn(200);
		conTip.find('.tip-box').css({'margin-bottom':'35px','-webkit-transition':'all linear .2s','transition':'all linear .2s'});
		conTip.find('.trangle').css({'bottom':'69px','-webkit-transition':'all linear .2s','transition':'all linear .2s'});

		conTip.find('a.close').click(function(){
			conTip.find('.tip-box').css({'margin-bottom':'15px','-webkit-transition':'all linear .2s','transition':'all linear .2s'});
			conTip.find('.trangle').css({'bottom':'49px','-webkit-transition':'all linear .2s','transition':'all linear .2s'});
			
			$('.message').css('top','160px');
			conTip.fadeOut(function(){
				that.showMes();
			});
			
			if ($('.jconfirm').length) {
				$('.jconfirm').remove();
			}
		})
	}
};
