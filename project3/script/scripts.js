// ================================
// Google Apps Script
// ================================

const scriptURL = "https://script.google.com/macros/s/AKfycbyL0Ss4ON8OkMq4ltByzH_iS4AheqoaSp7CA6vSJQmveYUdWgz_93gSeIClhF0anSStPQ/exec";

function initPage() {

    const form = document.getElementById("vividSubmitForm");
    const submitBtn = document.getElementById("submitBtn");

    if (!form || !submitBtn) return;

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        // 버튼 비활성화
        submitBtn.disabled = true;

        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            신청 접수 중...
        `;

        fetch(scriptURL, {
            method: "POST",
            body: new FormData(form),
            mode: "no-cors"
        })
        .then(() => {

            submitBtn.innerHTML = `
                <i class="fas fa-check mr-2"></i>
                신청 완료!
            `;

            alert("성공적으로 신청되었습니다!\n담당자가 확인 후 입력해주신 연락처(010)로 순차적으로 연락드릴 예정이오니 참고 부탁드립니다.");

            form.reset();

            setTimeout(() => {

                closeApplyModal();

                submitBtn.disabled = false;
                submitBtn.innerHTML = "신청 완료하기";

            }, 500);

        })
        .catch((err) => {

            console.error(err);

            alert("오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");

            submitBtn.disabled = false;
            submitBtn.innerHTML = "신청 완료하기";

        });

    });
    // ==========================
    // 모바일 메뉴 자동 닫기
    // ==========================
    document.querySelectorAll(".mobile-link").forEach(link => {

        link.addEventListener("click", function () {
            closeMobileMenu();
        });

    });

}

// ================================
// 네비게이션
// ================================

function toggleNavDropdown() {
    document.getElementById("navDropdown").classList.toggle("hidden");
}

function openBookingModal(type) {

    document.getElementById("navDropdown").classList.add("hidden");
    document.getElementById("bookingModal").classList.remove("hidden");

    changeBookingTab(type);

}

function closeBookingModal() {

    document.getElementById("bookingModal").classList.add("hidden");

}

function changeBookingTab(type) {

    const pSection = document.getElementById("personalPrices");
    const cSection = document.getElementById("classNotice");

    const pBtn = document.getElementById("btnTabPersonal");
    const cBtn = document.getElementById("btnTabClass");

    if (type === "personal") {

        pSection.classList.remove("hidden");
        cSection.classList.add("hidden");

        pBtn.className = "w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-md shadow-md transition";
        cBtn.className = "w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold text-md hover:bg-slate-200 transition";

    } else {

        pSection.classList.add("hidden");
        cSection.classList.remove("hidden");

        pBtn.className = "w-full bg-slate-100 text-slate-700 py-4 rounded-xl font-bold text-md hover:bg-slate-200 transition";
        cBtn.className = "w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-md shadow-md transition";

    }

}

// ================================
// 신청 모달
// ================================

function openApplyModal() {

    const modal = document.getElementById("applyModalBox");

    if (modal) {
        modal.classList.remove("hidden");
    }

}

function closeApplyModal() {

    const modal = document.getElementById("applyModalBox");

    if (modal) {
        modal.classList.add("hidden");
    }

}

// ================================
// 모달 바깥 클릭
// ================================

window.onclick = function (event) {

    const modal = document.getElementById("applyModalBox");

    if (event.target === modal) {
        closeApplyModal();
    }

};

//헤더 반응형
function toggleMobileMenu() {

    const menu = document.getElementById("mobileMenu");

    if(menu){

        menu.classList.toggle("hidden");

    }

}

// 모바일 메뉴 열기/닫기
function toggleMobileMenu() {

    const menu = document.getElementById("mobileMenu");

    if (menu) {
        menu.classList.toggle("hidden");
    }

}

// 모바일 메뉴 닫기
function closeMobileMenu() {

    const menu = document.getElementById("mobileMenu");

    if (menu) {
        menu.classList.add("hidden");
    }

}