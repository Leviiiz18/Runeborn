const fs = require('fs');
const path = require('path');

const root = 'elementals';
const out = {};

const chars = fs.readdirSync(root);

for (let c of chars) {
    let searchDirs = [
        path.join(root, c, 'png'), 
        path.join(root, c, 'animations', 'PNG'),
        path.join(root, c, 'PNG animations')
    ];
    
    let pngDir = searchDirs.find(d => fs.existsSync(d));
    if (!pngDir) continue;
    
    let animDirs = fs.readdirSync(pngDir);
    
    // Some packs have an extra folder like `fire_knight` inside `png`
    if (animDirs.length > 0 && fs.statSync(path.join(pngDir, animDirs[0])).isDirectory()) {
        let sampleFiles = fs.readdirSync(path.join(pngDir, animDirs[0]));
        if (sampleFiles.length > 0 && fs.statSync(path.join(pngDir, animDirs[0], sampleFiles[0])).isDirectory()) {
            pngDir = path.join(pngDir, animDirs[0]);
            animDirs = fs.readdirSync(pngDir);
        }
    }
    
    out[c] = { name: c, anims: {} };
    
    function processAnim(folderName, folderPath, files) {
        let stdName = null;
        let folderLower = folderName.toLowerCase();
        
        if (folderLower.includes('defend_pose') || folderLower.includes('slide_loop') || folderLower.includes('diagonal')) {
            return;
        }
        
        if (folderLower.includes('idle')) stdName = 'idle';
        else if (folderLower.includes('run') || folderLower.includes('walk') || folderLower.includes('surf')) stdName = 'run';
        else if (folderLower.includes('j_up') || folderLower.includes('jump_up')) stdName = 'jump_up';
        else if (folderLower.includes('j_down') || folderLower.includes('jump_down')) stdName = 'jump_down';
        else if (folderLower.includes('1_atk') || folderLower.match(/^1_atk/)) stdName = 'attack';
        else if (folderLower.includes('2_atk') || folderLower.match(/^2_atk/)) stdName = 'attack2';
        else if (folderLower.includes('3_atk') || folderLower.match(/^3_atk/)) stdName = 'attack3';
        else if (folderLower.includes('sp_atk') || folderLower.match(/^sp_atk/)) stdName = 'special';
        else if (folderLower.includes('defend')) stdName = 'defend';
        else if (folderLower.includes('air_atk')) stdName = 'air_atk';
        else if (folderLower.includes('roll') || folderLower.includes('tumble') || folderLower.includes('slide')) stdName = 'roll';
        else if (folderLower.includes('arrow') && !folderLower.includes('hit')) stdName = 'projectile_throw';
        else if (folderLower.includes('projectile_throw')) stdName = 'projectile_throw';
        else if (folderLower.includes('arrow_hit')) stdName = 'projectile_land';
        else if (folderLower.includes('projectile_land')) stdName = 'projectile_land';
        else if (folderLower.includes('trap_throw')) stdName = 'trap_throw';
        else if (folderLower.includes('trap_land')) stdName = 'trap_land';
        else if (folderLower.includes('trap_detonate')) stdName = 'trap_detonate';
        else if (folderLower === '05_projectile_cast') stdName = 'projectile_cast';
        else if (folderLower === '06_trap_cast') stdName = 'trap_cast';
        else if (folderLower.includes('take_hit')) stdName = 'take_hit';
        else if (folderLower.includes('death')) stdName = 'death';
        
        if (stdName) {
            out[c].anims[stdName] = {
                folder: folderName,
                path: folderPath.replace(/\\/g, '/'),
                count: files.length,
                template: files[0].replace(/\d+\.png$/, '{i}.png')
            };
        }
    }

    for (let a of animDirs) {
        let ap = path.join(pngDir, a);
        if (fs.statSync(ap).isDirectory()) {
            let files = fs.readdirSync(ap).filter(f => f.endsWith('.png'));
            if (files.length > 0) {
                processAnim(a, ap, files);
            } else {
                let subItems = fs.readdirSync(ap);
                for (let sub of subItems) {
                    let subAp = path.join(ap, sub);
                    if (fs.statSync(subAp).isDirectory()) {
                        let subFiles = fs.readdirSync(subAp).filter(f => f.endsWith('.png'));
                        if (subFiles.length > 0) {
                            processAnim(sub, subAp, subFiles);
                        }
                    }
                }
            }
        }
    }
}

fs.writeFileSync('characters.json', JSON.stringify(out, null, 2));
console.log("Wrote characters.json with " + Object.keys(out).length + " characters.");
