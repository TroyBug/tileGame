pileScore = highScore = 0;

var tileObj = function(gx,gy) {
	var solvedGx = gx,	//图块的正确位置 横向索引
		solvedGy = gy,	//图块的正确位置 纵向索引
		left = gx * tileSize,	//索引X块大小得到left值
		top = gy * tileSize,
		$tile = $('<div class="tile"></div>'),	//创建一个tile元素

		that = {
			$element: $tile,
			gx: gx,
			gy: gy,
			move:function(ngx,ngy) {
				that.gx = ngx;
				that.gy = ngy;
				tilesArray[ngy][ngx] = that;
				$tile.css({
					left:ngx * tileSize + 'px',
					top:ngy * tileSize + 'px'
				});
			},
			checkSolved:function() {//检测拼块是否处于正确的位置
				if(that.$element.attr('nPos') !== that.$element.attr('pos')) {
					return false;
				}
				return true;
			}
		};

	$tile.css({
		left: gx * tileSize + 'px',
		top: gy * tileSize + 'px',
		width: tileSize - 2 + 'px',
		height: tileSize - 2 + 'px',
		backgroundPosition: -left + 'px ' + -top + 'px',
		backgroundImage:'url('+imageUrl+')'
	});
	$tile.data('tileObj',that);
	return that;
};

var checkSolved = function() {//检测拼块是否处于正确的位置
	var pos,nPos,that,doneCount = 0;
	$('.tile').each(function() {
		that = $(this);
		pos = that.attr('pos');
		nPos = that.attr('nPos');

		if(pos == nPos) {
			doneCount++;	//正确块数+1
		}
	});

	/*if(doneCount == numTiles * numTiles) return true;
	return false;*/

	return {
		complete: doneCount === numTiles * numTiles ? true : false,
		dc: doneCount
	};
};


var shuffle = function() {
	//随机拼块
	blockArray = [];
	rArr = [];	//随机数组
	for(i = 0; i < numTiles * numTiles; i++) {
		blockArray.push(i);
	}
	for(var j = 0; j < numTiles * numTiles; j++) {
		var r = blockArray.splice(Math.floor( (Math.random() * 10000) % blockArray.length),1);
		rArr.push(r);
	}

	var tiles = $('.tile');

	$('.tile').each(function(i) {
		var r = rArr.shift(),
			t = tiles.eq(r).attr('pos').split('-'),
			nx = t[0],
			ny = t[1];

		$(this).css({
			left: nx * tileSize + 'px',
			top: ny * tileSize + 'px'
		});

		$(this).attr('nPos',nx+'-'+ny);
		
	});
};

//初始化游戏
var setup = function() {
	var x,y,i;
	//imageUrl = './images/rhino.jpg';
	imageUrl = config.stageInfo[currentStage-1]['imageUrl'];
	layer = $('#layer');
	$('.origin').css({
		backgroundImage:'url('+imageUrl+')'
	});
	//$('#done-image').attr('src',imageUrl);

	$('.tile',$('#layer')).remove();
	numTiles = 3;
	emptyGx = emptyGy = numTiles - 1;
	tileSize = Math.ceil(312 / numTiles);	//块大小
	tilesArray = [];
	for(y = 0; y < numTiles; y++) {
		tilesArray[y] = [];
		for(x = 0; x < numTiles; x++) {
			var tile = tileObj(x,y);	//初始化块位置
			tile.$element.attr('pos',x+'-'+y);	//保存原始位置信息
			tilesArray[y][x] = tile;
			$('#layer').append(tile.$element);
		}
	}
	updateInfo();
	//shuffle();	//打乱拼块
};

var bindEvent = function() {
	var tag,tagX,tagY,deltaX,deltaY,clone,dragStart,time,originPosX,originPosY;

	layer.bind('touchstart',function(e) {
		dragStart = true;
		time = +new Date();
		tag = $(e.target);
		if(!tag.hasClass('tile')) return;

		originPosX = e.originalEvent.targetTouches[0].pageX; 
		originPosY = e.originalEvent.targetTouches[0].pageY; 

		tagX = tag.offset().left;
		tagY = tag.offset().top;
		deltaX = e.originalEvent.targetTouches[0].pageX - tagX;
		deltaY = e.originalEvent.targetTouches[0].pageY - tagY;
		clone = tag.clone(true);

		clone.addClass('clone');
		clone.css({
			width: tileSize - 4 + 'px',
			height: tileSize - 4 + 'px',
			zIndex: 3,
			opacity: 0.8,
			border:'2px dotted #999',
			display:'none'
		});

		$(document.body).append(clone);	
	});

	layer.bind('touchmove',function(e) {
		if(!dragStart) return;
		e.preventDefault();
		e.stopPropagation();
		curX = e.originalEvent.targetTouches[0].pageX,
		curY = e.originalEvent.targetTouches[0].pageY;

		clone.css({
			display:'block',
			left: curX - deltaX + 'px',
			top: curY - deltaY + 'px'
		});
	});

	layer.bind('touchend',function(e) {
		dragStart = false;
		
		//如果结束位置偏移不超过10像素，则判定为一次无效的移动，清除clone块
		if(Math.abs(originPosX - curX) < 10 && Math.abs(originPosY - curY) < 10) {
			clone.remove();
			return false;
		}

		var cloneX1 = clone.offset().left,
			cloneX2 = cloneX1 + clone.width(),
			cloneY1 = clone.offset().top,
			cloneY2 = cloneY1 + clone.height(),
			targetPos = {},
			score = $('.score b');

		$('.tile').each(function() {
			var that = $(this),
				w = that.width(),
				h = that.height(),
				halfWidth = w / 2,
				halfHeight = h / 2,
				tmp,tmp_cur;

			targetPos.x1 = that.offset().left;
			targetPos.x2 = targetPos.x1 + w;
			targetPos.y1 = that.offset().top;
			targetPos.y2 = targetPos.y1 + h;

			//时间超过200毫秒则认为是一次有效的touch，并判断矩形是否相交
			if((+new Date() - time > 200) && cloneX2 >= (targetPos.x1 + halfWidth) && cloneX2 <= (targetPos.x2 + halfWidth) && cloneY2 >= (targetPos.y1 + halfHeight) && cloneY2 <= (targetPos.y2 + halfHeight)) {
				tmp = tag.attr('nPos').split('-');
				tmp_cur = that.attr('nPos').split('-');
				//交换两个块的位置并设置新索引
				tag.css({
					left: tmp_cur[0] * tileSize + 'px',
					top: tmp_cur[1] * tileSize + 'px'
				});
				that.css({
					left: tmp[0] * tileSize + 'px',
					top: tmp[1] * tileSize + 'px'
				});
				that.attr('nPos',tmp[0] + '-' + tmp[1]);
				tag.attr('nPos',tmp_cur[0] + '-' + tmp_cur[1]);

				if(checkSolved().complete) {//完成后取消监听
					layer.unbind('touchstart');
					layer.unbind('touchmove');
					layer.unbind('touchend');

					//更新分数
					var dc = checkSolved().dc;
					pileScore += (dc * 10) * parseInt($('.time span').html() / 10);
					score.html(pileScore);
					highScore = highScore > pileScore ? highScore : pileScore;
					clearInterval(t);
					win();
				} else {
					var dc = checkSolved().dc;
					pileScore += dc * 10;
					score.html(pileScore);
					highScore = highScore > pileScore ? highScore : pileScore;
				}

				return false;
			}
		});
		clone.remove();
	});
};

var limit = 10,t;

//倒计时
function count(callback) {	
	var now = +new Date();
	var end = now + limit * 1000;
	var second,cSecond,tmp;
	var secBox = $('.time').find('span');
	var mSecBox = $('.time').find('b');

	t = setInterval(function() {
		if(second !== '00') {
			tmp = (end - +new Date()) / 1000;
			second = Math.ceil(tmp);
			if(second === limit) second = limit - 1;
			second = second < 10 ? '0' + second : second;
			cSecond = Math.floor(tmp * 100 % 100);
			if(cSecond < 0) cSecond = 0;
			cSecond = cSecond < 10 ? ('0' + cSecond) : cSecond;
			secBox.html(second);
			mSecBox.html(cSecond);
		} else {
			clearInterval(t);
			callback && callback();
		}
	},17);
}


//开始游戏按钮
$('.startBtn').bind('click',startGame);

//重新开始游戏
$('#replay').bind('click',function() {
	$('.startBtn').bind('click',startGame);
	$('.failPanel').hide();
	$('.startBtn').show();
	$('.startBtn').find('.arr').show();
	$('#countDown').hide();
	$('.score').hide();
	$('.stage').show();
	$('.time').find('span').html(limit < 10 ? '0' + limit : limit);

	updateInfo();
});

$('#continuePlay').bind('click',continuePlay);

function startGame() {
	$('.startBtn').unbind('click');

	var shadow = $('.shadow'),
		startBtn = $('.startBtn'),
		score = $('.score'),
		stage = $('.stage'),
		arr = startBtn.find('.arr'),
		countDown = $('#countDown'),
		t;

	arr.hide();
	score.show();
	stage.hide();
	countDown.show();

	(function() {
		if(countDown.html() !== '1') {
			countDown.html(parseInt(countDown.html()) - 1);
			t = setTimeout(arguments.callee,1000);
		} else {
			shadow.hide();
			startBtn.hide();
			countDown.html('4');
			shuffle();
			bindEvent();
			count(fail);
		}
	})();
}

function fail() {
	$('.clone').remove();
	layer.unbind('touchstart');
	layer.unbind('touchmove');
	layer.unbind('touchend');
	
	$('.failPanel').show();
	$('.shadow').show();

	$('.highscore').each(function() {
		$(this).html(highScore);
	});
	$('.fp2 b').each(function() {
		$(this).html(pileScore);
	});
}
function win() {
	layer.unbind('touchstart');
	layer.unbind('touchmove');
	layer.unbind('touchend');

	if(currentStage < config.maxStage) {
		currentStage++;
	} else {
		$('#continuePlay').hide();
		clearInterval(t);
	}

	$('.winPanel').show();
	$('.shadow').show();

	$('.highscore').each(function() {
		$(this).html(highScore);
	});
	$('.fp2 b').each(function() {
		$(this).html(pileScore);
	});
}

function updateInfo() {
	var reg = /\{\{(.*)?\.?(.*)\}\}/gm;
	var stage = $('.stage');
	stage.find('b').html(currentStage);	
	stage.find('span').html(config.maxStage);
	$('.time').find('span').html(config.limit < 10 ? '0' + config.limit : config.limit);
	$('.time').find('b').html('00');
	$('.score span').html(pileScore);
	limit = config.limit;
}

function continuePlay() {
	$('.winPanel').hide();
	$('.startBtn').show();
	$('.startBtn').find('.arr').show();
	$('#countDown').hide();
	$('.score').hide();
	$('.stage').show();
	$('.time').find('span').html(limit < 10 ? '0' + limit : limit);

	$('.startBtn').bind('click',startGame);

	updateInfo();

	setup();
}

//setup();


$('#pClose').bind('click',function() {
	$('.prizePanel').hide();
	$('.shadow').hide();
});
$('#prize').bind('click',function() {
	$('.prizePanel').show();
	$('.shadow').show();
});

$('#play-button').bind('click',function() {
	setTimeout(function() {
		$('#go').click();
		$('.shadow').show();
	},5000);
	setup();
});