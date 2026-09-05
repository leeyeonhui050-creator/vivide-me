const SPREADSHEET_ID = '1AsqTSyFzYNztYpPhOCF5tqbHnu1RRowaVyVI7Kluzos';
const DRIVE_FOLDER_ID = '1plRcBAG0PJlINp8ye0ELddgpg4CZqUGF';

function getSpreadsheet() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  throw new Error('스프레드시트를 찾을 수 없습니다. SPREADSHEET_ID를 확인해주세요.');
}

function getOrCreateSheet(type) {
  const ss = getSpreadsheet();
  const sheetName = type === 'review' ? 'review' : 'qna';
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const headers = type === 'review'
    ? ['id', 'date', 'author', 'content', 'rating', 'image', 'exposure']
    : ['date', 'question', 'answer'];

  const existingHeaders = sheet.getRange(1, 1, 1, Math.max(headers.length, sheet.getLastColumn())).getDisplayValues()[0] || [];
  const needsHeaders = existingHeaders.slice(0, headers.length).join(',') !== headers.join(',');
  if (needsHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function doPost(e) {
  const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  const data = JSON.parse(raw || '{}');
  const action = data.action;
  const sheetName = data.sheet;

  const sheetQna = getOrCreateSheet('qna');
  const sheetReview = getOrCreateSheet('review');

  try {
    if (sheetName === 'qna') {
      if (action === 'add') {
        appendRow(sheetQna, [new Date().toISOString(), data.data && data.data[1] || '', data.data && data.data[2] || ''], 'qna');
        return jsonResult(true, '성공');
      }
      if (action === 'update') {
        updateRowById(sheetQna, data.data && data.data[0], [data.data && data.data[1] || '', data.data && data.data[2] || ''], 'qna');
        return jsonResult(true, '성공');
      }
      if (action === 'delete') {
        deleteRowById(sheetQna, data.data && data.data[0]);
        return jsonResult(true, '성공');
      }
    }

    if (sheetName === 'review') {
      if (action === 'add') {
        const imageUrl = data.data && data.data[3] ? uploadImageToDrive(data.data[3], 'review') : '';
        appendRow(sheetReview, [data.data && data.data[0] || sheetReview.getLastRow() + 1, new Date().toISOString(), data.data && data.data[1] || '', data.data && data.data[2] || '', data.data && data.data[5] || '', imageUrl, 'Y'], 'review');
        return jsonResult(true, '성공');
      }
      if (action === 'update') {
        const currentImage = getExistingImageUrl(sheetReview, data.data && data.data[0]);
        let nextImageUrl = currentImage || '';
        const nextImageData = data.data && data.data[3] ? data.data[3] : '';
        if (nextImageData) {
          if (currentImage) {
            deleteImageFromDrive(currentImage);
          }
          nextImageUrl = uploadImageToDrive(nextImageData, 'review');
        }
        updateRowById(sheetReview, data.data && data.data[0], [data.data && data.data[0] || '', data.data && data.data[1] || '', data.data && data.data[2] || '', data.data && data.data[5] || '', nextImageUrl, 'Y'], 'review');
        return jsonResult(true, '성공');
      }
      if (action === 'delete') {
        const imageUrl = getExistingImageUrl(sheetReview, data.data && data.data[0]);
        deleteRowById(sheetReview, data.data && data.data[0]);
        if (imageUrl) {
          deleteImageFromDrive(imageUrl);
        }
        return jsonResult(true, '성공');
      }
    }

    switch (action) {
      case 'listQna':
        return jsonResult(true, '성공', listRows(sheetQna, 'qna'));
      case 'addQna':
        appendRow(sheetQna, [new Date().toISOString(), data.question || '', data.answer || ''], 'qna');
        return jsonResult(true, '성공');
      case 'updateQna':
        updateRowById(sheetQna, data.id, [data.question || '', data.answer || ''], 'qna');
        return jsonResult(true, '성공');
      case 'deleteQna':
        deleteRowById(sheetQna, data.id);
        return jsonResult(true, '성공');
      case 'listReview':
        return jsonResult(true, '성공', listRows(sheetReview, 'review'));
      case 'addReview': {
        const imageUrl = data.image ? uploadImageToDrive(data.image, 'review') : '';
        appendRow(sheetReview, [sheetReview.getLastRow() + 1, new Date().toISOString(), data.author || '', data.content || '', data.rating || '', imageUrl, 'Y'], 'review');
        return jsonResult(true, '성공');
      }
      case 'updateReview': {
        const currentImage = getExistingImageUrl(sheetReview, data.id);
        let nextImageUrl = currentImage || '';
        if (data.image) {
          if (currentImage) {
            deleteImageFromDrive(currentImage);
          }
          nextImageUrl = uploadImageToDrive(data.image, 'review');
        }
        updateRowById(sheetReview, data.id, [data.id || '', data.author || '', data.content || '', data.rating || '', nextImageUrl, 'Y'], 'review');
        return jsonResult(true, '성공');
      }
      case 'deleteReview': {
        const imageUrl = getExistingImageUrl(sheetReview, data.id);
        deleteRowById(sheetReview, data.id);
        if (imageUrl) {
          deleteImageFromDrive(imageUrl);
        }
        return jsonResult(true, '성공');
      }
      default:
        return jsonResult(false, '알 수 없는 액션입니다.');
    }
  } catch (error) {
    return jsonResult(false, error.toString());
  }
}

function listRows(sheet, type) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length <= 1) return [];

  const headers = values[0];
  const rows = values.slice(1).map((row, index) => {
    const item = {};
    headers.forEach((header, i) => {
      item[header] = row[i] || '';
    });

    const idIndex = getHeaderIndex(headers, ['id']);
    item.id = idIndex >= 0 && row[idIndex] ? row[idIndex] : index + 2;

    if (type === 'qna') {
      item.question = item.question || item.Question || item.질문 || '';
      item.answer = item.answer || item.Answer || item.답변 || '';
    }
    if (type === 'review') {
      item.author = item.author || item.Author || item.name || item.Name || item.작성자 || '';
      item.content = item.content || item.Content || item.내용 || '';
      item.rating = item.rating || item.Rating || item.평점 || '';
      item.image = item.image || item.Image || item.이미지 || '';
      item.exposure = item.exposure || item.Exposure || item.노출 || 'Y';
    }
    return item;
  });

  return rows.filter((row) => row.id);
}

function appendRow(sheet, values, type) {
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), values.length)).getDisplayValues()[0] || [];
  const normalized = headers.map(() => '');

  if (type === 'qna') {
    headers.forEach((header, index) => {
      if (header === 'date' || header === 'Date' || header === '날짜') normalized[index] = values[0] || '';
      else if (header === 'question' || header === 'Question' || header === '질문') normalized[index] = values[1] || '';
      else if (header === 'answer' || header === 'Answer' || header === '답변') normalized[index] = values[2] || '';
    });
    sheet.appendRow(normalized);
    return;
  }

  if (type === 'review') {
    headers.forEach((header, index) => {
      if (header === 'id' || header === 'ID') normalized[index] = values[0] || '';
      else if (header === 'date' || header === 'Date' || header === '날짜') normalized[index] = values[1] || '';
      else if (header === 'author' || header === 'Author' || header === '작성자' || header === 'name' || header === 'Name') normalized[index] = values[2] || '';
      else if (header === 'content' || header === 'Content' || header === '내용') normalized[index] = values[3] || '';
      else if (header === 'rating' || header === 'Rating' || header === '평점') normalized[index] = values[4] || '';
      else if (header === 'image' || header === 'Image' || header === '이미지') normalized[index] = values[5] || '';
      else if (header === 'exposure' || header === 'Exposure' || header === '노출') normalized[index] = values[6] || 'Y';
    });
    sheet.appendRow(normalized);
    return;
  }

  sheet.appendRow(values);
}

function updateRowById(sheet, id, values, type) {
  const rowIndex = Number(id);
  if (!rowIndex || rowIndex < 2) return;
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 6)).getDisplayValues()[0] || [];
  const rowValues = headers.map((header) => {
    if (type === 'qna') {
      if (header === 'date' || header === 'Date' || header === '날짜') return sheet.getRange(rowIndex, headers.indexOf(header) + 1).getValue();
      if (header === 'question' || header === 'Question' || header === '질문') return values[0];
      if (header === 'answer' || header === 'Answer' || header === '답변') return values[1];
      return sheet.getRange(rowIndex, headers.indexOf(header) + 1).getValue();
    }
    if (type === 'review') {
      if (header === 'id' || header === 'ID') return values[0] || rowIndex;
      if (header === 'date' || header === 'Date' || header === '날짜') return sheet.getRange(rowIndex, headers.indexOf(header) + 1).getValue();
      if (header === 'author' || header === 'Author' || header === '작성자' || header === 'name' || header === 'Name') return values[1];
      if (header === 'content' || header === 'Content' || header === '내용') return values[2];
      if (header === 'rating' || header === 'Rating' || header === '평점') return values[3];
      if (header === 'image' || header === 'Image' || header === '이미지') return values[4];
      if (header === 'exposure' || header === 'Exposure' || header === '노출') return values[5] || 'Y';
      return sheet.getRange(rowIndex, headers.indexOf(header) + 1).getValue();
    }
    return '';
  });
  sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
}

function deleteRowById(sheet, id) {
  const rowIndex = Number(id);
  if (!rowIndex || rowIndex < 2) return;
  sheet.deleteRow(rowIndex);
}

function getExistingImageUrl(sheet, id) {
  const rowIndex = Number(id);
  if (!rowIndex || rowIndex < 2) return '';
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 6)).getDisplayValues()[0] || [];
  const imageIndex = getHeaderIndex(headers, ['image', 'Image', '이미지']);
  if (imageIndex < 0) return '';
  return sheet.getRange(rowIndex, imageIndex + 1).getValue() || '';
}

function getHeaderIndex(headers, candidates) {
  return headers.findIndex((header) => candidates.includes(header));
}

function uploadImageToDrive(base64Data, prefix) {
  if (!base64Data) return '';
  const match = String(base64Data).match(/^data:(.+);base64,/);
  const mimeType = match ? match[1] : 'image/jpeg';
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const base64Content = String(base64Data).split(',').pop() || '';
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Content), mimeType, `${prefix}_${Utilities.getUuid()}.${extension}`);

  let folder = DriveApp.getRootFolder();
  if (DRIVE_FOLDER_ID) {
    try {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    } catch (error) {
      folder = DriveApp.getRootFolder();
    }
  }

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  return `https://drive.google.com/thumbnail?id=${file.getId()}`;
}

function deleteImageFromDrive(imageUrl) {
  if (!imageUrl) return;
  const match = String(imageUrl).match(/(?:id=|file\/d\/)([a-zA-Z0-9\-_]+)/);
  const fileId = match ? match[1] : '';
  if (!fileId) return;
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
  } catch (error) {
    // ignore
  }
}

function jsonResult(success, error, items) {
  return ContentService.createTextOutput(JSON.stringify({ success, error, items }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const type = e && e.parameter ? e.parameter.type : '';
  try {
    if (type === 'qna') {
      return jsonResult(true, '성공', listRows(getOrCreateSheet('qna'), 'qna'));
    }

    if (type === 'review') {
      return jsonResult(true, '성공', listRows(getOrCreateSheet('review'), 'review'));
    }

    return jsonResult(false, '알 수 없는 조회 타입입니다.', []);
  } catch (error) {
    return jsonResult(false, error.toString(), []);
  }
}
