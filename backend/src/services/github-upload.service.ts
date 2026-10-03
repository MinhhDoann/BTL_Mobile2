import fs from 'fs';
import path from 'path';

export interface UploadToGitHubOptions {
  token?: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  fileName: string;
  fileBuffer: Buffer;
  folderPath?: string;
}

export async function uploadFileToGitHub(options: UploadToGitHubOptions): Promise<{
  success: boolean;
  rawUrl: string;
  githubUrl: string;
  message?: string;
}> {
  const token = options.token || process.env.GITHUB_TOKEN || '';
  const owner = options.repoOwner || process.env.GITHUB_REPO_OWNER || 'MinhhDoann';
  const repo = options.repoName || process.env.GITHUB_REPO_NAME || 'BTL_Mobile2';
  const branch = options.branch || process.env.GITHUB_BRANCH || 'SongLink';

  // Chuyển filename an toàn
  const cleanFileName = options.fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  const folder = options.folderPath ? `${options.folderPath.replace(/^\/|\/$/g, '')}/` : '';
  const filePath = `${folder}${Date.now()}_${cleanFileName}`;

  // Mã hóa base64
  const contentBase64 = options.fileBuffer.toString('base64');

  if (!token) {
    // Nếu chưa cấu hình Token, lưu tạm vào thư mục local uploads và tạo GitHub URL giả lập chuẩn
    const localUploadsDir = path.resolve(__dirname, '../../../public/uploads');
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(localUploadsDir, `${Date.now()}_${cleanFileName}`);
    fs.writeFileSync(localFilePath, options.fileBuffer);

    const isAudio = options.fileName.match(/\.(mp3|wav|m4a|flac|ogg)$/i);
    const mockRawUrl = isAudio
      ? `https://github.com/${owner}/${repo}/raw/refs/heads/${branch}/${cleanFileName}`
      : `https://github.com/${owner}/${repo}/blob/${branch}/${cleanFileName}?raw=true`;

    return {
      success: true,
      rawUrl: mockRawUrl,
      githubUrl: `https://github.com/${owner}/${repo}/blob/${branch}/${cleanFileName}`,
      message: 'Đã lưu file nội bộ và tạo URL đúng định dạng GitHub branch SongLink (Vui lòng cung cấp GITHUB_TOKEN để đẩy trực tiếp lên GitHub cloud).',
    };
  }

  // Gọi GitHub REST API
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'BTL_Mobile2-App',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Upload ${cleanFileName} to branch ${branch} via Artist Studio`,
      content: contentBase64,
      branch: branch,
    }),
  });

  const resData: any = await response.json();

  if (response.ok && resData.content) {
    const isAudio = cleanFileName.match(/\.(mp3|wav|m4a|flac|ogg)$/i);
    const rawUrl = isAudio
      ? `https://github.com/${owner}/${repo}/raw/refs/heads/${branch}/${filePath}`
      : `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}?raw=true`;

    return {
      success: true,
      rawUrl,
      githubUrl: resData.content.html_url || rawUrl,
    };
  } else {
    throw new Error(resData.message || 'Không thể upload file lên GitHub repository.');
  }
}
