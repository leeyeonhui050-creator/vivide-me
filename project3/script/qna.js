import {
    addQnaItem,
    addReviewItem,
    deleteQnaItem,
    deleteReviewItem,
    getQnaItems,
    getReviewItems,
    updateQnaItem,
    updateReviewItem
} from '../admin/firebase/sheet-api.js';

import { buildReviewCardHtml } from '../admin/js/review.js';


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


// 현재 페이지가 관리자 페이지인지 확인
function isAdminPage() {
    return location.pathname.includes('/admin/');
}


// 관리자 로그인 + 관리자 페이지일 때만 관리자 모드
function getAdminMode() {
    return isAdminPage() && localStorage.getItem('admin-auth') === 'true';
}


async function renderQna() {

    const faqList = document.getElementById('faq-list');
    const reviewsList = document.getElementById('reviews-list');

    const faqAdminPanel = document.getElementById('faq-admin-panel');
    const reviewAdminPanel = document.getElementById('review-admin-panel');


    if (faqAdminPanel) {
        faqAdminPanel.classList.toggle(
            'hidden',
            !getAdminMode()
        );
    }


    if (reviewAdminPanel) {
        reviewAdminPanel.classList.toggle(
            'hidden',
            !getAdminMode()
        );
    }


    if (!faqList) return;


    const [faqs, reviews] = await Promise.all([
        getQnaItems(),
        getReviewItems()
    ]);


    faqList.innerHTML = faqs.map((item) => `

        <div class="bg-white rounded-3xl shadow-sm overflow-hidden">

            <button
                onclick="toggleFaq(this)"
                class="faq-toggle w-full flex justify-between items-center px-8 py-6 font-bold text-left">

                ${escapeHtml(item.title || item.question || '질문')}

                <i class="fa-solid fa-plus"></i>

            </button>


            <div class="hidden px-8 pb-8 text-slate-600 leading-8">

                ${escapeHtml(
                    item.answer ||
                    item.answered ||
                    item.content ||
                    ''
                )}

            </div>


            ${
                getAdminMode()
                ?
                `
                <div class="px-8 pb-6 flex gap-3">

                    <button
                        type="button"
                        data-edit-faq="${escapeHtml(item.id)}"
                        class="text-sm font-semibold text-[#B58B5A]">

                        수정

                    </button>


                    <button
                        type="button"
                        data-delete-faq="${escapeHtml(item.id)}"
                        class="text-sm font-semibold text-red-500">

                        삭제

                    </button>

                </div>
                `
                :
                ''
            }


        </div>

    `).join();



    // 홈페이지 리뷰는 항상 일반 모드
    if (reviewsList) {

        reviewsList.innerHTML = reviews
            .map((item) => buildReviewCardHtml(item, false))
            .join('');

    }

}



function toggleFaq(button) {

    const content = button.nextElementSibling;
    const icon = button.querySelector('i');


    if (!content || !icon) return;


    content.classList.toggle('hidden');


    if (content.classList.contains('hidden')) {

        icon.className = 'fa-solid fa-plus';

    } else {

        icon.className = 'fa-solid fa-minus';

    }

}



function resetFaqForm() {

    const questionInput = document.getElementById('faq-question');
    const answerInput = document.getElementById('faq-answer');
    const editIdInput = document.getElementById('faq-edit-id');
    const submitButton = document.getElementById('faq-submit-btn');


    if (questionInput) questionInput.value = '';
    if (answerInput) answerInput.value = '';
    if (editIdInput) editIdInput.value = '';
    if (submitButton) submitButton.textContent = '추가';

}



function resetReviewForm() {

    const nameInput = document.getElementById('review-name');
    const contentInput = document.getElementById('review-content');
    const ratingSelect = document.getElementById('review-rating');
    const editIdInput = document.getElementById('review-edit-id');
    const imageInput = document.getElementById('review-image');
    const submitButton = document.getElementById('review-submit-btn');


    if (nameInput) nameInput.value = '';
    if (contentInput) contentInput.value = '';
    if (ratingSelect) ratingSelect.value = '5';
    if (editIdInput) editIdInput.value = '';
    if (imageInput) imageInput.value = '';
    if (submitButton) submitButton.textContent = '추가';

}



async function submitFaq() {

    const questionInput = document.getElementById('faq-question');
    const answerInput = document.getElementById('faq-answer');
    const editIdInput = document.getElementById('faq-edit-id');


    if (!questionInput || !answerInput) return;


    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();


    if (!question || !answer) return;



    if (editIdInput && editIdInput.value) {

        await updateQnaItem(
            editIdInput.value,
            question,
            answer
        );

    } else {

        await addQnaItem(
            question,
            answer
        );

    }


    resetFaqForm();

    await renderQna();

}



async function submitReview() {

    const nameInput = document.getElementById('review-name');
    const contentInput = document.getElementById('review-content');
    const ratingSelect = document.getElementById('review-rating');
    const editIdInput = document.getElementById('review-edit-id');
    const imageInput = document.getElementById('review-image');


    if (!nameInput || !contentInput || !ratingSelect) return;


    const author = nameInput.value.trim();
    const content = contentInput.value.trim();
    const rating = Number(ratingSelect.value);


    if (!author || !content) return;



    if (editIdInput && editIdInput.value) {

        await updateReviewItem(
            editIdInput.value,
            author,
            content,
            rating,
            imageInput?.files?.[0] || ''
        );

    } else {

        await addReviewItem(
            author,
            content,
            rating,
            imageInput?.files?.[0] || ''
        );

    }


    resetReviewForm();

    await renderQna();

}



async function deleteFaq(id) {

    await deleteQnaItem(id);

}



async function deleteReview(id) {

    await deleteReviewItem(id);

}



function bindQnaEvents() {

    document.addEventListener('click', async (event)=>{


        const editFaqButton =
            event.target.closest('[data-edit-faq]');


        if(editFaqButton){

            const faqId = editFaqButton.dataset.editFaq;

            const faqs = await getQnaItems();

            const target =
                faqs.find(item => item.id === faqId);


            if(target){

                document.getElementById('faq-question').value =
                    target.question || '';

                document.getElementById('faq-answer').value =
                    target.answer || '';

                document.getElementById('faq-edit-id').value =
                    target.id;

                document.getElementById('faq-submit-btn').textContent =
                    '수정';

            }

            return;

        }




        const editReviewButton =
            event.target.closest('[data-edit-review]');


        if(editReviewButton){

            const reviewId =
                editReviewButton.dataset.editReview;


            const reviews =
                await getReviewItems();


            const target =
                reviews.find(item => item.id === reviewId);



            if(target){

                document.getElementById('review-name').value =
                    target.author || '';

                document.getElementById('review-content').value =
                    target.content || '';

                document.getElementById('review-rating').value =
                    String(target.rating || 5);

                document.getElementById('review-edit-id').value =
                    target.id;

                document.getElementById('review-submit-btn').textContent =
                    '수정';

            }


            return;

        }




        const deleteFaqButton =
            event.target.closest('[data-delete-faq]');


        if(deleteFaqButton){

            await deleteFaq(
                deleteFaqButton.dataset.deleteFaq
            );

            await renderQna();

            return;

        }




        const deleteReviewButton =
            event.target.closest('[data-delete-review]');


        if(deleteReviewButton){

            await deleteReview(
                deleteReviewButton.dataset.deleteReview
            );

            await renderQna();

        }


    });

}



function initPage(){

    renderQna();

    bindQnaEvents();

}



window.toggleFaq = toggleFaq;


window.addEventListener('storage',()=>{

    renderQna();

});



setTimeout(()=>{

    initPage();

},300);