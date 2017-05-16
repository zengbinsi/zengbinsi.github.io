/**
	FormsUI 表单元素控件
	模拟select 模拟性别选择，日期选择
**/

var FormsUI = {
	/**
		自己控制初始化时机，FormsUI.int()。对于动态添加的dom元素，可以指定formEl参数，避免重复绑定并可以提供查找速度
	**/
	init: function(form) {
		var formEl = form || $(document);
		this.dropSelect(formEl);
		this.prettyRadio(formEl);
		
		//日历初始化
		if (formEl.find('.ipt-datetimepicker').length){
			var nowDate = new Date();
				nowYear = nowDate.getFullYear();
				nowMonth = nowDate.getMonth()+1;
				nowThisDate = nowDate.getDate();
			formEl.find('.ipt-datetimepicker').each(function(i) {
				var el = $(this),
					format = el.attr('data-format') || 'yyyy-mm-dd',
					isRange = el.hasClass('date-range'),
					rangeToday = el.attr('data-today'),
					type = el.attr('data-type'),
					startView = 2, //默认显示日期面板
					minView = 2;//默认是选择日期
				// 按照先选择年再选择月再选择日的方式显示
				if (type && type == 'y-m-d' || type == 'y-m') {
					startView = 4;
				}
				if (format == 'yyyy-mm') {
					minView = 3;//只选择年月，不选择日期
				}
				el.datetimepicker({
					format: format,
					startView: startView, //首先打开的视图    1:秒 2:日 3:月 4:年
					minView: minView,   //日期时间选择器所能够提供的最精确的时间选择视图       0:时分 1:时 2:日 3:月 4:年
					autoclose: 1,//选择完毕关闭窗口
					weekStart:1,//周日期从周一开始
					todayHighlight: true,
					//startDate: false,
					endDate: nowYear +'-'+nowMonth+'-'+nowThisDate,//设定以现在日期为结束日期，之后的将被禁用
					todayBtn: (rangeToday ? 1 : 0)	//显示今日按钮
				}).on('changeDate', function(e){
					if (rangeToday) {
						var startIpt = el.closest('.form-row').find('.date-range').eq(0);
						if (new Date(e.date) < new Date(startIpt.val())) {
							alert('结束时间不能小于开始时间')
							return false;
						}
					} else if (isRange && el.attr('name') == 'startDate') {
						var endIpt = el.closest('.form-row').find('.date-range').eq(1);
						
						if (new Date(e.date).getFullYear() == new Date().getFullYear() && new Date(e.date).getMonth() == new Date().getMonth()) {
							endIpt.parent().addClass('show-prefix-today');
							endIpt.parent().find('input[name="now"]').val('1');
							endIpt.removeClass('required');
						} else {
							endIpt.parent().removeClass('show-prefix-today');
							endIpt.parent().find('input[name="now"]').val('');
							endIpt.addClass('required');
						}
						
						endIpt.val(el.val());
						endIpt.datetimepicker('setStartDate', el.val());
						
					}
					if (isRange && el.attr('name') == 'endDate') {
						if (new Date(e.date).getFullYear() == new Date().getFullYear() && new Date(e.date).getMonth() == new Date().getMonth()) {
							el.parent().addClass('show-prefix-today');
							el.parent().find('input[name="now"]').val('1');
							el.removeClass('required');
						} else {
							el.parent().removeClass('show-prefix-today');
							el.parent().find('input[name="now"]').val('');
							el.addClass('required');
						}
					}
					
				});
				
				if (el.attr('name') == 'birthday') {
					el.datetimepicker('setStartDate','1966-01');
					el.datetimepicker('setEndDate','2000-12');
				}
				if (isRange && el.attr('name') == 'startDate') {
					el.datetimepicker('setStartDate','1996-01');
				}
				if (isRange && el.attr('name') == 'endDate') {
					if (el.val() == '' && el.closest('.form-row').find('.date-range').eq(0).val() == '') {
						el.datetimepicker('setStartDate','1996-01');
					} else {
						el.datetimepicker('setStartDate', el.closest('.form-row').find('.date-range').eq(0).val());
					}
					
				}
				/*el.on('click', function() {
					if ($('.datetimepicker').eq(i).is(':visible')) {
						$('.datetimepicker').eq(i).hide();
					} else {
						$('.datetimepicker').eq(i).show();
					}
				});*/
			})
		}
		
		/*薪资要求范围*/
		formEl.find('.start-salary').on('click', 'li', function() {
			FormsUI.changeSalary($(this).attr('data-val'));
		})
		
		/*技能标签*/
		//formEl.find('.ipt-tags').tagsInput();
		
		/*期望的行业选择*/
		formEl.find('.select-industry .industry-cells').on('click', 'span', function() {
			var itemCon = $(this).closest('dd');
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				itemCon.find('.select-industry .industry-title h3').removeClass('red');
				itemCon.find('.select-industry .industry-title p.gray').removeClass('red').text('最多可选 3 个技能标签');
			} else {
				if (itemCon.find('.select-industry .industry-cells .selected').length > 2) {
					itemCon.find('.select-industry .industry-title h3').addClass('red');
					itemCon.find('.select-industry .industry-title p.gray').addClass('red').text('最多可选 3 个技能标签');
					return;
				}
				$(this).addClass('selected');
			}
		});
		formEl.find('.select-industry .industry-title').on('click', '.btn', function(e) {
			e.preventDefault();
			var itemCon = $(this).closest('dd'),
				tagIpt = itemCon.find('.industry-title .ipt'),
				isExits = false;
			if ($(this).text() == '确定') {
				var textArr = [],
					idArr = [];
				itemCon.find('.select-industry .industry-cells .selected').each(function() {
					textArr.push($(this).text());
					idArr.push($(this).attr('data-val') || $(this).text());
				});
				if (!textArr.length) {
					textArr.push('不限');
					idArr.push('0');
				}
				itemCon.find('.select-industry').closest('dd').find('.dropdown-select .ipt').val(textArr.join('·'));
				itemCon.find('.select-industry').closest('dd').find('.dropdown-select input[type="hidden"]').val(idArr.join('·'));
				itemCon.find('.select-industry').closest('dd').find('.dropdown-select').removeClass('dropdown-select-open');
				itemCon.find('.select-industry').closest('dd').find('.dropdown-menu').removeClass('dropdown-menu-open');
			} else if ($(this).text() == '取消') {
				itemCon.find('.select-industry').closest('dd').find('.dropdown-select').removeClass('dropdown-select-open');
				itemCon.find('.select-industry').closest('dd').find('.dropdown-menu').removeClass('dropdown-menu-open');
			} else if ($(this).hasClass('btn-addtag')) {
				var curLen = Validate.getLength(tagIpt.val()),
					tipText = itemCon.find('.select-industry .industry-title p.gray');
				if (tagIpt.val().replace(/(\s*$)/g,'') == '') {
					tipText.text('请输入标签名称').addClass('red');
					curIpt.val('');
					return;
				} else if (curLen > 6) {
					tipText.text('请输入不超过6个字的标签名称').addClass('red');
					return;
				}
				itemCon.find('.select-industry .industry-cells span').each(function() {
					if ($(this).text() == tagIpt.val()) {
						isExits = true;
						return;
					} else {
						isExits = false;
					}
				});
				if (!isExits) {
					
					itemCon.find('.industry-cells .blank-tag').remove();
					tipText.text('最多可选 3 个技能标签');
					if (itemCon.find('.select-industry .industry-cells .selected').length > 2) {
						tipText.addClass('red');
						return;
					} else {
						tipText.removeClass('red');
						itemCon.find('.industry-cells').prepend('<span class="selected">'+ tagIpt.val() +'</span>');
						tagIpt.val('');
					}
				} else {
					tipText.addClass('red').text('该标签已存在');
				}
				
			}
			
		})
		
		/*自动完成*/
		formEl.find('.ipt-autocomplete').on('input keyup', function() {
			var _self = $(this);
			if (FormsUI.suggestTimer) clearTimeout(FormsUI.suggestTimer);
			FormsUI.suggestTimer = setTimeout(function() {
				_self.parent().find('input[type="hidden"]').val('');
				FormsUI.getSuggest(_self);
			},200)
			
		})
		formEl.find('.suggest-complete').on('click', 'li', function() {
			FormsUI.setSuggest($(this));
		})
	},
	/**
		模拟单选，暂时只有方形的，给label加class="radio-square"
		<div class="radio-list"><label class="radio-square radio-checked">男</label><label class="radio-square">女</label><input type="hidden" name="gender" value="1"></div>
	**/
	prettyRadio: function(formEl) {
		var formEl = formEl || $(document);
		if (formEl) {
			formEl.find('.radio-list').each(function() {
				var _self = $(this),
					elKey = _self.find('input[type="hidden"]');
				_self.on('click', 'label', function() {
					_self.find('label').removeClass('radio-checked');
					$(this).addClass('radio-checked');
					elKey.val($(this).attr('data-val'));
				})
			})
		}
	},
	/**
		模拟下拉框，使用方法举例：
		<span class="dropdown-select"><i class="icon-select-arrow"></i><input type="text" class="ipt" placeholder="选择学历" readonly="" /><input type="hidden" name="test" value="3"></span>
		<div class="dropdown-menu">
			<ul>
				<li data-val="1">大专</li>
				<li data-val="2">本科</li>
				<li data-val="3">硕士</li>
				<li data-val="4">博士</li>
			</ul>
		</div>
	**/
	dropSelect: function(formEl) {
		var formEl = formEl || $(document);
		if (formEl) {
			function setEndSelect(el, ipt, init) {
				if (ipt.hasClass('ipt-range') && ipt.attr('data-range') == 'start') {
						var rangeWrap = ipt.closest('.form-row'),
							startList = ipt.closest('dd').find('.dropdown-menu ul'),
							endIpt = rangeWrap.find('.ipt-range[data-range="end"]'),
							endKey = endIpt.parent().find('input[type="hidden"]'),
							endList = endIpt.closest('dd').find('.dropdown-menu ul'),
							curNum = el.attr('data-val') || el.val(),
							str = '<li data-val="-1">至今</li>',
							curYear = new Date().getFullYear(),
							i,
							upNum = parseInt(curNum) + 4;
						startList.find('li').each(function() {
							if ($(this).attr('data-val') >= curNum && curNum != curYear) {
								str += $(this).prop('outerHTML');
							}
						})
						endList.html(str);
						if (!init) {
							if (upNum < curYear) {
								endIpt.val(upNum);
								endKey.val(upNum);
								//str = '<li data-val="-1">'+ (parseInt(curNum) + 4) +'</li>';
							} else {
								endIpt.val(endList.find('li').eq(0).text());
								endKey.val(endList.find('li').eq(0).attr('data-val'));
							}
						}
					}
			}
			formEl.find('.dropdown-select').each(function() {
				var _self = $(this),
					rangeEl = _self.find('.ipt-range[data-range="start"]'),
					highSalaryEl = _self.find('input[name="highSalary"]');
				_self.on('click', function() {
					if ($(this).hasClass('dropdown-disabled')) {
						return;
					}
					if (!$(this).hasClass('dropdown-select-open')) {
						formEl.find('.dropdown-select-open').removeClass('dropdown-select-open');
						formEl.find('.dropdown-menu-open').removeClass('dropdown-menu-open');
					}
					$(this).toggleClass('dropdown-select-open');
					_self.next('.dropdown-menu').toggleClass('dropdown-menu-open');
				})
				if (_self.find('.ipt-range[data-range="end"]')) {
					setEndSelect(rangeEl, rangeEl, true);
				}
				if (highSalaryEl.val() == '') {
					highSalaryEl.closest('.dropdown-select').addClass('dropdown-disabled');
					highSalaryEl.closest('.dropdown-select').find('.ipt').attr('disabled', 'disabled');
				}
				if (highSalaryEl.length && highSalaryEl.val() != '') {
					if (highSalaryEl.val() == '请选择') {
						highSalaryEl.parent().hide();
					} else {
						highSalaryEl.val(highSalaryEl.parent().find('.ipt').val());
						FormsUI.changeSalary(highSalaryEl.closest('dd').find('input[name="lowSalary"]').val().replace('K',''), true);
					}
					
				}
				
			})
			formEl.find('.dropdown-menu').each(function() {
				var _self = $(this),
					elPrev = _self.prev('.dropdown-select'),
					elInput = elPrev.find('input[readonly]'),
					elKey = elPrev.find('input[type="hidden"]'),
					treeCon = _self.find('.select-tree'),
					tagsCon = _self.find('.tags-cells');
				/*获取职位选择三级宣传*/
				if (treeCon.length) {
					if (treeCon.attr('data-level') == 3) {
						treeCon.html('<ul class="tree-1"></ul><ul class="tree-2"></ul><ul class="tree-3"></ul>');
					}
					if (treeCon.attr('data-level') == 2) {
						treeCon.html('<ul class="tree-1"></ul><ul class="tree-2"></ul>');
					}
					FormsUI.getTreeData(treeCon, jobData);
				}
				/*获取技能选择的标签数据*/
				if (tagsCon.length) {
					Resume.getTag(formEl, true);
				}
				
				
				_self.on('click', 'li', function() {
					/*三级职位选择*/
					if ($(this).closest('.select-tree').length) {
						var level = $(this).closest('.select-tree').attr('data-level');
						
						$(this).parent().find('li').removeClass('selected');
						$(this).addClass('selected');
						if (level == 3) {
							if ($(this).closest('.tree-1').length) {
								$(this).closest('.select-tree').find('.tree-3').hide();
								FormsUI.getTreeData(treeCon, jobData, $(this).attr('data-id'));
								return false;
							} else if ($(this).closest('.tree-2').length) {
								$(this).closest('.select-tree').find('.tree-3').show();
								elKey.attr('level2', $(this).attr('data-id'));
								FormsUI.getTreeData(treeCon, jobData, $(this).closest('.select-tree').find('.tree-1 .selected').attr('data-id'), $(this).attr('data-id'));
								return false;
							}
						}
						if (level == 2) {
							if ($(this).closest('.tree-1').length) {
								$(this).closest('.select-tree').find('.tree-3').hide();
								FormsUI.getTreeData(treeCon, jobData, $(this).attr('data-id'));
								return false;
							} else if ($(this).closest('.tree-2').length) {
								$(this).closest('.select-tree').find('.tree-3').show();
								elKey.attr('level2', $(this).attr('data-id'));
								FormsUI.getTreeData(treeCon, jobData, $(this).closest('.select-tree').find('.tree-1 .selected').attr('data-id'), $(this).attr('data-id'));
								return false;
							}
						}
					}
					/*时间段选择*/
					setEndSelect($(this), elInput);
					elInput.val($(this).text());
					elKey.val($(this).attr('data-val'));
					
					elKey.closest('dd').find('.tip-text').remove();
					_self.removeClass('dropdown-menu-open');
					elPrev.removeClass('dropdown-select-open');
					/*更换职位之后，技能标签置为空*/
					if (elKey.attr('name') == 'position') {
						var tagsWrap = $(this).closest('.form-resume').find('.select-tags');
						tagsWrap.closest('dd').find('.ipt').val('');
						tagsWrap.closest('dd').find('input[type="hidden"]').val('');
						Resume.getTag(tagsWrap.closest('.form-resume'));
					}
					
				})
			})
			
			$(document).on('click', function(e) {
				if (!$(e.target).closest('.dropdown-menu').length && !$(e.target).closest('.dropdown-select').length) {
					formEl.find('.dropdown-select').removeClass('dropdown-select-open');
					formEl.find('.dropdown-menu').removeClass('dropdown-menu-open');
				}
			})
		}
	},
	getTreeData: function(formEl, data, id1 , id2) {
		//var data = [{'id':1,'name':'产品1','children':[{'id':11,'name':'产品a2','children':[{'id':111,'name':'产品aa3'},{'id':112,'name':'产品aa3'}]},{'id':12,'name':'产品b2','children':[{'id':121,'name':'产品bb3'},{'id':122,'name':'产品bb3'}]}]},{'id':2,'name':'技术1','children':[{'id':21,'name':'技术2','children':[{'id':211,'name':'技术3'},{'id':212,'name':'技术3'}]}]}];
		var str1 = '',
			str2 = '',
			str3 = '',
			i,
			j,
			k;
		for (i = 0; i < data.length; i++) {
			var childData2 = data[i].children;
			str1 += '<li data-id="'+ data[i].id +'">'+ data[i].name +'</li>';
			if (childData2 && id1 && data[i].id == id1) {
				for (j = 0; j < childData2.length; j++) {
					var childData3 = childData2[j].children;
					str2 += '<li data-id="'+ childData2[j].id +'">'+ childData2[j].name +'</li>';
					if (childData3 && id2 && childData2[j].id == id2) {
						for (k = 0; k < childData3.length; k++) {
							str3 += '<li data-val="'+ childData3[k].id +'">'+ childData3[k].name +'</li>';
						}
					}
				}
			}
		}
		if (!id1) {
			formEl.find('.tree-1').html(str1);
			formEl.find('.tree-2').html('<li class="blank">选择职类</li>');
		}
		if (id2) {
			formEl.find('.tree-3').html(str3);
		} else if (id1) {
			formEl.find('.tree-2').html(str2);
		}
	},
	changeSalary: function(num, init) {
		var endSalary = $('.end-salary'),
			endIpt = endSalary.find('.ipt'),
			endKey = endSalary.find('input[type="hidden"]'),
			endCon = endSalary.find('ul'),
			num = num,
			endNum = 0;
			if (num) {
				endIpt.closest('.dropdown-select').removeClass('dropdown-disabled');
				endIpt.removeAttr('disabled');
			}
			if (num == '面议') {
				endIpt.val('面议').parent().hide();
				endKey.val('面议');
            } else {
				num = parseInt(num, 10);
				endIpt.val(endIpt.val() + 'K').parent().show();
			}
			if (num <= 50) {
				if (!init) {
					endIpt.val(num + 1 + 'K');
					endKey.val(num + 1);
				}
                
                endCon.html('')
                for (var i = num + 1; i <= num * 2; i++) {
                    var str = '';
                    str += '<li data-val="'+ i +'">' + i + 'K</li>';
                    $(str).appendTo(endCon);
                }
            }
            if (num > 50 && num < 200) {
				if (!init) {
					endIpt.val(num + 10 + 'K');
					endKey.val(num + 10);
				}
                endCon.html('');
				if (num < 160) {
					endNum = num + 50;
				} else {
					endNum = num * 2;
				}
				if (endNum > 200) {
					endNum = 200;
				}
                for (var i = num + 10; i <= endNum; i += 10) {
                    var str = '';
                    str += '<li data-val="'+ i +'">' + i + 'K</li>';
                    $(str).appendTo(endCon);
                }
            }
            /*if (num == 100) {
                endIpt.val('150K');
				endKey.val('150');
                endCon.html('')
                var str = '';
                str += '<li class="selected" data-val="150">150K</li>';
                $(str).appendTo(endCon);
            }*/
			
	},
	/*搜索建议*/
	getSuggest: function(el) {
		var el = el,
			url = el.attr('data-url'),
			keyword = el.val(),
			resultPannel = el.parent().find('.suggest-complete');
		if (keyword == '') {
			resultPannel.removeClass('dropdown-menu-open');
			return;
		}
		resultPannel.html('<ul></ul>').addClass('dropdown-menu');
		var resultCon = resultPannel.find('ul');
		$.ajax({
			type: 'POST',
			url: url,
			dataType:'JSON',
			data: {
				'query': keyword
			},
			success: function(result) {
				
				var result = result.data,
					str = '',
					i;
				if (typeof result == 'string') {
					result = eval('('+ result +')');
				}
				if (result && result.length) {
					for (i = 0; i < result.length; i++) {
						str += '<li data-val="'+ result[i].code +'">'+ result[i].hlname +'</li>';
					}
					resultCon.html(str);
					resultPannel.addClass('dropdown-menu-open');
				}
				
			},
			error: function(result) {
				
			}
		})
		
		
	},
	setSuggest: function(el) {
		var elIpt = el.closest('dd').find('.ipt'),
			elLocation = el.closest('dd').find('input[name="location"]');
		elIpt.val(el.text());
		elLocation.val(el.attr('data-val'));
		el.closest('.suggest-complete').removeClass('dropdown-menu-open');
		elIpt.parent().find('.tip-text').remove();
	}
};