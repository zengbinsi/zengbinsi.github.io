/*
	表单验证
*/
var Validate = {
	init: function(form, isAdd) {
		var formEl = form,
			iptEls = formEl.find('input,textarea');
		formEl.on('submit', function(e) {
			var canSubmit = false;
			iptEls.each(function() {
				if ($(this).hasClass('required')) {
					if (!Validate.check($(this), true)) {
						canSubmit = false;
						return false;
					};
				}
				canSubmit = true;
			})
			if (canSubmit) {
				Resume.postData(formEl);
			}
			e.preventDefault();
		});
		iptEls.each(function() {
			var countEl = $(this).closest('dd').find('.count-num');
			if ($(this).hasClass('required') || $(this).attr('data-range')) {
				if (!isAdd) {
					Validate.check($(this), false, countEl);
				}
				$(this).bind('input keyup', function() {
					Validate.check($(this), false, countEl);
				})
			}
		})
		formEl.find('.form-btns .btn-back').on('click', function() {
			formEl.closest('.resume-item').removeClass('resume-item-open');
		})
		/*formEl.find('.form-btns .btn-delete').on('click', function() {
			Resume.removeData($(this));
		})*/
		formEl.find('input[name="locationName"]').on('blur', function() {
			if ($(this).val() != '' && $(this).parent().find('input[name="location"]').val() == '') {
				$(this).val('');
				Validate.showError($(this), '请输入正确的城市');
			}
		})
		
		
	},
	/*获取文本的长度，2个英文算一个长度*/
	getLength: function(str) {
		var realLength = 0,
			str = str;
			len = str.length,
			charCode = -1;
		for (var i = 0; i < len; i++) {
			charCode = str.charCodeAt(i);
			if (charCode >= 0 && charCode <= 128) {
				realLength += 0.5
			} else {
				realLength += 1
			}
		}
		return Math.round(realLength);
	},
	/*
		el: 被验证的表单元素
		showBlankTip: 为空时是否显示错误提示，默认不显示
		
	*/
	check: function(el, showBlankTip, countEl) {
		var el = el,
			range = el.attr('data-range'),
			curLen = Validate.getLength(el.val()),
			redStr = ' class="red"',
			str = el.val().replace(/(\s*$)/g,'');
		if (str == '') {
			//el.val('');
			if (!showBlankTip) {
				Validate.hideError(el);
			} else {
				Validate.showError(el, el.attr('data-blank'));
				return false;
			}
		} else {
			Validate.hideError(el);
		}
		if (el.attr('name') == 'locationName' && str != '' && el.parent().find('input[name="location"]').val() == '') {
			Validate.showError(el, '请输入正确的城市');
			return false;
		}
		
		if (range) {
			range = range.split(',');
			if (countEl && countEl.length) {
				countEl.html('<em'+ (curLen > range[1] ? redStr : '') +'>'+ curLen +'</em>/' + range[1]);
			}
			if (curLen > range[1] || curLen < range[0]) {
				Validate.showError(el, '请输入' + range[0] + '-' + range[1] + '个字');
				return false;
			} else {
				Validate.hideError(el);
			}
			
		}
		return true;
	},
	showError: function(el, text) {
		var str = '<div class="tip-text">'+ text +'</div>';
		Validate.hideError(el);
		el.closest('dd').find('.tip-text').remove();
		$(str).appendTo(el.closest('dd'));
		el.addClass('ipt-error');
	},
	hideError: function(el) {
		el.closest('dd').find('.tip-text').remove();
		el.removeClass('ipt-error');
	}
};
$(function() {
	$('.form-resume').each(function() {
		Validate.init($(this));
	})
	
})