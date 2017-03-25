/*登录注册*/
var Sign = {
	init: function(wrap) {
		if (wrap) {
			PlaceholderCheck.init()
		}
		var elWrap = wrap || $('.sign-wrap');
		Sign.source = getQueryString('s');//获取来源参数
		if (Sign.source) {
			Sign.directUrls = {//标记登录或注册之后的跳转地址
				'recharge': '/weixin/official/toPay'//微信充值
			}
		}
		elWrap.find('.sign-tab').on('click', 'span', function() {
			var el = $(this);
			if (el.hasClass('link-signin')) {
				Sign.showPannel(elWrap, 'signin');
				try {
					_T.sendEvent('signin_tab_signin');
				} catch(e) {}
			}
			if (el.hasClass('link-sms')) {
				Sign.showPannel(elWrap, 'sms');
				try {
					_T.sendEvent('signin_tab_sms');
				} catch(e) {}
			}
			if (el.hasClass('link-scan')) {
				Sign.showPannel(elWrap, 'scan');
				try {
					_T.sendEvent('signin_tab_scan');
				} catch(e) {}
			}
			
		})
		elWrap.find('.text-tip .link-signup').on('click', function() {
			Sign.showPannel(elWrap, 'register');
			try {
				_T.sendEvent('signin_link_signup');
			} catch(e) {}
		})
		elWrap.find('.text-tip .link-signin').on('click', function() {
			Sign.showPannel(elWrap, 'signin');
			try {
				_T.sendEvent('signin_link_signin');
			} catch(e) {}
		})
		Sign.dropSelect(elWrap);
		
		elWrap.find('form').on('submit', function(e) {
			Sign.checkForm($(this));
			e.preventDefault();
		})
		elWrap.find('.btn-sms').on('click', function() {
			var formEl = $(this).closest('form');
			Sign.checkForm(formEl, true);
		});
		elWrap.find('.ipt').on('focus', function() {
			$(this).parent().addClass('focus-wrap');
		}).on('blur', function() {
			$(this).parent().removeClass('focus-wrap');
		})
		elWrap.find('.verifyimg').on('click', function() {
			$(this).attr('src', '/captcha/?randomKey='+ $(this).closest('.form-row').find('.randomkey').val() +'&_r=' + new Date().getTime());
			try {
				_T.sendEvent('signin_verify_code');
			} catch(e) {}
		})
		
		elWrap.find('.sign-form').each(function() {
			if ($(this).find('.randomkey').length && $(this).find('.randomkey').val() == '') {
				Sign.getRandomkey(elWrap, $(this));
				return false;
			}
		})
		/*如果是扫码过来的，默认扫码tab会显示，那么需要自动触发scan*/
		if ($('.sign-scan').is(':visible')) {
			Sign.scanPending(elWrap);
		}
		
		if (cookie.get('hasShowLoginTip')) {
			elWrap.find('.qrcode-tip').hide();
		} else {
			elWrap.find('.qrcode-tip').show();
		}
		elWrap.find('.qrcode-tip .gray').on('click', function() {
			elWrap.find('.qrcode-tip').hide();
			cookie.set('hasShowLoginTip','1',30000);
		})
	},
	showPannel: function(wrap, type) {
		wrap.find('.sign-form').hide();
		var curForm;
		switch (type) {
			case 'signin':
				curForm = wrap.find('.sign-pwd');
			break;
			case 'sms':
				curForm = wrap.find('.sign-sms');
			break;
			case 'scan':
				curForm = wrap.find('.sign-scan');
				
			break;
			case 'register':
				curForm = wrap.find('.sign-register');
			break;
			case 'welcome':
				curForm = wrap.find('.sign-welcome');
			break;
			case 'history':
				curForm = wrap.find('.sign-history');
			break;
			case 'deliver':
				curForm = wrap.find('.sign-deliver');
			break;
			case 'validate':
				curForm = wrap.find('.sign-validate');
			break;
		}
		curForm.show();
		curForm.find('.verifyimg').click();
		if (type == 'scan') {
			Sign.scanPending(wrap);
		}
		/*if (curForm.find('.randomkey').length && curForm.find('.randomkey').val() != '') {
			Sign.getRandomkey(curForm);
		}*/
		
	},
	/*区号选择*/
	dropSelect: function(wrap) {
		wrap.find('.dropdown-select').each(function() {
			var _self = $(this);
			_self.on('click', function() {
				if ($(this).hasClass('dropdown-disabled')) {
					return;
				}
				
				$(this).toggleClass('dropdown-select-open');
				$(this).closest('.form-row').find('.dropdown-menu').toggleClass('dropdown-menu-open');
			})
		})
		wrap.find('.dropdown-menu').each(function() {
			var _self = $(this),
				elSelect = _self.closest('.form-row').find('.dropdown-select'),
				elText = elSelect.find('.text-select'),
				elKey = elSelect.find('input[type="hidden"]');
			_self.on('click', 'li', function() {
				elText.text($(this).attr('data-val'));
				elKey.val($(this).attr('data-val'));
				elKey.closest('dd').find('.tip-text').remove();
				_self.removeClass('dropdown-menu-open');
				elSelect.removeClass('dropdown-select-open');
			})
		})
		$(document).on('touchend click', function(e) {
			if (!$(e.target).closest('.dropdown-menu').length && !$(e.target).closest('.dropdown-select').length) {
				wrap.find('.dropdown-select').removeClass('dropdown-select-open');
				wrap.find('.dropdown-menu').removeClass('dropdown-menu-open');
			}
		})
	},
	/*获取图片验证码的randomkey*/
	getRandomkey: function(wrap, formEl) {
		var formEl = formEl,
			el = formEl.find('.ipt-code'),
			url = el.attr('data-url'),
			elRandomkey = formEl.find('.randomkey');
		if (elRandomkey.val() != '') {
			return;
		}
		$.ajax({
			url: url,
			type: 'POST',
			dataType: 'json',
			data: null,
			success: function(result){
				if (result.rescode == 1) {
					wrap.find('.randomkey').val(result.randomKey);//全部表单都设置上randomKey
					elRandomkey.parent().find('.verifyimg').click();
					wrap.find('.sign-scan .qrcode-box img').attr('src', '/qrcode/' + result.qrId);
					wrap.find('.uuid').val(result.qrId);
				}
			},
			error: function(e){
				
			}
		})
	},
	checkForm: function(formEl, isSms) {
		var formEl = formEl,
			elPhone = formEl.find('.ipt-phone'),
			elZone = formEl.find('input[name="regionCode"]'),
			elPwd = formEl.find('.ipt-pwd'),
			elCode = formEl.find('.ipt-code'),
			elSms = formEl.find('.ipt-sms'),
			elTip = formEl.closest('.sign-form').find('.tip-error');
		if (elPhone.length) {
			if (elPhone.val() == '') {
				Sign.showError(formEl, '请填写手机号');
				elPhone.focus();
				return false;
			} else if (elZone.val() == '+86' && !/^(1[35678][0-9]{9})$/.test(elPhone.val())) {
				Sign.showError(formEl, '请正确填写手机号');
				elPhone.focus();
				return false;
			} else if (!/^(\d{6,11})$/.test(elPhone.val())) {//国外的手机号只简单验证为6-11位与客户端一致
				Sign.showError(formEl, '请正确填写手机号');
				elPhone.focus();
				return false;
			} else {
				Sign.hideError(formEl);
			}
		}
		if (elPwd.length) {
			if (elPwd.val() == '') {
				Sign.showError(formEl, '请填写密码');
				elPwd.focus();
				return false;
			} else {
				Sign.hideError(formEl);
			}
		}
		if (elCode.length) {
			if (elCode.val() == '') {
				Sign.showError(formEl, '请填写验证码');
				elCode.focus();
				return false;
			} else if (!elCode.val().match(/^.{4}$/)) {
				Sign.showError(formEl, '请填写正确的验证码');
				elCode.focus();
				return false;
			} else {
				Sign.hideError(formEl);
			}
		}
		if (elSms.length && !isSms) {
			if (elSms.val() == '') {
				Sign.showError(formEl, '请填写短信验证码');
				elSms.focus();
				return false;
			} else if (!elSms.val().match(/^.{4}$/)) {
				Sign.showError(formEl, '请填写正确的短信验证码');
				elSms.focus();
				return false;
			} else {
				Sign.hideError(formEl);
			}
		}
		Sign.postData(formEl, isSms);
	},
	postData: function(formEl, isSms) {
		var formEl = formEl,
			formType = formEl.closest('.sign-form'),
			btnSms = formEl.find('.btn-sms'),
			url = formEl.attr('action'),
			btnEl = formEl.find('.form-btn .btn');
		if (isSms) {
			if (btnSms.hasClass('btn-disabled')) {
				return;
			}
			url = btnSms.attr('data-url');
			btnSms.addClass('btn-disabled').html('请稍后');
		} else {
			if (btnEl.hasClass('btn-disabled')) {
				return;
			}
			btnEl.addClass('btn-disabled');
		}
		$.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			data: formEl.serialize(),
			success: function(result){
				var result = result;
				if (typeof result == 'string') {
					result = eval('('+ result +')');
				}
				if (result.rescode == 1) {
					if (formType.hasClass('sign-pwd')) {
						Sign.callbackPwd(formEl, result);
					}
					if (formType.hasClass('sign-sms')) {
						if (isSms) {
							if (result.type == 2) {//已经注册
								btnSms.html('已发送(<em class="num">60s</em>)').addClass('count-down btn-disabled');
								Sign.countDown(btnSms, function() {
									btnSms.html('发送验证码').removeClass('count-down btn-disabled');
								});
								btnSms.parent().find('.ipt-sms').focus();
								try {
									_T.sendEvent('signin_sms_send_sms');
								} catch(e) {}
							} else {//未注册
								Sign.showError(formEl, result.resmsg, true);
								btnSms.html('发送验证码').removeClass('count-down btn-disabled');
							}
						} else {
							Sign.callbackSms(formEl, result);
						}
					}
					if (formType.hasClass('sign-register')) {
						if (isSms) {
							if (result.type == 2) {//已经注册过
								Sign.showError(formEl, result.resmsg, true);
								btnSms.html('发送验证码').removeClass('count-down btn-disabled');
							} else {//未注册
								btnSms.html('已发送(<em class="num">60s</em>)').addClass('count-down btn-disabled');
								Sign.countDown(btnSms, function() {
									btnSms.html('发送验证码').removeClass('count-down btn-disabled');
								});
								btnSms.parent().find('.ipt-sms').focus();
								formEl.append('<input type="hidden" name="rescode" value="1" />');
								try {
									_T.sendEvent('signin_register_send_sms');
								} catch(e) {}
							}
						} else {
							Sign.callbackRegister(formEl, result);
							Sign.countDown(formEl.closest('.sign-form').nextAll('.sign-welcome').find('.count-down'), function() {
								window.location.href = '/geek/myresume.html';
							});
						}
					}
				} else {
					Sign.showError(formEl, result.resmsg, true);
					if (isSms) {
						btnSms.html('发送验证码').removeClass('btn-disabled');
					}
				}
				if (!isSms) {
					btnEl.removeClass('btn-disabled');
				}
			},
			error: function(e){
				if (isSms) {
					btnSms.html('发送验证码').removeClass('btn-disabled');
				} else {
					btnEl.removeClass('btn-disabled');
				}
			}
		})
	},
	/*密码登录回调*/
	callbackPwd: function(formEl, result) {
		try {
			_T.sendEvent('signin_submit_pwd');
		} catch(e) {}
		if (Sign.source) {//有指定跳转地址的就直接跳了
			window.location.href = Sign.directUrls[Sign.source];
			return;
		}
		if (result.identity == 1) {//BOSS身份登录
			window.location.href = '/chat/im';
		} else {//牛人身份登录
			if($('.page-sign').length){
				if (result.toUrl) {
					window.location.href = decodeURIComponent(result.toUrl);
				} else {
					window.location.href = '/';
				}
			} else {
				window.location.reload();
			}
		}
	},
	/*短信登录回调*/
	callbackSms: function(formEl, result) {
		var elTip = formEl.closest('.sign-form').find('.tip-error');
		try {
			_T.sendEvent('signin_submit_code');
		} catch(e) {}
		if (Sign.source) {//有指定跳转地址的就直接跳了
			window.location.href = Sign.directUrls[Sign.source];
			return;
		}
		if (result.identity == 1) {//BOSS登录
			window.location.href = '/chat/im';
		} else if($('.page-sign').length){
			if (result.toUrl) {
				window.location.href = decodeURIComponent(result.toUrl);
			} else {
				window.location.href = '/';
			}
		} else {
			window.location.reload();
		}
	},
	/*手机号注册回调*/
	callbackRegister: function(formEl, result) {
		var wrap = $('.sign-wrap');
		try {
			_T.sendEvent('signin_submit_register');
		} catch(e) {}
		if (formEl.closest('.pop-sign-box').length) {
			wrap = formEl.closest('.pop-sign-box');
		}
		if (Sign.source) {//有指定跳转地址的就直接跳了，不需要完善
			window.location.href = Sign.directUrls[Sign.source];
			return;
		} else {
			Sign.showPannel(wrap, 'welcome');
		}
	},
	showError: function(formEl, msg, isSubmit) {
		var elTip = formEl.closest('.sign-form').find('.tip-error');
		elTip.text(msg);
		if (isSubmit && formEl.find('.verifyimg').length) {
			formEl.find('.ipt-code').val('');
			formEl.find('.verifyimg').click();
		}
		if (isTouch) {
			Sign.showToast(msg);
		}
	},
	hideError: function(formEl) {
		var elTip = formEl.closest('.sign-form').find('.tip-error');
		elTip.text('');
	},
	showToast: function(str) {
		var el = $('<div class="toast"><p>'+ str +'</p></div>');
		if ($('.toast').length) {
			$('.toast').remove();
		}
		if (Sign.timerToast) clearTimeout(Sign.timerToast);
		$('body').append(el);
		$('.toast').show();
		Sign.timerToast = setTimeout(function() {
			Sign.hideToast(el);
		},2000)
	},
	hideToast: function() {
		$('.toast').fadeOut(function() {
			$('.toast').remove();
		});
	},
	/*倒计时*/
	countDown: function(el, callback) {
		var sec = parseInt(el.find('.num').text().replace('s'), 10);
		/*if (el.closest('.sign-welcome').length) {
			sec = 3;
		}*/
		Sign.interCount = setInterval(function(){
			sec--;
			el.find('.num').text(sec + 's');
			if(sec <= 0){
				callback();
				clearInterval(Sign.interCount);
				Sign.interCount = null;
			}
		},1000);
	},
	/*扫码登录等候*/
	scanPending: function(wrap) {
		var uuid = wrap.find('.uuid').val(),
			redirectUrl = wrap.find('.qrcode-box img').attr('data-url');
		if (!uuid || !wrap.find('.sign-scan').is(':visible')) return;
		$.ajax({
			type: 'GET',
			url: '/scan?uuid=' + uuid,
			dataType: 'json',
			cache: false,
			timeout: 100000,
			success: function (result) {
				if (result.scaned) {
					if (('validate' in result ) && result.validate) {
						try {
							_T.sendEvent('rq_scan_form_index_foot');//JS触发上报事件
						} catch(e) {}
						window.location.href = redirectUrl + uuid;
					} else if (('allweb' in result) && result.allweb) {
						try {
							_T.sendEvent('rq_scan_form_index_foot');//JS触发上报事件
						} catch(e) {}
						window.location.href = redirectUrl + uuid;
					} else if (('validate' in result ) && !result.validate){
						//show_ts();
						setTimeout("window.location.reload()", 3000); //三秒后自动跳转
					}else {
						setTimeout("window.location.reload()", 3000); //三秒后自动跳转
					}
				} else {
					if(wrap.find('.sign-scan').is(':visible')) {
						Sign.scanPending(wrap);
					}
				}
			},
			error: function () {
				if(wrap.find('.sign-scan').is(':visible')) {
					setTimeout(function () {
						Sign.scanPending(wrap);
					}, 5000);
				}
			}
		});
	}
};