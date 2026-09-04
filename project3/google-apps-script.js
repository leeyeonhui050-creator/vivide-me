import { getSheet } from './spreadsheet-config.js';


// QNA
export async function getQnaItems(){

    const data = await getSheet("qna");

    return data.data || [];

}


// REVIEW
export async function getReviewItems(){

    const data = await getSheet("review");

    return data.data || [];

}


export const getQna = getQnaItems;
export const getReviews = getReviewItems;