const fs = require('fs');

fs.copyFileSync('.env.development', '.env.local');
console.log('.env.local 設定済み！');

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
  console.log('uploads フォルダ作成済み！');
}
