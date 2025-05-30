const fs = require('fs');

// 删除 ./uploads 文件夹
if (fs.existsSync('./uploads')) {
  fs.rmSync('./uploads', { recursive: true, force: true });
  console.log('✅ ./uploads 削除済み');
} else {
  console.log('ℹ️ ./uploads 見つけませんでした、削除をスキップする');
}

fs.copyFileSync('.env.production', '.env.local');
console.log('.env.local 設定済み！');

