const port = 2019;  //鲶鱼精邮差所监听的端口
function HTTPpostNamazu(command, data) {
  fetch(`http://127.0.0.1:${port}/${command}`, {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type": "application/json"},
    body: data
  });
}
const centerX = 100;
const centerY = 100;
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
  'A',
  'A-B中间',
  'B',
  'B-C中间',
  'C',
  'C-D中间',
  'D',
  'A-D中间',
];
const index2ABCD = [
  'A/北',
  'B/东',
  'C/南',
  'D/西',
];
function firemark(actorID, markType) {
  // if (isWS) return;
  try {
    callOverlayHandler({
      call: "PostNamazu",
      c: "mark",
      p: JSON.stringify({ ActorID: actorID, MarkType: markType }),
    });
  } catch {}
}
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
function hdgTo4DirNum(heading) {
  // N = 0, E = 1, S = 2, W = 3
  return (Math.round(2 - heading * 2 / Math.PI) % 4 + 4) % 4;
};

function addedCombatantPosTo8Dir(combatant,centerX,centerY) {
    const x = parseFloat(combatant.x);
    const y = parseFloat(combatant.y);
    return xyTo8DirNum(x, y, centerX, centerY);
};

Options.Triggers.push({
  zoneId: ZoneId.TheWeaponsRefrainUltimate,
  triggers: [
      {
        id: 'UWU Phase Tracker',
        // 2B53 = Slipstream
        // 2B5F = Crimson Cyclone
        // 2CFD = Geocrush
        // 2CF5 = Intermission
        // 2B87 = Tank Purge
        // 2D4C = Ultimate Annihilation
        // 2D4D = Ultimate Suppression
        netRegex: NetRegexes.ability({ id: ["2B53", "2B5F", "2CFD", "2CF5", "2B87", "2D4C", "2D4D"] }),
        run: (data, matches) => {
          data.bossId ??= {};
          data.phase ??= "garuda";
          if (data.phase === "garuda" && matches.id === "2B53") {
            data.bossId.garuda = matches.sourceId;
          } else if (data.phase === "garuda" && matches.id === "2B5F") {
            data.phase = "ifrit";
            data.bossId.ifrit = matches.sourceId;
          } else if (data.phase === "ifrit" && matches.id === "2CFD") {
            data.phase = "titan";
            data.bossId.titan = matches.sourceId;
          } else if (data.phase === "titan" && matches.id === "2CF5") {
            data.phase = "intermission";
          } else if (data.phase === "intermission" && matches.id === "2B87") {
            data.phase = "predation";
            data.bossId.ultima = matches.sourceId;
          } else if (matches.id === "2D4C") {
            data.phase = "annihilation";
          } else if (matches.id === "2D4D") {
            data.phase = "suppression";
          }
        },
    },
    {
      id: 'UWU Ifrit Woken',
      netRegex: NetRegexes.gainsEffect({ target: "伊弗利特", effectId: "5F9", capture: false }),
      sound: 'Long',
      run: (data) => {
        data.ifritAwoken = true;
      },
    },
    {
      // Wait after suppression for primal triggers at the end.
      id: 'UWU Phase Tracker Finale',
      netRegex: NetRegexes.ability({ source: '究极神兵', id: '2D4D', capture: false }),
      delaySeconds: 74,
      run: (data) => data.phase = 'finale',
    },
    {
      id: 'UWU Garuda Aerial Blast',
      netRegex: NetRegexes.startsUsing({ id: ["2B55"], capture: false }),
      alertText: {cn: '大气爆发 减伤'},
      tts: {cn: '大气爆发 减伤'},
    },
    {
      id: 'UWU Garuda Sisters Location',
      netRegex: NetRegexes.startsUsing({ id: ["2B55"], capture: false  }),
      /*
      [21:13:53.626] StartsCasting 14:400188D4:Garuda:2B55:Aerial Blast:400188D4:Garuda:2.700:100.00:100.00:0.00:0.00
      [21:13:56.607] AOEActionEffect 16:400188D4:Garuda:2B55:Aerial Blast:XXXXXXXX:Tiny Poutini:350003:1F560000:1B:2B558000:0:0:0:0:0:0:0:0:0:0:0:0:22867:25795:10000:10000:::100.33:97.62:0.00:0.01:693098:1664845:34464:10000:::100.00:100.00:0.00:0.00:0000D57F:7:8
      [21:14:07.587] 261 105:Change:400188CC:Heading:0.0000:PosX:94.0000:PosY:100.0000:PosZ:0.0000
      [21:14:07.587] 261 105:Change:400188CB:Heading:0.0000:PosX:106.0000:PosY:100.0000:PosZ:0.0000
      [21:14:11.772] StartsCasting 14:400188C6:Garuda:2B4D:Feather Rain:E0000000::0.700:101.06:101.93:0.00:0.00
      [21:14:11.772] StartsCasting 14:400188C7:Garuda:2B4D:Feather Rain:E0000000::0.700:101.30:101.74:0.00:0.00
      [21:14:11.772] StartsCasting 14:400188C8:Garuda:2B4D:Feather Rain:E0000000::0.700:100.79:102.21:0.00:0.00
      [21:14:11.772] StartsCasting 14:400188C9:Garuda:2B4D:Feather Rain:E0000000::0.700:100.50:101.45:0.00:0.00
      [21:14:11.772] StartsCasting 14:400188CA:Garuda:2B4D:Feather Rain:E0000000::0.700:100.80:102.30:0.00:0.00
      [21:14:11.969] 261 105:Change:400188CB:Heading:0.0000:ModelStatus:16384:PosX:100.0000:PosY:80.5000:PosZ:0.0000
      [21:14:11.969] 261 105:Change:400188CC:Heading:3.1416:ModelStatus:16384:PosX:100.0000:PosY:119.5000:PosZ:0.0000
      [21:14:14.448] TargetIcon 1B:XXXXXXXX:Tiny Poutini:0000:0000:0010:0000:0000:0000
      */
      condition: (data) => data.phase === 'garuda',
      delaySeconds: 19,
      promise: async (data) => {
        data.combatantData = [];

        // TODO: it'd be nice if this function allowed filtering by name ids.
        data.combatantData = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
      },
      alertText: (data, _matches, output) => {
        // These two sisters are added before the pull starts,
        // but they are the only two with these names.
        // 1645 = Suparna
        // 1646 = Chirada
        const sisters = data.combatantData.filter((x) =>
          x.BNpcNameID === 1645 || x.BNpcNameID === 1646
        );
        const [dir1, dir2] = sisters.map((c) =>
          xyTo4DirNum(c.PosX, c.PosY, centerX, centerY)
        ).sort();
        if (dir1 === undefined || dir2 === undefined || sisters.length !== 2)
          return {cn:"分身未找到" };

        const map = {
          0: "北(A)",
          1: "东(B)",
          2: "南(C)",
          3: "西(D)",
        } ;
        const target_1 = map[dir1];
        const target_2 = map[dir2];
        try {
          callOverlayHandler({
            call: "PostNamazu",
            c: "command",
            p: `/p 分身: ${target_1} / ${target_2}`,
          });
        } catch { };
        try{
         HTTPpostNamazu('command', `/p 分身: ${target_1} / ${target_2} `);
        }catch { };
        return {cn:`分身: ${target_1} / ${target_2}` };
      },
    },
    {
      id: 'UWU Ifrit Hellfire',
      netRegex: NetRegexes.ability({ id: ["2B5E"] }),
      alertText: {cn: '减伤'},
      tts: {cn: '减伤'},
    },
    {
      id: 'UWU Ifrit Incinerate',
      netRegex: NetRegexes.ability({ id: ["2B56"] }),
      alertText: {cn: '无敌'},
      tts: {cn: '无敌'},
    },
    {
      id: 'UWU Ifrit Nail Adds',
      netRegex: NetRegexes.addedCombatant({ npcNameId: "1186", npcBaseId: "8731" }),  
      preRun: (data, matches, output) => {
          (data.nailAdds ??= []).push(matches);
      },
      alertText: (data, _matches, output) => {
        var nailLength = data.nailAdds.length;
        if( nailLength == 4)
        {
          return {cn: `火神柱出现`};
        }
      },
      run: (data) => {
        var nails = [];
        var nailLength = data.nailAdds.length;
        if (nailLength == 4)
        {
          for(var i = 0;i < 4;i++)
          {
            nails.push({
              id: data.nailAdds[i].id,
              index: addedCombatantPosTo8Dir(data.nailAdds[i], centerX, centerY),
              mark: -1,
            });
          }
          nails.sort(function(a,b) {
                return a.index - b.index
          });
          data.nails = nails;
          var delta1 = nails[1].index - nails[0].index;
          if(delta1 < 0) delta1 = delta1 + 8;
          if(delta1 % 8 == 3) {
            nails[0].mark = 1;
            nails[1].mark = 2;
          }
          if(delta1 % 8 == 1) {
            nails[0].mark = 4;
            nails[1].mark = 3;
          }
          var delta2 = nails[2].index - nails[1].index;
          if(delta2 < 0) delta2 = delta2 + 8;
          if(delta2 % 8 == 3) {
            nails[1].mark = 1;
            nails[2].mark = 2;
          }
          if(delta2 % 8 == 1) {
            nails[1].mark = 4;
            nails[2].mark = 3;
          }
          var delta3 = nails[3].index - nails[2].index;
          if(delta3 < 0) delta3 = delta3 + 8;
          if(delta3 % 8 == 3) {
            nails[2].mark = 1;
            nails[3].mark = 2;
          }
          if(delta3 % 8 == 1) {
            nails[2].mark = 4;
            nails[3].mark = 3;
          }
          var delta4 = nails[0].index - nails[3].index;
          if(delta4 < 0) delta4 = delta4 + 8;
          if(delta4 % 8 == 3) {
            nails[3].mark = 1;
            nails[0].mark = 2;
          }
          if(delta4 % 8 == 1) {
            nails[3].mark = 4;
            nails[0].mark = 3;
          }
          for(var j = 0 ;j < 4; j++)
          {
            try {
              callOverlayHandler({
                call: "PostNamazu",
                c: "command",
                p: `/e ${nails[j].index} ${nails[j].id} ${nails[j].mark}`,
              });
            } catch {};
            try{
             HTTPpostNamazu('command', `/e ${nails[j].index} ${nails[j].id} ${nails[j].mark}`); 
            }catch {};
            try{
              var int_id = parseInt(nails[j].id,16);
              HTTPpostNamazu('mark', `{ \"ActorID\": ${int_id}, \"MarkType\": \"attack${nails[j].mark}\" }`);
            }catch{};        
          }
        }
      },
    },
    {
      id: 'UWU Ifrit Nail Deaths',
      netRegex: NetRegexes.ability({ id: ["2B58"] }),
      condition: (data, matches) => {
        data.nailDeaths ??= {};
        return (data.nailDeaths[matches.sourceId] === undefined );
      },
      preRun: (data, matches, output) => {
          data.nailDeaths ??= {};
          if(data.nailDeaths[matches.sourceId] === undefined)
          {
             data.nailDeaths[matches.sourceId] = matches;
             (data.nailDeathOrder ??= []).push(matches.sourceId);
          }
          
      },
      alertText: (data, _matches, output) => {
        var nailDeathsLen = data.nailDeathOrder.length;
        if( nailDeathsLen > 0)
        {
          var nail_id = data.nailDeathOrder[nailDeathsLen - 1];
          var nail_mark = -1;
          for (var i = 0 ;i < 4 ; i++)
          {
            if(data.nails[i].id === nail_id){
              nail_mark = data.nails[i].mark;
              break;
            }
          }

          if(nail_mark != -1) {    
            return {cn: `${nail_mark}柱炸`};
          }
          else return {cn: "不知道哪根柱子炸了"};
        }
      },
      run: (data, _matches, output) => {
        var nailDeathsLen = data.nailDeathOrder.length;          
        if(nailDeathsLen == 4)
        {
            var ret_text = "";
            var first_nail_id = data.nailDeathOrder[0];
            for (var i = 0 ;i < 4 ; i++)
            {
              if(data.nails[i].mark === 3 || data.nails[i].mark === 4)
              {
                if( (data.nails[i].index % 2) == 1)
                {
                  var safeP = (data.nails[i].index + 4) % 8;
                  ret_text += `安全点:${index2mark[safeP]}|`;
                }
              }
              if(data.nails[i].id === first_nail_id)
              {
                if(data.nails[i].mark === 1)
                {
                  var startP = (data.nails[i].index + 1) % 8;
                  data.startP = startP;
                  data.run_dir = 0;
                  ret_text += `起跑点(逆时针):${index2mark[startP]}|`
                }
                 if(data.nails[i].mark === 2)
                 {
                   var startP = data.nails[i].index -1;
                   if (startP < 0) startP = startP+8;
                   data.startP = startP;
                   data.run_dir = 1;
                   ret_text += `起跑点(顺时针):${index2mark[startP]}|`
                 }
              }
            }
            try {
              callOverlayHandler({
                call: "PostNamazu",
                c: "command",
                p: `/p ${ret_text}`,
              });
            } catch {};
            try{
             HTTPpostNamazu('command', `/p ${ret_text}`); 
            }catch {};
        }
      },
    },
    {
      id: 'UWU Ifrit Name Toggle Counter',
      netRegex: NetRegexes.nameToggle({ name: "伊弗利特", toggle: "00", capture: false }),
      run: (data) => {
        data.ifritUntargetableCount ??= 0;
        data.ifritUntargetableCount++;
      },
    },
    {
      id: 'UWU Ifrit Dash Destination',
      netRegex: NetRegexes.nameToggle({ name: "伊弗利特", toggle: "00", capture: false }),
      condition: (data) => data.ifritUntargetableCount === 2 && data.ifritAwoken,
      // Here's one log file example for this timing.
      // [20:38:36.510] NameToggle 22:40017C12:Ifrit:40017C12:Ifrit:00
      // [20:38:38.245] 261 105:Change:40017C12:Heading:2.3562:PosX:86.3000:PosY:113.7000:PosZ:0.0000
      // [20:38:40.919] StartsCasting 14:40017C0F:Ifrit:2B5F:Crimson Cyclone:40017C0F:Ifrit:2.700:113.70:113.70:0.00:-2.36
      // [20:38:42.343] StartsCasting 14:40017C11:Ifrit:2B5F:Crimson Cyclone:40017C11:Ifrit:2.700:100.00:80.50:0.00:0.00
      // [20:38:43.725] StartsCasting 14:40017C12:Ifrit:2B5F:Crimson Cyclone:40017C12:Ifrit:2.700:86.30:113.70:0.00:2.36
      // [20:38:45.152] StartsCasting 14:40017C10:Ifrit:2B5F:Crimson Cyclone:40017C10:Ifrit:2.700:80.50:100.00:0.00:1.57
      delaySeconds: 2.5,
      promise: async (data) => {
        data.combatantData = [];
        if (data.bossId.ifrit === undefined)
          return;

        // The real Ifrit is the one that is Awoken so find where he is.
        data.combatantData = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(data.bossId.ifrit, 16)],
        })).combatants;
      },
      alertText: (data, _matches, output) => {
        // If killed before dashes occur, and geocrush has started casting, suppress this.
        if (data.phase === 'titan') return;
        var combatant = undefined;
        var [combatant] = data.combatantData;
        if (combatant === undefined || data.combatantData.length !== 1) return;
        const real_ifrit_dest = xyTo8DirNum(combatant.PosX,combatant.PosY,centerX,centerY);
        var ret_text = "";
        if(real_ifrit_dest % 2 )  {
          //本体在斜点，0逆时针，1顺时针
          var startP = data.startP;
          var run_dir = data.run_dir;
          if(run_dir)//顺时针去奇数
          {
            var endP = (((startP+1) % 2) ? (startP+1) : (startP+2))%8;
            ret_text = `本体在斜点,终点:${index2mark[endP]}`;
          }
          else//逆时针去奇数
          {
             var endP = (((startP-1) % 2) ? (startP-1) : (startP-2));
             if (endP < 0) endP = endP + 8;
             ret_text = `本体在斜点,终点:${index2mark[endP]}`;
          }
        }
        else {
          //本体在正点，0逆时针，1顺时针
          var startP = data.startP;
          var run_dir = data.run_dir; 
          if(run_dir)//顺时针去偶数
          {
            var endP = (((startP+1) % 2) ? (startP+2) : (startP+1))%8;
            ret_text = `本体在正点,终点:${index2mark[endP]}`;
          }
          else//逆时针去偶数
          {
             var endP = (((startP-1) % 2) ? (startP-2) : (startP-1));
             if (endP < 0) endP = endP + 8;
             ret_text = `本体在正点,终点:${index2mark[endP]}`;
          }         
        }
        try {
          callOverlayHandler({
            call: "PostNamazu",
            c: "command",
            p: `/p ${ret_text}`,
          });
        } catch {};
        try{
         HTTPpostNamazu('command', `/p ${ret_text}`); 
        }catch {}; 
        return  {cn: ret_text};      
      },
    },
    {
      id: 'UWU Titan Name Toggle Counter',
      netRegex: NetRegexes.nameToggle({ name: "泰坦", toggle: "00", capture: false }),
      run: (data) => {
        data.TitanUntargetableCount ??= 0;
        data.TitanUntargetableCount++;
      },
    },
    {
      id: 'UWU Titan Jump Point 1',
      netRegex: NetRegexes.nameToggle({ name: "泰坦", toggle: "00", capture: false }),
      condition: (data) => data.TitanUntargetableCount === 1 ,
      delaySeconds: 0.3,
      promise: async (data) => {
        data.combatantData = [];

        // The real Ifrit is the one that is Awoken so find where he is.
        data.combatantData = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(data.bossId.titan, 16)],
        })).combatants;
      },
      alertText: (data, _matches, output) => {
        // If killed before dashes occur, and geocrush has started casting, suppress this.
        var combatant = undefined;
        var [combatant] = data.combatantData;
        if (combatant === undefined || data.combatantData.length !== 1) return;
        const titan_jump_p = hdgTo4DirNum(combatant.Heading);
        var titan_safe_p = (titan_jump_p + 2)%4;
        var titan_safe_dir = index2ABCD[titan_safe_p] ;
        return {cn:`去${titan_safe_dir}`};
      },
    },
    {
      id: 'UWU Titan Jump Point 2',
      netRegex: NetRegexes.nameToggle({ name: "泰坦", toggle: "00", capture: false }),
      condition: (data) => data.TitanUntargetableCount === 2,
      delaySeconds: 0.2,
      promise: async (data) => {
        data.combatantData = [];

        // The real Ifrit is the one that is Awoken so find where he is.
        data.combatantData = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(data.bossId.titan, 16)],
        })).combatants;
      },
      alertText: (data, _matches, output) => {
        // If killed before dashes occur, and geocrush has started casting, suppress this.
        var combatant = undefined;
        var [combatant] = data.combatantData;
        if (combatant === undefined || data.combatantData.length !== 1) return;
        const titan_jump_p = hdgTo4DirNum(combatant.Heading);
        var titan_safe_p = (titan_jump_p + 2)%4;
        var titan_safe_dir = index2ABCD[titan_safe_p] ;
        return {cn:`去${titan_safe_dir}`};
      },
    },
    {
      id: 'UWU Predation A',
      netRegex: NetRegexes.startsUsing({ id: "2B76", capture: false }),
      // [21:55:41.426] StartsCasting 14:4000BB88:The Ultima Weapon:2B76:Ultimate Predation:4000BB88:The Ultima Weapon:2.700:99.99:89.98:0.00:3.14
      // [21:55:44.404] ActionEffect 15:4000BB88:The Ultima Weapon:2B76:Ultimate Predation:4000BB88:The Ultima Weapon:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:3215688:3746181:0:10000:::99.99:89.98:0.00:3.14:3215688:3746181:0:10000:::99.99:89.98:0.00:3.14:0000A459:0:1
      // [21:55:48.850] NameToggle 22:4000BB88:The Ultima Weapon:4000BB88:The Ultima Weapon:00
      // [21:55:50.500] 261 105:Change:4000BB8E:Heading:-2.3563:PosX:103.0000:PosY:103.0000:PosZ:0.0000
      // [21:55:50.500] 261 105:Change:4000BB89:Heading:-1.5709:PosX:117.0000:PosY:97.0000:PosZ:0.0000
      // [21:55:50.500] 261 105:Change:4000BB8D:Heading:-2.3563:PosX:113.7000:PosY:113.7000:PosZ:0.0000
      // [21:55:50.500] 261 105:Change:4000BB88:Heading:2.3562:PosX:88.0000:PosY:112.0000:PosZ:0.0000
      // [21:55:56.229] StartsCasting 14:4000BB8D:Ifrit:2B5F:Crimson Cyclone:4000BB8D:Ifrit:2.700:113.70:113.70:0.00:-2.36
      delaySeconds: 10,
      durationSeconds: 5,
      promise: async (data) => {
        data.combatantData = [];

        const hexIds = Object.values(data.bossId);

        data.combatantData = (await callOverlayHandler({
          call: 'getCombatants',
          ids: hexIds.map((x) => parseInt(x, 16)),
        })).combatants;
      },
      alertText: (data, _matches, output) => {


        const garuda_hexId = data.bossId['garuda'];
        const garuda_decId = parseInt(garuda_hexId, 16);
        const garuda = data.combatantData.find((x) => x.ID === garuda_decId);

        const ifrit_hexId = data.bossId['ifrit'];
        const ifrit_decId = parseInt(ifrit_hexId, 16);
        const ifrit = data.combatantData.find((x) => x.ID === ifrit_decId);

        const titan_hexId = data.bossId['titan'];
        const titan_decId = parseInt(titan_hexId, 16);
        const titan = data.combatantData.find((x) => x.ID === titan_decId); 

        const ultima_hexId = data.bossId['ultima'];
        const ultima_decId = parseInt(ultima_hexId, 16);
        const ultima = data.combatantData.find((x) => x.ID === ultima_decId); 

        if (
          garuda === undefined || ifrit === undefined || titan === undefined || ultima === undefined
        )
          return;

        // Garuda always at +/- 3 from center on an intercardinal.
        const garudaDir = xyTo8DirNum(garuda.PosX, garuda.PosY, centerX, centerY);
        if (garudaDir % 2 === 0)
          return;

        // e.g. Garuda is NW (7), the two safe directions are E (2) and S (4).
        let safeDir = [(garudaDir + 3) % 8, (garudaDir + 5) % 8];

        // Titan appears slightly offset from a cardinal. Never run out towards Titan.
        // TODO: Titan is slightly offset and you could theoretically pick a slightly
        // safer cardinal in some cases (I think?) depending on how landslides aim from there.
        const titanDir = xyTo8DirNum(titan.PosX, titan.PosY, centerX, centerY);
        safeDir = safeDir.filter((x) => x !== titanDir);

        // Ultima appears on an intercardinal. If Ultima is adjacent to only one of the safe spots,
        // then pick the other safe spot because it will have more safe directions to run 2nd.
        const ultimaDir = xyTo8DirNum(ultima.PosX, ultima.PosY, centerX, centerY);

        const notAdjacentToUltima = safeDir.filter((x) => {
          const isAdjacentToUltima = x === (ultimaDir + 1) % 8 || ultimaDir === (x + 1) % 8;
          return !isAdjacentToUltima;
        });
        // If there's at least one cardinal not next to Ultima, pick one of those.
        if (notAdjacentToUltima.length !== 0)
          safeDir = safeDir.filter((x) => notAdjacentToUltima.includes(x));

        // Ifrit always is on an intercard and dashes through it.
        const ifritDir = xyTo8DirNum(ifrit.PosX, ifrit.PosY, centerX, centerY);

        const dirStrMap = {
          0: "北(A)",
          2: "东(B)",
          4: "南(C)",
          6: "西(D)",
        } ;

        // (1) Do any of our safe spots have an early safe spot where you could
        // go stand on the wall immediately?
        for (const dir of safeDir) {
          for (const run of [-1, 1]) {
            const final = (dir + run + 8) % 8;
            if (final === ultimaDir)
              continue;
            // Will Ifrit dash through this or the opposite side?
            if (final % 4 === ifritDir % 4)
              continue;
            const rotation = run === -1 ? "逆时针" : "顺时针";
            try {
              callOverlayHandler({
                call: "PostNamazu",
                c: "command",
                p: `/p 去${ dirStrMap[dir]} 然后马上 ${rotation}`,
              });
            } catch {};
            try{
             HTTPpostNamazu('command', `/p 去${ dirStrMap[dir]} 然后马上 ${rotation}`); 
            }catch {}; 
            return {cn: `去${ dirStrMap[dir]} 然后马上 ${rotation}`};
            //return output.early!({ dir: dirStrMap[dir], rotation: rotation });
          }
        }

        // (2) Are any safe spots opposite of Garuda (and not by Ultima)?
        const garudaOpposite = (garudaDir + 4) % 8;
        for (const dir of safeDir) {
          for (const run of [-1, 1]) {
            const final = (dir + run + 8) % 8;
            if (final === ultimaDir)
              continue;
            if (final !== garudaOpposite)
              continue;
            const rotation = run === -1 ? "逆时针" : "顺时针";
            try {
              callOverlayHandler({
                call: "PostNamazu",
                c: "command",
                p: `/p 去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`,
              });
            } catch {};
            try{
             HTTPpostNamazu('command', `/p 去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`); 
            }catch {}; 
            return {cn: `去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`};
            //return output.normal!({ dir: dirStrMap[dir], rotation: rotation });
          }
        }

        // (3) Otherwise, just pick any safe spot and direction away from Ultima.
        for (const dir of safeDir) {
          for (const run of [-1, 1]) {
            // If both directions were safe from Ultima, we would have found an early spot,
            // since one of them would be safe from Ifrit as well. So, not possible to
            // say "either direction" here, so just pick the first safe direction.
            const final = (dir + run + 8) % 8;
            if (final === ultimaDir)
              continue;
            const rotation = run === -1 ? "逆时针" : "顺时针";
            try {
              callOverlayHandler({
                call: "PostNamazu",
                c: "command",
                p: `/p 去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`,
              });
            } catch {};
            try{
             HTTPpostNamazu('command', `/p 去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`); 
            }catch {}; 
            return {cn: `去${ dirStrMap[dir]} 等火神冲 然后 ${rotation}`};
            //return output.normal!({ dir: dirStrMap[dir], rotation: rotation });
          }
        }
      },
    },
    {
      id: 'UWU Apply Viscous',
      netRegex: NetRegexes.gainsEffect( {effectId: "5FC", capture: false }),
      alertText: {cn: '吸附式炸弹'}, 
    },
     {
      id: 'UWU Ultimate Suppression',
      netRegex: NetRegexes.startsUsing({ id: "2D4D", capture: false }),
      alertText: {cn: '三运 找泰坦'},
    },
     {
      id: 'UWU Ultimate TANK LB LB LB',
      netRegex: NetRegexes.startsUsing({ id: "2B8B", capture: false }),
      alertText: {cn: '坦克LB'},
    },
    // --------- Primal Roulette ----------
    {
      id: 'UWU Garuda Finale',
      netRegex: NetRegexes.ability({ source: '究极神兵', id: '2CD3', capture: false }),
      condition: (data) => data.phase === 'finale',
      alertText: {cn: "迦楼罗"},
    },
    {
      id: 'UWU Ifrit Finale',
      netRegex: NetRegexes.ability({ source: '究极神兵', id: '2CD4', capture: false }),
      condition: (data) => data.phase === 'finale',
      alertText: {cn: "伊弗利特"},
    },
    {
      id: 'UWU Titan Finale',
      type: 'Ability',
      netRegex: NetRegexes.ability({ source: '究极神兵', id: '2CD5', capture: false }),
      condition: (data) => data.phase === 'finale',
      alertText: {cn: "泰坦"},
    },
  ],
});
