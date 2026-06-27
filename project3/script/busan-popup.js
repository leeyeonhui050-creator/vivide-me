//부산점

function initVividBusanPopup() {
    const busanPopup = document.getElementById('vividBusanPopup');
    const busanContent = document.getElementById('busanPopupContent');
    
    if (!busanPopup || !busanContent) return; // 요소가 없으면 실행 안 함

    const isHiddenToday = localStorage.getItem('hideVividBusanPopupToday');
    const now = new Date().getTime();

    // 오늘 하루 안보기를 누르지 않았다면 기존 모달들을 체크하고 팝업 띄우기
    if (!(isHiddenToday && now < parseInt(isHiddenToday))) {
        
        // [핵심] 기존에 먼저 열려버린 대기 신청 모달창이 있다면 강제로 잠시 숨깁니다.
        const defaultModal = document.getElementById('applyModal');
        if (defaultModal && !defaultModal.classList.contains('hidden')) {
            defaultModal.classList.add('hidden');
        }

        // 부산 팝업 열기
        busanPopup.classList.remove('hidden');
        setTimeout(() => {
            busanPopup.style.opacity = '1';
            busanContent.style.transform = 'scale(1)';
        }, 50);
    }
}

// 팝업 닫기 애니메이션
function closeBusanPopupWithAnim(callback) {
    const busanPopup = document.getElementById('vividBusanPopup');
    const busanContent = document.getElementById('busanPopupContent');
    
    if (!busanPopup || !busanContent) return;

    busanPopup.style.opacity = '0';
    busanContent.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        busanPopup.classList.add('hidden');
        if (callback) callback();
    }, 300);
}

// 일반 닫기
function closeBusanPopup() {
    closeBusanPopupWithAnim();
}

// 오늘 하루 안 보기
function closeBusanPopupToday() {
    const checkIcon = document.getElementById('busanCheckIcon');
    if (checkIcon) {
        checkIcon.className = "fa-solid fa-square-check text-indigo-400";
    }
    
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('hideVividBusanPopupToday', expiryTime);
    
    setTimeout(() => {
        closeBusanPopupWithAnim();
    }, 200);
}

// 예약 버튼 클릭 시 실행
function handleFinalBooking(bookingType) {
    console.log(bookingType + " 선택됨");
    
    closeBusanPopupWithAnim(() => {
        // 팝업이 닫힌 후, 기존 홈페이지에 있던 openModal 함수를 안전하게 호출
        if (typeof openModal === 'function') {
            openModal();
        } else {
            // 혹시 openModal 함수명이 다르다면 아래 id를 직접 제어
            const defaultModal = document.getElementById('applyModal');
            if (defaultModal) defaultModal.classList.remove('hidden');
        }
    });
}

// 브라우저 로드 완료 시 안전하게 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVividBusanPopup);
} else {
    initVividBusanPopup();
}
