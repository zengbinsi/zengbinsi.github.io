var Resume = {
	previewUrl:null,
	attachmentName:null,
	init:function(){
		if (!$('#pop-resume').length) {
			return;
		}
		$('#pop-resume .pop-success .content').css({'background':'none','overflow-y':'auto','overflow-x':'hidden'})
		$('.resume-loading').hide();
		//简历预览相关内容
		//Resume.showPopResume(0);
		$('#pop-resume .pop-item .content').height($(window).height()-200);
		$('#pop-resume .pop-success .content').height($(window).height()-100);
		$('#pop-resume .pop-resume-close').on('click',function(){
			Resume.removePopResume();
			$('.preview-refresh').parent().show();
			$('.resume-loading').hide();
		})
		$('.btn-confim').on('click',function(){//确认保存
			Resume.stateChange()
			Resume.saveResume()//调用保存简历接口
			Resume.removePopResume()
		})
		$('.btn-change , .upload-again').on('click',function(){
			Resume.removePopResume();
			$('.jconfirm-bg').show();
			$('#fileupload').click();
			$('.preview-refresh').parent().show();
			$('.resume-loading').hide();
			
		});
		$('.preview-refresh').click(function(e){//刷新预览
			$(this).parent().hide();
			$('.resume-loading').show();
			Resume.loadResumeImg('/resume/pic4Owner/'+Resume.previewUrl);
		})
		if($('.progress-score').length != 0){
			var width = $('.progress-score').text();
			$('.progress p').css('width',width);
		}
		
		Resume.ownerTags = [];//标记自定义标签
		Resume.canSubmit = false;//标记是否可以提交表单，防止快速重复提交
		/*$('.form-resume').on('submit', function(e) {
			Resume.postData($(this));
			e.preventDefault();
		});*/
		
		$('.resume-item').on('click', '.link-add, .link-edit', function(e) {
			Resume.getData($(this));
			e.preventDefault();
		})
		$('.resume-item').on('click', '.link-delete', function(e) {
			Resume.removeData($(this));
			e.preventDefault();
		})
		
		$('.resume-nav .link-edit').on('click', function(e) {
			var targetId = $(this).attr('data-target');
			Resume.getData($('#' + targetId).find('.link-edit'));
			e.preventDefault();
		})
		$('.resume-nav .link-add').on('click', function(e) {
			var targetId = $(this).attr('data-target');
			Resume.getData($('#' + targetId).find('.link-add'));
			e.preventDefault();
		})
		
		/*初始化附件简历上传*/
		if ($('#fileupload').length) {
			Resume.setUpload();
		}
		// 删除简历
		Resume.deleteFile();
		/*初始化头像上传裁剪*/
		$('.figure .upload-layer').on('click', function () {
			//Uploader.showPannel();
        });
		if ($('.sider-resume').length) {
			var sideNav = $('.sider-resume'),
				sideNavTop = sideNav.offset().top;
			$(window).on('scroll', function() {
				if ($(this).scrollTop() > sideNavTop) {
					sideNav.addClass('fixed-nav');
				} else {
					sideNav.removeClass('fixed-nav');
				}
			})
		}

		// 上传简历hover
		$('.btn-upload-file').hover(function(){
			$('.file-result').css('background','#eee');
		},function(){
			$('.file-result').css('background','#f7f7f7');
		});

		$('.upload-op .btn-upload-file').hover(function(){
			$('.upload-op .change').css('color','#5dd5c8');
		},function(){
			$('.upload-op .change').css('color','#000');
		})
		
	},
	
	/*获取技能标签，在选择了职位之后才能获取*/
	getTag: function(form, init) {
		var formEl = form,
			tagsCon = formEl.find('.tags-cells'),
			url = '/webscan/positionSkill',
			ownerStr = '',
			str = '',
			iptEl = tagsCon.closest('dd').find('.ipt'),
			level2 = formEl.find('input[name="position"]').attr('level2');
		if (!level2) return;
		$.ajax({
			type: 'GET',
			url: url,
			dataType:'JSON',
			data: {
				'positonLv2': level2
			},
			success: function(result) {
				var result = result,
					i,
					curStr = '',
					arr = tagsCon.closest('dd').find('.ipt').val().split('·'),
					loadedArr = [];
				if (result.length > 0) {
					for (i = 0; i < result.length; i++) {
						if ($.inArray(result[i], arr) > -1) {
							curStr = ' class="selected"';
						} else {
							curStr = '';
							
						}
						str += '<span'+ curStr +' ka="tag-'+ result[i] +'">'+ result[i] +'</span>';
						loadedArr.push(result[i]);
					}
					if (init) {//初始化时获取自定义的标签，自定义的标签不会在标准标签里
						for (var j = 0; j < arr.length; j++) {
							if ($.inArray(arr[j], loadedArr) == -1) {
								Resume.ownerTags.push(arr[j]);
								ownerStr += '<span class="selected" ka="tag-'+ arr[j] +'">'+ arr[j] +'</span>';
							}
						}
					}
					
				} else {
					str = '<div class="blank-tag">还未添加标签</div>';
				}
				tagsCon.html(ownerStr + str);
			},
			error: function(result) {
			}
		})
	},
	
	getData: function(el) {
		var el = el,
			url = el.attr('href'),
			formCon = el.closest('.resume-item').find('.item-form');
		$('.resume-item').removeClass('resume-item-open');
		$.ajax({
			type: 'POST',
			url: url,
			dataType:'JSON',
			data: null,
			success: function(result) {
				var result = result;
				if (typeof result == 'string') {
					result = eval('('+ result +')');
				}
				if (result.rescode == 1) {
					formCon.html(result.html);
					el.closest('.resume-item').addClass('resume-item-open');
					formCon.find('.form-btns .btn-back').on('click', function() {
						el.closest('.resume-item').removeClass('resume-item-open');
						$('html,body').animate({
							scrollTop: el.closest('.resume-item').offset().top + 'px'
						}, 500);
					})
					formCon.find('.form-btns .btn-delete').unbind('click').on('click', function(e) {
						Resume.removeData(el, $(this));
						e.preventDefault();
					})
					
					var isAdd = false;//标记是否是新增的表单
					if (!result.resoper) {
						var isAdd = true;
					}
					FormsUI.init(formCon.find('form'), isAdd);
					Validate.init(formCon.find('form'), isAdd);
					PlaceholderCheck.init(formCon.find('form'));
				} else {
					Resume.showError(result.resmsg);
				}
				$('html,body').animate({
					scrollTop: el.closest('.resume-item').offset().top + 'px'
				}, 500);
			},
			error: function(result) {
				Resume.showError();
			}
		})
	},
	postData: function(form) {
		var formEl = form,
			url = formEl.attr('action'),
			primaryWrap = formEl.closest('.resume-item'),
			primaryCon = primaryWrap.find('.item-primary'),
			primaryModule = primaryWrap.attr('id');
		if (formEl.find('.show-prefix-today').length) {
			formEl.find('input[name="endDate"]').val('');
			formEl.find('input[name="now"]').val('1');
		}
		$.ajax({
			type: 'POST',
			url: url,
			dataType:'JSON',
			data: formEl.serialize(),
			success: function(result) {
				var result = result,
					str = '',
					resultId = '';
				if (typeof result == 'string') {
					result = eval('('+ result +')');
				}
				if (result.rescode == 1) {
					primaryWrap.removeClass('resume-item-open');
					str = result.html;
					if (primaryModule == 'resume-userinfo') {
						primaryCon.find('.name').remove();
						primaryCon.find('.info-labels').remove();
						primaryCon.append(str);
					}
					if (primaryModule == 'resume-summary') {
						primaryCon.find('.text').remove();
						primaryCon.append(str);
					}
					if (primaryModule == 'resume-purpose') {
						resultId = $(str).attr('id');
						if (primaryWrap.find('#' + resultId).length) {
							primaryWrap.find('#' + resultId).after(str).remove();
						} else {
							primaryCon.find('.info-labels').prepend(str);
						}
						
					}
					if (primaryModule == 'resume-history' || primaryModule == 'resume-project' || primaryModule == 'resume-education') {
						resultId = $(str).attr('id');
						//if ($('#' + resultId).length) {
							//$('#' + resultId).after(str).remove();
						//} else {
							var titleEl = primaryCon.find('.title'),
								loadEl = '';
							if (primaryModule == 'resume-history') {
								loadEl = 'history-project'
							}
							if (primaryModule == 'resume-project') {
								loadEl = 'history-project'
							}
							if (primaryModule == 'resume-education') {
								loadEl = 'history-education'
							}
							primaryCon.load(''+ window.location.href +' #'+ primaryModule +' .'+ loadEl +'', function() {
								primaryCon.prepend(titleEl);
							});
						//}
					}
					if (primaryModule == 'resume-social') {
						resultId = $(str).attr('id');
						if (primaryCon.find('#' + resultId).length) {
							primaryCon.find('#' + resultId).after(str).remove();
						} else {
							primaryCon.find('.social-account').prepend(str);
						}
						
					}
					//primaryCon.find('.text').remove();
					//primaryCon.append(str);
					$('html,body').animate({
						scrollTop: formEl.closest('.resume-item').offset().top + 'px'
					}, 500);
				} else {
					Resume.showError(result.resmsg);
				}
				Resume.canSubmit = true;
			},
			error: function() {
				Resume.canSubmit = true;
				Resume.showError();
			}
		})
		Resume.canSubmit = false;
	},
	removeData: function(el, btn) {
		var el = el,
			url = el.attr('href') || el.attr('data-url'),
			primaryWrap = el.closest('.resume-item'),
			primaryCon = primaryWrap.find('.item-primary'),
			primaryModule = primaryWrap.attr('id'),
			formCon = el.closest('.resume-item').find('.item-form');
		//如果是点击的编辑表单中的删按钮
		if (btn) {
			url = btn.attr('data-url');
		}
		$.confirm({
			content: '<div class="tip-alert">删除后不可恢复，确认删除吗？</div>',
			title: '温馨提示',
			closeIcon: true,
			columnClass: 'pop-tip-box pop-tip',
			confirm: function() {
				var _self = this;
				$.ajax({
					type: 'POST',
					url: url,
					dataType:'JSON',
					data: {},
					success: function(result) {
						var result = result;
						if (typeof result == 'string') {
							result = eval('('+ result +')');
						}
						if (!result.rescode) {
							Resume.showError(result.resmsg);
						} else {
							el.closest('.resume-item').removeClass('resume-item-open');
							if (primaryModule == 'resume-purpose') {
								el.parent().parent().remove();
							}
							if (primaryModule == 'resume-history' || primaryModule == 'resume-project' || primaryModule == 'resume-education') {
								var closeParent = el.closest('.item-primary');
								el.closest('.history-item').remove();
								if (primaryModule != 'resume-project') {//项目经验是可以全部删除的
									if (closeParent.find('.history-item').length == 1) {
										closeParent.find('.history-item .op .link-delete').hide();
										closeParent.find('.history-item .op .vline').hide();
									} else {
										closeParent.find('.history-item .op .link-delete').show();
										closeParent.find('.history-item .op .vline').show();
									}
								}
							}
							if (primaryModule == 'resume-social') {
								el.closest('.account-item').remove();
							}
							$('html,body').animate({
								scrollTop: primaryWrap.closest('.resume-item').offset().top + 'px'
							}, 500);
						}
						
						_self.close();
					}
				})
				return false;
			},
			error: function() {
				Resume.showError();
			}
		})
	},
	showError: function(msg) {
		if (!msg) {
			var msg = '服务器错误，请稍后再试';
		}
		$.confirm({
			content: '<div class="tip-alert">'+ msg +'</div>',
			title: '温馨提示',
			closeIcon: true,
			confirmButton: '确定',
			cancelButton: false,
			columnClass: 'pop-tip-box pop-tip'
		})
	},
	/*简历上传*/
	showPopResume:function(index){
		var $children=$('#pop-resume .pop-item'),
			$parent=$('#pop-resume');
		$parent.show();
		$children.hide();
		$children.eq(index).show()	
		$('body').css('overflow','hidden');
		$('.jconfirm-bg').hide();
	},
	removePopResume:function(){
		$('#pop-resume').hide();
		$('body').css('overflow','visible');
	},
    stateChange:function(){//
		$('.upload').remove();
		Resume.reLoadResume = false;
		if($('.file-name').length ==0){
			$('.resume-attachment').append('<div class="loadresume"><span class="file-name">'+ Resume.attachmentName +'</span><div class="upload-op"><i class="change">更改</i><a class="btn-upload-file">'+
				'<input id="fileupload" type="file" name="file">'+
				'</a></div><i class="fz-resume fz-close"></i></div></div>');
		}else {
			$('.file-name').text(Resume.attachmentName)
		}
		
		/*详情页的投递上传*/
		$('.jconfirm-bg').show();
		$('.deliver-pop .btns .btn').eq(0).text('确定');
		$('.deliver-pop .btns .file').remove();
	},
	isImgLoad:function(){//判断图片是否加载完成
//		$('.pop-success .content img').each(function(){
//			if(this.readyState=="complete"||this.readyState=="loaded"){
//				$('.preview-refresh').parent().show();
//				$('.resume-loading').hide();
//	    		Resume.showPopResume(1)//上传成功
//	    		console.log(1)
//			}else{
//				$('.preview-refresh').parent().show();
//				$('.resume-loading').hide();
//				Resume.showPopResume(3)//预览失败
//				console.log(2)
//				//Math.Random()
//			}
//			
//		})
	    $('.pop-success .content img').each(function(){
	    	$(this).load(function(){
	    		$('.preview-refresh').parent().show();
				$('.resume-loading').hide();
	    		Resume.showPopResume(1)//上传成功
	    	});
	    	$(this).error(function(){
	    		Resume.showPopResume(3)//预览失败
	    	});
	    });	
//	   	$('.pop-success .content img').each(function(){
//	    	$(this).error(function(){
//	    		Resume.showPopResume(3)//预览失败
//	    		return;
//	    	});
//	    	$('.preview-refresh').parent().show();
//			$('.resume-loading').hide();
//	    	Resume.showPopResume(1)//上传成功
//	    });	
	},
	setUpload: function() {
		var url = '/geek/attresume/upload.json',
			elProgress = $('.progress'),
			typeRule = /(\.|\/)(ppt|pptx|doc|docx|pdf|png|jpg|jpeg)$/i,
			maxSize = 2000000;//2M
		$(".resume-attachment,.deliver-pop").on("click","#fileupload",function(){
			$(this).blur();
			$('#fileupload').fileupload({
				type: 'POST',
				url: url,
				dataType: 'text',
				acceptFileTypes: typeRule,
				maxFileSize: maxSize,
				//maxChunkSize:5000000,//分片5M
				add: function (e, data) {
					var file = data.files[0],
						fileName = file.name;
					$('.resume-title').text(fileName)
					if (typeRule.test(fileName)) {
						Resume.reLoadResume = false;
						data.submit();
						Resume.showPopResume(0)
					} else {
						alert('请选择有效的文件');
					}
				},
				done: function (e, data) {
					var result = data.result;
					if (typeof result == 'string') {
						result = eval('('+ result +')');
					}
					if(result.rescode == 1){
						Resume.previewUrl = result.previewUrl;
						Resume.loadResumeImg('/resume/pic4Owner/'+ result.previewUrl);
						//$('.pop-success .content img').attr('src','/resume/pic4Owner/'+result.previewUrl)//预览图片路径
						Resume.attachmentName=result.attachmentName
						//Resume.isImgLoad();//判断图片
					}else{
						//alert(result.resmsg);
						Resume.showPopResume(2)//上传失败
					}
					
				}
			}).prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled');
		});
		$(".resume-attachment").trigger('click')
	},
	saveResume:function(){//确认保存简历
		$.ajax({
			type: 'POST',
			url: '/geek/attresume/save.json?previewUrl='+Resume.previewUrl,
			dataType:'JSON',
			data: {},
			success: function(result) {
				if(result.rescode == 1){		
				}else{
						alert(result.resmsg);
				}
		    }	
	    })
	},
	/*预加载简历*/
	loadResumeImg: function(url) {
		var img = new Image();
			img.src = url;
			img.onload = function() {
				$('.pop-success .content').html('<img src="'+ url +'" />');
				$('.pop-success .content img').css({'display':'block','width':'810px','margin':'0 auto'});
				$('.preview-refresh').parent().show();
				$('.resume-loading').hide();
				$('.pop-success .content .msg').hide();
				$('.pop-success .content .resume-loading').hide();
				Resume.showPopResume(1)//上传成功
			};
			img.onerror = function() {
				if (Resume.reLoadResume) {
					Resume.showPopResume(3)//预览失败
					Resume.consoleLog()
					$('.preview-fail .content .msg').show();
					$('.preview-fail .content .resume-loading').hide();
				}
				/*重试*/
				if (!Resume.reLoadResume) {
					Resume.loadResumeImg(url);
					Resume.reLoadResume = true;
				}
			}
	},
	consoleLog:function(){//预览失败打印日志
		$.ajax({
			type: 'POST',
			url: '/actionLog/previewFail.json',
			dataType:'JSON',
			data: {'previewUrl':Resume.previewUrl},
			success: function(result) {				
		    }	
	    })		
	},
	// 简历删除
	deleteFile:function(){
		$(".resume-attachment").delegate(".fz-close","click",function(){
			var url = '/geek/attresume/delete.json';
			$.confirm({
				content: '<div class="tip-alert">确认删除该附件简历吗？</div>',
				title: '温馨提示',
				closeIcon: true,
				columnClass: 'pop-tip-box pop-tip',
				confirm: function() {
					var _self = this;
					$.ajax({
						type: 'POST',
						url: url,
						dataType:'JSON',
						data: {},
						success: function(result) {
							if(result.rescode == 1){
								$('.resume-attachment .loadresume').remove();
								$('.resume-attachment').append('<div class="upload"><div class="file-result">上传附件简历</div>'+
									'<div class="file-btn"><a class="btn-upload-file">'+
									'<input id="fileupload" type="file" name="file">'+
									'</a></div><div class="file-tip"><p>支持 doc、docx、pdf、jpg、png 格式</p></div></div>');
								
							}
							_self.close();
						}
					})
					return false;
				},
				error: function() {
					Resume.showError();
				}
			})
		})
	}
}
