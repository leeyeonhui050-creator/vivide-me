const API_URL = 'https://script.google.com/macros/s/AKfycbzxwlOJLmzmP0oK6gDna1wz-ZvdkE4LZ_JPt-jVLiXaYFZKLV0u2h01K2GFCL_9Lt2P/exec';

async function parseJsonResponse(response) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || '요청에 실패했습니다.');
    }

    if (data && data.success === false) {
        throw new Error(data.error || '요청에 실패했습니다.');
    }

    return data;
}

export async function requestSheet(action, payload = {}) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action,
                ...payload
            })
        });

        return await parseJsonResponse(response);
    } catch (error) {
        throw new Error(error?.message || '요청에 실패했습니다.');
    }
}

export async function getSheet(type) {
    try {
        const response = await fetch(`${API_URL}?type=${encodeURIComponent(type)}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });

        return await parseJsonResponse(response);
    } catch (error) {
        throw new Error(error?.message || '조회에 실패했습니다.');
    }
}

export async function adminLogin(id, password) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                id,
                password
            })
        });

        return await parseJsonResponse(response);
    } catch (error) {
        throw new Error(error?.message || '로그인에 실패했습니다.');
    }
}
