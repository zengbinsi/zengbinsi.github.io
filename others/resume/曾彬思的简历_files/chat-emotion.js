/**
	表情处理
**/
var Emotion = {
	data: ["微笑", "撇嘴", "色", "发呆", "得意", "流泪", "害羞", "闭嘴", "睡", "大哭", "尴尬", "发怒", "调皮", "呲牙", "惊讶", "难过", "酷", "冷汗", "抓狂", "吐", "偷笑", "愉快", "白眼", "傲慢", "饥饿", "困", "惊恐", "流汗", "憨笑", "悠闲", "奋斗", "咒骂", "疑问", "嘘", "晕", "疯了", "衰", "骷髅", "敲打", "再见", "擦汗", "抠鼻", "鼓掌", "糗大了", "坏笑", "左哼哼", "右哼哼", "哈欠", "鄙视", "委屈", "快哭了", "阴险", "亲亲", "吓", "可怜", "菜刀", "西瓜", "啤酒", "篮球", "乒乓", "咖啡", "饭", "猪头", "玫瑰", "凋谢", "嘴唇", "爱心", "心碎", "蛋糕", "闪电", "炸弹", "刀", "足球", "瓢虫", "便便", "月亮", "太阳", "礼物", "拥抱", "强", "弱", "握手", "胜利", "抱拳", "勾引", "拳头", "差劲", "爱你", "NO", "OK"],
	/*初始化时生成表情面板*/
	init: function() {
		var str = '',
			i,
			key,
			emotionPannel = Publisher.editor.find('.emotion');
		if (!emotionPannel.length) {
			for (i = 0; i < Emotion.data.length; i++) {
				key = Emotion.data[i];
				str += '<li><button class="emoj emoj-'+ (i + 1) +'" data-key="['+ key +']" title="'+ key +'"></button></li>';//button、img这样的标签不会失焦，i标签不行
			}
			Publisher.editor.append('<div class="emotion"><ul>'+ str +'</ul></div>');
			Emotion.showEmotion();
			$(document).on('click', function(e) {
				if (!$(e.target).hasClass('btn-emotion') && !$(e.target).parents('.emotion').length) {
					Emotion.hideEmotion();
				}
			})
			Publisher.editor.find('.emotion').on('click','.emoj', function() {
				var el = $(this);
				Emotion.chooseEmotion(el);
			})
		}
		emotionPannel.show();
		
	},
	/*显示表情面板*/
	showEmotion: function() {
		Publisher.editor.find('.emotion').show();
	},
	/*隐藏表情面板*/
	hideEmotion: function() {
		Publisher.editor.find('.emotion').hide();
	},
	/*将[微笑]这样的文本转为<i class="emoj emoj-39" data-key="[微笑]" title="微笑"></i>*/
	/*表情字符转为图片*/
	textCodeToImg:function(text){
		var matchArr = text.match(/\[[a-zA-Z\u4e00-\u9fa5]{1,3}\]/g),
			i;
		if(!matchArr){
			return text;
		}
		for(i = 0; i < matchArr.length; i++){
			var key = matchArr[i].replace(/[\[\]]/g,'');
			var num = Emotion.data.indexOf(key),
				emoStr;
			if(num > -1){
				emoStr = '<i class="emoj emoj-'+ (num + 1) +'" title="'+ key +'"></i>'
			}
			if(emoStr){
				text = text.replace(matchArr[i],emoStr);
			}
		}
		return text;
	},
	chooseEmotion: function(el) {
		var emoj = el,
			num = emoj.attr('class').split('emoj-')[1];
		Publisher.editorInput.focus();
		var imgTemp = '/v2/web/boss/images/emotions/Expression_'+ num +'@2x.png';
		//document['execCommand']('InsertImage',false, imgTemp);
		var iptImage = Publisher.editorInput.find('img:not(.emoj-insert)');
		/*console.log(iptImage.attr('src'))
		if(!isWebkit){
			$(imgTemp).insertBefore(iptImage);
		}else{
			$(imgTemp).clone().insertAfter(iptImage);
		}
		iptImage.remove();*/
		Publisher.inserCurosrHtml(imgTemp, emoj.attr('data-key'));
		Emotion.hideEmotion();
		Publisher.submitBtn.removeClass('btn-disabled');
	}
};



