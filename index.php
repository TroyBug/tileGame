<?php 
	$xml = simplexml_load_file("config.xml");

	$limit = $xml->limit;
	$maxStage = $xml->maxStage;

	foreach ($xml->stageInfo->stages as $list) {
		$value[] = get_object_vars($list);
	}

	$str = "";
	for($i = 0, $len = count($value); $i < $len; $i++) {
		$str .= "{stage:".$value[$i]["stage"].",imageUrl:'".$value[$i]["url"]."'}";
		if($i !== $len - 1) {
			$str .= ",";
		}
	}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width,initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0,user-scalable=no" />
	<title>拼图游戏</title>
	<link rel="stylesheet" href="css/tileStyle.css">
	<link rel="stylesheet" href="css/jquery.mobile.min.css">
	<script src="js/jquery-1.11.2.min.js"></script>
	<script src="js/jquery.mobile.custom.min.js"></script>
	<script>
		config = {
			limit:<?php echo $limit; ?>,
			maxStage:<?php echo $maxStage; ?>,
			user: 'default',
			stageInfo: [<?php echo $str; ?>]
		};
		currentStage = 1;
	</script>
</head>
<body class="ui-mobile-viewport">
	<div id="menu" data-role="page" data-url="menu">
		<div class="s-img"><img src="images/eg.jpg" alt=""></div>
		<a id="play-button" data-transition="slide"  href="#ready" data-role="button" data-theme="c" class="ui-btn ui-btn-corner-all ui-shadow ui-btn-up-c">
			<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">开始游戏</span></span>
		</a>
		<div class="ui-select txtCen">
			<select name="select-native-1" id="select-native-1">
				<option value="0">选　　关</option>
				<?php 
					$str = "";
					for($i = 0; $i < $maxStage; $i++) {
						$str .= "<option value=\"".($i+1)."\">第".($i+1)."关</option>";
					}
					echo $str;
				?>
            </select>
            <script>
            	$('#select-native-1').bind('change',function() {
            		var curValue = $(this).val();
            		if(curValue !== 0) {
            			currentStage = $(this).val();
            			$('.stage b').html(currentStage);
            		}
            	});
            </script>
        </div>
        <a id="prize" href="javascript:void(0)" data-rel="popup" data-theme="c" class="ui-btn ui-btn-corner-all ui-shadow ui-btn-up-c">
			<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">奖&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;品</span></span>
		</a>
		<div class="prizePanel">
			<a id="pClose" href="javascript:void(0)" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a>
			<dl>
				<dt>奖品介绍：<span>我获得的奖品</span></dt>
				<dd>1.奖品介绍</dd>
				<dd>2.奖品介绍</dd>
				<dd>3.奖品介绍</dd>
				<dd>4.奖品介绍</dd>
				<dd>5.奖品介绍</dd>
				<dd>6.奖品介绍</dd>
			</dl>
		</div>
	</div>
	<div class="ready" id="ready" data-role="page" data-url="ready">
		<div class="logo">
			<img src="images/logo.jpg" alt="">
		</div>
		<div class="fp4">玩游戏，赢大奖</div>
		<div class="fp5 txtCen">游戏加载中...</div>
		<div class="cirBox">
			<div class="circle c1"></div>	
			<div class="circle c2"></div>	
			<div class="circle c3"></div>	
			<div class="circle c4"></div>	
			<div class="circle c5"></div>	
		</div>
		
		<a id="go" data-transition="slide" href="#game" data-role="button"></a>
	</div>
	<!-- 游戏主体 -->
	<div id="game" data-role="page" data-url="game">
		<div id="layer">
			<div class="origin"></div>
		</div>
		<div class="m_t5 clearfix">
			<span class="timeIcon"></span>
			<!-- 倒计时 -->
			<span class="time">
				<span>0</span>.
				<b>00</b>"
			</span>
			<span class="fr stage">当前是(<b>1</b>/<span>{{maxStage}}</span>)关</span>
			<span class="score fr">得分：<b>0</b>分</span>
		</div>
		<div class="startBtn">
			<div class="arr"></div>
			<span id="countDown">4</span>
		</div>
		<!-- 游戏失败提示 -->
		<div class="failPanel">
			<div class="fp1 txtCen">亲，闯关失败！</div>
			<div class="m_t10">本次得分：<span class="fp2"><b>0</b>分</span></div>
			<div>历史最高：<span class="highscore">0</span>分</div>
			<div>亲，不要灰心，<span class="fp3">一时的成绩不代表什么，相信自己，且玩且珍惜！</span></div>
			<div class="txtCen toolBar m_t10">
				<a href="#">邀请好友</a>
				<a id="replay" href="javascript:void(0)">再玩一次</a>
			</div>
		</div>
		<!-- 游戏胜利提示 -->
		<div class="winPanel">
			<div class="fp1 txtCen">亲，恭喜您！</div>
			<div class="txtCen m_t10">获得优惠券一张</div>
			<div class="m_t5">本次得分：<span class="fp2"><b>0</b>分</span></div>
			<div>历史最高：<span class="highscore">0</span>分</div>
			<div>亲，您可以点击 <a class="useItem" href="#">立即使用</a></div>
			<div>该奖品，避免过期哦，也可以：</div>
			<div class="txtCen toolBar m_t10">
				<a href="#">炫耀一下</a>
				<a id="continuePlay" href="javascript:void(0)">继续闯关</a>
			</div>
		</div>
	</div>
	<div class="shadow"></div>

	<script src="js/core.js"></script>
</body>
</html>