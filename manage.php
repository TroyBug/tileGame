<?php 
	//获取提交表单后的值
	if(isset($_REQUEST["stage"])) {
		$result = $_REQUEST["stage"];
	}

	if(isset($_REQUEST["timeLimit"])) {
		$timeLimit = $_REQUEST["timeLimit"];
	}

	if(isset($_REQUEST["maxStage"])) {
		$ms = $_REQUEST["maxStage"];
	}


	//读取配置文件
	$xml = new DOMDocument();
	$filename = "config.xml";
	
	$urls = array();

	if(file_exists($filename)) {
		$xml->load($filename);	
		$limit = getVal($xml,"limit");
		$maxStage = getVal($xml,"maxStage");
		$stagesNum = $xml->getElementsByTagName("stages")->length;
		$imgUrls = $xml->getElementsByTagName("url");

		foreach ($imgUrls as $list) {
			$val = $list->firstChild->nodeValue;
			array_push($urls, $val);
		}

		if(isset($result) && isset($timeLimit) && isset($maxStage)) {
			$doc = simplexml_load_file("config.xml");

			$doc->limit = $timeLimit;
			$doc->maxStage = $ms;

			unset($doc->stageInfo);
			$stageInfo = $doc->addChild("stageInfo");

			for($i = 0; $i < count($result); $i++) {
				$stages = $stageInfo->addChild("stages");
				$stages->addChild("stage",$i+1);
				$stages->addChild("url",$result[$i]);
			}
			//写入xml文件
			file_put_contents("config.xml", $doc->asXML());

			echo "<script>location.href = 'javascript:history.back()'</script>";
		}
	}



	function getVal($node,$item) {
		return $node->getElementsByTagName($item)->item(0)->nodeValue;
	}

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>拼图管理后台</title>
	<style>
		body{margin: 0; font:12px/180% Arial;}
		img{border:0; vertical-align: bottom;}
		ul,ol,dt,dd,dl,p,form{margin:0;padding:0;}
		.inp{
			border:1px solid #ddd;
			border-radius: 3px;
			height: 20px;
			line-height: 20px;
			font-size: 14px;
			padding-left: 4px;
			width: 300px;
		}
		.w50{width: 50px;}
		table{border-collapse: collapse; width: 60%;}
		table th,table td{padding: 10px; border:1px solid #ddd;}
		table th{width: 15%;}
		.fr{float: right;}
		.stageConfig{margin: 10px 0;}
		.txtCen{text-align: center;}
		.m_t20{margin-top: 20px;}
	</style>
	<script src="js/jquery-1.11.2.min.js"></script>
</head>
<body>
	<form name="f" action="#" method="post">
		<table cellpadding="10" cellspacing="10">
			<tr>
				<th>时间限制：</th>
				<td>
					<input name="timeLimit" class="inp w50" type="text" value="<?php echo $limit ? $limit : 30 ?>">
					<span>默认为30秒</span>
				</td>
			</tr>
			<tr>
				<th>关卡设置：</th>
				<td>
					<span><a id="addStage" href="javascript:void(0)">新增关卡</a></span>
					<div id="stageField">
						<?php 
							for($i = 0; $i < $stagesNum; $i++) {
								$html = "<div class=\"stageConfig\">".
											"<label>关卡".($i+1)."图片路径</label>&nbsp;".
											"<input class=\"inp\" type=\"text\" name=\"stage[]\" value=\"".$urls[$i]."\" />".
											"&nbsp;&nbsp;<a onclick=\"delStage(this)\" href=\"javascript:void(0)\">删除当前关卡</a>".
										"</div>";

								echo $html;
							}
						?>
					</div>
				</td>
			</tr>
		</table>
		<div class="m_t20">
			<input type="submit" onclick="save()" value="保存">
			<input id="maxStage" name="maxStage" type="hidden" value="<?php echo $stagesNum; ?>">
		</div>
	</form>
	<script>
		var add = $('#addStage'),
			stage = <?php echo $stagesNum; ?>;	//当前关卡数量

		//添加关卡
		add.bind('click',function() {
			stage++;
			var html = '<div class="stageConfig">' +
							'<label>关卡'+stage+'图片路径</label>&nbsp;'+
							'<input class="inp" type="text" name="stage[]" value="" />' +
							'&nbsp;&nbsp;<a onclick="delStage(this)" href="javascript:void(0)">删除当前关卡</a>' +
						'</div>';
			$('#stageField').append(html);
		});

		//删除关卡
		function delStage(el) {
			$(el).parent().remove();
			stage--;
		}

		//保存配置
		function save() {
			var count = 0;
			$('.stageConfig .inp').each(function() {
				if($(this).val() !== '') {
					count++;
				}
			});
			//根据关卡数量设置最大关卡
			$('#maxStage').val(count);
			return true;
		}
	</script>
</body>
</html>