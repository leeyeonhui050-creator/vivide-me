import {
    getQnaItems,
    getReviewItems
} from '../sheet/sheet-api.js';

import { buildReviewCardHtml } from '../sheet/review.js';


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


async function renderQna() {

    const faqList = document.getElementById('faq-list');
    const reviewsList = document.getElementById('reviews-list');

    // The Q&A component is loaded dynamically, so do nothing until it exists.
    if (!faqList && !reviewsList) return;

    try {
        const [faqs, reviews] = await Promise.all([
            faqList ? getQnaItems() : Promise.resolve([]),
            reviewsList ? getReviewItems() : Promise.resolve([])
        ]);

        if (faqList) {
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

        </div>

    `).join('');
        }

        // Reviews are read-only on the public page and come directly from Google Sheets.
        // No image field is rendered.
        if (reviewsList) {
            reviewsList.innerHTML = reviews
                .map((item) => buildReviewCardHtml(item, false))
                .join('');
        }
    } catch (error) {
        console.error('Q&A/Review loading failed:', error);
        if (reviewsList) {
            reviewsList.innerHTML = '';
        }
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


function initPage() {
    renderQna();
}


document.addEventListener('componentsLoaded', initPage, { once: true });

// Handles direct loading of qna.js when the components are already present.
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('faq-list') || document.getElementById('reviews-list')) {
        initPage();
    }
});


window.toggleFaq = toggleFaq;
