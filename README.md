# JCBC Security Document Management

## Getting Started

ローカル環境で起動する(データベース設定済みかつ初期化されたの場合)
```bash

npm i 
// or  yarn install

npx prisma generate

env.env.local　　rename⇒　.env.local

npm run dev 
// or yarn dev

./uploads ファイル作成
```

ローカルからデプロイ
```bash
.env.local　　rename⇒　env.env.local

npm run build
// or  yarn build

// script起動，./uploadsフォルダを削除するので、自分でプロジェクトフォルダ以外でバックアップしてください。
./deploy.sh 
```

本番環境で実施して、デプロイ完了
```bash
./rebuild-compose.sh
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Lama Dev Youtube Channel](https://youtube.com/lamadev) 
- [Next.js](https://nextjs.org/learn)