// 모달 제어 함수
function openModal() {
    document.getElementById('applyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('applyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 구글 앱스 스크립트 연결 주소
const scriptURL = 'https://script.google.com/macros/s/AKfycbyL0Ss4ON8OkMq4ltByzH_iS4AheqoaSp7CA6vSJQmveYUdWgz_93gSeIClhF0anSStPQ/exec';
const form = document.getElementById('vividSubmitForm');
const submitBtn = document.getElementById('submitBtn');

// 폼 전송 이벤트
form.addEventListener('submit', e => {
    e.preventDefault();
    
    // 버튼 상태를 '전송 중'으로 변경
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 전송 중...';

    // 데이터 전송 (FormData 사용)
    fetch(scriptURL, { 
        method: 'POST', 
        body: new FormData(form),
        mode: 'no-cors' 
    })
    .then(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '신청 완료하기';
        alert('성공적으로 신청되었습니다! 담당자가 확인 후 연락드릴게요.');
        form.reset();
        closeModal();
    })
    .catch(error => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '다시 시도하기';
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Error!', error.message);
    });
});