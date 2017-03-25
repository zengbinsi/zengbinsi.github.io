/**
	消息发布器
**/
var Publisher = {
	init: function() {
		Publisher.editor = $('.chat-editor');
		Publisher.editorControls = Publisher.editor.find('.chat-controls');
		Publisher.editorInput = Publisher.editor.find('.chat-message');
		Publisher.editorPlaceholder = Publisher.editor.find('.chat-placholder');
		Publisher.submitBtn = Publisher.editor.find('.btn-send');
		/*聊天输入框操作*/
		Publisher.editorControls.on('click','a', function() {
			if ($(this).parent().hasClass('links')) {
				return;
			}
			var kaArr = $(this).attr('ka').split('_');
			$(this).attr('ka', kaArr[0] + '_' + kaArr[1] + '_' + kaArr[2] + '_' + Chat.curUserData.uid);
			switch ($(this).attr('class')) {
				case 'btn-emotion':
					Emotion.init();
				break;
				case 'btn-dict':
					Publisher.showSentence($(this));
				break;
				case 'btn-contact':
					$.confirm({
						content: '确认与对方交换电话吗？',
						title: '温馨提示',
						closeIcon: true,
						columnClass: '',
						onOpen: function(){
							
						},
						confirm: function() {
							Chat.exchangePhone(2,{
								from:{
									uid: Chat.curUserData.uid
								}
							});
						},
						error: function(result) {
						}
					})
				break;
				case 'btn-weixin':
					$.confirm({
						content: '确认与对方交换微信吗？',
						title: '温馨提示',
						closeIcon: true,
						columnClass: '',
						onOpen: function(){
							
						},
						confirm: function() {
							Chat.exchangeWeixin(2,{
								from:{
									uid: Chat.curUserData.uid
								}
							});
						},
						error: function(result) {
						}
					})	
				break;
				case 'btn-resume':
					$.confirm({
						content: '向牛人索取简历吗？<p>如果牛人同意，TA的简历将发送到<br/>' + Chat.myselfData.email + '</p>',
						title: '温馨提示',
						closeIcon: true,
						columnClass: '',
						onOpen: function(){
							
						},
						confirm: function() {
							Chat.exchangeResume(2,{
								from:{
									uid: Chat.curUserData.uid
								}
							});
						},
						error: function(result) {
						}
					})	
				break;
				case 'btn-transmit':
					$.confirm({
						content: '<div class="transmit-con"><div class="transmit-title">把<span class="text-blue"></span>推荐给同事</div><div class="transmit-list"><ul></ul></div><div class="transmit-op"><p><textarea class="ipt ipt-area" name="shareNote">此人文武双全，你一定要看看啊！</textarea></p><p class="tip-text"><label class="checkbox"><input type="checkbox" name="canShareMsg" /><span>连同聊天记录一并转发</span></label></p></div></div>',
						title: false,
						closeIcon: true,
						columnClass: 'pop-default',
						onOpen: function(){
							/*获取同事列表*/
							var page = 1,
								_self = this,
								listCon = _self.$content.find('.transmit-list ul');
							_self.$content.find('.transmit-title .text-blue').text(Chat.curUserData.name);
							$.ajax({
								type: 'GET',
								url: '/chat/brandUserList.json',
								dataType:'JSON',
								data: {
									page: page,
									pageSize: 100
								},
								success: function(result) {
									var result = result,
										str = '',
										list,
										i;
									if(result.rescode == 1){
										list = result.data;
										for (i = 0; i < list.length; i++) {
											str += '<li data-uid="'+ list[i].userId +'"><img src="'+ list[i].tiny +'" /><span class="name">'+ list[i].name +'</span></li>';
										}
										listCon.append(str);
									}
								},
								error: function(result) {
									
								}
							});
							listCon.on('click', 'li', function() {
								var el = $(this),
									uid = el.attr('data-uid');
								el.parent().find('li').removeClass('checked');
								if (!el.find('.fz-check').length) {
									el.append('<i class="fz fz-check"></i>');
								}
								el.addClass('checked');
							})
						},
						confirm: function() {
							var _self = this,
								selectedEls = _self.$content.find('.transmit-list li.checked'),
								toId = selectedEls.attr('data-uid'),
								canShareEl = _self.$content.find('input[name="canShareMsg"]:checked'),
								canShareMsg = (canShareEl.length ? 1 : 0),
								shareNote = _self.$content.find('textarea[name="shareNote"]').val();
							if (!toId) {
								if (_self.$content.find('.transmit-con .tip-error').length == 0) {
									_self.$content.find('.transmit-con').prepend('<div class="tip-error">请选择一位同事</div>');
								} else {
									_self.$content.find('.transmit-con .tip-error').html('请选择一位同事');
								}
								return false;
							} else if (shareNote == '') {
								if (_self.$content.find('.transmit-con .tip-error').length == 0) {
									_self.$content.find('.transmit-con').prepend('<div class="tip-error">请填写推荐评语</div>');
								} else {
									_self.$content.find('.transmit-con .tip-error').html('请填写推荐评语');
								}
								return false;
							} else {
								_self.$content.find('.transmit-con .tip-error').remove();
							}
							$.ajax({
								type: 'POST',
								url: '/chat/shareGeek.json',
								dataType:'JSON',
								data: {
									toId: toId,
									geekId: Chat.curUserData.uid,
									shareNote: shareNote,
									expectId: Chat.curUserData.jobId,
									canShareMsg: canShareMsg
								},
								success: function(result) {
									var result = result;
									if(result.rescode == 1){
										$.confirm({
											content: '转发成功',
											title: '温馨提示',
											closeIcon: true,
											columnClass: '',
											autoClose: 'confirm|3000'
										})
										_self.close();
									} else {
										$.confirm({
											content: '转发失败',
											title: '温馨提示',
											closeIcon: true,
											columnClass: '',
											autoClose: 'confirm|3000'
										})
									}
								},
								error: function(result) {
									$.confirm({
										content: '发送失败',
										title: '温馨提示',
										closeIcon: true,
										columnClass: '',
										autoClose: 'confirm|3000'
									})
								}
							});
						}
					})	
				break;
				case 'btn-interview':
					if (Chat.curUserData.isCloseInterview) {
						$.confirm({
							content: '请勿重复发送',
							title: '温馨提示',
							closeIcon: true,
							columnClass: '',
							autoClose: 'confirm|3000'
						})
						return false;
					}
					$.confirm({
						content: '<form class="form-check">' +
									'<input type="hidden" name="_token" value="">' +
									'<table class="data-manage">' +
										'<tr><td class="t">职位：</td><td><select class="ipt sel" name="jobid"><option>请选择职位</option></select></td></tr>' +
										'<tr><td class="t">面试时间：</td><td><input type="text" class="ipt ipt-datetimepicker" name="date" data-type="y-m-d" data-format="yyyy-mm-dd" placeholder="选择日期" autocomplete="off"> - <select name="hour" class="sel"><option value="0">请选择</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option></select> : <select name="minute" class="sel"><option value="0">请选择</option><option value="0">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option></select></td></tr>' +
										'<tr><td class="t">面试地点：</td><td><p class="tip-text tip-address">请先选择职位</p></td></tr>' +
										'<tr><td class="t t-top">其他要求：</td><td><textarea name="other" class="ipt ipt-area" placeholder="选填，最多140字"></textarea></td></tr>' +
										'<tr><td class="t">&nbsp;</td><td><p class="tip-text"><label class="checkbox"><input type="checkbox" name="sendmsg" /><span></span></label>同时发送<span class="text-blue">面试邀请 </span>短信给<span class="name"></span>，消耗20积分</p></td></tr>' +
									'</table>' +
								'</form>',
						title: '邀请面试',
						closeIcon: true,
						columnClass: 'pop-default',
						onOpen: function(){
							Chat.jobData = {},
							_self = this;
							//日历初始化
							if ($('.ipt-datetimepicker').length){
								var nowDate = new Date();
									nowYear = nowDate.getFullYear();
									nowMonth = nowDate.getMonth()+1;
									nowThisDate = nowDate.getDate();
								$('.ipt-datetimepicker').each(function() {
									var format = $(this).attr('data-format') || 'yyyy-mm-dd',
										type = $(this).attr('data-type'),
										startView = 2, //默认显示日期面板
										minView = 2;
									// 按照先选择年再选择月再选择日的方式显示
									if (type && type == 'y-m-d') {
										startView = 2;
										minView = 2;
									}
									if (type && type == 'h:i') {
										startView = 1;
										minView = 0;
									}
									$(this).datetimepicker({
										format: format,
										startView: startView, //首先打开的视图    1:秒 2:日 3:月 4:年
										minView: minView,   //日期时间选择器所能够提供的最精确的时间选择视图       0:时分 1:时 2:日 3:月 4:年
										autoclose: 1,//选择完毕关闭窗口
										startDate: nowYear +'-'+nowMonth+'-'+nowThisDate,
										//endDate: nowYear +'-'+nowMonth+'-'+nowThisDate,//设定以现在日期为结束日期，之后的将被禁用
										todayBtn: 0	//显示今日按钮
									});
								})
							}
							/*获取职位列表*/
							$.ajax({
								type: 'GET',
								url: '/chat/user/joblist.json',
								dataType:'JSON',
								data: null,
								success: function(result) {
									var result = result,
										str = '',
										i;
									if (result.rescode == 1) {
										for (i = 0; i < result.data.length; i++) {
											str += '<option value="'+ result.data[i].jobId +'">'+ filterXss(result.data[i].jobName) +'</option>';
											if (!Chat.jobData[result.data[i].jobId]) {
												Chat.jobData[result.data[i].jobId] = {};
											}
											Chat.jobData[result.data[i].jobId].jobName = filterXss(result.data[i].jobName);
											Chat.jobData[result.data[i].jobId].address = filterXss(result.data[i].address);
											if (i == 0) {
												_self.$content.find('.tip-address').html(filterXss(result.data[i].address));
											}
										}
										_self.$content.find('.sel[name="jobid"]').html(str);
										
									}
								},
								error: function(result) {
								}
							});
							/*职位改变之后更改地址*/
							_self.$content.find('.sel[name="jobid"]').on('change', function() {
								var jobid = $(this).val();
								_self.$content.find('.tip-address').html(Chat.jobData[jobid].address);
							})
							/*显示接收短信的名字*/
							_self.$content.find('.data-manage .tip-text .name').text(Chat.curUserData.name);
						},
						confirm: function() {
							var _self = this,
								jobid = _self.$content.find('.sel[name="jobid"]').val(),
								date = _self.$content.find('input[name="date"]').val(),
								hour = _self.$content.find('.sel[name="hour"]').val(),
								minute = _self.$content.find('.sel[name="minute"]').val(),
								other = _self.$content.find('textarea[name="other"]').val(),
								sendmsg = _self.$content.find('input[name="sendmsg"]:checked').val();
							if (jobid == '') {
								alert('请选择职位');
								return false;
							}
							if (date == '') {
								alert('请选择日期');
								return false;
							}
							if (hour == '0') {
								alert('请选择时段');
								return false;
							}
							if (other.length > 140) {
								alert('其他要求字数最多为140字');
								return false;
							}
							$.ajax({
								type: 'POST',
								url: '/bossweb/interview/invite.json',
								dataType:'JSON',
								data: {
									jobname: Chat.jobData[jobid].jobName,
									jobid: jobid,
									date: date,
									hour: hour,
									minute: minute,
									address: Chat.jobData[jobid].address,
									other: other,
									uid: Chat.curUserData.uid,
									name: Chat.curUserData.name,
									sendmsg: (sendmsg ? 1 : 0)
								},
								success: function(result) {
									var result = result,
										str = '',
										i;
									if(result.rescode == 1){
										Chat.usersData[Chat.curUserData.uid].isCloseInterview = true;
										_self.close();
									} else if (result.rescode == 3) {
										Chat.usersData[Chat.curUserData.uid].isCloseInterview = true;
										Chat.showSystemMessage(Chat.curUserData.uid, result.resmsg);
										Publisher.editorControls.find('.btn-interview').addClass('disabled');
										_self.close();
									} else {
										alert(result.resmsg);
									}
								},
								error: function(result) {
									
								}
							});
							return false;
						},
						error: function(result) {
						}
					})	
				break;
			}
		});
		
		/*IE不支持Ctrl+回车换行*/
		var enterText = '按Enter键发送，按Ctrl+Enter键换行'
		if (isIE) {
			enterText = '按Enter键发送';
			Publisher.editor.find('.chat-op .tip').text(enterText);
		}
		
		Publisher.editorInput.on('keyup', function(e) {
			var text = Publisher.htmlConverToMessage($(this).html());
			if(text.replace(/[\n\s]/g,'') != ''){
				Publisher.submitBtn.removeClass('btn-disabled');
				return;
			} else {
				Publisher.submitBtn.addClass('btn-disabled');
				return;
			}
			if (text.length > 1000) {
				Publisher.editor.find('.tip').text('您输入的内容过长，请删减后再发送').addClass('error-tip');
				Publisher.submitBtn.addClass('btn-disabled');
			} else {
				Publisher.editor.find('.tip').text(enterText).removeClass('error-tip');
				Publisher.submitBtn.removeClass('btn-disabled');
			}
		});
		/*这个像是防止IE下自动给url加链接*/
		try {
			document.execCommand('AutoUrlDetect', false, false);
		} catch (e) {}
		
		/*粘贴处理*/
		Publisher.editorInput.on('paste', function(e) {
			
			var text = null;
			if(window.clipboardData && clipboardData.setData) {
				// IE
				text = window.clipboardData.getData('text');
			} else {
				text = (e.originalEvent || e).clipboardData.getData('text/plain');
			}
			if (document.body.createTextRange) {    
				if (document.selection) {
					textRange = document.selection.createRange();
				} else if (window.getSelection) {
					var sel = window.getSelection();
					var range = sel.getRangeAt(0);
					
					// 创建临时元素，使得TextRange可以移动到正确的位置
					var tempEl = document.createElement("span");
					tempEl.innerHTML = "&#FEFF;";
					range.deleteContents();
					range.insertNode(tempEl);
					textRange = document.body.createTextRange();
					textRange.moveToElementText(tempEl);
					tempEl.parentNode.removeChild(tempEl);
				}
				textRange.text = text;
				textRange.collapse(false);
				textRange.select();
			} else {
				// Chrome之类浏览器
				document.execCommand('insertText', false, text);
				if (text != '') {
					Publisher.submitBtn.removeClass('btn-disabled');
				}
			}
			
			e.preventDefault();
		});
		
		/*回车提交*/
		Publisher.editorInput.bind('keydown',function(e){
			if(e.which == 13){
				if(!e.ctrlKey && !e.shiftKey){
					Publisher.sendText();
					e.preventDefault();
				}else{
					document.execCommand('insertText', false, '\n');
				}
			}
			if (Publisher.editorInput.html() != '') {
				Publisher.editorPlaceholder.hide();
			}
		});
		Publisher.editorInput.bind('focus',function(e){
			Publisher.editorPlaceholder.hide();
		});
		Publisher.editorInput.bind('blur',function(e){
			if (Publisher.editorInput.html() == '' || Publisher.editorInput.html() == '<br>') {
				Publisher.editorPlaceholder.show();
			}
			
		});
		Publisher.editorPlaceholder.on('click', function() {
			Publisher.editorPlaceholder.hide();
			Publisher.editorInput.focus();
		});
		Publisher.editorControls.on('click', function(e) {
			if (!$(e.target).closest('a').length) {
				Publisher.editorPlaceholder.hide();
				Publisher.editorInput.focus();
			}
			
		});
		
		/*点提交按钮提交*/
		Publisher.submitBtn.on('click', function(e) {
			Publisher.sendText();
		});
		
		$(document).on('click', function(e) {
			if (!$(e.target).hasClass('btn-dict') && !$(e.target).parents('.sentence-pannel').length) {
				Publisher.editor.find('.sentence-pannel').remove();
			}
		})
		
	},
	/*html转换为消息文本*/
	htmlConverToMessage: function(html) {
		var h=$('<div/>');
		h.append(html);
		h.find("img").each(function(){
			$(this).replaceWith($(this).data("key"));
		});
		//h.find("div,p").prepend("\n");
		return h.text();
	},
	/*通过js的方式focus，因为contenteditable的div并不具备focus方法*/
	/*focusEditor: function() {
		var editor = Publisher.editorInput.get(0);
		editor.onfocus = function () {
			window.setTimeout(function () {
				var sel,range;
				if (window.getSelection && document.createRange) {
					range = document.createRange();
					range.selectNodeContents(editor);
					range.collapse(true);
					range.setEnd(editor, editor.childNodes.length);
					range.setStart(editor, editor.childNodes.length);
					sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				} else if (document.body.createTextRange) {
					range = document.body.createTextRange();
					range.moveToElementText(editor);
					range.collapse(true);
					range.select();
				}
			}, 1);
		}
		editor.focus();
	},*/
	/*在光标处插入内容*/
	inserCurosrHtml: function(src,key) {
		var el = Publisher.editorInput.get(0),
			len = Publisher.editorInput.text().length;
		if ('getSelection' in window) {
			var sel = window.getSelection();
			if (sel && sel.rangeCount === 1) {
				//有选区，且选区数量是一个
				el.focus();
				var range = sel.getRangeAt(0);
				//如果先失焦，再点击表情，强制将光标移动到最后,写法还不对后面再看
				/*if (!range.startOffset && !range.endOffset) {
					range.setStart(range.startContainer, len)
					range.setEnd(range.startContainer, len)
					range.collapse(true)
				}*/
				var img = new Image();
				img.src=src;
				img.setAttribute('data-key',key);
				img.className = 'emoj-insert';
				img.setAttribute('title',key.replace('[','').replace(']',''));
				range.deleteContents();//删除选中的内容，当然如果没有选中，只是光标的话就什么也不会删除
				range.insertNode(img);
				range.collapse(false);//对于IE来说，参数不可省略
				sel.removeAllRanges();
				sel.addRange(range);
			}
		} else if ('selection' in document) {      
			el.focus();
			var range = document.selection.createRange();
			range.pasteHTML('<img class="emoj-insert" data-key="'+ key +'" title="'+ key.replace('[','').replace(']','') +'" src="' + src + '">');
			el.focus();//IE 11模拟的IE5~IE8无须这一步也能获得焦点
		} 
	},
	/*提交发布*/
	sendText: function(text) {
		var text = text,//传入text参数时是JS模拟发送，而不是手工输入内容
			str = '';
		if (!text) {
			if (Publisher.editorInput.hasClass('btn-disabled')) {
				return false;
			}
			str = Publisher.htmlConverToMessage(Publisher.editorInput.html());
			if(str.replace(/[\n\s]/g,'') == ''){
				alert("请输入文字");
				Publisher.editorInput.html('');
				return false;
			}
			if (str.length > 1000) {
				alert('您输入的内容过长，请删减后再发送');
				return false;
			}
		} else {
			str = text;
		}
		var nowTime = new Date().getTime();
		Chat.sendTextMessage({
			tempID: _PAGE.uid + nowTime,
			isSelf: true,
			from:{
				uid: Chat.myselfData.uid,
				name: Chat.myselfData.name,
				avatar: Chat.myselfData.face
			},
			to:{
				uid: Chat.curUserData.uid
			},
			time:nowTime,
			body:{
				type: 1,
				text: str
			},
			mSource: 'server',
			typeSource: 'newSubmit'
		});
		if (!text) {
			Publisher.editorInput.html('');
			Publisher.submitBtn.addClass('btn-disabled');
			Publisher.editorPlaceholder.show();
		}
	},
	/*显示常用语面板*/
	showSentence: function(el) {
		var html = '<div class="sentence-pannel"><h3 class="title"><a href="javascript:;" class="link-set">设置</a>常用语</h3><div class="sentence-blank">加载中...</div></div>',
			textEl = Publisher.editorInput.get(0);
		$.ajax({
			url: '/setting/replyword/list.json',
			type: 'GET',
			data: null,
			dataType:'JSON',
			timeout: 30000,
			success: function(result){
				var str = '',
					list = result.replyWords;
				if(result.rescode){
					if (list.length) {
						for (i = 0; i < list.length; i++) {
							str += '<li>'+ filterXss(list[i]) +'</li>';
						}
						html = '<div class="sentence-pannel"><h3 class="title"><a href="javascript:;" class="link-set">设置</a>常用语</h3><ul>'+ str +'</ul></div>';
					} else {
						html = '<div class="sentence-pannel"><h3 class="title"><a href="javascript:;" class="link-set">设置</a>常用语</h3><div class="sentence-blank"><a href="javascript:;" class="link-add">+添加常用语</a></div></div>';
					}
					$(html).appendTo(Publisher.editor).show();
					Publisher.editor.find('.sentence-pannel li').on('click', function() {
						//Publisher.editorInput.focus();
						Publisher.editorInput.html(Publisher.editorInput.html() + $(this).text());
						Publisher.editor.find('.sentence-pannel').hide();
						Publisher.submitBtn.removeClass('btn-disabled');
						/*光标聚焦定位到最后位置暂时未做*/
						Publisher.setCursorEnd(textEl);
						
					})
					Publisher.editor.find('.sentence-pannel .link-set').on('click', function() {
						PageSet.showPannel(null, '1');
						Menu.setUrl('set');
					})
				}
			},
			error: function(result){
				
			}
		});
	},
	/*将光标移动到最后的位置,obj是原生的contenteditable对象*/
	setCursorEnd: function(obj) {
		if (window.getSelection) {
			obj.focus();
			var range = window.getSelection();
			range.selectAllChildren(obj);
			range.collapseToEnd();
		} else if (document.selection) {//ie10 9 8 7 6 5
			var range = document.selection.createRange();//创建选择对象
			range.moveToElementText(obj);//range定位到obj
			range.collapse(false);//光标移至最后
			range.select();
		}
	}
};




