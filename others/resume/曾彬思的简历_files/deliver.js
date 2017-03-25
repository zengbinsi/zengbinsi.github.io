var Deliver = {
		init:function(){
			if ($('.deliver-list').length == 0) return;
			Deliver.isLoading = false;
			Deliver.type = 'list';
			Deliver.listContainer = $('.job-box')
			Deliver.listWrap = Deliver.listContainer.find('.deliver-list');
			Deliver.tipsContainer = Deliver.listWrap.find('.data-tips');
			Deliver.listCon = Deliver.listWrap.find('ul');
			Deliver.listMoreEl = Deliver.listWrap.find('.loadmore');
			/*标记页码*/
			Deliver.para = {
				'page':0
			};
			Deliver.getData(1, true);
			/*var listMore = Deliver.listMoreEl.get(0);
			$(window).on('scroll', function() {
				if (Deliver.timer) clearTimeout(Deliver.timer);
				if (Deliver.listMoreEl.hasClass('disabled')) return;
				Deliver.timer = setTimeout(function() {
					if (!Deliver.isLoading && isVisiable(listMore) && !Deliver.listMoreEl.hasClass('disabled')) {
						Deliver.getData();
					}
				},100)
				
			});*/
			Deliver.listMoreEl.on('click', function() {
				if (!Deliver.isLoading && !Deliver.listMoreEl.hasClass('disabled')) {
					Deliver.getData();
				}
			})
			Deliver.listCon.on('click', '.btn', function(e) {
				var el = $(this);
				Detail.startChat(el);
				e.preventDefault();
			})
		},
		getData: function(init, side) {
			if (init) {
				Deliver.para.page = 0;
				Deliver.listCon.html('');
				//Deliver.tipsContainer.html('<div class="spinner spinner-circle"><div class="loader"></div><span>正在加载数据...</span></div>').show();
				Deliver.listWrap.find('.user-list').hide();
				Deliver.listWrap.find('.detail-box').hide();
			}
			
			Deliver.para.page ++;
			
			Deliver.isLoading = true;
			if (Deliver.para.page > 1) {
				Deliver.listMoreEl.addClass('disabled');
				Deliver.listMoreEl.text('正在加载中...');
			}
			$.ajax({
				type: 'GET',
				url: '/geek/deliveryinfo.json',
				dataType:'JSON',
				cache:false,
				data: Deliver.para,
				success: function(result) {
					var result = result,
						listStr = '',
						previewStr = '';
					if (result.rescode == 1) {
						if (result.hasMore == true) {
							Deliver.listMoreEl.removeClass('disabled').text('加载更多').show();
						} else if (Deliver.para.page > 1) {
							Deliver.listMoreEl.addClass('disabled').text('没有更多了').show();
						}
						if (result.html == '') {
							if (init) {
								Deliver.tipsContainer.html('<div class="data-blank"><i class="tip-nodata"></i><b>没有相关数据</b></div>').show();
							}
						} else {
							listStr += result.html;
							Deliver.listCon.append(listStr);
							Deliver.tipsContainer.html('').hide();
						}
						/*初次加载时如果条数小于15就不显示more，需要等页条数确定后再打开*/
						if (init && Deliver.listCon.find('li').length < 10) {
						 	Deliver.listMoreEl.text('没有更多了').addClass('disabled').hide();
						}
					}
					Deliver.isLoading = false;
				},
				error: function(result) {
					if (Deliver.para.page > 1) {
						Deliver.listMoreEl.removeClass('disabled').text('数据加载出错').show();
					}
					Deliver.isLoading = false;
					if (init) {
						Deliver.listMoreEl.hide();
						Deliver.tipsContainer.html('<div class="data-blank"><i class="tip-errordata"></i><b>数据加载出错</b></div>').show();
					}
				}
			});
		}
	}
