import { requestSheet, getSheet } from './spreadsheet-config.js';

function extractItems(result) {
    if (Array.isArray(result)) {
        return result;
    }

    if (result && Array.isArray(result.data)) {
        return result.data;
    }

    if (result && Array.isArray(result.items)) {
        return result.items;
    }

    return [];
}

async function fetchItems(type) {
    const result = await getSheet(type);
    return extractItems(result);
}

export async function getQnaItems() {
    return fetchItems('qna');
}

export async function addQnaItem(question, answer) {
    const items = await getQnaItems();
    const id = items.length > 0 ? Math.max(...items.map((item) => Number(item.id) || 0)) + 1 : 1;

    return requestSheet('add', {
        sheet: 'qna',
        data: [id, question, answer, 'Y']
    });
}

export async function updateQnaItem(id, question, answer) {
    return requestSheet('update', {
        sheet: 'qna',
        data: [Number(id), question, answer, 'Y']
    });
}

export async function deleteQnaItem(id) {
    return requestSheet('delete', {
        sheet: 'qna',
        data: [Number(id)]
    });
}

export async function getReviewItems() {
    return fetchItems('review');
}

export async function getQna() {
    return getQnaItems();
}
