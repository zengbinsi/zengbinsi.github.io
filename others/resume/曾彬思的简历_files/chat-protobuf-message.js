function ProtobufMessage(){
	this.init();
}
var Proto = ProtobufMessage.prototype;

Proto.init=function() {
	if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
		throw(new Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions."));
	}
	// 创建ProtoBuf
	var ProtoBuf = dcodeIO.ProtoBuf;
	Proto.chatProto = ProtoBuf.loadProtoFile(INTERFACE_URLS.chatProtoUrl);
	Proto.createMessage.init();
}

Proto.decode = function(bytes){
	return Proto.createMessage.build.chatProtocol.decode(bytes);
}

Proto.createMessage={
	init: function(){
		this.build = {
			chatProtocol: Proto.chatProto.build("TechwolfChatProtocol"),
			message: Proto.chatProto.build("TechwolfMessage"),
			messageSync: Proto.chatProto.build("TechwolfMessage"),
			messageRead: Proto.chatProto.build("TechwolfMessageRead"),
			presence: Proto.chatProto.build("TechwolfPresence"),
			user: Proto.chatProto.build("TechwolfUser"),
			body: Proto.chatProto.build("TechwolfMessageBody"),
			clientInfo: Proto.chatProto.build("TechwolfClientInfo")
		};
	},
	model: {
		chatProtocol: function(type){
			var chatProtocol = new Proto.createMessage.build.chatProtocol();
			chatProtocol.setType(type);
			return chatProtocol;
		},
		message: function(type, cmid, from, to, body){
			var message = new Proto.createMessage.build.message();
			message.setType(type);
			message.setMid(cmid, true);
			message.setCmid(cmid, true);
			message.setFrom(from);
			message.setTo(to);
			message.setBody(body);
			return message;
		},
		messageSync: function(clientMid, serverMid){
			var messageSync = new Proto.createMessage.build.messageSync();
			messageSync.setClientMid(clientMid, true);
			messageSync.setServerMid(serverMid, true);
			return messageSync;
		},
		messageRead: function(userId, messageId){
			var messageRead = new Proto.createMessage.build.messageRead();
			messageRead.setUserId(userId, true);
			messageRead.setMessageId(messageId, true);
			messageRead.setReadTime(new Date().getTime(), true);
			return messageRead;
		},
		presence:function(opts){
			var presence = new Proto.createMessage.build.presence();
			var clientInfo = new Proto.createMessage.build.clientInfo(),
				clientObj = opts.clientInfo;
			presence.setUid(_PAGE.uid, true);
			presence.setType(opts.type);
			presence.setLastMessageId(opts.lastMessageId, true);
			
			clientInfo.setVersion(clientObj.version);
			clientInfo.setSystem(clientObj.system);
			clientInfo.setSystemVersion(clientObj.systemVersion);
			clientInfo.setModel(clientObj.model);
			clientInfo.setUniqid(clientObj.uniqid);
			clientInfo.setNetwork(clientObj.network);
			clientInfo.setAppid(clientObj.appid);
			clientInfo.setPlatform(clientObj.platform);
			clientInfo.setChannel(clientObj.channel);
			clientInfo.setSsid(clientObj.ssid);
			clientInfo.setBssid(clientObj.bssid);
			clientInfo.setLongitude(clientObj.longitude);
			clientInfo.setLatitude(clientObj.latitude);
			
			presence.setClientInfo(clientInfo, true);
			return presence;
		},
		user: function(uid){
			var user = new Proto.createMessage.build.user();
			user.setUid(0, true);
			if(uid){
				user.setName(Chat.curUserData.encryptUid);//发送时的name是加密uid后的encryptUid
			}
			return user;
		},
		body:function(type, templateId){
			var body = new Proto.createMessage.build.body();
			body.setType(type);
			body.setTemplateId(templateId);
			return body;
		}
	},
	text:function(opts){
		var model = this.model,
			from = model.user(),
			to = model.user(opts.to.uid),
			body = model.body(1, 1);
		body.setText(opts.body.text);
		var message = model.message(1, opts.tempID, from, to, body),
			chatProtocol = model.chatProtocol(1);
		chatProtocol.setMessages([message]); 
		return chatProtocol;
	},
	sync:function(opts){
		var model = this.model,
			messageSync = model.messageSync(opts.clientMid, opts.serverMid),
			chatProtocol = model.chatProtocol(5);
		chatProtocol.setMessageSync([messageSync]); 
		return chatProtocol;
	},
	read:function(opts){
		var model = this.model,
			messageRead = model.messageRead(opts.uid, opts.mid),
			chatProtocol = model.chatProtocol(6);
		chatProtocol.setMessageRead([messageRead]); 
		return chatProtocol;
	},
	presence:function(opts){
		var model = this.model,
			presence = model.presence(opts),
			chatProtocol = model.chatProtocol(2);
		chatProtocol.setPresence(presence); 
		return chatProtocol;
	}
}