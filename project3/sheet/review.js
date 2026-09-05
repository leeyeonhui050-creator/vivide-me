export function buildReviewCardHtml(item, isAdminMode = false) {
  return `
    <div class="bg-white rounded-3xl p-8 shadow-sm relative">

      <div class="text-[#B58B5A]">
        ${'★'.repeat(Number(item.rating) || 5)}
      </div>

      <p class="mt-5 text-slate-600 leading-8">
        ${escapeHtml(item.content || '')}
      </p>

      <p class="mt-6 font-bold">
        ${escapeHtml(item.name || item.author || '익명')}
      </p>

      ${
        isAdminMode
          ? `
            <div class="mt-4 flex gap-3">
              <button
                type="button"
                data-edit-review="${escapeHtml(item.id)}"
                class="text-sm font-semibold text-[#B58B5A]"
              >
                수정
              </button>

              <button
                type="button"
                data-delete-review="${escapeHtml(item.id)}"
                class="text-sm font-semibold text-red-500"
              >
                삭제
              </button>
            </div>
          `
          : ''
      }

    </div>
  `;
}


function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
