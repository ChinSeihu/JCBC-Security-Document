import { NextApiRequest, NextApiResponse } from 'next';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const pump = promisify(pipeline);

export const config = {
  api: {
    bodyParser: false, // 禁用默认 body 解析
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	console.log("upload is starting...")
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 处理文件上传
  const { files } = await require('next/dist/server/parse-body')(req, {
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  if (!files?.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = files.file;
  const originalName = file.originalFilename;
  const ext = path.extname(originalName);
  const filename = `${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'upload');
  const filePath = path.join(uploadDir, filename);

  try {
    // 确保上传目录存在
    await require('fs/promises').mkdir(uploadDir, { recursive: true });
    
    // 写入文件
    await pump(
      file.data,
      createWriteStream(filePath)
    );

    res.status(200).json({ 
      filename,
      originalName,
      size: file.size,
      url: `/upload/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
}