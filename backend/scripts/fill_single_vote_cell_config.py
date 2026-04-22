from __future__ import annotations

TARGET_COLUMN = '第二阶段 轮次 1'

TARGET_ENTRIES = [
    ('梓川枫', '青春猪头少年系列', 10581.0),
    ('小鞠知花', '败犬女主太多了！', 10504.6),
    ('藤原千花', '辉夜大小姐想让我告白～天才们的恋爱头脑战～', 9060.0),
    ('菲伦', '葬送的芙莉莲', 8840.5),
    ('平泽忧', '轻音少女', 8205.7),
    ('和泉纱雾', '埃罗芒阿老师', 8060.4),
    ('周防有希', '不时轻声地以俄语遮羞的邻座艾莉同学', 7975.5),
    ('春日野穹', '缘之空', 7878.3),
    ('五河琴里', '约会大作战', 7716.2),
]

INPUT_BLOCKS = [
    {
          'mode': 'html_duel',
        'html': '''
<div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/355.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">时崎狂三</p>
<p class="contestantSeries">约会大作战</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1472</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3117.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">绪山真寻</p>
<p class="contestantSeries">别当欧尼酱了！</p>
</div>






<h3 class="contestantVotes contestantInfo ">543</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3508.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">三角初华</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1053</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3296.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">河原木桃香</p>
<p class="contestantSeries">少女乐队的呐喊</p>
</div>






<h3 class="contestantVotes contestantInfo ">785</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/845.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">平泽唯</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1205</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3337.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">绫濑沙季</p>
<p class="contestantSeries">义妹生活</p>
</div>






<h3 class="contestantVotes contestantInfo ">722</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3168.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">芙莉莲</p>
<p class="contestantSeries">葬送的芙莉莲</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1351</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/474.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">远坂凛</p>
<p class="contestantSeries">Fate系列</p>
</div>






<h3 class="contestantVotes contestantInfo ">669</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1101.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">泉此方</p>
<p class="contestantSeries">幸运☆星</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">937</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1854.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">结城明日奈</p>
<p class="contestantSeries">刀剑神域</p>
</div>






<h3 class="contestantVotes contestantInfo ">924</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3293.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">安和昴</p>
<p class="contestantSeries">少女乐队的呐喊</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1126</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/85.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">立华奏</p>
<p class="contestantSeries">Angel Beats!</p>
</div>






<h3 class="contestantVotes contestantInfo ">870</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/247.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">友利奈绪</p>
<p class="contestantSeries">Charlotte</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1432</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3149.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">星野爱</p>
<p class="contestantSeries">【我推的孩子】</p>
</div>






<h3 class="contestantVotes contestantInfo ">577</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2955.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">喜多川海梦</p>
<p class="contestantSeries">更衣人偶坠入爱河</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1006</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1000.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">阿库娅</p>
<p class="contestantSeries">为美好的世界献上祝福！</p>
</div>






<h3 class="contestantVotes contestantInfo ">759</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3109.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">椎名真昼</p>
<p class="contestantSeries">关于我在无意间被隔壁的天使变成废柴这件事</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1204</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1501.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">爱蜜莉雅</p>
<p class="contestantSeries">Re:从零开始的异世界生活</p>
</div>






<h3 class="contestantVotes contestantInfo ">787</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3130.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">山田凉</p>
<p class="contestantSeries">孤独摇滚！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1190</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/350.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">五河琴里</p>
<p class="contestantSeries">约会大作战</p>
</div>






<h3 class="contestantVotes contestantInfo ">710</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3163.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">椎名立希</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">950</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/261.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">丹生谷森夏</p>
<p class="contestantSeries">中二病也要谈恋爱！</p>
</div>






<h3 class="contestantVotes contestantInfo ">840</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2885.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">亚托莉</p>
<p class="contestantSeries">ATRI -My Dear Moments-</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1291</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2969.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">七草荠</p>
<p class="contestantSeries">彻夜之歌</p>
</div>






<h3 class="contestantVotes contestantInfo ">657</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3216.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">八奈见杏菜</p>
<p class="contestantSeries">败犬女主太多了！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1466</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1926.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">茵蒂克丝</p>
<p class="contestantSeries">魔法禁书目录</p>
</div>






<h3 class="contestantVotes contestantInfo ">534</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1867.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">北白川玉子</p>
<p class="contestantSeries">玉子市场</p>
</div>






<h3 class="contestantVotes contestantInfo ">847</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1414.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">由比滨结衣</p>
<p class="contestantSeries">我的青春恋爱物语果然有问题。</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">849</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3090.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">伊地知虹夏</p>
<p class="contestantSeries">孤独摇滚！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1083</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/848.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">田井中律</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo ">836</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3089.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">后藤独</p>
<p class="contestantSeries">孤独摇滚！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1559</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2749.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">东海帝王</p>
<p class="contestantSeries">赛马娘 Pretty Derby</p>
</div>






<h3 class="contestantVotes contestantInfo ">503</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1935.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">白井黑子</p>
<p class="contestantSeries">魔法禁书目录</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">894</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/427.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">和泉纱雾</p>
<p class="contestantSeries">埃罗芒阿老师</p>
</div>






<h3 class="contestantVotes contestantInfo ">859</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1341.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">休比·多拉</p>
<p class="contestantSeries">NO GAME NO LIFE 游戏人生</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1178</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1002.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">惠惠</p>
<p class="contestantSeries">为美好的世界献上祝福！</p>
</div>






<h3 class="contestantVotes contestantInfo ">739</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2368.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">樱岛麻衣</p>
<p class="contestantSeries">青春猪头少年系列</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1445</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2400.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">中野三玖</p>
<p class="contestantSeries">五等分的新娘</p>
</div>






<h3 class="contestantVotes contestantInfo ">601</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1456.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">艾拉</p>
<p class="contestantSeries">可塑性记忆</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1206</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3218.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">温水佳树</p>
<p class="contestantSeries">败犬女主太多了！</p>
</div>






<h3 class="contestantVotes contestantInfo ">686</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3155.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">要乐奈</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1147</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1606.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">椎名真白</p>
<p class="contestantSeries">樱花庄的宠物女孩</p>
</div>






<h3 class="contestantVotes contestantInfo ">935</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3092.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">喜多郁代</p>
<p class="contestantSeries">孤独摇滚！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1350</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/262.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">七宫智音</p>
<p class="contestantSeries">中二病也要谈恋爱！</p>
</div>






<h3 class="contestantVotes contestantInfo ">539</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3295.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">井芹仁菜</p>
<p class="contestantSeries">少女乐队的呐喊</p>
</div>






<h3 class="contestantVotes contestantInfo ">855</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2433.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">藤原千花</p>
<p class="contestantSeries">辉夜大小姐想让我告白～天才们的恋爱头脑战～</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">922</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/843.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">秋山澪</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1371</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/846.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">琴吹䌷</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo ">446</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3152.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">高松灯</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1275</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2953.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">锦木千束</p>
<p class="contestantSeries">莉可丽丝</p>
</div>






<h3 class="contestantVotes contestantInfo ">771</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2748.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">洛琪希·米格路迪亚</p>
<p class="contestantSeries">无职转生</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">945</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3219.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">小鞠知花</p>
<p class="contestantSeries">败犬女主太多了！</p>
</div>






<h3 class="contestantVotes contestantInfo ">898</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2093.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">初音未来</p>
<p class="contestantSeries">VOCALOID</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1439</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2376.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">梓川枫</p>
<p class="contestantSeries">青春猪头少年系列</p>
</div>






<h3 class="contestantVotes contestantInfo ">622</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3159.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">长崎爽世</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1367</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3176.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">猫猫</p>
<p class="contestantSeries">药屋少女的呢喃</p>
</div>






<h3 class="contestantVotes contestantInfo ">654</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/847.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">中野梓</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1164</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2523.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">天野阳菜</p>
<p class="contestantSeries">天气之子</p>
</div>






<h3 class="contestantVotes contestantInfo ">730</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3161.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">丰川祥子</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1342</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2131.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">春日野穹</p>
<p class="contestantSeries">缘之空</p>
</div>






<h3 class="contestantVotes contestantInfo ">743</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/263.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">小鸟游六花</p>
<p class="contestantSeries">中二病也要谈恋爱！</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1519</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/379.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">灰原哀</p>
<p class="contestantSeries">名侦探柯南</p>
</div>






<h3 class="contestantVotes contestantInfo ">547</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/748.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">千反田爱瑠</p>
<p class="contestantSeries">冰菓</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">988</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3222.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">周防有希</p>
<p class="contestantSeries">不时轻声地以俄语遮羞的邻座艾莉同学</p>
</div>






<h3 class="contestantVotes contestantInfo ">766</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/2432.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">四宫辉夜</p>
<p class="contestantSeries">辉夜大小姐想让我告白～天才们的恋爱头脑战～</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1172</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/473.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">阿尔托莉雅·潘德拉贡</p>
<p class="contestantSeries">Fate系列</p>
</div>






<h3 class="contestantVotes contestantInfo ">835</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/1342.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">白</p>
<p class="contestantSeries">NO GAME NO LIFE 游戏人生</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1378</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/270.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">古河渚</p>
<p class="contestantSeries">CLANNAD</p>
</div>






<h3 class="contestantVotes contestantInfo ">630</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/951.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">宫水三叶</p>
<p class="contestantSeries">你的名字。</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">986</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/844.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">平泽忧</p>
<p class="contestantSeries">轻音少女</p>
</div>






<h3 class="contestantVotes contestantInfo ">913</h3>


</div>
</div>



</div>


<div class="resultsArenaGroup">





<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3164.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">若叶睦</p>
<p class="contestantSeries">BanG Dream!</p>
</div>






<h3 class="contestantVotes contestantInfo victoryText">1320</h3>


</div>
</div>

<div class="resultArenaPosition">
<div class="resultArenaContestant">

<img class="contestantFlag contestantInfo" src="https://cdn.isml.app/static/avatar/main/3169.png">

<div class="contestantTitle contestantInfo">
<p class="contestantName">菲伦</p>
<p class="contestantSeries">葬送的芙莉莲</p>
</div>






<h3 class="contestantVotes contestantInfo ">761</h3>


</div>
</div>



</div>

</div>
        '''
    }
]

