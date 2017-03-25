/**
	Geek 端聊天
**/
var Chat = {
	init: function() {
		//在chrome 19版本及以前，包括第三方浏览器如傲游2015年的版本不支持calc，隐藏用js来控制
		Chat.isSuportCalc = true;
		if (typeof Modernizr != 'undefined' && !Modernizr.prefixedCSSValue('height', 'calc(0vh)')) {
			Chat.isSuportCalc = false;
		}
		
		Chat.usersCon = $('.boss-list');
		if($('.nav-figure').length && $('.standard').length){
			Chat.usersTempData = [];//缓存初次加载获取到的全部用户,放的是有序数组
			Chat.usersData = {};//缓存初次以及后续添加进去的所有用户，放的是无序对象
			
			
			Chat.myselfData = { //自己的信息
				uid: _PAGE.uid,
				name: _PAGE.name,
				face: _PAGE.face
			}
			Publisher.init();
			Chat.curUserData = {};//当前对话的用户数据
			//Chat.chatUserCount = 0;//标记用户的位置，用于ka
			Chat.messageStatusData = {};//储存消息的状态
			Chat.messageStatusDataTemp = {};//临时储存消息状态
			Chat.receiveMaxId = -1;
			Chat.mids = {};//我发出的消息的MID
			Chat.unreadCountBox = $('.nav-chat-num');
			Chat.unreadMessageCount = 0;//未读消息总数
			Chat.unReadMessages = {};//存储未读消息，以userid为键
			Chat.websocketConnected = false;//标记webocket的连接状态
			//在非标记是否是收到离线未读消息
			/*	{
					123123: {
						123:{
							type:1,
							offline:true
						}
					}
				}
			*/
			
			Chat.outputData = {//传给其他页面的几个参数
				30:{count:0},  //看过我的。
				31:{count:0},  //有人对你感兴趣
				35:{count:0}  //有新人或新职位
			};
			
			
			Chat.userList.init();
			
			
			
			
			Chat.chatList = $('.chat-list');
			Chat.chatListCon = Chat.chatList.find('ul');
		
			
			
			if (Chat.chatList.length) {
				Chat.curUserData.messageMinId = 0;//
				Chat.curUserData.uid = Chat.chatList.attr('data-uid');
				Chat.curUserData.encryptUid = Chat.chatList.attr('data-eid');
				Chat.curUserData.newMsgCount = 0;
				Chat.curUserData.historyPage = 1;//标记第一页
				Chat.curUserData.canLoadingData = false;//标记是否可以再次加载
				Chat.curUserData.historyLastItem = null;//还原记录
				
				Chat.chatList.on('click', 'img', function() {
					var largeUrl = $(this).attr('data-large'),
						w = $(this).attr('large-x'),
						h = $(this).attr('large-y');
					if (largeUrl) {
						$.confirm({
							content: '<img src="'+ largeUrl +'" width="'+ w +'" height="'+ h +'" />',
							title: false,
							closeIcon: true,
							confirmButton: false,
							cancelButton: false,
							boxWidth: w + '',
							columnClass:'pop-imgview',
							onOpen: function(){
								this.$body.css({
									width: w + 'px',
									height: h + 'px'
								})
							},
							confirm: function() {
								
							},
							error: function(result) {
							}
						})
					}
				})
				
			}
			
			
			
			/*检查是否支持calc*/
			if (!Chat.isSuportCalc) {
				Chat.chatList.css('height',$(window).height() - 334 + 'px');
				$('.chat-sider .detail-content').css('height',$(window).height() - 509 + 'px');
				//Chat.chatList.css('height',$(window).height() - 416 + 'px');
			}
			
			/*监听cookie或localstorage中msgcount的变化*/
			/*var newMsgCount;
			localStorageInstance('msgcount','');//进入页面时清空
			setInterval(function() {
				newMsgCount = localStorageInstance('msgcount');
				console.log('inter')
				console.log(localStorageInstance('msgcount'))
				Chat.checkReadMessageCount(newMsgCount);
			},2000)*/
		}
		
		/*清除localstorage中的未发送成功的记录，防止storage被撑爆*/
		if(window.localStorage){
			for (var i = 0; i < localStorage.length; i++) {
				if (localStorage.key(i).indexOf('/chatws:ws-') > -1) {
					localStorage.removeItem(localStorage.key(i))
				}
			}
		}
	},
	userList: {
		init: function() {
			this.page = 0;//标记拉取联系人数据的页码,0为加载全部，如果初始为1则是按页加载
			this.elList = Chat.usersCon.find('ul');
			this.RenderPage = 0;//标记渲染联系人列表的页码，数据是来自内存的数组
			this.listMore = false;//标记是否还存在更多联系人
			this.tipsContainer = Chat.usersCon.find('.data-tips');
			this.elMore = Chat.usersCon.find('.loadmore');//标记加载更多的dom元素
			this.isLoading = false;//标记正在进行加载更多
			this.getList(this.page);
			var _self = this;
			this.elList.on('click', '.btn-continue', function() {
				var el = $(this),
					item = el.closest('li');
				item.removeClass('read');
				item.find('.icon-new').remove();
			})
			this.elMore.on('click', function() {
				_self.page++;
				if ($(this).hasClass('disabled')) {
					return;
				}
				_self.updateUserList(_self.page);
			})
		},
		getList: function(page) {
			var _self = this,
				page = page;
			_self.isLoading = true;
			if (page == 0) {
				//_self.tipsContainer.html('<div class="spinner spinner-circle"><div class="loader"></div><span>正在加载数据...</span></div>').show();
				_self.elMore.hide();
			}
			$.ajax({
				type: 'GET',
				url: '/gchat/userList.json',
				dataType:'JSON',
				data: 'page=' + page,
				success: function(result) {
					if (result.rescode && result.data.length) {
						var list = result.data,
							i;
						for (i = 0; i < list.length; i++) {
							/*将用户数据加入到对象usersData中,以uid作为键*/
							if (!Chat.usersData[list[i].uid]) {
								Chat.usersData[list[i].uid] = list[i];
								Chat.usersData[list[i].uid].fromSource="list";
								if (!Chat.usersData.newMsgCount) {
									Chat.usersData[list[i].uid].newMsgCount = 0;
								}
							}
							
						}
						//Chat.usersTempData.push(list);//将每次的数据放入缓存
						/*if(DEVELOP_MODEL && page > 3){
							return;
						}*/
						
						if (page == 0) {
							_self.updateUserList(0);
							if (list.length > 14) {
								_self.elMore.show();//更多按钮显示出来，以便滚动加载时判断
							}
							
						}
						
						//page ++;
						//_self.getList(page);
						
						_self.tipsContainer.html('').hide();
						
						//等加载好用户列表之后再加载当前用户的历史消息
						if (Chat.chatList.length) {
							/*滚动到顶部的时候加载之前的聊天记录*/
							Chat.chatList.on('scroll', function() {
								var el = $(this);
								if (!Chat.curUserData) return;
								if (Chat.timerHistory) clearTimeout(Chat.timerHistory);
								Chat.timerHistory = setTimeout(function() {
									if (el.scrollTop() < 20 && Chat.curUserData.canLoadingData) {
										Chat.curUserData.historyPage ++;
										Chat.curUserData.historyLastItem = Chat.chatListCon.find('li').eq(0);//标记最老的一条元素，以便不要滚动到底部
										Chat.getHistoryMessage({
											uid: Chat.curUserData.uid,
											name: Chat.curUserData.name,
											avatar: Chat.curUserData.avatar
										}, Chat.curUserData.messageMinId, Chat.curUserData.historyPage);
									}
								},200)
								
							})
							Chat.getHistoryMessage({
								uid: Chat.curUserData.uid
							}, Chat.curUserData.messageMinId, 1);
						}
					} else if (page == 0) {
						_self.tipsContainer.html('<div class="data-blank"><i class="tip-nodata"></i><b>没有相关数据</b></div>').show();
					}
					_self.isLoading = false;
					
					//实例化protobufMessage和websocket初始化并连接
					Chat.protobufMessage = new ProtobufMessage(this);
					ChatWebsocket.init();
					
				},
				error: function(result) {
					_self.isLoading = false;
				}
			});
		},
		/*分页从内存中显示userlist,其中userlist是一个以用户id, page是数组索引，从0开始*/
		renderUserList: function(arrUsers, page) {
			var _self = this,
				list = arrUsers,
				page = page,
				str = '',
				pageSize = 15;
			
			/*将数据按每100个进行分页*/
			var i,
				j = 0,
				k,
				tempData = [];
			for (i = 0; i < list.length; i++) {
				if (i > 0 && i % pageSize == 0) {
					j++
				}
				if (typeof tempData[j] == 'undefined') {
					tempData[j] = [];
				}
				tempData[j].push(list[i]);
			}
			/*if (!list) {
				_self.elMore.text('没有更多了').show();
				return;
			} else {
				_self.elMore.text('加载更多').show();
			}*/
			//Chat.usersCon.find('ul').html('');
			if (tempData[page]) {
				for (k = 0; k < tempData[page].length; k++) {
					/*console.log(Chat.usersCon.find('li[data-uid="'+ tempData[page][k].uid +'"]'))
					if (Chat.usersCon.find('li[data-uid="'+ tempData[page][k].uid +'"]').length == 0) {
						str += _self.renderUser(tempData[page][k]);
					}*/
					str += _self.renderUser(tempData[page][k]);
				}
			}
			if (!tempData[page] || tempData[page].length < pageSize) {
				_self.elMore.addClass('disabled').text('没有更多了').show();
			} else {
				_self.elMore.removeClass('disabled').text('点击加载更多').show();
			}
			
			if (page > 0) {
				Chat.userList.elList.append(str);
			} else {
				Chat.userList.elList.html(str);
				//Chat.userList.elList.find('.notice').prependTo(Chat.userList.elList);//将小秘书移动到最前面
			}
		},
		/*生成user 元素*/
		renderUser: function(userInfo) {
			var opStr = '',
				jobStr = '',
				companyStr = '',
				readStr = '',
				newIconStr = '';
			if (userInfo.uid > 1000) {
				companyStr = '<em>·</em>'+ userInfo.companyName + (userInfo.experienceName ? '<em>·</em>' + filterXss(userInfo.experienceName) : '');
				opStr = '<div class="op"><span class="time">'+ userInfo.lastTime +'</span><a class="btn btn-continue" href="/gchat/im.html?bossId='+ userInfo.encryptBossId +'" target="_blank" ka="go_chat_done_'+ userInfo.jobId +'">继续沟通</a></div>';
				jobStr = '<span class="gray">'+ (userInfo.jobName ? '招'+ filterXss(userInfo.jobName) +'<em class="vline"></em>' : '') + (userInfo.locationName ? userInfo.locationName + '<em class="vline"></em>': '') + (userInfo.salary ? userInfo.salary : '') + '</span>';
				if (!userInfo.newMsgCount) {
					readStr = ' class="read"';
				} else {
					newIconStr = '<i class="icon-new"></i>';
				}
			} else {
				opStr = '<div class="op"><span class="time">'+ userInfo.lastTime +'</span><a class="btn btn-view" href="/gchat/im.html?bossId='+ userInfo.encryptBossId +'" target="_blank">查看消息</a></div>';
				if (!userInfo.newMsgCount) {
					readStr = ' class="notice read"';
				} else {
					readStr = ' class="notice"';
					newIconStr = '<i class="icon-new"></i>';
				}
				
			}
			return '<li'+ readStr +' data-uid="'+ userInfo.uid +'"><div class="figure"><img src="'+ userInfo.tinyUrl +'" /></div>'+ opStr +'<div class="text"><h3 class="name">'+ userInfo.name + companyStr + jobStr + '</h3><p class="gray">'+ newIconStr + (userInfo.lastMsg? '“'+ filterXss(userInfo.lastMsg) +'”' : '') +'</p></div></li>';
		},
		/**将userList对象转换为数组，并排序*/
		changeUserList: function() {
			var userList = Chat.usersData,
				arrUsers = [],
				arrTop = [];
			for (var id in userList) {
				if (userList[id]) {
					if (userList[id].uid < 1000 && userList[id].lastMsg != '') {//小秘书的单独拿出来，用于置顶显示
						arrTop.push(userList[id]);
					} else if (userList[id].uid > 1000) {
						arrUsers.push(userList[id]);	
					}
				}
			}
			arrUsers.sort(function(a, b) {
				return b.lastTS - a.lastTS;//优先isTop排序，其次时间排序
			})
			return arrTop.concat(arrUsers);
		},
		/*更新userlist界面*/
		updateUserList: function(page, autoPage) {
			var _self = this;
			if (!Chat.userList.elList.length) {
				return;
			}
			var arrUsers = _self.changeUserList(),
				page = page;//当一次性加载用户列表时
				autoPage = autoPage;//自动加载到第n页
			if (autoPage) {
				for (var i = 0; i <= autoPage; i++) {
					_self.renderUserList(arrUsers, i);
				}
			} else {
				_self.renderUserList(arrUsers, page);
			}
			
		}
		
	},
	/*消息处理 message.type==1*/
	showMessage: function(message){
		if(!message){
			return;
		}
		var base = Chat.showMessageBase(message);
		if (message.offline) {
			return;
		}
		if(message.from.uid == Chat.myselfData.uid){
			message.isSelf = true;
		}
		var messageHtml = '';
		switch(message.body.type){
			case 1://文字消息
				if(message.body.templateId == 3 || message.body.templateId == 6){
					messageHtml = this.showSystemMessage(message);
				}else{
					messageHtml = this.showTextMessage(message);//对方发过来的文本
					
				}
				break;
			case 2://语音消息
				if(!message.isSelf){
					message.body.text = "收到一条不支持的消息，请在 App 查看";
					messageHtml = this.showSystemMessage(message);
				}
				break;
			case 3://图片消息
				if(message.body.templateId == 1){
					if (message.body.image) {
						message.body.text = '<img src="'+ message.body.image.tinyImage.url +'" width="'+ message.body.image.tinyImage.width +'" height="'+ message.body.image.tinyImage.height +'" data-large="'+ message.body.image.originImage.url +'" large-x="'+ message.body.image.originImage.width +'" large-y="'+ message.body.image.originImage.height +'"';
					}
					messageHtml = this.showTextMessage(message);
				}
				break;
			case 4:
				//动作
				if(message.body.action.aid == 20){  //交换联系方式反馈
					var extend=eval('('+ message.body.action.extend +')');
					Chat.setDialogMessageDomStatus(extend.msg_id);
				}else if(message.body.action.aid == 27){  //请求交换联系方式   WEB发送返回此，MOBILE发送返回body.type=7,dialog.type=0;
					message.body.text="请求交换联系方式已发送";
					messageHtml = this.showSystemMessage(message);
				}else if(message.body.action.aid == 32){  //请求交换联系方式   WEB发送返回此，MOBILE发送返回body.type=7,dialog.type=0;
					message.body.text="请求交换微信已发送";
					messageHtml = this.showSystemMessage(message);
				}else if(message.body.action.aid == 37){
					var email = _PAGE.email;
					if(message.body.action.extend){
						var extend = eval('('+ message.body.action.extend +')');
						email = extend.resumeEmail;
					}
					message.body.text = "简历请求已发送。如果牛人同意，TA的简历将发送到{"+email+"}!";
					messageHtml = this.showSystemMessage(message);
				}else if(message.body.action.aid == 40){//牛人端的简历已发送的消息提示
					var email = _PAGE.email;
					if(message.body.action.extend){
						var extend = eval('('+ message.body.action.extend +')');
						email = extend.resumeEmail;
					}
					message.body.text = "简历附件已发送";
					messageHtml = this.showSystemMessage(message);
				}
				break;
			case 7://发起的换电话、换微信、发简历
				if(message.isSelf){
					if(message.body.dialog.type == 0){   //MOBILE发送返回此，web发送返回body.type=4,dialog.type=0;
						//message.body.text="请求交换联系方式已发送";
						//messageHtml=this.showSystemMessage(message);
					}else if(message.body.dialog.type == 4){//我发出的面试邀请
						base.userData.isCloseInterview = true;
						/*message.body.text="发出面试邀请，请登录APP查看";
						this.showSystemMessage(message).appendTo(box);*/
					}
				} else {
					/**
						2:对方发起的简历
						1:对方发起的换微信
						0:对方发起的换电话
					**/
					message.body.text = '收到一条不支持的消息，请在 App 查看';
					messageHtml = this.showSystemMessage(message);
					/*if(message.body.dialog.type == 2 || message.body.dialog.type == 1 || message.body.dialog.type == 0){
						
						messageHtml = this.showDialogMessage(message);
					} else {
						message.body.text = "收到一条不支持的消息，请在 App 查看";
						messageHtml = this.showSystemMessage(message);
					}*/
				}
				break;
			case 12:
				if(message.body.hyperLink.hyperLinkType == 2 && ((message.body.hyperLink.text.indexOf("面试提醒")>-1 || message.body.hyperLink.text.indexOf("面试邀请")>-1) && message.to.uid == Chat.myselfData.uid)){
					message.body.text = message.body.hyperLink.text;
					messageHtml = this.showSystemMessage(message);
				}else if(message.body.hyperLink.hyperLinkType == 3 && message.to.uid == Chat.myselfData.uid){//面试取消,这里由于server会同时以对方和自己的身份发2条取消的消息，只处理给我的消息
					message.body.text = message.body.hyperLink.text;
					messageHtml = this.showSystemMessage(message);
				} else if(message.body.hyperLink.hyperLinkType == 1 && message.to.uid == Chat.myselfData.uid){
					message.body.text = message.body.hyperLink.text;
					messageHtml = this.showSystemMessage(message);
				}
				break;
			case 99:
				messageHtml = this.showSystemMessage(message);
				break;
			default:
				message.body.text = "收到一条不支持的消息，请在 App 查看";
				messageHtml = this.showSystemMessage(message);
				break;
		}
		
		
		/*if (message.body.type == 1) {
			if(message.body.templateId == 3 || message.body.templateId == 6){
				messageHtml = this.showSystemMessage(message);
			}else{
				messageHtml = this.showTextMessage(message);//对方发过来的文本
				
			}
		} else if(message.type != 4) {
			message.body.text = message.from.name + '给你发送了一条消息，网页版暂不支持，请在Boss直聘APP查看';
			messageHtml = this.showSystemMessage(message);
		}*/
		
		
		/*如果消息来自非当前用户的或者是同步我发出的消息时*/
		
		if (message.body.type == 99 && message.from.uid == Chat.curUserData.uid) {
			$(messageHtml).appendTo(Chat.chatListCon);
		} else if ((message.from.uid == Chat.myselfData.uid && message.to.uid == Chat.curUserData.uid) || (message.to.uid == Chat.myselfData.uid && message.from.uid == Chat.curUserData.uid)) {
			if (messageHtml && (message.from.uid == Chat.curUserData.uid) || message.from.uid == Chat.myselfData.uid) {
				/*如果是在翻看聊天记录，从顶部添加*/
				Chat.showTimeLine(message);
				if (!Chat.chatListCon.find('#temp-' + message.mid).length) {
					if (Chat.curUserData.historyLastItem && message.typeSource == 'history') {
						$(messageHtml).prependTo(Chat.chatListCon);
					} else {
						$(messageHtml).appendTo(Chat.chatListCon);
						Chat.scrollToBottom();
					}
				}
			}
		}
	},
	/*消息处理 message.type==3 */
	showMessageOther: function(message) {
		if(!message){
			return;
		}
		var base = null;
		var messageHtml = null;
		switch(message.body.type){
			case 1://系统消息
				if(message.body.templateId==1){
					Chat.showMessage(message);
				}else if(message.body.templateId==3||message.body.templateId==7||message.body.templateId==6){
					Chat.showMessage(message);
				}else if(message.body.templateId==5 && message.to.uid == Chat.myselfData.uid){//收到联系方式
					message.body.text=message.body.text.replace(/\<\/?[a-zA-Z]+\>/g,"").replace(/&lt;\/?phone&gt;/g,"").replace(/&lt;\/?copy&gt;/g,"");
					base = Chat.showMessageBase(message);
					
					messageHtml = Chat.showSystemMessage(message);
				}
				break;
			case 4:
				if(message.body.action.aid==30){//看过我的。
					Chat.outputData[message.body.action.aid]=JSON.parse(message.body.action.extend);
				}else if(message.body.action.aid==31){//有人对你感兴趣 
					Chat.outputData[message.body.action.aid]=JSON.parse(message.body.action.extend);
				}else if(message.body.action.aid==35){//有新人或新职位
					Chat.outputData[message.body.action.aid]=JSON.parse(message.body.action.extend);
				}else if(message.body.action.aid==47){//同意面试
					/*base = Chat.showMessageBase(message);
					if(base.userData){
						base.userData.isCloseInterview=  false;
						message.body.text = '<b>'+base.userData.name+'</b>接受了您的面试邀请';
						messageHtml = Chat.showSystemMessage(message);
					}*/
				}else if(message.body.action.aid==48){//拒绝面试
					var user=Chat.usersData[message.from.uid];
					if(user){
						user.isCloseInterview=false;
					}
				}else if(message.body.action.aid==50){//待面试数变化

				}
				break;
			case 8://牛人卡片
				//base=Chat.showMessageBase(message);//只为增加MAXID
				//message.body.text="建议您主动打招呼，介绍一下自己。";
				//messageHtml = Chat.showSystemMessage(message);//牛人主动开聊时只有职位卡片相关的消息
				break;
			case 10://发出一个红包
				base=Chat.showMessageBase(message);
				if(message.isSelf){
					message.body.text="发出一个红包，请登录APP查看";
				}else{
					message.body.text="收到红包消息，请登录APP端查收";
				}
				messageHtml = Chat.showSystemMessage(message);
				break;
			default:
				break;
		}
		/*如果消息来自非当前用户的或者是同步我发出的消息时*/
		if (message.body.type == 99 && message.from.uid == Chat.curUserData.uid) {
			$(messageHtml).appendTo(Chat.chatListCon);
		} else if ((message.from.uid == Chat.myselfData.uid && message.to.uid == Chat.curUserData.uid) || (message.to.uid == Chat.myselfData.uid && message.from.uid == Chat.curUserData.uid)) {
			if (messageHtml && (message.from.uid == Chat.curUserData.uid) || message.from.uid == Chat.myselfData.uid) {
				/*如果是在翻看聊天记录，从顶部添加*/
				Chat.showTimeLine(message);
				if (Chat.curUserData.historyLastItem && message.typeSource == 'history') {
					$(messageHtml).prependTo(Chat.chatListCon);
				} else {
					$(messageHtml).appendTo(Chat.chatListCon);
					Chat.scrollToBottom();
				}
				/*if (message.from.uid == Chat.curUserData.uid) {
					Chat.curUserData.lastMessage[message.mid] = true;
				}*/
			}
		}
		/*if(Chat.curUserData&&(Chat.curUserData.userId==message.from.uid||message.isSelf)){
			Chat.scrollToBottom();
		}*/
	},
	/*普通消息处理*/
	showTextMessage: function(message) {
		var str = '',
			statusClass = '',
			statusStr = '',
			idStr = '',
			time = message.time,
			msgText = this.messageConverToHtml(filterXss(message.body.text)),
			temp = 'temp-' + message.tempID;//存储临时的id
		if (message.typeSource == 'newSubmit') {
			msgText = this.messageConverToHtml(filterXss(message.body.text));
		}
		
		if (message.from.uid == Chat.myselfData.uid) {
			/*if(message.typeSource == 'history'){
				statusClass = '';
				statusStr = '';
			}*/
			if(message.typeSource == 'history'){
				statusStr = '<i class="status"></i>';
				/*新提交的并不会有status*/
				switch (message.status) {
					case 0://发到服务器了，但是对方未必收到，也使用该class
						statusClass = 'status-delivery';
					break;
					case 1://已经发送
						statusClass = 'status-delivery';
					break;
					case 2://对方已读
						statusClass = 'status-read';
					break;
					default:
						statusClass = '';
						statusStr = '';
					break;
				}
				
				
			} else if (message.typeSource == 'newSubmit') {
				idStr = 'id="'+ temp +'"';
				statusStr = '<i class="status"></i>';
			} else if (message.from.uid == Chat.myselfData.uid) {
				statusClass = 'status-delivery';
				statusStr = '<i class="status"></i>';
			}
			
			

			var userStatusData = Chat.messageStatusData[message.to.uid];
			if(!userStatusData){
				userStatusData = Chat.messageStatusData[message.to.uid] = {};
			}
			if(message.mid){
				idStr = 'id="temp-'+ message.mid +'"';
				userStatusData[message.mid] = {
					
				}
			} else {
				Chat.messageStatusDataTemp[message.tempID] = message.to.uid;
				userStatusData[message.tempID] = {
					tempID:message.tempID
				}
			}
			return '<li '+ idStr +' class="item-myself '+ statusClass +'"><div class="figure"></div><div class="text">'+ statusStr +''+ msgText +'</div></li>';
		} else {
			return '<li '+ (message.mid ? 'id="temp-'+ message.mid +'"' : '') + ' class="item-friend"><div class="figure"><img src="'+ message.from.avatar +'" alt="" /></div><div class="text">'+ msgText +'</div></li>';
		}
	},
	/*系统消息处理*/
	showSystemMessage: function(message) {
		if (!message.body.text) return;
		var str = '<li class="item-system" id="temp-'+ message.mid +'"><div class="text">'+ message.body.text +'</div></li>';
		/*暂时不处理收到附件简历消息*/
		if (message.body.type == 12 && message.body.hyperLink && message.body.hyperLink.hyperLinkType == 1) {
			str = '<li class="item-system"><div class="text">收到附件简历，请登录邮箱{'+ _PAGE.email +'}查看</div></li>';
			/*var obj = JSON.parse(message.body.hyperLink.extraJson),
				tipText = obj.mailTip,
				url = message.body.hyperLink.url,
				kaText = 'resume';
			if (tipText) {
				tipText = '<p class="attachment-tip">'+ tipText +'</p>';
			}
			str = '<li class="item-system item-attachment"><a href="'+ url +'" ka="'+ message.from.uid +'-'+ kaText +'" target="_blank"><div class="attachment-figure"><i class="icon-doc"></i></div><div class="text">'+ message.body.text +''+ tipText +'</div></a></li>';*/
		}
		return str;
	},
	/*对话框消息处理:交互微信、交换电话、发送简历*/
	showDialogMessage: function(message) {
		var dialogName = '',
			disabledName = '',
			messageEl;
		/**
			2:对方发起的简历
			1:对方发起的换微信
			0:对方发起的换电话
		**/
		switch (message.body.dialog.type) {
			case 0://对方发起的换电话
				dialogName = 'item-phone'
			break;
			case 1://对方发起的换微信
				dialogName = 'item-weixin'
			break;
			case 2://对方发起的简历
				dialogName = 'item-resume'
			break;
		}
		if (message.body.dialog.operated) {
			disabledName = 'disabled';
		}
		messageEl = $('<li class="item-friend '+ dialogName +'"><div class="figure"><img src="'+ message.from.avatar +'" alt="" /></div><div class="text"><p>'+ this.messageConverToHtml(message.body.dialog.text) +'</p><div class="btns"><button type="button" class="btn btn-agree '+ disabledName +'">同意</button><button type="button" class="btn btn-danger btn-refuse '+ disabledName +'">拒绝</button></div></div></li>');
		messageEl.on('click', '.btn', function(e) {
			if ($(this).hasClass('disabled')) {
				return false;
			}
			messageEl.find('.btn').addClass('disabled');//点击过之后，把同意和拒绝按钮都置为不可点
			if (dialogName == 'item-phone') {
				if ($(this).hasClass('btn-agree')) {
					Chat.exchangePhone(1, message);
				} else {
					Chat.exchangePhone(0, message);
				}
			}
			if (dialogName == 'item-weixin') {
				if ($(this).hasClass('btn-agree')) {
					Chat.exchangeWeixin(1, message);
				} else {
					Chat.exchangeWeixin(0, message);
				}
			}
			if (dialogName == 'item-resume') {
				if ($(this).hasClass('btn-agree')) {
					Chat.exchangeResume(1, message);
				} else {
					Chat.exchangeResume(0, message);
				}
			}
			
		})
		return messageEl;
	},
	/*同步对话消息时，将按钮状态置为不可点*/
	setDialogMessageDomStatus: function(mid, status) {
		if (mid) {
			Chat.chatListCon.find('#temp-' + mid).find('.btn').addClass('disabled').unbind('click')
		}
	},
	/*消息内容格式处理*/
	messageConverToHtml: function(messageText) {
		var text = Emotion.textCodeToImg(messageText);
		if (/^&lt;img src="/.test(text)) {//转义后的<img 开头的
			text = text.replace('&lt;','<').replace('&gt;','>');
		} else {//将http和https开头的字符替换为链接形式
			text = text.replace(/(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|\&|-)+)/g, "<a href='$1$2' target='_blank'>$1$2</a>");
		}
		return (messageText ? text.replace(/\n/g,'<br/>') : '')
	},
	/*消息状态处理*/
	setTextMessageDomStatus:function(uid,mid,tempID,status){
		if (Chat.curUserData.uid != uid) return;//只能是在当前窗口状态下才能改变界面的是否已读状态
		var userStatusData = Chat.messageStatusData[uid],
			messageEl,
			//chatHistoryList = Chat.chatHistoryData[uid].chatList,
			chatHistoryIndex,
			chatHistoryItem;
		if(!userStatusData){
			return;
		}
		if(mid && tempID){
			userStatusData[mid] = userStatusData[tempID];
			messageEl = Chat.chatListCon.find('#temp-' + userStatusData[tempID]['tempID']);
			delete userStatusData[tempID];
			delete Chat.messageStatusDataTemp[tempID];
		}
		
		if (mid && !tempID) {
			messageEl = Chat.chatListCon.find('#temp-' + mid);
		}
		/*对方已读之后，让全部都设置为已读*/
		if(status == 'read'){
			Chat.chatListCon.find('.status-delivery').removeClass('status-delivery').addClass('status-read');
		} else if(status) {
			var obj = userStatusData[mid ? mid : tempID];
			if(!obj){
				return;
			}
			messageEl.attr('class', messageEl.attr('class').replace(/status\-/g, '')).addClass('status-' + status);
			
			//var tempClass = $(chatHistoryList[chatHistoryIndex]).attr('class');
			//Chat.chatHistoryData[uid].chatList[chatHistoryIndex] = $(chatHistoryList[chatHistoryIndex]).attr('class', tempClass.replace(/status\-/g, '')).addClass('status-' + status);
			
			if (mid) {
				messageEl.attr('id', 'temp-' + mid);//将临时的id改为正式的id
				//Chat.chatHistoryData[uid].chatList[chatHistoryIndex] = $(Chat.chatHistoryData[uid].chatList[chatHistoryIndex]).attr('id', 'temp-' + mid);
			}
			if(status == 'error'){
				delete userStatusData[obj.tempID];
				delete userStatusData[mid];
			}
		}
		/*将缓存中的dom状态也对应修改*/


	},
	//发送已读
	sendReadMessage:function(opts){
		if(!opts.mid || opts.uid == Chat.myselfData.uid){
			return;
		}
		ChatWebsocket.sendReadMessage({
			uid:opts.uid,
			mid:opts.mid,
			callback:function(data){
				opts.curUserData.maxMessageId=null;
			}
		});
	},
	getOutputData:function(){
		return Chat.outputData;
	},
	/*发送文本消息*/
	sendTextMessage: function(options) {
		var noWebsocket = options.noWebsocket || false;//暂时还没有地方传入 noWebsocket，但是可以用作多窗口时给用户发送消息，避免websocket只有一个连接的问题
		Chat.showMessage(options);//将输入的信息添加到聊面板
		var message=Chat.protobufMessage.createMessage.text(options);
		ChatWebsocket.send(message);
		
		/*非websocket时直接调用如下接口*/
		if (noWebsocket) {
			$.ajax({
				url: '/chat/sendmsg.json',
				type: 'POST',
				data: {
					to: options.to.uid,
					text: options.body.text
				},
				dataType:'JSON',
				cache: false,
				timeout: 30000,
				success: function(result){
					if(result.result==1){
						Chat.mids[result.mid] = 'Text';
						Chat.setTextMessageDomStatus(options.to.uid,result.mid,options.tempID,'delivery');

						/*var toUserData = Chat.usersData[options.to.uid];
						if(toUserData){
							toUserData.setMessageMinId(result.mid);
						}*/
					}else{
						Chat.setTextMessageDomStatus(options.to.uid,result.mid,options.tempID,'error');
					}
				},
				error: function(result){
					Chat.setTextMessageDomStatus(options.to.uid,result.mid,options.tempID,'error');
				}
			});
		}
	},
	/*显示时间分割线*/
	showTimeLine: function(message) {
		var msgDate = new Date(message.time),
			lastMessageTime = Chat.curUserData.lastMessageTime,
			today = new Date(),
			time = new Date(message.time),
			format;
		today = new Date(today.getFullYear(),today.getMonth(),today.getDate());
		if(today - time > 0){
			format = 'MM-dd hh:mm';
		} else {
			format = 'Z hh:mm';
		}
		/*超过5分钟显示时间分隔线*/
		if(lastMessageTime && (msgDate - lastMessageTime) > 300000){
			$('<li class="item-time"><span class="time">'+ this.dateFormat(msgDate, format) +'</span></li>').appendTo(Chat.chatListCon);
		}
		Chat.curUserData.lastMessageTime = message.time;
		
	},
	/*日期格式化*/
	dateFormat: function(date,fmt) {
		var o = {
			//"Z":getHZ(date),//暂时不用了
			"Z":'',
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"H+": date.getHours()>12?date.getHours()-12:date.getHours(), //12小时制
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		function getHZ(time){
			var hour=time.getHours();
			if(hour<6){
				return "凌晨";
			}
			if(hour<11){
				return "上午";
			}
			if(hour<13){
				return "中午";
			}
			if(hour<16){
				return "下午";
			}
			if(hour<18){
				return "傍晚";
			}
			if(hour<24){
				return "晚上";
			}
		}
		return fmt;
	},
	/*聊天窗口滚动到最底部*/
	scrollToBottom: function() {
		Chat.chatList.scrollTop(Chat.chatListCon.outerHeight() + 119);
		
	},
	/**
		来新消息时通过url直接跳转(暂时不支持)
	**/
	toggleUser: function(data) {
		if (Chat.curUserData.encryptUid && Chat.curUserData.encryptUid != data.uid) {
			//window.location.href = '/gchat/im.html?bossId=' + Chat.curUserData.encryptUid;
		}
		
	},
	/**
		获取历史消息
		info：用户的基本信息数据对象
		maxId: 标记的获取历史消息临界id,虽然叫maxId，实际上传入的时候是上一次数据的最小id
		page: 标记页码
	**/
	getHistoryMessage: function(info, maxId, page) {
		$.ajax({
			url: '/gchat/historymsg.json',
			type: 'GET',
			data: {
				bossId: info.uid,
				maxMsgId: maxId,
				c: 20,
				page: page
			},
			dataType: 'JSON',
			timeout: 20000,
			success: function(result){		
				var result = result;
				if (typeof result == 'string') {
					result = eval('('+ result +')');
				}
				if(result.type == 1 && result.messages){
					var len = result.messages.length,
						i,
						message;
					if (len > 0) {
						/*如果是加载的非第一页的历史记录，数据是反的，需要倒着插入*/
						if (Chat.curUserData.historyLastItem) {
							for(i = (len -1); i >= 0; i--){
								message = result.messages[i];
								message.mSource = 'server';
								message.typeSource = 'history';
								ChatWebsocket.receiveTextMessage(message);
							}
						} else {
							for(i = 0; i < len; i++){
								message = result.messages[i];
								message.mSource = 'server';
								message.typeSource = 'history';
								ChatWebsocket.receiveTextMessage(message);
								if (message.from.uid == Chat.curUserData.uid && message.type != 4 && message.body.type != 4 && !message.uncount) {
									Chat.curUserData.maxMessageId = result.messages[i].mid;
								}
							}
							//if (Chat.curUserData.maxMessageId && message.from.uid != Chat.myselfData.uid && message.type != 4 && message.body.type != 4) {
							if (Chat.curUserData.maxMessageId) {
								if (Chat.websocketConnected) {
									Chat.sendReadMessage({
										userData: Chat.curUserData,
										uid: Chat.curUserData.uid,
										mid: Chat.curUserData.maxMessageId
									});
								} else {
									/*如果还未连接，但是要防止未连接时就已经切换了用户*/
									if (Chat.interConnect) clearInterval(Chat.interConnect); 
									Chat.interConnect = setInterval(function() {
										if (Chat.websocketConnected) {
											Chat.sendReadMessage({
												userData: Chat.curUserData,
												uid: Chat.curUserData.uid,
												mid: Chat.curUserData.maxMessageId
											});
											clearInterval(Chat.interConnect);
										}
									},1000)
								}
								
							}
							
						}
						Chat.curUserData.messageMinId = result.messages[0].mid;
						
						Chat.curUserData.canLoadingData = true;
					}
					if (page == 1) {
						/*Chat.chatListCon.show();
						Chat.chatList.find('.chat-info').show();
						Chat.chatList.find('.loading').hide();*/
						if (Chat.showChatListTimeer) clearTimeout(Chat.showChatListTimeer);
						Chat.showChatListTimeer = setTimeout(function() {
							Chat.chatList.css('visibility', 'visible');
						},100)
						if (!isEmptyObject(Chat.curUserData) && Chat.curUserData.newMsgCount) {
							Chat.clearMessageCount(Chat.curUserData, Chat.curUserData.newMsgCount);
						}
					}
					if (Chat.curUserData.historyLastItem) {
						try {
							Chat.chatList.scrollTop(Chat.curUserData.historyLastItem.offset().top - Chat.chatList.height() - 100);
						} catch(e) {}
					}
				} else {
					/*没有历史消息了就不要再加载了*/
					Chat.curUserData.canLoadingData = false;
				}
				
			},
			error: function(e){
				Chat.curUserData.canLoadingData = true;
			}
		});
	},
	//获取用户详情
	getUserInfo:function(uid,callback){
		$.ajax({
			url:'/gchat/bossInfo.json',
			data:{uid:uid},
			//async:false,
			dataType:"JSON",
			timeout:5000,
			success: function(e){
				if(typeof e=="string"){
					e=eval("("+e+")");
				}
				callback(e);
			},
			error:function(e){
				callback({status:0,msg:"系统错误"});
			}
		});
	},
	//插入新用户,分为内存中存在的但是没有渲染出来的，以及内存中不存在的
	addUser: function(uid, encryptBossId, message){
		var userInfo = {};
		if (uid && Chat.usersData[uid]) {
			userInfo = Chat.usersData[uid];
		} else if (message) {
			userInfo = {
				tinyUrl: message.from.avatar,
				fromSource: message.mSource,
				isTop: 0,
				lastTime: message.time,
				name: message.from.name,
				sex: 0,
				newMsgCount:0,
				uid: message.from.uid,
				encryptBossId: encryptBossId
				
			}
			var timeStr = '',
				time = userInfo.lastTime;
			var nowDate=new Date();
			var todyStartTime=new Date(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate());
			var diffTime=todyStartTime-time;
			if(nowDate.getFullYear()!=new Date(time).getFullYear() && (nowDate.getFullYear()-new Date(time).getFullYear() > 1)){
				timeStr=(nowDate.getFullYear()-new Date(time).getFullYear())+"年前";
			}else if(diffTime>86400000){//大于2天
				timeStr=Chat.dateFormat(new Date(time),"MM月dd日");
			}else if(diffTime>0){//大于0天
				timeStr="昨天";
			}else{//今天
				timeStr=Chat.dateFormat(new Date(time),"hh:mm");
			}
			Chat.usersData[uid] = userInfo;
			Chat.usersData[uid].lastTime = timeStr;
			/*如果是从历史未读消息，不插入新用户*/
			if (message.offline) {
				return;
			} else {
				Chat.getUserInfo(uid, function(data) {
					if(data.rescode){
						var result = data.data;
						Chat.usersData[uid] = result;
						if (result.uid != Chat.myselfData.uid) {
							Chat.showMessageBase(message);//重新调用
						}
					}
				});
			}
		}
		
		//userInfo.orderNum = Chat.chatUserCount;
		//Chat.chatUserCount ++;
		
		
		if (userInfo.encryptBossId) {
			if (userInfo.uid != Chat.myselfData.uid) {
				var html = Chat.userList.renderUser(userInfo),
					exitItem = Chat.userList.elList.find('li[data-uid="'+ userInfo.uid +'"]');
				if (exitItem.length) {
					exitItem.remove();	
				} else {
					Chat.userList.elList.find('li:last').remove();
				}
				$(html).prependTo(Chat.userList.elList);
				//Chat.userList.elList.find('.notice').prependTo(Chat.userList.elList);//将小秘书移动到最前面
				//Chat.usersData[userInfo.uid].lastTS = new Date().getTime()
			}
		}
	},
	/*消息基础信息处理*/
	showMessageBase: function(message){
		var chatUserId,
			isExist = false;
		if(message.from.uid == Chat.myselfData.uid){
			message.isSelf = true;
		}
		
		
		var thisUnReadMessageCount = 0;
		if(Chat.curUserData.uid && !message.offline && !message.received && (Chat.curUserData.uid == message.from.uid || Chat.curUserData.uid == message.to.uid)){
			var thisMessageUserData = Chat.curUserData;
			//thisMessageUserData.maxMessageId=message.mid;  //记录最大MID
			if(!message.isSelf && message.body.type != 99 && message.typeSource != 'history' && message.type != 4 && message.body.type != 4){
				//已读
				Chat.sendReadMessage({
					userData: thisMessageUserData,
					uid: message.from.uid,
					mid: message.mid
				});
				/*Chat.setTextMessageDomStatus(message.from.uid, message.mid, null, 'read');*/
			}
			//thisMessageUserData.moveTop();
			chatUserId = thisMessageUserData.uid;
		} else {
			if(message.from.uid == Chat.myselfData.uid){
				var udata = message.to;
			} else if(message.to.uid == Chat.myselfData.uid){
				var udata = message.from;
			}
			//udata.uid = 9999;
			if(!isEmptyObject(Chat.curUserData) && Chat.usersData && !Chat.usersData[udata.uid]){
				//如没有此用户处理
				Chat.addUser(udata.uid, null, message);
			}
			var thisMessageUserData = (Chat.usersData ? Chat.usersData[udata.uid] : Chat.curUserData);
			//thisMessageUserData.maxMessageId=message.mid;  //记录最大MID
			if(!message.isSelf){
				thisUnReadMessageCount = 1;//未读加一
			}
			//thisMessageUserData.moveTop();
			chatUserId = udata.uid;
			/*收到消息后移动到最上面，离线消息不移动*/
			if (!message.offline && !message.received) {
				if (Chat.userList.elList) {
					var itemUser = Chat.userList.elList.find('li[data-uid="'+ chatUserId +'"]').parent();
					if (itemUser.length) {
						itemUser.prependTo(itemUser.closest('ul'));
					} else if(Chat.usersData[chatUserId]) {//不在第一页的用户需要重新添加显示
						Chat.addUser(chatUserId, Chat.usersData[chatUserId].encryptBossId);
					} else {
						Chat.addUser(udata.uid, null, message);
						return;
					}
				}
				
				
			}
			
		}

		if(thisUnReadMessageCount && thisMessageUserData && message.typeSource != 'history' && !message.received && message.type != 4 && message.body.type != 4 && !message.uncount){
			
			if (!message.offline || (!thisMessageUserData.maxMessageId || (message.offline && thisMessageUserData.maxMessageId && message.mid > thisMessageUserData.maxMessageId))) {
				if (!thisMessageUserData.newMsgCount) {
					thisMessageUserData.newMsgCount = 1;
				} else {
					thisMessageUserData.newMsgCount++;
				}
				if (!thisMessageUserData.mids) {
					thisMessageUserData.mids = [];
				}
				if (message.body.type == 7 || message.body.type == 13) {
					thisMessageUserData.lastMsg = '收到一条不支持的消息，请在 App 查看';
				}
				thisMessageUserData.mids.push(message.mid);
				Chat.showMessageCountInfo(thisMessageUserData);//头像处显示红点
				Chat.setUnReadMessageCount(1);
			}
		}
		if(!message.isSelf && thisMessageUserData && (!thisMessageUserData.maxMessageId || thisMessageUserData.maxMessageId < message.mid) && message.body.type != 4 && message.type != 4 && !message.uncount){
			thisMessageUserData.maxMessageId = message.mid;  //记录最大MID
			
		}
		
		if (!message.isSelf && message.typeSource != 'history' && message.type != 4 && message.body.type != 4 && message.body.type != 8) {
			if (!Chat.unReadMessages[message.from.uid]) {
				Chat.unReadMessages[message.from.uid] = {};
				Chat.unReadMessages[message.from.uid] = [];
			}
			if ($.inArray(message.mid, Chat.unReadMessages[message.from.uid]) == -1) {
				Chat.unReadMessages[message.from.uid].push(message.mid);
			}
		}
		
		
		/*在用户列表上也相应更新时间和最后的聊天内容*/
		var pushText = filterXss(message.body.text) || filterXss(message.pushText);
		/*if (!pushText && message.body.dialog && message.body.dialog.text) {
			pushText = message.body.dialog.text;
		} else if (message.body.image || message.body.sound) {
			pushText = message.body.text;
		}*/
		//console.log(message.mid + ':' +pushText)
		if (pushText && !message.offline && message.typeSource != 'history' && message.type != 4 && message.body.type != 4 && !message.uncount) {
			var msgDate = new Date(message.time);
			/*var item = Chat.userList.elList.find('a[data-uid="'+ thisMessageUserData.uid +'"]');
			item.find('.time').text(Chat.getLastTime(msgDate));
			item.find('.gray').text(pushText.substring(0,40));*/
			
			if (Chat.usersCon.length) {
		
				if (Chat.usersData[thisMessageUserData.uid] && message.time > Chat.usersData[thisMessageUserData.uid].lastTS) {
					Chat.usersData[thisMessageUserData.uid].lastTime = Chat.getLastTime(message.time);
					Chat.usersData[thisMessageUserData.uid].lastTS = message.time;//收到消息的时候更新下最后的时间
					
				}
				if ((message.body.type == 7 || message.body.type == 2) && !message.isSelf) {
					Chat.usersData[thisMessageUserData.uid].lastMsg = '收到一条不支持的消息，请在 App 查看';
				} else if(message.isSelf && (message.body.type == 7 || message.body.type == 12)) {
					
				} else if(message.isSelf && message.body.type == 3) {
					Chat.usersData[thisMessageUserData.uid].lastMsg = '图片已发送';
				} else {
					Chat.usersData[thisMessageUserData.uid].lastMsg = pushText;//每次收消息都记录一下，这样新用户的最后一条消息才可以记住
				}

				
				Chat.userList.updateUserList(0, Chat.userList.page);//获取当前的page，并且刷新后自动加载到该页
			}
		}
		
		//通知,条件
		/*if (!PAGE_ACTIVITY && !message.offline && !message.received && message.from.uid != Chat.myselfData.uid && message.from.uid != Chat.curUserData.uid && message.to.uid == Chat.myselfData.uid && message.typeSource != 'history') {
			chatNotification.show(message.from.name, message.from.avatar, message);
		}*/
		return {
			userData:thisMessageUserData,
			setUnReadMessageCount:Chat.setUnReadMessageCount
		}
	},
	/*设置消息计数*/
	setUnReadMessageCount: function(n) {
		/*投递箱的聊天页面和聊天对话框页面不需要处理计数*/
		//if (Chat.usersCon.length || Chat.chatList.length) return;
		
		
		Chat.unreadMessageCount += n;
		if(Chat.unreadMessageCount>99){
			Chat.unreadCountBox.html('<i class="dot-plenty"></i>');
		}else{
			Chat.unreadCountBox.html(Chat.unreadMessageCount);
		}
		
		if(Chat.unreadMessageCount && Chat.unreadMessageCount > 0){
			Chat.unreadCountBox.css('display', 'inline-block');
			Chat.unreadCountBox.parent().attr('ka','nav_msg_red');
		}else{
			Chat.unreadCountBox.hide();
			Chat.unreadCountBox.parent().attr('ka','nav_msg');
		}
		//Chat.onChangeReadMessageCount(Chat.unreadMessageCount);
		//pageTitleStatus.set(Chat.unreadMessageCount);
	},
	onChangeReadMessageCount: function(count) {
		localStorageInstance('msgcount',count);
	},
	/*检查并设置消息总数*/
	checkReadMessageCount: function(count) {
		if(count > 99){
			Chat.unreadCountBox.html('<i class="dot-plenty"></i>');
		}else{
			Chat.unreadCountBox.html(count);
		}
		
		if(count && count > 0){
			Chat.unreadCountBox.css('display', 'inline-block');
		}else{
			Chat.unreadCountBox.hide();
		}
	},
	/*清除或减少消息计数*/
	clearMessageCount: function(userData, count){
		//if (Chat.usersCon.length || Chat.chatList.length) return;
		if(userData.newMsgCount - count < 0){
			count = userData.newMsgCount;
		}
		Chat.setUnReadMessageCount(count * -1);//消息总数
		userData.newMsgCount -= count;
		
		Chat.showMessageCountInfo(userData);
	},
	/*在用户列表显示未读 消息数量*/
	showMessageCountInfo: function(userData){
		if (!Chat.usersData) return;
		var num = userData.newMsgCount,
			lastMsg = filterXss(userData.lastMsg),
			item = Chat.userList.elList.find('li[data-uid="'+ userData.uid +'"]');
		/*如果用户列表里面存在消息发送者，在用户头像边上加上红点*/
		if (num) {
			/*num = (num > 999 ? 999 : num);
			if (Chat.usersData[userData.uid]) {
				
				if (item.find('.notice-badge').length) {
					item.find('.notice-badge').text(num);
				} else {
					item.find('.text').append('<span class="notice-badge">'+ num +'</span>');
				}
			}*/
			item.removeClass('read');
			item.find('p.gray').html('<i class="icon-new"></i>'+ (lastMsg ? lastMsg : '') +'');
			item.find('.icon-new').show();
			
		} else {
			item.addClass('read');
			item.find('.icon-new').hide();
		}
	},
	/*消息红点计数*/
	addUserCount: function(message) {
		var coutStr = '<span class="notice-badge"></span>';
		/*如果用户列表里面存在消息发送者，在用户头像边上加上红点*/
		if (Chat.usersData[message.from.uid]) {
			Chat.userList.elList.find('a[data-uid="'+ message.from.uid +'"]').find('.figure').prepend(coutStr);
		}
	},
	/*给usersData添加mid*/
	addMessageId: function(uid, mid){
		if(!Chat.curUserData || (Chat.curUserData && Chat.curUserData.userId != uid)){
			if (!Chat.usersData[uid].mids) {
				Chat.usersData[uid].mids = [];
			}
			if (mid > Chat.usersData[uid].maxMessageId) {
				Chat.usersData[uid].mids.push(mid);
				Chat.usersData[uid].maxMessageId = mid;
			}
			
			
		}
	},
	setMessageMinId: function(uid, mid){
		if(!Chat.usersData[uid].messageMinId){
			Chat.usersData[uid].messageMinId = mid;
		}
	},
	/*将时间戳转换为易用时间*/
	getLastTime:function(time){
		this.lastMessageTime=time;
		var timeStr="";
		var nowDate=new Date();
		var todyStartTime=new Date(nowDate.getFullYear(),nowDate.getMonth(),nowDate.getDate());
		var diffTime=todyStartTime-time;
		if(nowDate.getFullYear()!=new Date(time).getFullYear() && (nowDate.getFullYear()-new Date(time).getFullYear() > 1)){
			timeStr=(nowDate.getFullYear()-new Date(time).getFullYear())+"年前";
		}else if(diffTime>86400000){//大于2天
			timeStr=Chat.dateFormat(new Date(time),"MM月dd日");
		}else if(diffTime>0){//大于0天
			timeStr="昨天";
		}else{//今天
			timeStr=Chat.dateFormat(new Date(time),"hh:mm");
		}
		return timeStr;
		
	},
	/*C端重写一个消息总数的计数方法*/
	setSyncTotalCount: function(userId, mid, maxMid) {
		if (Chat.unreadMessages && Chat.unreadMessages[userId]) {
			var mids = Chat.unreadMessages[userId],
				i,
				readCount;
			if (!mids) return;
			if (maxMid) {
				for (i = 0; i < mids.length; i++) {
					if (mids[i] < maxMid) {
						readCount++;
						mids.splice(0, i);
					}
				}
			}
			Chat.reduceMessageCount(userId, readCount);
		}
		
	},
	/*减少消息数*/
	reduceMessageCount: function(userId, count) {
		var count = count;
		if(Chat.unreadMessages[userId].length - count < 0){
			count = Chat.unreadMessages[userId].length;
		}
		Chat.setUnReadMessageCount(count * -1);//消息总数
		if (Chat.usersData && Chat.usersData[userId]) {
			Chat.usersData[userId].newMsgCount -= count;
		}
	}
};



/**
	websocket相关，在chat.js中调用
**/
var ChatWebsocket = {
	
	init:function(){//初始化
		var isDebug = getQueryString('debug');
		this.settings={
			cid:"",
			token:"",
			password:'',
			receiveUrl:"",
			receiveStepTime:5000,
			onSendMessage:function(opts){},
			onRecevieMessage:function(message){},
			onlineDebug: (isDebug ? true : false)
		}
		var wswt=cookie.get("wt") || cookie.get("t");
        if(wswt){
            ChatWebsocket.settings.password=wswt;
		}
		this.uuid="ws-"+getUuid(16,16);
		this.client = new Paho.MQTT.Client(_PAGE.ws.server, _PAGE.ws.port,"/chatws", this.uuid);
		this.client.onConnectionLost = this.onConnectionLost;
		this.client.onMessageArrived = this.onMessageArrived;
		this.client.onMessageDelivered=this.onMessageDelivered;
		//this.client.onDisconnect=this.onMessageDelivered;
		this.connection();
		ChatWebsocket.checkConnectInter = setInterval(function() {
			var wswt=cookie.get("wt") || cookie.get("t");
			if (!wswt) {
				clearInterval(ChatWebsocket.checkConnectInter);
				ChatWebsocket.disconnect();
			}
		},2000)
	},
	logCss:"font-weight:bold;color:#ff0000;",
	connection:function(){//连接
		var wswt=cookie.get("wt") || cookie.get("t");
		if (!wswt) {
			return;
		} else {
			ChatWebsocket.settings.password = wswt;
		}
		this.client.connect({
			userName:_PAGE.token,
			password:ChatWebsocket.settings.password,
			timeout:60,
			keepAliveInterval:40,
			cleanSession:true,
			onSuccess:this.onConnect,
			onFailure:this.onFailure,
			mqttVersion:3,
			useSSL:!!_PAGE.ws.useSSL
		});
	},
	disconnect: function() {//强制断开连接
		this.client.disconnect();
	},
	reConnection:function(){//重连
		this.connection();
	},
	sendPresence:function(){//发送上线状态
		var uniqid = cookie.get('__a').split('.'),
			type = 1;//非聊天相关页面为4，暂时没有使用4这个了
		//if (!Chat.receiveMaxId) Chat.receiveMaxId = 0;
		var message = Chat.protobufMessage.createMessage.presence({
			type: 1,
			lastMessageId: Chat.receiveMaxId < 0 ? 0 : Chat.receiveMaxId,
			clientInfo: {
				version: '',
				system: '',
				systemVersion: '',
				model: cookie.get('sid') || '',
				uniqid: (uniqid[1] + '' + uniqid[0]) || '',
				network: _PAGE.clientIP || '',
				appid: 9019,//boss端是9018
				platform: 'web',
				channel: '-1',
				ssid: '',
				bssid: '',
				longitude: 0,
				latitude: 0
			}
			
		});
		if(ChatWebsocket.settings.onlineDebug){
			console.log("%cpresence:",ChatWebsocket.logCss);
			console.log(message);
		}
		ChatWebsocket.send(message,2);
	},
	onConnect:function(e){//连接成功回调
		if(ChatWebsocket.settings.onlineDebug){
			console.log("%cconnect:",ChatWebsocket.logCss);
		}
		ChatWebsocket.sendPresence();
		Chat.websocketConnected = true;//标记可以进行已读状态的发送了
	},
	onFailure:function(e,ee,eee){//连接失败回调
		var T=this;
		if(ChatWebsocket.settings.onlineDebug){
			console.log("%conFailure:",ChatWebsocket.logCss);
			console.log(e,ee,eee);
		}
		if(typeof e=="object"&&e.errorCode==6){
			var m=e.errorMessage.match(/^AMQJS0006E Bad Connack return code:(\d).+$/);
			if(m){
				if(parseInt(m[1],10)==3){
					setTimeout(function(){
						ChatWebsocket.reConnection();
					},2000);
				} else{
					alert("登录信息失效");
					window.location.reload();
				}
			}

		}else{
			setTimeout(function(){
				ChatWebsocket.reConnection();
			},2000);
		}
	},
	onConnectionLost:function(responseObject){//WEBSOCKET方法内部错误
		if(this.onlineDebug){
			console.log("%conConnectionLost(data):",ChatWebsocket.logCss);
			console.log(responseObject);
		}
		if(responseObject.errorCode==8){
			ChatWebsocket.reConnection();
		}
		if (responseObject.errorCode !== 0) {
			console.log("%conConnectionLost(message):",ChatWebsocket.logCss);
			console.log(responseObject.errorMessage);
		}
	},
	onMessageArrived:function(data){//收取消息
		try{
			var bytes=data.payloadBytes;
			var message=Chat.protobufMessage.decode(bytes);
			message=ChatWebsocket.eachParseInt(message);
			if(ChatWebsocket.settings.onlineDebug){
				console.log("%conMessageArrived(data):",ChatWebsocket.logCss);
				console.log(data);
				console.log("%conMessageArrived(message):",ChatWebsocket.logCss);
				console.log(message);
			}	
			switch(message.type){
				case 1:
					ChatWebsocket.receiveMessage(message);
					break;
				case 5:
					ChatWebsocket.receiveSyncMessage(message);
					break;
				case 6:
					ChatWebsocket.receiveStatusMessage(message);
					break;
			}
		}catch(e){
			console.log("%conMessageArrived(try error):",ChatWebsocket.logCss);
			console.log(e);
		}
		
		// p.receiveTextMessage(message);
		//new dcodeIO.Long(-1862120648, 0);    高低位转值
	},
	onMessageDelivered:function(data){//发送消息回执
		var bytes=data.payloadBytes;
		var message=Chat.protobufMessage.decode(bytes);
		message=ChatWebsocket.eachParseInt(message);
		switch(message.type){
			case 1:
				var data =  message.messages;
				for(var i = 0; i < data.length; i++){
					Chat.setTextMessageDomStatus(Chat.curUserData.uid, data[i].mid, null, 'delivery');
				}
			break;
			case 6:
				//清除已读用户MAXID，防止重复发送
				for(var i=0;i<message.messageRead.length;i++){
					var userData=Chat.usersData[message.messageRead[0].userId];
					if(userData&&userData.maxMessageId==message.messageRead[0].messageId){
						userData.maxMessageId=null;
					}
				}
				break;
			default:
				break;
		}
		if(ChatWebsocket.settings.onlineDebug){
			console.log("%conMessageDelivered(data):",ChatWebsocket.logCss);
			console.log(data);
			console.log("%conMessageDelivered(message):",ChatWebsocket.logCss);
			console.log(message);
		}
	},
	send:function(message,qos){//发送消息
		if(ChatWebsocket.settings.onlineDebug){
			// console.log(this.client.isConnected());
			console.log("%csend:",ChatWebsocket.logCss);
			console.log(message);
		}
		if(this.client.isConnected()){
			this.client.send("chat", message.toArrayBuffer(), qos?qos:2, true);
		}else if(message.type==1&&message.messages[0].type==1&&message.messages[0].body.type==1){
			//alert("服务未连接，请稍后");
			ChatWebsocket.reConnection();
			Chat.setTextMessageDomStatus(Chat.curUserData.uid,message.messages[0].cmid,null,"error");
		}else{
			ChatWebsocket.reConnection();
		}
	},
	eachParseInt:function(data){//将protobufMessage转换的消息数据内INT64类型转为int32   注：后期数值过大，可能会超。应时刻关注此方法
		for(var k in data){
			var obj=data[k];
			if(obj && typeof obj=="object"){
				if(typeof obj.unsigned=="boolean" && typeof obj.high=="number" && typeof obj.low=="number"){
					longVal=new dcodeIO.Long(obj.low,obj.high);
					data[k]=parseInt(longVal.toString(),10);
				}else{
					this.eachParseInt(obj);
				}
			}
		}
		return data;
	},
	//发送已读
	sendReadMessage: function(message){
		var message = Chat.protobufMessage.createMessage.read(message);
		ChatWebsocket.send(message);
	},
	//从历史记录里面调用，和新消息推送receiveMessage方法中调用
	receiveTextMessage: function(message){
		if(message.from && message.to){
			if(message.from.uid > 1000){
				if(message.type == 3){
					Chat.showMessageOther(message);
				}else if(message.type == 1 || message.type == 2 || message.type == 4){
					/**message.type = 2 是代表群聊，目前无用，但是历史消息接口里面的对方发过简历记录的type却是2，属于接口bug*
					   message.type = 4 是代表打招呼的介绍
					**/
					if(message.from.uid == Chat.myselfData.uid || message.to.uid == Chat.myselfData.uid){
						Chat.showMessage(message);
						
					}
				}
			} else if(message.type==3){//ID小于1000的通知，后期继续优化
				if (message.from.uid == 995) {
					Chat.showMessage(message);
				}
				if(message.from.uid == 998){
					Chat.showMessageOther(message);
				}
			} else if (message.type==1) {
				if (message.from.uid == 995) {
					Chat.showMessage(message);
				}
			}
		}
	},
	//推送过来调用
	receiveMessage: function(data) {
		var mids = '',
			isOfflineMsg = false;
		for(var i = 0; i < data.messages.length; i++){
			var message = data.messages[i];
			if (message.offline) {
				isOfflineMsg = true;
			} else {
				isOfflineMsg = false;
			}
			if(message.type == 3 && message.body.type == 4){
				//验证是否被踢出
				if(message.body.action.extend==2001){//C端非聊天列表和聊天页面，为了获取消息总数，暂时没有使用这个了
					var countData = eval('('+ message.body.headTitle +')');
					if (!Chat.usersCon.length && !Chat.chatList.length) {
						Chat.setUnReadMessageCount(countData.msgcount);
					}
				}else if(message.body.action.aid==0){
					switch(parseInt(message.body.action.extend,10)){
						case 1011:  //切换身份
							//alert("您的身份已切换为BOSS，请在APP中切换回来之后再登录");
							window.location.href = INTERFACE_URLS.logoutUrl;
							break;
						case 1012:  //到期
							var cookieWt=cookie.get("wt");
							var cookieT=cookie.get("t");
							if(cookieT&&cookieWt){
								if(cookieT!=cookieWt){
									window.location.href=INTERFACE_URLS.logoutUrl;
									return;
								}
							}
							alert("您订购的网页聊天服务已到期，版请重新购买！");
							window.location.reload();
							break;
						case 1013:  //boss身份被冻结
							alert("抱歉，您的BOSS账号刚被冻结。请前往App端申请解冻，解冻后可正常使用");
							window.location.href=INTERFACE_URLS.logoutUrl;
							break;
						default:
							break;
					}
				}
			}
			
			if(Chat.receiveMaxId < message.mid){
				Chat.receiveMaxId = message.mid;
			}
			var isSelfMessage = false;
			for(var mid in Chat.mids){
				if(mid == Chat.receiveMaxId){
					isSelfMessage = true;
					continue;
				} else if(mid < Chat.receiveMaxId){
					delete Chat.mids[mid];
				}
			}
			if(!isSelfMessage){
				message.mSource = 'server';
				ChatWebsocket.receiveTextMessage(message);
				if(Chat.usersData && message.mid && (message.from.uid > 1000 || message.from.uid == 995) && message.type!= 4 && message.body.type != 4 && !message.uncount){//995是小秘书
					var toUserData = Chat.usersData[message.from.uid];
					if(toUserData){
						Chat.addMessageId(message.from.uid, message.mid);
						Chat.setMessageMinId(message.from.uid, message.mid);
					}
				}
			} else{
				var toUserData = Chat.usersData[message.to.uid];
				if(toUserData){
					toUserData.setMessageMinId(message.to.uid, message.mid);
				}
			}
			/*if(message.from.uid == Chat.myselfData.uid && message.to.uid == Chat.toUserData.uid && message.body.type != 7){//不是我发出的消息
				message.mSource = 'server';
				ChatWebsocket.receiveTextMessage(message);
				Chat.toggleUser(message.from.uid, message);
				chatNotification.show(message.from.name, message.from.avatar, message);
				

				ChatWebsocket.addCount(message);
			}*/
			/*如果是历史未读消息，需要重新排序*/
			/*if (message.offline) {
				Chat.offlineMessages.push(message);
				var msgDate = new Date(message.time);
				if (message.from.uid && message.from.uid != Chat.myselfData.uid) {
					Chat.usersData[message.from.uid].lastTS = message.time;
					Chat.usersData[message.from.uid].lastTime = Chat.getLastTime(msgDate);
					
					var existArr,
						i;
					for (i = 0; i < Chat.usersData.length; i++) {
						existArr.push(Chat.usersData[i])
					}
					console.log(existArr)
					Chat.filterUserListData(null, existArr);
					
				}
			}*/
		}
		/*if (isOfflineMsg && Chat.curUserData && Chat.curUserData.uid) {
			Chat.sendReadMessage({
				userData: Chat.curUserData,
				uid: Chat.curUserData.uid,
				mid: Chat.curUserData.maxMessageId
			});
		}*/
		
	},
	//收到通知消息处理动作 type=6
	receiveStatusMessage:function(data){
		if(data.messageRead){//消息已读
			//var unReadMessages;
			for(var i = 0; i < data.messageRead.length; i++){
				//unReadMessages = Chat.unReadMessages[data.messageRead[i].userId];
				if(data.messageRead[i].sync){
					ChatWebsocket.synchReadMessage(data.messageRead[i].userId,data.messageRead[i].messageId);
				}else if (data.messageRead[i].userId == Chat.curUserData.uid){
					Chat.setTextMessageDomStatus(data.messageRead[i].userId, data.messageRead[i].messageId, null, 'read');
				} else if(Chat.usersData && Chat.usersData[data.messageRead[i].userId].maxMessageId && data.messageRead[i].messageId <= Chat.usersData[data.messageRead[i].userId].maxMessageId) {
					ChatWebsocket.synchReadMessage(data.messageRead[i].userId,data.messageRead[i].messageId);
				} else if(Chat.curUserData.uid && data.messageRead[i].userId == Chat.curUserData.uid) {
					ChatWebsocket.synchReadMessage(data.messageRead[i].userId,data.messageRead[i].messageId);
				}
				
				//
				//ChatWebsocket.synchReadMessage(data.messageRead[i].userId,data.messageRead[i].messageId);
				//console.log(Chat.unReadMessages)
				//Chat.setSyncTotalCount(data.messageRead[i].userId, null, data.messageRead[i].messageId);
			}
		}
	},
	/*收到同步消息 type=5*/
	receiveSyncMessage:function(data){
		if(data.messageSync){
			for(var i = 0;i < data.messageSync.length; i++){
				var message = data.messageSync[i];
				var uid = Chat.messageStatusDataTemp[message.clientMid];
				if(uid){
					Chat.mids[message.serverMid] = 'Text';
					//Chat.setTextMessageDomStatus(uid, message.serverMid, message.clientMid, 'delivery');//2017.3.13去掉，放到onMessageDelivered中去设置
					/*var toUserData = Chat.usersData[uid];
					if(toUserData){
						toUserData.setMessageMinId(message.serverMid);
					}*/
					//暂时注释
					//Chat.toUserData.messageMinId = message.serverMid;
				}
				
			}
		}
	},
	//同步已读消息
	synchReadMessage: function(userId,maxId){
		var userData = (Chat.usersData ? Chat.usersData[userId] : Chat.curUserData);
		if(!userData){
			return;
		}
		if (!userData.mids) {
			userData.mids = [];
		}
		userData.mids.sort(function(a,b){
			return a > b;
		});
		var readIdCount = 0;
		for(var i=0; i < userData.mids.length; i++){
			if(userData.mids[i] <= maxId){
				readIdCount++;
			} else{
				break;
			}
		}
		userData.mids.splice(0, readIdCount);
		Chat.clearMessageCount(userData, readIdCount);
	}
};