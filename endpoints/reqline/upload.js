const { createHandler } = require('@app-core/server');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function cleanupOldFiles(uploadDir) {
  if (!fs.existsSync(uploadDir)) return;

  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  fs.readdirSync(uploadDir).forEach((filename) => {
    const filePath = path.join(uploadDir, filename);
    const stats = fs.statSync(filePath);

    if (stats.mtime.getTime() < oneHourAgo) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete old file ${filename}:`, error);
      }
    }
  });
}

module.exports = createHandler({
  path: '/upload',
  method: 'post',
  async handler(rc, helpers) {
    try {
      // For now, we'll accept a simplified approach where files are sent as base64
      // This is a temporary solution until we can properly integrate multer
      const { files } = rc.body;

      if (!files || files.length === 0) {
        return {
          status: helpers.http_statuses.HTTP_400_BAD_REQUEST,
          data: { error: 'No files uploaded' },
        };
      }

      const uploadDir = path.join(__dirname, '../../../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Process uploaded files
      const uploadedFiles = files.map((fileData) => {
        const { name, content, type } = fileData;
        const filename = `${uuidv4()}-${name}`;
        const filePath = path.join(uploadDir, filename);

        // Write file content to disk
        const buffer = Buffer.from(content, 'base64');
        fs.writeFileSync(filePath, buffer);

        return {
          originalName: name,
          serverPath: filePath,
          filename,
          size: buffer.length,
          mimetype: type || 'application/octet-stream',
          fieldName: 'file',
        };
      });

      // Clean up old files
      cleanupOldFiles(uploadDir);

      return {
        status: helpers.http_statuses.HTTP_200_OK,
        data: {
          message: 'Files uploaded successfully',
          files: uploadedFiles,
        },
      };
    } catch (error) {
      return {
        status: helpers.http_statuses.HTTP_500_INTERNAL_SERVER_ERROR,
        data: { error: 'File upload failed', details: error.message },
      };
    }
  },
});
