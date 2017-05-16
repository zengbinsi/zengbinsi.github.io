(function (win) {
  win.upp = function (url) {
    this._url = url;
    this._init();
  };
  upp.prototype = {
    _init: function () {
      var addressPair = this._url.split('?'),
        i = 0,
        keypairs = [];
      this.host = addressPair[0];
      this._params = {};
      if (addressPair.length > 1) {
        keypairs = addressPair[1].split('&');
        for (; i < keypairs.length ; i++) {
          var keypair = keypairs[i].split('=');
          this.add(keypair[0], keypair[1]);
        }
      }
    },
    add: function (_key, _value) {
      this._params[_key] = _value;
      return this;
    },
    remove: function (key) {
      delete this._params[key];
      return this;
    },
    contains: function (key, value) {
      return this._params[key] !== undefined;
    },
    update: function (key, value) {
      this._params[key] = value;
    },
    get: function (key) {
      return this._params[key];
    },
    all: function () {
      return this._params;
    },
    url: function () {
      var queryStrings = [];
      for (var key in this._params) {
        queryStrings.push(key + '=' + this._params[key]);
      }
      return this.host + (queryStrings.length > 0 ? '?' : '') + queryStrings.join('&');
    }
  };
})(window);
(function(){
  if(window._T){
    var _body = document.getElementsByTagName('body')[0],
      addEvent = function( obj, type, fn ) {
        if (obj.addEventListener)
          obj.addEventListener( type, fn, false );
        else if (obj.attachEvent) {
          //保存指针 供removeEvent时使用
          obj["e"+type+fn] = fn;
          obj.attachEvent( "on"+type, function() {
            obj["e"+type+fn].call(obj, window.event);
          } );
        }
      };
    if(_body){
      addEvent(_body, 'click', function(e){
        var target = e.target || e.srcElement;
		 while(target !== document && target !== document.body && !target.getAttribute('ka') && target.parentNode){
			  target = target.parentNode;
			}
		  var k = target.getAttribute('ka');
        if(k){
          var p =  target.getAttribute('href')||'';
          if(p && p.indexOf('#') !== 0 && p.indexOf('javascript:;') === -1 && !target.getAttribute('noa')){
            var u = new window.upp(p);
			//加白名单判断--start
			var whiteLlist = [ "bosszhipin.com", "kanzhun.com", "weizhipin.com" ];
			var len = whiteLlist.length;
			var flag = false;
			if (p.indexOf("http://") >= 0 || p.indexOf("https://") >= 0) {
				for (var i = 0; i < len; i++) {
					if (p.indexOf(whiteLlist[i]) >= 0) {
						flag = true;
						break;
					}
				}
			} else {
				flag = true;
			}
			if (flag) {
				u.add('ka', encodeURIComponent(k));
				if(!target.getAttribute('xieyi')==""){
					 target.setAttribute('href', u.url()+"#"+target.getAttribute('xieyi'));
				}
				else
				{
				
					  target.setAttribute('href', u.url());
				}
			}
			
          }
          _T.sendEvent(k, p);
        }
      });
    }
  }
  if(typeof $ !="undefined"){
	  $("[iska]").each(function(index, element) {
		var T=$(this);
		 T.click(function(e){
		   $("<i ka="+T.attr("ka")+" style='display:none'></i>").appendTo("body").click().delay(200).remove();
		   e.stopPropagation()
		 })
	  });
   }
})();