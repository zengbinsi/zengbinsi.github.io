noticeSwitch={
	init:function(){
		var T=this;
		window.noticeIsClose=localStorageInstance("noticeisclose")?Boolean(localStorageInstance("noticeisclose")):false;
		window.noticeAudioIsClose=localStorageInstance("noticeaudioisclose")?Boolean(localStorageInstance("noticeaudioisclose")):false;
		this.box=$(".aside_nav_bar .btool");
		this.setBox=this.box.find(".setbox");
		this.box.find(".btn_settings").bind("click",function(e){
			if(T.setBox.is(":hidden")){
				T.setBox.show();
				bindObjOutsiteClick(T.setBox);
			}else{
				T.setBox.hide();
				unbindObjOutsiteClick(T.setBox);
			}
			e.preventDefault();
		});
		if(window.noticeIsClose){
			this.setBox.find(".desk").addClass("off").text("打开桌面通知");
		}
		if(window.noticeAudioIsClose){
			this.setBox.find(".audio").addClass("off").text("打开声音提醒");
		}
		this.setBox.find(".desk").bind("click",function(e){
			if(window.noticeIsClose){
				window.noticeIsClose=false;
				$(this).removeClass("off").text("关闭桌面通知");
			}else{
				window.noticeIsClose=true;
				$(this).addClass("off").text("打开桌面通知");
			}
			localStorageInstance("noticeisclose",window.noticeIsClose);
			e.preventDefault();
		});
		this.setBox.find(".audio").bind("click",function(e){
			if(window.noticeAudioIsClose){
				window.noticeAudioIsClose=false;
				$(this).removeClass("off").text("关闭声音提醒");
			}else{
				window.noticeAudioIsClose=true;
				$(this).addClass("off").text("打开声音提醒");
			}
			localStorageInstance("noticeaudioisclose",window.noticeAudioIsClose);
			e.preventDefault();
		});
	}
}
$(function(){
	noticeSwitch.init();
})
pageTitleStatus={
	status:null,
	ani:null,
	aniTime:500,
	set:function(num){
		var T=this;
		var faviconUrl = 'data:image/ico;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAABILAAASCwAAAAAAAAAAAAC6wk3/usJN/7rCTf+6wk3/usFN/7nBS/+6wEz/usFL/7rAS/+5wU3/u8JP/7vBTf+6wk3/usJN/7rCTf+6wk3/u8JP/7vCT/+7wk//u8JP/7vDUP+8xFP/u8JR/7zCT/+8wlD/usFM/7e/Rf+8wk7/u8JP/7vCT/+7wk//u8JP/7rCTv+6wk7/u8JQ/7a+Q//S143/9/ju//f57v/6+vX/+fv1//Dy3v/R1Yz/usBK/7rCTv+6wk7/usJO/7rCTv+7w07/u8NO/7zEUf+2v0H/19uZ///////o6sX/3eGl/+Hksv/29+v//////9XZk/+4wEX/vMRQ/7vDTv+7w07/vcRP/73ET/++xVL/uMBD/9bblv//////y9B5/7K7Nv+4vkH/wshf//n68//z9eP/vcRR/73ETv+9xE//vcRP/7zET/+8xE//vcVS/7jAQ//X25b//////9DVhv+7wkr/vsZT/7rARf/t79X//Pz3/7/GVv+7w03/vcRQ/7zET/++xE//vsRP/7/FUv+6wUP/19uX///////P1IL/ucFE/7zDTf/N0nv//////+3w0v+9xE3/vsVQ/77FUP++xE//vsVQ/77FUP+/xlP/usFE/9jcmf//////9PXk/+/x2f/x8t7//P36//T15P/Kz3D/vMNK/7/GUv++xVD/vsVQ/77GUf++xlH/v8dU/7rCRf/Y3Zj///////T25P/v8dj/+Pnu//3+/f/T2Iz/usJE/7/HU/++xlH/vsZR/77GUf+/x1H/v8dR/8DIVP+7xET/2N2Y///////Q1oT/u8NG/8HHVf/s7cr//f79/8jOaf+9xkz/v8hS/7/HUf+/x1H/wMlQ/8DJUP/ByVP/u8VE/9nel///////0deE/77GSf+7w0H/0daE///////Y3Zj/u8VE/8HJU//AyVD/wMlQ/8DIU//AyFP/wclW/7zER//Z3Zf//////9LYhv+/xkr/xMpa/+frwf//////1dqQ/7zFSP/ByVb/wMhT/8DIU//ByVL/wclS/8HKVf+8xUb/3OCf///////8/Pf/+frz//39+///////7vDT/8LKV//AyVH/wclT/8HJUv/ByVL/wclT/8HJU//BylT/v8hN/87Udv/i5a7/4eWr/+Hlr//i5a3/2dyT/8TKVv/ByE//wcpU/8HJU//ByVP/wclT/8HKVP/BylT/wcpT/8LKVP/Ax03/vMVF/73FRf+9xUT/vcVE/7/HR//CyVP/wspU/8HKU//CylT/wcpU/8HKVP/Cy1P/wstT/8LLU//Cy1P/xcpV/8TMV//Fy1f/xMxW/8TLV//Ey1b/wspU/8PLU//Cy1P/wstT/8LLU//Cy1P/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
		faviconUrlNew = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAC6wk3/usJN/7rCTf+6wk3/usFN/7nBS/+6wEz/usFL/7rAS/+5wU3/u8JP/7vBTf+6wk3/usJN/7rCTf+6wk3/u8JP/7vCT/+7wk//u8JP/7vDUP+8xFP/u8JR/7zCT/+8wlD/usFM/7e/Rf+8wk7/u8JP/7vCT/+7wk//u8JP/7rCTv+6wk7/u8JQ/7a+Q//S143/9/ju//f57v/6+vX/+fv1//Dy3v/R1Yz/usBK/7rCTv+6wk7/usJO/7rCTv+7w07/u8NO/7zEUf+2v0H/19uZ///////o6sX/3eGl/+Hksv/29+v//////9XZk/+4wEX/vMRQ/7vDTv+7w07/vcRP/73ET/++xVL/uMBD/9bblv//////y9B5/7K7Nv+4vkH/wshf//n68//z9eP/vcRR/73ETv+9xE//vcRP/7zET/+8xE//vcVS/7jAQ//X25b//////9DVhv+7wkr/vsZT/7rARf/t79X//Pz3/7/GVv+7w03/vcRQ/7zET/++xE//vsRP/7/FUv+6wUP/19uX///////P1IL/ucFE/7zDTf/N0nv//////+3w0v+9xE3/vsVQ/77FUP++xE//vsVQ/77FUP+/xlP/usFE/9jcmf//////9PXk/+/x2f/x8t7//P36//T15P/Kz3D/vMNK/7/GUv++xVD/vsVQ/77GUf++xlH/v8dU/7rCRf/Y3Zj///////T25P/v8dj/+Pnu//3+/f/T2Iz/usJE/7/HU/++xlH/vsZR/77GUf+/x1H/v8dR/8DIVP+7xET/2N2Y///////Q1oT/u8NG/8HHVf/s7cr//f79/8jOaf+9xkz/v8hS/7/HUf+/x1H/wMlQ/8DJUP/ByVP/u8VE/9nel///////0deE/77GSf+7w0H/0daE///////Y3Zj/u8VE/8HJU//AyVD/wMlQ/8DIU//AyFP/wclW/7zER//Z3Zf//////9LYhv+/xkr/xMpa/+frwf//////vMGb/zI3w/8IDOn/MzjG/6mwZv/ByVL/wclS/8HKVf+8xUb/3OCf///////8/Pf/+frz//39+///////7vDT/zQ4x/8AA/D/AAPw/wAD8P8wNcj/wclT/8HJU//BylT/v8hN/87Udv/i5a7/4eWr/+Hlr//i5a3/2dyT/8TKVv8JDOj/AAPw/wAD8P8AA/D/BQjs/8HKVP/BylT/wcpT/8LKVP/Ax03/vMVF/73FRf+9xUT/vcVE/7/HR//CyVP/NDjG/wAD8P8AA/D/AAPw/zA1yf/Cy1P/wstT/8LLU//Cy1P/xcpV/8TMV//Fy1f/xMxW/8TLV//Ey1b/wspU/6yzZf80Ocb/CQzp/zQ5xv+rs2X/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
		if (isIE) {
			faviconUrl = _PAGE.assetUrl+'images/1.5/favicon.ico';
			faviconUrlNew = _PAGE.assetUrl+'images/1.5/favicon1.ico';
		}
		if(!this.favicon){
			if($("#favicon").length){
				this.favicon=$("#favicon");
			}else{
				this.favicon=$('<link rel="icon" id="favicon" type="image/x-icon">').attr("href",faviconUrl).appendTo("html>head");
			}
		}
		//this.status=status;
		this.text="";
		if(num){
			this.text="("+num+")";
			document.title="BOSS直聘"+this.text;
			if(!this.ani){
				var curBool=true;
				this.ani=setInterval(function(){
					T.favicon.attr("href",curBool?faviconUrl:faviconUrlNew);
					curBool=!curBool;
				},this.aniTime);
			}
		}else{
			if(this.ani){
				clearInterval(this.ani);
				this.ani=null;
			}
			T.favicon.attr("href",faviconUrl);
			document.title="BOSS直聘";
		}
	},
	clear:function(){
		if(this.status){
			this.status=null;
		}
		if(this.ani){
			clearInterval(this.ani);
		}
		
	}
}
//桌面通知
chatNotification={
	data:{},
	dataArray:[],
	dataHistory:[],
	show:function(title,img, message) {
		if(_PAGE.debug&&this.num){
			return;
		}
		this.num=true;
		if(window.noticeIsClose||window.isFocus){
			return;
		}
		if(!window.isIE&&!window.noticeAudioIsClose&&!this.audio){
			this.audio=document.createElement("audio");
			this.audio.src="https://img.bosszhipin.com/audio/message.mp3";
			this.audio.preload="auto";
			this.audio.load();
		}
		var T=this;
		this.Notification = window.Notification || window.mozNotification || window.webkitNotification;  
		if(this.Notification) {//支持桌面通知  
			if(this.Notification.permission == "granted") {//已经允许通知  
				T.handler(title,img,message);
			}else {//第一次询问或已经禁止通知(如果用户之前已经禁止显示通知，那么浏览器不会再次询问用户的意见，Notification.requestPermission()方法无效)  
				this.Notification.requestPermission(function(status) {  
					if (status === "granted") {//用户允许  
						T.handler(title,img,message);
					}else {//用户禁止  
						return false  
					}  
				});  
			}
		}else {//不支持(IE等)  
		   
		} 
	},
	handler:function(title,img,message){
		var T=this;
		var msg=this.formatMessage(message);
		if(!msg){
			return;
		}
		if(!window.noticeAudioIsClose){
			this.audio.play();
		}
		/*if(T.dataArray.length>3){
			this.dataHistory.push({title:title,img:img,message:message});
			return;
		}*/
		var instance = new this.Notification(title, {  
			body: this.formatText(msg),  
			icon: img,
			tag: 'replace',
			renotify: true
		});
		this.data[message.mid]=instance;
		this.dataArray.push(message.mid);
		instance.onclick = function() {
			if(message.isSelf){
				var uid=message.to.uid;
			}else{
				var uid=message.from.uid;
			}
			Chat.toggleUser({
				uid: uid
			});
			//T.chatRander.toggleUser(uid);
			instance.close();
			window.focus();
		};
		instance.onerror = function() {  
			//console.log('onerror');  
		};
		instance.onshow = function() {
			setTimeout(function(){
				instance.close();
			},5000);
		};
		instance.onclose = function() {
			delete T.data[message.mid];
			for(var i=0;i<T.dataArray.length;i++){
				if(T.dataArray[i]==message.mid){
					T.dataArray.splice(i,1);
				}
			}
			/*if(T.dataHistory.length){
				var newData=T.dataHistory[0];
				T.dataHistory.splice(0,1);
				T.handler(newData.title,newData.img,newData.message);
			}*/
		};
	},
	messageTypes:{
		text:{//文字消息
			types:[1,1,1],
			result:function(message){
				if(message.isSelf){
					return null;
				}
				return message.body.text;
			}
		},
		voice:{//语音消息
			types:[1,2],
			result:function(message){
				if(message.isSelf){
					return null;
				}
				return "[收到语音消息，请登录APP端查收]";
			}
		},
		image:{//图片消息
			types:[1,3],
			result:function(message){
				if(message.isSelf){
					return null;
				}
				return "[收到图片消息，请登录APP端查收]";
			}
		},
		redEnvelope:{//发出红包
			types:[3,10],
			result:function(message){
				if(message.isSelf){
					//return "[发出一个红包，请登录APP查看]";
				}else{
					return "[收到红包消息，请登录APP端查收]";
				}
			}
		},
		getSystemText:{//通知消息 发出文字消息类型不显示
			types:[3,1,1],
			result:function(message){
				if(message.isSelf){
					return null;
				}else{
					return message.body.text;
				}
			}
		},
		getSystemMessage:{//通知消息 (不能分收到与发出，但根据使用情景，主动发出时窗口应在可视情况，遂不会弹出消息框)
			types:[3,1],
			result:function(message){
				return message.body.text;
			}
		},
		interview:{
			types:[1,7,4],
			result:function(message){
				return null;
			}
		},
		dialogMessage:{//交换联系方式  面试邀请
			types:[1,7,0],
			result:function(message){
				if(message.body.dialog.title&&message.body.dialog.title.indexOf("面试邀请")>-1){
					//return "[发出面试邀请，请登录APP查看]";
					return null;
				}else{
					if(message.isSelf){
						return null;
					}
					return message.body.dialog.text;
				}
			}
		},
		dialogWeixin:{//交换微信
			types:[1,7,1],
			result:function(message){
				if(message.isSelf){
					return null;

				}
				return message.body.dialog.text;
			}
		},
		dialogResume:{//发送简历
			types:[1,7,2],
			result:function(message){
				if(message.isSelf){
					return null;
				}
				return message.body.dialog.text;
			}
		},
		agreeInterview:{
			types:[3,4,47],
			result:function(message){
				return message.from.name+"接受了您的面试邀请。";
			}
		}
	},
	formatMessage:function(message){
		var T=this;
		var result=null;
		for(var key in this.messageTypes){
			var type=this.messageTypes[key];
			var types=type.types;
			if(types[0]==message.type&&types[1]==message.body.type){
				if(types[0]==1&&types[1]==7){//对话框
					if(types[2]==message.body.dialog.type){
						return type.result.call(T,message);
					}
				}else if(types[0]==3&&types[1]==4){//对话框
					if(types[2]==message.body.action.aid){
						return type.result.call(T,message);
					}
				}else if(types.length==3){//templateId
					if(types[2]==message.body.templateId){
						return type.result.call(T,message);
					}
				}else{
					return type.result.call(T,message);
				}
			}
		}
		return null;
	},
	formatText:function(text){
		text=text.replace(/\[[a-zA-Z\u4e00-\u9fa5]{1,3}\]/g,"[表情]");
		if(text.match(/./g).length>18){
			text=text.substring(0,18)+"...";
		}
		return text;
	}
}
