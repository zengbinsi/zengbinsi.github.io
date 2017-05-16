var Search = {
	init: function() {
		Search.searchBox = $('.search-box');
		Search.isLoading = false;
		
		Search.searchBox.find('.city-sel').on('click', function(e) {
			if ($(e.target).closest('.city-box').length) {
				if ($(e.target).attr('data-val')) {
					$(this).find('.label-text b').attr('data-val', $(e.target).attr('data-val')).text($(e.target).text());
					//Search.para.city = $(e.target).attr('data-val');
					Search.searchBox.removeClass('show-city');
				}
				return;
			}
			Search.searchBox.toggleClass('show-city');
		})
		Search.searchBox.find('.dorpdown-province li').on('mouseover', function() {
			var idx = $(this).index(),
				elsTab = $(this).parent().find('li'),
				elsCon = Search.searchBox.find('.dorpdown-city ul');
			elsTab.removeClass('cur');
			$(this).addClass('cur');
			elsCon.removeClass('show');
			elsCon.eq(idx).addClass('show');
		})
		Search.searchBox.find('.dorpdown-city li').on('click', function() {
			var elSel = Search.searchBox.find('.city-sel').find('.label-text b'),
				elCode = Search.searchBox.find('.city-code'),
				elName = Search.searchBox.find('.city-name');
			elSel.text($(this).text());
			elCode.val($(this).attr('data-val'));
			elName.val($(this).text());
		})
		Search.searchBox.find('form').on('submit', function(e) {
			var elForm = $(this),
				elText = elForm.find('.ipt-search');
			if (elText.val() == '搜索职位、公司') {
				elText.val('');
			}
		})
		
		$(document).on('click', function(e) {
			if (!$(e.target).closest('.city-sel').length && !$(e.target).closest('.dorpdown-province').length) {
				Search.searchBox.removeClass('show-city');
			}
			if (!$(e.target).closest('.suggest-result').length) {
				Search.searchBox.find('.suggest-result').hide();
			}
		})
		
		/*搜索输入*/
		Search.searchBox.find('.ipt-search').on('change paste keyup', function(e) {
			if(e.which != 13 && e.which != 27 && e.which != 38 && e.which != 40){
				if (Search.suggestTimer) clearTimeout(Search.suggestTimer);
				var _self = $(this);
				Search.suggestTimer = setTimeout(function() {
					Search.suggest(_self);
				},200)
			}
		})
		/*搜索选中,填入输入框*/
		Search.searchBox.find('.suggest-result').on('click', 'li', function() {
			Search.addInput($(this));
		})
		
		var currentSelection = -1,
			currentProposals = [];
		Search.searchBox.find('.ipt-search').keydown(function(e) {
			var els = Search.searchBox.find('.suggest-result li');
			switch(e.which) {
				case 38: // Up arrow
					els.removeClass('selected');
					if (currentSelection == -1) {
						currentSelection = -1;
						currentSelection = els.length - 1;
					} else {
						currentSelection--;
					}
					els.eq(currentSelection).addClass('selected');
					Search.addInput(els.eq(currentSelection), true);
					Search.scrollVisiable(els.eq(currentSelection));					
				break;
				case 40: // Down arrow
					e.preventDefault();
					els.removeClass('selected');
					if (currentSelection > els.length - 2) {
						currentSelection = -1;
					}
					currentSelection++;
					els.eq(currentSelection).addClass('selected');
					Search.addInput(els.eq(currentSelection), true);
					Search.scrollVisiable(els.eq(currentSelection));
				break;
				case 13: // Enter
					currentSelection = -1;
					break;
				case 27: // Esc button
					currentSelection = -1;
					//proposalList.empty();
					Search.searchBox.find('.ipt-search').val('');
					break;
			}
		});
			
		/*搜索结果点击上报*/
		if (Search.searchBox.length) {//聊天用户列表也用到了.job-list（无语），所以加个条件判断下
			$('.job-list li a').on('click', function() {
				var el = $(this),
					elCon = el.closest('.job-list');
				$.ajax({
					type: 'POST',
					url: '/actionLog/search.json',
					dataType:'JSON',
					data: {
						keyword: elCon.attr('data-keyword'),
						l3code: elCon.attr('data-l3code'),
						filter: elCon.attr('data-filter'),
						rescount: elCon.attr('data-rescount'),
						page: elCon.attr('data-page'),
						index: el.attr('data-index'),
						lid: el.attr('data-lid'),
						itemid: el.attr('data-itemid'),
						jobid: el.attr('data-jobid'),
						source: elCon.attr('data-source')
					}
				});
			})
		}
	},
	/*搜索建议*/
	suggest: function(el) {
		var el = el,
			keyword = el.val().replace(/(^\s*)|(\s*$)/g, ''),
			suggestCon = el.closest('.search-box').find('.suggest-result'),
			resultCon = suggestCon.find('ul');
		if (keyword == '') {
			suggestCon.hide();
			return;
		}
		$.ajax({
			type: 'GET',
			url: '/autocomplete/query.json',
			dataType:'JSON',
			cache: false,
			data: {
				query: keyword
			},
			success: function(result) {
				var result = result,
					str = '',
					list,
					i;
				if (result.data && result.data.length) {
					list = result.data;
					for (i = 0; i < list.length; i++) {
						str += '<li>'+ list[i].hlname +'</li>';
					}
					resultCon.html(str);
					suggestCon.show();
				} else {
					resultCon.html('<li class="blank-data">暂无匹配结果</li>');
				}
				Search.isLoading = false;
			},
			error: function(result) {
				Search.isLoading = false;
			}
		});
	},
	/*关键词高亮*/
	hightLight:function(str, keyword){
		var keyword = keyword.replace(/(^\s*)|(\s*$)/g, '');//删除前后空格
		if (keyword == '') {
			return str;
		}
		var tempKeyword = keyword;
		return str.replace(keyword.toLowerCase(),'<em class="text-blue">'+tempKeyword+'</em>').replace(keyword.toUpperCase(),'<em class="text-blue">'+tempKeyword+'</em>');//替换全部匹配到的字符串
	},
	/*先将选中的值填入输入框*/
	addInput: function(el, isUpDown) {
		var el = el,
			name = el.text().replace('<u class="h">','').replace('</u>','');
		//Search.searchBox.find('.suggest-result').find('li').removeClass('cur');
		//el.addClass('cur');
		Search.searchBox.find('.ipt-search').val(name);
		if (!isUpDown) {
			Search.searchBox.find('.suggest-result').hide();
			Search.searchBox.find('form').submit();
		}
		
	},
	/*搜索建议按方向键时滚动到可视区域*/
	scrollVisiable: function(el) {
		var el = el,
			suggestCon = Search.searchBox.find('.suggest-result ul');
		suggestCon.scrollTop(el.position().top);
	}
};