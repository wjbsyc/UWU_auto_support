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
  zoneId:  ZoneId.TheMinstrelsBalladSphenesBurden,
  triggers: [
    // Phase trackers
    {
      id: 'QueenEternal Ex Phase Tracker Elemental',
      netRegex: NetRegexes.startsUsing( { id: ['A019', 'A01A', 'A01B'], source: 'Queen Eternal', capture: true }),
      run: (data, matches) => {
        switch (matches.id) {
          case 'A019':
            data.phase = 'wind';
            break;
          case 'A01A':
            data.phase = 'earth';
            break;
          case 'A01B':
            data.phase = 'ice';
            break;
        }
      },
    },
    {
      id: 'QueenEternal Ex Phase Tracker P1',
      netRegex: NetRegexes.startsUsing({ id: 'A01C', source: 'Queen Eternal', capture: false }),
      run: (data) => data.phase = 'p1',
    },
    {
      id: 'QueenEternal Ex Phase Tracker P2',
      netRegex: NetRegexes.ability({ id: 'A04B', source: 'Queen Eternal', capture: false }),
      run: (data) => data.phase = 'p2',
    },
    // General triggers
    {
      id: 'QueenEternal Ex General ActorSetPos Tracker',
      netRegex: NetRegexes.actorSetPos({ id: '4[0-9A-F]{7}', capture: true }),
      run: (data, matches) => {
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
        };
      },
    },
    {
      id: 'QueenEternal Ex General Legitimate Force East Safe First',
      netRegex: NetRegexes.startsUsing({ id: 'A01E', source: 'Queen Eternal', capture: false }),
      condition: (data) => ['p1', 'earth', 'ice'].includes(data.phase),
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'QueenEternal Ex General Legitimate Force West Safe First',
      netRegex: NetRegexes.startsUsing({ id: 'A020', source: 'Queen Eternal', capture: false }),
      condition: (data) => ['p1', 'earth', 'ice'].includes(data.phase),
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'QueenEternal Ex World Shatter',
      netRegex: NetRegexes.startsUsing({ id: ['7692', 'A01C'], source: 'Queen Eternal', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Prosecution of War',
      netRegex: NetRegexes.startsUsing({ id: 'A00A', source: 'Queen Eternal', capture: true }),
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'QueenEternal Ex Royal Domain',
      netRegex: NetRegexes.startsUsing({ id: 'A04E', source: 'Queen Eternal', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Virtual Shift',
      netRegex: NetRegexes.startsUsing({ id: ['A019', 'A01A', 'A01B'], source: 'Queen Eternal', capture: false }),
      response: Responses.bigAoe(),
    },

    // Before wind
    {
      id: 'QueenEternal Ex Aethertithe Safe Parties',
      netRegex: NetRegexes.mapEffect({ flags: ['04000100', '08000100', '10000100'], location: '00', capture: true }),
      alertText: (_data, matches, output) => {
        var dirMap = {
          '04000100': 'west',
          '08000100': 'middle',
          '10000100': 'east',       
        } 
        var dirs = ['unknown','unknown'];
        switch(matches.flags)
        {
            case '04000100':
                dirs = ['middle','east'];
                break;
            case '08000100':
                dirs = ['west','east']
                break;
            case '10000100':
                dirs = ['west','middle']
                break;
        }
        var dir1 = dirs[0];
        var dir2 = dirs[1];
        return output.combo({
          dir1: output[dir1](),
          dir2: output[dir2](),
          groups: output.healerGroups(),
        });
      },
      outputStrings: {
        east: Outputs.east,
        middle: Outputs.middle,
        west: Outputs.west,
        healerGroups: Outputs.healerGroups,
        combo: {
          en: '${dir1}/${dir2}, ${groups}',
          de: '${dir1}/${dir2}, ${groups}',
          fr: '${dir1}/${dir2}, ${groups}',
          ja: '${dir1}/${dir2}, ${groups}',
          cn: '${dir1}/${dir2}, ${groups}',
          ko: '${dir1}/${dir2}, ${groups}',
        },
        unknown: Outputs.unknown,
        unknownCombo: {
          en: '${unk} => ${groups}',
          de: '${unk} => ${groups}',
          fr: '${unk} => ${groups}',
          ja: '${unk} => ${groups}',
          cn: '${unk} => ${groups}',
          ko: '${unk} => ${groups}',
        },
      },
    },

    // Wind phase
    {
      id: 'QueenEternal Ex Wind Phase Aeroquell',
      netRegex: NetRegexes.startsUsing({ id: 'A025', source: 'Queen Eternal', capture: false }),
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.stacks(),
      outputStrings: {
        stacks: Outputs.healerGroups,
      },
    },
    {
      id: 'QueenEternal Ex Wind Phase Debuff Collector',
      netRegex: NetRegexes.gainsEffect({ effectId: ['105D', '105E'], capture: true }),
      condition: Conditions.targetIsYou(),
      run: (data, matches) =>
        data.windKnockbackDir = matches.effectId === '105E' ? 'right' : 'left',
    },
    {
      id: 'QueenEternal Ex Wind Phase Legitimate Force',
      netRegex: NetRegexes.startsUsing({ id: ['A01E', 'A020'], source: 'Queen Eternal', capture: true }),
      condition: (data) => data.phase === 'wind',
      delaySeconds: 0.5,
      durationSeconds: 13.3,
      alertText: (data, matches, output) => {
      	var safeDir = 'unknown';
      	if (matches.id == 'A01E'){
      		 safeDir = 'rightLeft';
      	} else {
      		safeDir ='leftRight';
      	}
        // const safeDir: 'leftRight' | 'rightLeft' = matches.id === 'A01E'
        //   ? 'rightLeft'
        //   : 'leftRight';
        const kbDir = data.windKnockbackDir;

        if (kbDir === undefined) {
          return output.comboUnknown({
            break: output.break(),
            safe: output[safeDir](),
            unk: output.unknown(),
          });
        }

        return output.combo({
          break: output.break(),
          safe: output[safeDir](),
          kbDir: output[kbDir](),
        });
      },
      outputStrings: {
        leftRight: Outputs.leftThenRight,
        rightLeft: Outputs.rightThenLeft,
        left: {
          en: 'Knockback Left',
          de: 'Rückstoß Links',
          fr: 'Poussée Gauche',
          cn: '向左击退',
          ko: '왼쪽 넉백',
        },
        right: {
          en: 'Knockback Right',
          de: 'Rückstoß Rechts',
          fr: 'Pousée Droite',
          cn: '向右击退',
          ko: '오른쪽 넉백',
        },
        break: Outputs.breakChains,
        unknown: Outputs.unknown,
        combo: {
          en: '${break} => ${safe} => ${kbDir}',
          de: '${break} => ${safe} => ${kbDir}',
          fr: '${break} => ${safe} => ${kbDir}',
          ja: '${break} => ${safe} => ${kbDir}',
          cn: '${break} => ${safe} => ${kbDir}',
          ko: '${break} => ${safe} => ${kbDir}',
        },
        comboUnknown: {
          en: '${break} => ${safe} => ${unk}',
          de: '${break} => ${safe} => ${unk}',
          fr: '${break} => ${safe} => ${unk}',
          ja: '${break} => ${safe} => ${unk}',
          cn: '${break} => ${safe} => ${unk}',
          ko: '${break} => ${safe} => ${unk}',
        },
      },
    },

    // // After wind
    {
      id: 'QueenEternal Ex Divide and Conquer',
      netRegex: NetRegexes.startsUsing({ id: 'A017', source: 'Queen Eternal', capture: false }),
      alertText: {cn: '八方分散'},
    },

    // // Earth phase
    {
      id: 'QueenEternal Ex Earth Phase Initial Up',
      netRegex: NetRegexes.ability({ id: 'A01A', capture: false }),
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.up(),
      outputStrings: {
        up: {
          en: 'Up',
          de: 'Hoch',
          fr: 'En haut',
          cn: '上浮',
          ko: '공중으로',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase First Towers',
      netRegex: NetRegexes.ability({ id: 'A028', capture: false }),
      delaySeconds: 14.3,
      alertText: (_data, _matches, output) => output.downSoak(),
      outputStrings: {
        downSoak: {
          en: 'Down, soak tower',
          de: 'Runter, Turm nehmen',
          fr: 'En bas, prenez une tour',
          cn: '下降 => 踩塔',
          ko: '하강, 기둥 밟기',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Pillar Collector',
      netRegex: NetRegexes.startsUsing({ id: 'A02C', capture: true }),
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
      run: (data) => data.gravitationalEmpireMech = 'spread',
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Ray Collector',
      netRegex: NetRegexes.tether({ id: '0011', capture: true }),
      condition: (data, matches) => matches.source === data.me,
      alertText: (_data, _matches, output) => output.cone(),
      run: (data) => data.gravitationalEmpireMech = 'cone',
      outputStrings: {
        cone: {
          en: 'Cone on YOU',
          de: 'Kegel auf DIR',
          fr: 'Cône sur VOUS',
          cn: '扇形点名',
          ko: '산개징 대상자',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Gravitational Empire Towers',
      netRegex: NetRegexes.startsUsing({ id: 'A02B', capture: false }),
      delaySeconds: 0.5,
      alertText: (data, _matches, output) => {
        if (data.gravitationalEmpireMech !== 'tower')
          return;

        return output.downSoak();
      },
      outputStrings: {
        downSoak: {
          en: 'Down, soak tower',
          de: 'Runter, Turm nehmen',
          fr: 'En bas, prenez une tour',
          cn: '下降 => 踩塔',
          ko: '하강, 기둥 밟기',
        },
      },
    },
    {
      id: 'QueenEternal Ex Earth Phase Boulder',
      netRegex: NetRegexes.headMarker({ id: '022F', capture: false }),
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'QueenEternal Ex Earth Phase Weighty Blow',
      netRegex: NetRegexes.startsUsing({ id: 'A033', source: 'Queen Eternal', capture: false }),
      alertText: (_data, _matches, output) => output.text(),
      outputStrings: {
        text: {
          en: 'Hide behind rocks',
          de: 'Hinter den Steinen verstecken',
          fr: 'Cachez-vous derrière les rochers',
          cn: '躲在石头后',
          ko: '돌 뒤로 숨기',
        },
      },
    },

    // // After earth
    {
      id: 'QueenEternal Ex Coronation Laser Collector',
      netRegex: NetRegexes.startsUsing({ id: 'A013', source: 'Queen Eternal', capture: false }),
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
        }));

        if (combatants === null) {
          console.error(`Coronation Laser Collector: null data`);
          return;
        }

        const lasers = combatants.combatants.filter((c) => c.BNpcID === 18043);

        if (lasers.length !== 4) {
          console.error(
            `Coronation Laser Collector: expected 4, got ${combatants.combatants.length}`,
          );
          return;
        }

        for (const laser of lasers) {
          data.actorPositions[laser.ID?.toString(16).toUpperCase() ?? ''] = {
            x: laser.PosX,
            y: laser.PosY,
          };
        }
      },
    },
    {
      id: 'QueenEternal Ex Coronation Laser Tether Collector',
      netRegex: NetRegexes.tether({ id: ['010E', '010F'], capture: true }),
      durationSeconds:8,
      alertText: (data, matches, output) => {
        const idToSideMap = {
          '010E': -1, // 'left',
          '010F': 1, // 'right',
        };

        const offset = idToSideMap[matches.id];
        const pos = data.actorPositions[matches.targetId];

        if (offset === undefined || pos === undefined) {
          console.error(
            `Coronation Laser Tether Collector: ${offset ?? 'undefined'}, ${JSON.stringify(pos)}`,
          );
          return output.unknown();
        }

        const laserDirNum = Directions.xyTo4DirNum(pos.x, pos.y, 100.0, 100.0);
        const sideDirNum = (4 + laserDirNum + offset) % 4;

        const laserDir = Directions.outputFromCardinalNum(laserDirNum);
        const sideDir = Directions.outputFromCardinalNum(sideDirNum);

        if (laserDir === 'unknown' || sideDir === 'unknown') {
          console.error(
            `Coronation Laser Tether Collector: laserDir = ${laserDir}, sideDir = ${sideDir}`,
          );
          return output.unknown();
        }

        data.coronationLasers.push({
          dir: laserDir,
          side: sideDir,
          name: matches.source,
        });

        if (data.coronationLasers.length < 8)
          return;

        const myLaser = data.coronationLasers.find((laser) => laser.name === data.me);

        if (myLaser === undefined)
          throw new UnreachableCode();

        const partnerLaser = data.coronationLasers.find((laser) =>
          laser.dir === myLaser.dir && laser !== myLaser
        );
        var safeSide = 'unknown';
        switch(myLaser.dir){
          case 'dirN':
            if (myLaser.side == 'dirW'){
              safeSide = '中间';
            }else{
              safeSide = '右上角';
            }
            break;
          case 'dirE':
            if (myLaser.side == 'dirN'){
              safeSide = '中间';
            }else{
              safeSide = '右下角';
            }
            break;
          case 'dirS':
            if (myLaser.side == 'dirE'){
              safeSide = '中间';
            }else{
              safeSide = '左下角';
            }
            break;
          case 'dirW':
            if (myLaser.side == 'dirS'){
              safeSide = '中间';
            }else{
              safeSide = '左上角';
            }
            break;
        }
        return output.text({
          laserDir: output[myLaser.dir](),
          sideDir: output[myLaser.side](),
          partner: data.party.member(partnerLaser?.name),
          safeSide:safeSide,
        });
      },
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        text: {
          en: '${laserDir} laser, ${sideDir} side, w/ ${partner}, ${safeSide}',
          de: '${laserDir} Laser, ${sideDir} Seite, mit ${partner}, ${safeSide}',
          fr: 'Laser ${laserDir} , côté ${sideDir}, avec ${partner}, ${safeSide}',
          cn: '${laserDir} 激光, ${sideDir} 侧, 和 ${partner}, 站 ${safeSide}',
          ko: '${laserDir} 레이저, ${sideDir}쪽, 파트너: ${partner}, ${safeSide}',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'QueenEternal Ex Absolute Authority',
      netRegex: NetRegexes.startsUsing({ id: 'A041', source: 'Queen Eternal', capture: false }),
      alertText: (_data, _matches, output) => output.bait(),
      outputStrings: {
        bait: Outputs.baitPuddles,
      },
    },
    {
      id: 'QueenEternal Ex Absolute Authority Debuff Collector',
      netRegex: NetRegexes.gainsEffect({ effectId: '105A', capture: true }),
      condition: Conditions.targetIsYou(),
      run: (data) => data.absoluteAuthorityDebuff = 'spread',
    },
    {
      id: 'QueenEternal Ex Absolute Authority Debuff Mechanics',
      netRegex: NetRegexes.gainsEffect({ effectId: '105A', capture: false }),
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        return output.combo({
          stackSpread: output[data.absoluteAuthorityDebuff](),
          dorito: output.dorito(),
        });
      },
      outputStrings: {
        spread: {
          en: 'Flare Marker Spread',
          de: 'Flare Markierung verteilen',
          fr: 'Dispersion marqueur Brasier',
          cn: '核爆点名分散',
          ko: '플레어 징 산개',
        },
        stack: Outputs.stackMarker,
        dorito: Outputs.doritoStack,
        combo: {
          en: '${stackSpread} => ${dorito}',
          de: '${stackSpread} => ${dorito}',
          fr: '${stackSpread} => ${dorito}',
          ja: '${stackSpread} => ${dorito}',
          cn: '${stackSpread} => ${dorito}',
          ko: '${stackSpread} => ${dorito}',
        },
      },
    },

    // // Ice phase
    {
      id: 'QueenEternal Ex Ice Phase Motion Headmarker',
      netRegex: NetRegexes.headMarker({ id: '022A', capture: false }),
      suppressSeconds: 1,
      response: Responses.moveAround(),
    },
    {
      id: 'QueenEternal Ex Ice Phase Icecicles',
      netRegex: NetRegexes.tether({ id: '0039', capture: true }),
      condition: Conditions.targetIsYou(),
      durationSeconds: 15,
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        }));

        if (combatants === null) {
          console.error(`Ice Phase Icecicles: null data`);
          return;
        }
        if (combatants.combatants.length !== 1) {
          console.error(`Ice Phase Icecicles: expected 1, got ${combatants.combatants.length}`);
          return;
        }

        const icecicle = combatants.combatants[0];
        if (!icecicle)
          return;

        data.actorPositions[matches.sourceId] = {
          x: icecicle.PosX,
          y: icecicle.PosY,
        };
      },
      alertText: (data, matches, output) => {
        const iceciclePos = data.actorPositions[matches.sourceId];

        if (iceciclePos === undefined) {
          return output.unknown();
        }
        var iceIndex = 0;
        if(iceciclePos.y > 106.0) //1,2,3,4
        {
          if(iceciclePos.x < 94.0)
          {
            iceIndex = 1;
          }
          if(iceciclePos.x > 94.0 && iceciclePos.x  < 100.0)
          {
            iceIndex = 2;
          }
          if(iceciclePos.x > 100.0 && iceciclePos.x  < 106.0)
          {
            iceIndex = 3;
          }
          if(iceciclePos.x >  106.0)
          {
            iceIndex = 4;
          }
        }
        else // 5,6,7,8
        {
          if(iceciclePos.y < 100.0 && iceciclePos.x < 100.0)
          {
            iceIndex = 5;
          }
          if(iceciclePos.y < 100.0 && iceciclePos.x > 100.0)
          {
            iceIndex = 6;
          }
          if(iceciclePos.y  > 100.0 && iceciclePos.x < 100.0)
          {
            iceIndex = 7;
          }
          if(iceciclePos.y  > 100.0 && iceciclePos.x > 100.0)
          {
            iceIndex = 8;
          }
        }
        var toWhere = "";
        switch(iceIndex)
        {
        case 1:
          toWhere = "走北桥,去右边 上方 内侧,先过后回";
          break;
        case 2:
          toWhere = "走南桥,去右边 上方 外侧,先过后回";
          break;
        case 3:
          toWhere = "走南桥,去左边 上方 外侧,先过后回";
          break;
        case 4:
          toWhere = "走北桥,去左边 上方 内侧,先过后回";
          break;
        case 5:
          toWhere = "走南桥,去右边 下方,后过先回";
          break;
        case 6:
          toWhere = "走南桥,去左边 下方,后过先回";
          break;
        case 7:
          toWhere = "走北桥,去右边 中间,后过先回";
          break;
        case 8:
          toWhere = "走北桥,去左边 中间,后过先回";
          break;
        }

        try {
          callOverlayHandler({
            call: "PostNamazu",
            c: "command",
            p: `/e ${iceIndex}柱, ${toWhere}`,
          });
        } catch {};
        return {cn:`${toWhere}`};
      },
    },

    // // Phase two
    {
      id: 'QueenEternal Ex Platform Tracker',
      netRegex: NetRegexes.mapEffect({ location: ['09', '0A', '0B'], capture: true }),
      run: (data, matches) => {
        const flags = {
          '00200010': 'ccw',
          '00020001': 'cw',
        };

        const slots = {
          '09': 'wind',
          '0A': 'earth',
          '0B': 'ice',
        };

        const dir = flags[matches.flags];
        const element = slots[matches.location];

        if (dir === undefined || element === undefined) {
          return;
        }

        if (dir === 'cw') {
          data.radicalShiftCWPlatform = element;
        } else {
          data.radicalShiftCCWPlatform = element;
        }
      },
    },
    {
      id: 'QueenEternal Ex Rotation Direction + Spread',
      type: 'MapEffect',
      netRegex: { flags: ['08000400', '01000080'], location: '0C', capture: true },
      alertText: (data, matches, output) => {
        const dir = matches.flags === '08000400' ? 'cw' : 'ccw';
        let elem = data.radicalShiftCWPlatform;

        if (dir === 'ccw') {
          elem = data.radicalShiftCCWPlatform;
        }

        if (elem === undefined) {
          return output.combo({
            elem: output.unknown(),
            spread: output.spread(),
          });
        }

        return output.combo({
          elem: output[elem](),
          spread: output.spread(),
        });
      },
      outputStrings: {
        spread: Outputs.spread,
        unknown: Outputs.unknown,
        wind: {
          en: 'Wind/Green',
          de: 'Wind/Grün',
          fr: 'Vent/Vert',
          cn: '风/绿地板',
          ko: '바람/초록',
        },
        earth: {
          en: 'Earth/Yellow',
          de: 'Erde/Gelb',
          fr: 'Terre/Jaune',
          cn: '土/黄地板',
          ko: '땅/노랑',
        },
        ice: {
          en: 'Ice/Blue',
          de: 'Eis/Blau',
          fr: 'Glace/Bleu',
          cn: '冰/蓝地板',
          ko: '얼음/파랑',
        },
        combo: {
          en: '${elem} => ${spread}',
          de: '${elem} => ${spread}',
          fr: '${elem} => ${spread}',
          ja: '${elem} => ${spread}',
          cn: '${elem} => ${spread}',
          ko: '${elem} => ${spread}',
        },
      },
    },
    {
      id: 'QueenEternal Ex Radical Shift',
      netRegex: NetRegexes.startsUsing({ id: 'A04F', source: 'Queen Eternal', capture: false }),
      response: Responses.bigAoe(),
    },
    {
      id: 'QueenEternal Ex Dying Memory',
      tnetRegex: NetRegexes.startsUsing({ id: 'A059', source: 'Queen Eternal', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Royal Banishment',
      netRegex: NetRegexes.startsUsing({ id: 'A05A', source: 'Queen Eternal', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'QueenEternal Ex Tyranny\'s Grasp',
      netRegex: NetRegexes.startsUsing({ id: 'A055', source: 'Queen Eternal', capture: false }),
      alertText: (_data, _matches, output) => output.back(),
      outputStrings: {
        back: {
          en: 'Back, Tank Towers => AoE',
          de: 'Hinten, Tank Türme => AoE',
          fr: 'Arrière, Tours Tank => AoE',
          cn: '去后半场, 坦克踩塔 => AoE',
          ko: '뒤로, 탱커 기둥 => 전체 공격',
        },
      },
    },
    {
      id:'QueenEternal Ex Dimensional Distortion',
      netRegex: NetRegexes.startsUsing( { id: ['A052', 'A053', 'A054'], source: 'Queen Eternal', capture: false }),
      alertText: (_data, _matches, output) => output.back(),
      outputStrings: {
        back: {
          cn: '地火',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Ice Pillar': 'Eissäule',
        'Queen Eternal': 'Ewig(?:e|er|es|en) Königin',
        'Virtual Boulder': 'locker(?:e|er|es|en) Felsen',
      },
      'replaceText': {
        '\\(Dorito Stack\\)': '(Rote Dreiecke sammeln)',
        '\\(Flares/Stack\\)': '(Flare/Sammeln)',
        '\\(Knockback\\)': '(Rückstoß)',
        '\\(big\\)': '(groß)',
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(schaden)',
        '\\(front\\)': '(Vorne)',
        '\\(left tower\\)': '(linker Turm)',
        '\\(motion\\)': '(bewegen)',
        '\\(orb\\)': '(orb)',
        '\\(platforms\\)': '(Plattform)',
        '\\(right tower\\)': '(rechter Turm)',
        '\\(rotate\\)': '(Rotieren)',
        '\\(spread\\)': '(verteilen)',
        'Absolute Authority': 'Absolute Autorität',
        'Aeroquell': 'Windjoch',
        'Aethertithe': 'Ätherzehnt',
        'Atomic Ray': 'Atomstrahlung',
        'Authority Eternal': 'Ewige Autorität',
        'Burst': 'Explosion',
        'Coronation': 'Krönung',
        'Dimensional Distortion': 'Dimensionale Störung',
        'Divide and Conquer': 'Teile und Herrsche',
        'Drear Rising': 'Schwellende Trauer',
        'Dying Memory': 'Sterbende Erinnerung',
        'Gravitational Empire': 'Massenanziehungsreich',
        'Gravity Pillar': 'Gravitationspfeiler',
        'Gravity Ray': 'Gravitationsstrahl',
        'Ice Dart': 'Eispfeil',
        'Laws of Earth': 'Gesetz der Erde',
        'Laws of Ice': 'Gesetz des Eises',
        'Laws of Wind': 'Gesetz des Windes',
        'Legitimate Force': 'Legitime Herrschaft',
        'Meteor Impact': 'Meteoreinschlag',
        'Preservation': 'Absolute Wahrung',
        'Prosecution of War': 'Kriegsklagen',
        'Radical Shift': 'Radikaler Umschwung',
        'Raised Tribute': 'Eisige Retribution',
        'Retribute': 'Retribution',
        'Royal Banishment': 'Königliche Verbannung',
        'Royal Domain': 'Hoheitsgebiet',
        'Rush': 'Stürmen',
        'Ruthless Regalia': 'Unbarmherzigkeit der Krone',
        'Tyranny\'s Grasp': 'Griff der Tyrannei',
        'Virtual Shift': 'Virtueller Umschwung',
        'Weighty Blow': 'Schwerkräftiger Schlag',
        'World Shatter': 'Welterschütterung',
        'Wind of Change': 'Wind des Ostens/Westens',
        'Right(?! )': 'Rechts',
        'Left(?! )': 'Links',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Ice Pillar': 'pilier de glace',
        'Queen Eternal': 'Reine Éternité',
        'Virtual Boulder': 'roche instable',
      },
      'replaceText': {
        '\\(Dorito Stack\\)': '(Package donut)',
        '\\(Flares/Stack\\)': '(Brasiers/Packages)',
        '\\(Knockback\\)': '(Poussée)',
        '\\(big\\)': '(gros)',
        '\\(cast\\)': '(Incante)',
        '\\(damage\\)': '(Dommage)',
        '\\(front\\)': '(Devant)',
        '\\(left tower\\)': '(Tour gauche)',
        '\\(motion\\)': '(Déplacement)',
        '\\(orb\\)': '(Orbe)',
        '\\(platforms\\)': '(Platformes)',
        '\\(right tower\\)': '(Tour droite)',
        '\\(rotate\\)': '(Rotation)',
        '\\(spread\\)': '(Dispersion)',
        'Absolute Authority': 'Autorité absolue',
        'Aeroquell': 'Rafale de vent',
        'Aethertithe': 'Dîme d\'éther',
        'Atomic Ray': 'Rayon atomique',
        'Authority Eternal': 'Autorité éternelle',
        'Burst': 'Explosion',
        'Coronation': 'Déploiement',
        'Dimensional Distortion': 'Distortion dimensionnelle',
        'Divide and Conquer': 'Diviser pour mieux régner',
        'Drear Rising': 'Orage morne',
        'Dying Memory': 'Mémoire mourante',
        'Gravitational Empire': 'Empire gravitationnel',
        'Gravity Pillar': 'Pilier gravitationnel',
        'Gravity Ray': 'Rayon gravitationnel',
        'Ice Dart': 'Amas de glace',
        'Laws of Earth': 'Loi de la terre',
        'Laws of Ice': 'Loi de la glace',
        'Laws of Wind': 'Loi du vent',
        'Legitimate Force': 'Force légitime',
        'Meteor Impact': 'Impact de météore',
        'Preservation': 'Préservation absolue',
        'Prosecution of War': 'Réquisitoire guerrier',
        'Radical Shift': 'Transfert radical',
        'Raised Tribute': 'Tribut lourd',
        'Retribute': 'Tribut',
        'Royal Banishment': 'Bannissement royal',
        'Royal Domain': 'Domaine royal',
        'Rush': 'Ruée',
        'Ruthless Regalia': 'Monarchie brutale',
        'Tyranny\'s Grasp': 'Main réginale',
        'Virtual Shift': 'Transfert virtuel',
        'Wind of Change': 'Vent du changement',
        'Weighty Blow': 'Coup gravitationnel',
        'World Shatter': 'Monde brisé',
        'Right(?! )': 'Gauche',
        'Left(?! )': 'Droite',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Ice Pillar': '氷柱',
        'Queen Eternal': 'エターナルクイーン',
        'Virtual Boulder': '岩石',
      },
      'replaceText': {
        'Absolute Authority': 'アブソリュート・オーソリティ',
        'Aeroquell': 'エアロバースト',
        'Aethertithe': 'エーテルレヴィー',
        'Atomic Ray': 'アトミックレイ',
        'Authority Eternal': 'エターナル・オーソリティ',
        'Burst': '爆発',
        'Coronation': '端末射出',
        'Dimensional Distortion': 'ディメンショナル・ディストーション',
        'Divide and Conquer': 'ディバイド・アンド・コンカー',
        'Drear Rising': 'ドゥリアリーストーム',
        'Dying Memory': 'ダイイングメモリー',
        'Gravitational Empire': 'グラビティ・エンパイア',
        'Gravity Pillar': 'グラビティピラー',
        'Gravity Ray': 'グラビティレイ',
        'Ice Dart': '氷塊',
        'Laws of Earth': 'ロウ・オブ・アース',
        'Laws of Ice': 'ロウ・オブ・アイス',
        'Laws of Wind': 'ロウ・オブ・ウィンド',
        'Legitimate Force': 'レジティメート・フォース',
        'Meteor Impact': 'メテオインパクト',
        'Preservation': 'アブソリュート・プリザベーション',
        'Prosecution of War': 'プロセキューション・ウォー',
        'Radical Shift': 'ラディカルシフト',
        'Raised Tribute': 'ドゥリアリー・トリビュート',
        'Retribute': 'トリビュート',
        'Royal Banishment': 'バニッシュレイ',
        'Royal Domain': 'ロイヤルドメイン',
        'Rush': '突進',
        'Ruthless Regalia': 'ルースレスレガリア',
        'Tyranny\'s Grasp': 'クイーンズハンド',
        'Virtual Shift': 'ヴァーチャルシフト',
        'Weighty Blow': 'グラビティブロウ',
        'World Shatter': 'ワールドシャッター',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Ice Pillar': '冰柱',
        'Queen Eternal': '永恒女王',
        'Virtual Boulder': '岩石',
      },
      'replaceText': {
        '\\(Dorito Stack\\)': '(红三角集合)',
        '\\(Flares/Stack\\)': '(核爆/集合)',
        '\\(Knockback\\)': '(击退)',
        '\\(big\\)': '(大)',
        '\\(cast\\)': '(咏唱)',
        '\\(damage\\)': '(伤害)',
        '\\(front\\)': '(前)',
        '\\(left tower\\)': '(左塔)',
        '\\(motion\\)': '(行动)',
        '\\(orb\\)': '(球)',
        '\\(platforms\\)': '(平台)',
        '\\(right tower\\)': '(右塔)',
        '\\(rotate\\)': '(转)',
        '\\(spread\\)': '(分散)',
        'Absolute Authority': '绝对君权',
        'Aeroquell': '风爆',
        'Aethertithe': '以太税',
        'Atomic Ray': '原子射线',
        'Authority Eternal': '永恒君权',
        'Burst': '爆炸',
        'Coronation': '终端发射',
        'Dimensional Distortion': '空间扭曲',
        'Divide and Conquer': '分治法',
        'Drear Rising': '阴郁风暴',
        'Dying Memory': '垂死的记忆',
        'Gravitational Empire': '重力帝国',
        'Gravity Pillar': '重力之柱',
        'Gravity Ray': '重力射线',
        'Ice Dart': '冰块',
        'Laws of Earth': '土之律法',
        'Laws of Ice': '冰之律法',
        'Laws of Wind': '风之律法',
        'Legitimate Force': '合法武力',
        'Meteor Impact': '陨石冲击',
        'Preservation': '绝对保全',
        'Prosecution of War': '诉诸武力',
        'Radical Shift': '激进切换',
        'Raised Tribute': '横征暴敛',
        'Retribute': '俱是君恩',
        'Royal Banishment': '放逐射线',
        'Royal Domain': '王土',
        'Rush': '突进',
        'Ruthless Regalia': '王法无情',
        'Tyranny\'s Grasp': '女王之手',
        'Virtual Shift': '虚景切换',
        'Weighty Blow': '重力炸裂',
        'World Shatter': '世界破碎',
        'Wind of Change': '左/右风',
        'Right(?! )': '右',
        'Left(?! )': '左',
      },
    },
  ],
});