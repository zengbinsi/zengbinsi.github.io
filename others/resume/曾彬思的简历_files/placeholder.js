/*检查是否支持placeholder*/
function placeholderSupport() {
    return 'placeholder' in document.createElement('input');
}

/*IE低版本placeholder处理，自己择机调用*/
var PlaceholderCheck = {
	init: function(wrap) {
		if(!placeholderSupport()){
			var els;
			if (wrap) {
				els = wrap.find('[placeholder]')
			} else {
				els = $('[placeholder]');
			}
			els.focus(function() {
				var input = $(this);
				if (input.val() == input.attr('placeholder')) {
					input.val('');
					input.removeClass('placeholder');
				}
			}).blur(function() {
				var input = $(this);
				if (input.val() == '' || input.val() == input.attr('placeholder')) {
					input.addClass('placeholder');
					input.val(input.attr('placeholder'));
				}
			}).blur();
		};
	}
};