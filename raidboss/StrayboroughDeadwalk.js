const port = 2019;  //鲶鱼精邮差所监听的端口
function HTTPpostNamazu(command, data) {
  fetch(`http://127.0.0.1:${port}/${command}`, {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type": "application/json"},
    body: data
  });
}
const centerX = 17;
const centerY = -170;
const output16Dir = [
  'dirN',
  'dirNNE',
  'dirNE',
  'dirENE',
  'dirE',
  'dirESE',
  'dirSE',
  'dirSSE',
  'dirS',
  'dirSSW',
  'dirSW',
  'dirWSW',
  'dirW',
  'dirWNW',
  'dirNW',
  'dirNNW',
];

const index2mark = [
  '上/北',
  '右上/东北',
  '右/东',
  '右下/东南',
  '下/南',
  '左下/西南',
  '左/西',
  '左上/西北',
];
const index2ABCD = [
  '上/北',
  '右/东',
  '下/南',
  '左/西',
];

function xyTo4DirNum(x, y, centerX, centerY) {
  // N = 0, E = 1, S = 2, W = 3
  x = x - centerX;
  y = y - centerY;
  return Math.round(2 - 2 * Math.atan2(x, y) / Math.PI) % 4;
};
function xyTo8DirNum(x, y, centerX, centerY){
  // N = 0, NE = 1, ..., NW = 7
  x = x - centerX;
  y = y - centerY;
  return Math.round(4 - 4 * Math.atan2(x, y) / Math.PI) % 8;
};

function xyToInOut(x, y, centerX, centerY) {
	//1 outer, 0 inner
	var x = Math.abs(x - centerX);
	var y = Math.abs(y - centerY);
	var r =  Math.sqrt(x * x + y * y);
	if(r > 12) return 1;
	else return 0
}

Options.Triggers.push({
 zoneId: ZoneId.TheStrayboroughDeadwalk,
 triggers: [
 	{
 		id: 'Troubling Teacups',
      	netRegex: NetRegexes.startsUsingExtra({ id: ["8F71"] }),
		preRun: (data, matches, output) => {
		  (data.Teacups ??= []).push(matches);
		},
	},
	{
		id: 'Tea Awhirl',
		netRegex: NetRegexes.startsUsing({ id: ["8F6D"] }),
		delaySeconds: 1,
		alertText: (data, _matches, output) => {
	        var cups = [];
	        var cupsLen = data.Teacups.length;
	        var ret_text = "不知道去哪";
	        switch (cupsLen)
	        {
		        case 1:
		        	var x = parseFloat((data.Teacups[0].x));
		        	var y = parseFloat(data.Teacups[0].y);
		        	ret_text = `去:${index2ABCD[xyTo4DirNum(x, y, centerX, centerY)]}`
		        	break;
		        case 2:
		        	for(var i = 0;i < 2;i++)
					{
						cups.push({
							id: data.Teacups[i].sourceId,
							dir: xyTo8DirNum(parseFloat(data.Teacups[i].x), parseFloat(data.Teacups[i].y), centerX, centerY),
							rad: xyToInOut(parseFloat(data.Teacups[i].x), parseFloat(data.Teacups[i].y), centerX, centerY),
						});
					}
					cups.sort(function(a,b) {
					    return a.dir - b.dir
					});
					var delta = cups[1].dir - cups[0].dir;
					if(delta  >  4) delta = delta - 4 ; 		
					if(cups[0].rad + cups[1].rad == 2) //all outer
					{ 
						if(delta == 4) //180
						{
							var safe1 = (cups[0].dir + 1 ) % 8;
							var safe2 = (cups[1].dir + 1 ) % 8;
							ret_text = `去:${index2mark[safe1]} 或 ${index2mark[safe2]}`;
							break;	
						}
						if(delta  == 2 ) // 90
						{
							if(cups[1].dir - cups[0].dir  > 4 )
							{
								var safe = (cups[0].dir + 1) % 8;
							}
							else 
							{
								var safe = (cups[1].dir + 1) % 8;
							} 
							ret_text = `去:${index2mark[safe]}`;
							break;	
						}
					}
					if(cups[0].rad + cups[1].rad == 0) // all inner 
					{
						if(delta == 4) //180
						{
							var safe1 = (cups[0].dir + 7 ) % 8;
							var safe2 = (cups[1].dir + 7 ) % 8;
							ret_text = `去:${index2mark[safe1]} 或 ${index2mark[safe2]}`;
							break;							
						}
						else //do not know
						{
							data.waitSpin = true;
							data.SavedCups = cups; 
							ret_text = `等等`;
							return  {cn: ret_text};							
						}
					}
					if(cups[0].rad + cups[1].rad == 1) // 1 inner, 1 outter
					{
						data.waitSpin = true;
						data.SavedCups = cups; 
						ret_text = `等等`;
						return  {cn: ret_text};	
					}
					break;
		        default:	
		        	ret_text =  "不知道去哪";
		        	break;
	        }
	        data.Teacups = [];
	        return  {cn: ret_text};		
		},
	},
	{
		id: 'Tea Awhirl 2',
		netRegex: NetRegexes.ability({ id: ["8F6D"] }),
		delaySeconds: 1,
		promise: async (data) => {
			if('waitSpin' in data && data.waitSpin == true && data.SavedCups.length == 2)
			{ 
		        // The real Ifrit is the one that is Awoken so find where he is.
		        data.SpinedCups = (await callOverlayHandler({
		          call: 'getCombatants',
		          ids: [parseInt(data.SavedCups[0].id, 16),parseInt(data.SavedCups[1].id, 16)],
		        })).combatants;
	    	}
	    },
		alertText: (data, _matches, output) => {
			var ret_text = "";
			if('SpinedCups' in data && data.SpinedCups.length == 2)
			{
				var x1 = parseFloat(data.SpinedCups[0].PosX);
				var y1 = parseFloat(data.SpinedCups[0].PosY);
				var x2 = parseFloat(data.SpinedCups[1].PosX);
				var y2 = parseFloat(data.SpinedCups[1].PosY);
				var dir1 = xyTo8DirNum(x1,y1,centerX,centerY);
				var dir2 = xyTo8DirNum(x2,y2,centerX,centerY);
				var rdir1 = (dir1 + 4) % 8;
				var rdir2 = (dir2 + 4) % 8;
				if(Math.abs(rdir1 - rdir2) == 4)
				{
					var safe1 = (rdir1+2) % 8;
					var safe2 = (rdir2+2) % 8;
					ret_text = `去:${index2mark[safe1]} 或 ${index2mark[safe2]}`;	
				} 
				else 
				{
					var safe = 0;
					if(Math.abs(rdir1 - rdir2) > 4 ) safe = Math.round((rdir1+rdir2+8)/2) % 8;
					else safe = Math.round((rdir1+rdir2)/2) % 8;
					ret_text = `去:${index2mark[safe]}`;
				}
			}
			else
			{
				return;
			}
			data.SpinedCups = [];
			data.SavedCups = [];
			data.waitSpin = false;
			return  {cn: ret_text};
		},
	},
 ]
});