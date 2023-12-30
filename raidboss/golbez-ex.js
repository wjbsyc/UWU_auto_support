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
  zoneId:  ZoneId.TheVoidcastDaisExtreme,
  triggers: [
      // {
      //   id: 'golbez shadow add',
      //   netRegex: NetRegexes.addedCombatant({ npcNameId: "12366", npcBaseId: "16218" }),  
      //   run: (data, matches, output) => {
      //       (data.golbezShadow ??= []).push(matches);
      //     },
      // },
    {
      id: 'golbez gale sphere',
      netRegex: NetRegexes.ability({ id: ["8452","8451","8450","844F"] }),
      durationSeconds: 10,
      preRun: (data, matches, output) => {
          data.CurrGolbezShadowId = parseInt(matches.sourceId,16);
          (data.GolbezShadowOrder ??=[]).push({"id":data.CurrGolbezShadowId,dir:""});
      },
      delaySeconds: 1,
      promise: async (data) => {
          data.currShadowIndex ??=0;
          data.combatantData = (await callOverlayHandler({
            call: 'getCombatants',
            ids: [data.GolbezShadowOrder[data.currShadowIndex].id],
          })).combatants;
          data.currShadowIndex++;
      }, 
      alertText: (data, matches, output) => {
        var [combatant] = data.combatantData;
        data.SphereDirIndex ??= [];
        if (combatant === undefined || data.combatantData.length !== 1) return ;
        const shadow_heading = hdgTo4DirNum(combatant.Heading);
        var SphereDir = (shadow_heading + 2)%4;
        var shadow = data.GolbezShadowOrder.find((x) => combatant.ID === x.id);
        shadow.dir = (index2ABCD[SphereDir]);
        if (data.currShadowIndex == 4){
            var ret_text = `风球顺序:${data.GolbezShadowOrder[0].dir} ${data.GolbezShadowOrder[1].dir} ${data.GolbezShadowOrder[2].dir} ${data.GolbezShadowOrder[3].dir}`;
            HTTPpostNamazu('command', `/e ${ret_text}`); 
            data.currShadowIndex = 0;
            return {cn: ret_text};
       }
      },
    },
    {
      id: 'Azdaja Shadow 1',
      netRegex: NetRegexes.ability({ id: ["8478"] }),
      alertText: (data, matches, output) => {
         HTTPpostNamazu('command', "/e 钢铁 分摊"); 
         return {cn: '钢铁 分摊'};
      },
    },
    {
      id: 'Azdaja Shadow 2',
      netRegex: NetRegexes.ability({ id: ["8479"] }),
      alertText: (data, matches, output) => {
         HTTPpostNamazu('command', "/e 月环 分散"); 
         return {cn: '月环 分散'};
      },
    },
    {
      id: 'GolbezEx Phases of the Shadow',
      netRegex: NetRegexes.startsUsing({ id: ['86E7'], capture: false }),
      alertText: {cn: "后 => 前"},
    },
  ],
});