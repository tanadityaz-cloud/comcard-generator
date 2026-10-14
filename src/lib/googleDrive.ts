export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  size?: string;
  parents?: string[];
}

/**
 * Ensures an "Orland Management" root folder exists, optionally with a subfolder (e.g., "Comcards" or "Model Photos").
 */
export async function getOrCreateOrlandFolder(
  accessToken: string,
  subfolderName?: string
): Promise<string> {
  // 1. Search for root "Orland Management" folder
  const rootQ = `mimeType = 'application/vnd.google-apps.folder' and name = 'Orland Management' and trashed = false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(rootQ)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!searchRes.ok) {
    const errorMsg = await searchRes.text();
    throw new Error(`Failed to query Google Drive: ${errorMsg}`);
  }

  const searchData = await searchRes.json();
  let rootFolderId = searchData.files?.[0]?.id;

  if (!rootFolderId) {
    // Create Orland Management root folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Orland Management',
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    if (!createRes.ok) {
      throw new Error(`Failed to create root Orland Management folder: ${await createRes.text()}`);
    }
    const createData = await createRes.json();
    rootFolderId = createData.id;
  }

  if (!subfolderName) return rootFolderId;

  // 2. Search for subfolder under rootFolderId
  const subQ = `mimeType = 'application/vnd.google-apps.folder' and name = '${subfolderName}' and '${rootFolderId}' in parents and trashed = false`;
  const subSearchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(subQ)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const subSearchData = await subSearchRes.json();
  let subfolderId = subSearchData.files?.[0]?.id;

  if (!subfolderId) {
    // Create subfolder
    const createSubRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: subfolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [rootFolderId],
      }),
    });
    if (!createSubRes.ok) {
      throw new Error(`Failed to create subfolder ${subfolderName}: ${await createSubRes.text()}`);
    }
    const createSubData = await createSubRes.json();
    subfolderId = createSubData.id;
  }

  return subfolderId;
}

/**
 * Upload any Blob/File to Google Drive using standard multipart/related upload.
 */
export async function uploadFileToDrive(
  accessToken: string,
  blob: Blob,
  filename: string,
  folderId?: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const metadata: Record<string, any> = {
    name: filename,
    mimeType: blob.type || 'application/octet-stream',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read blob as base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${blob.type || 'application/octet-stream'}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errorText}`);
  }

  return await res.json();
}

/**
 * Set public reader permission on a Drive file so it can be loaded in web applications
 */
export async function makeDriveFilePublic(accessToken: string, fileId: string): Promise<void> {
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (err) {
    console.warn('Unable to set public permission on drive file:', err);
  }
}

/**
 * Direct high-resolution image URL from Google CDN for a given Drive file ID
 */
export function getDriveDirectImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
}

/**
 * Upload an exported comcard (PNG/JPG/PDF) to Google Drive in "Orland Management / Comcards"
 */
export async function uploadComcardToDrive(
  accessToken: string,
  blob: Blob,
  filename: string
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const folderId = await getOrCreateOrlandFolder(accessToken, 'Comcards');
  const result = await uploadFileToDrive(accessToken, blob, filename, folderId);
  await makeDriveFilePublic(accessToken, result.id);
  return result;
}

/**
 * Upload model photo directly to Google Drive as backend storage in "Orland Management / Model Photos"
 */
export async function uploadModelPhotoToDrive(
  accessToken: string,
  file: File | Blob,
  filename: string
): Promise<{ id: string; name: string; url: string; webViewLink?: string }> {
  const folderId = await getOrCreateOrlandFolder(accessToken, 'Model Photos');
  const uploaded = await uploadFileToDrive(accessToken, file, filename, folderId);
  
  // Make readable so <img> can render it
  await makeDriveFilePublic(accessToken, uploaded.id);

  // High-res CDN URL
  const directUrl = getDriveDirectImageUrl(uploaded.id);

  return {
    id: uploaded.id,
    name: uploaded.name,
    url: directUrl,
    webViewLink: uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`,
  };
}

/**
 * List all model photos stored in Google Drive backend ("Orland Management / Model Photos")
 */
export async function listDriveModelPhotos(accessToken: string): Promise<DriveFileItem[]> {
  const photosFolderId = await getOrCreateOrlandFolder(accessToken, 'Model Photos');
  const q = `'${photosFolderId}' in parents and trashed = false`;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&pageSize=60&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,size)&orderBy=createdTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list photos from Google Drive: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Save complete comcard database to Google Drive backend in "Orland Management / Database"
 */
export async function saveComcardsDatabaseToDrive(
  accessToken: string,
  comcardsData: any
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const folderId = await getOrCreateOrlandFolder(accessToken, 'Database');
  
  // Check if comcards_database.json already exists in Database folder
  const searchQ = `'${folderId}' in parents and name = 'comcards_database.json' and trashed = false`;
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQ)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const jsonBlob = new Blob([JSON.stringify(comcardsData, null, 2)], {
    type: 'application/json',
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const existingFileId = searchData.files?.[0]?.id;
    if (existingFileId) {
      // Update existing file content
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonBlob,
        }
      );
      if (updateRes.ok) {
        return { id: existingFileId, name: 'comcards_database.json' };
      }
    }
  }

  // Otherwise create new database file
  return await uploadFileToDrive(accessToken, jsonBlob, 'comcards_database.json', folderId);
}

/**
 * Load complete comcard database from Google Drive backend if present
 */
export async function loadComcardsDatabaseFromDrive(
  accessToken: string
): Promise<any[] | null> {
  try {
    const folderId = await getOrCreateOrlandFolder(accessToken, 'Database');
    const searchQ = `'${folderId}' in parents and name = 'comcards_database.json' and trashed = false`;
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQ)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const fileId = searchData.files?.[0]?.id;
    if (!fileId) return null;

    // Download content
    const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!downloadRes.ok) return null;
    return await downloadRes.json();
  } catch (err) {
    console.warn('Could not load database from Google Drive:', err);
    return null;
  }
}

/**
 * Backup full comcard database JSON to Google Drive in "Orland Management / Backups"
 */
export async function saveComcardsBackupToDrive(
  accessToken: string,
  comcardsData: any
): Promise<{ id: string; name: string; webViewLink?: string }> {
  const folderId = await getOrCreateOrlandFolder(accessToken, 'Backups');
  const jsonBlob = new Blob([JSON.stringify(comcardsData, null, 2)], {
    type: 'application/json',
  });
  const filename = `Orland_Comcards_Backup_${new Date().toISOString().split('T')[0]}.json`;
  return await uploadFileToDrive(accessToken, jsonBlob, filename, folderId);
}

/**
 * List files stored in the Orland Management folder and its subfolders
 */
export async function listOrlandDriveFiles(accessToken: string): Promise<DriveFileItem[]> {
  const rootFolderId = await getOrCreateOrlandFolder(accessToken);
  const comcardsFolderId = await getOrCreateOrlandFolder(accessToken, 'Comcards');
  const photosFolderId = await getOrCreateOrlandFolder(accessToken, 'Model Photos');
  const backupsFolderId = await getOrCreateOrlandFolder(accessToken, 'Backups');

  const folderIds = [rootFolderId, comcardsFolderId, photosFolderId, backupsFolderId];
  const parentsQuery = folderIds.map((id) => `'${id}' in parents`).join(' or ');
  const q = `(${parentsQuery}) and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&pageSize=50&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,createdTime,size,parents)&orderBy=createdTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to list Drive files: ${errorText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Delete a file from Google Drive (MUST be preceded by UI user confirmation)
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Failed to delete file from Drive: ${errorText}`);
  }
}
