(function() {
  'use strict';

  var aiBar = document.getElementById('ai-bar');
  var aiInput = document.getElementById('ai-input');
  var aiResult = document.getElementById('ai-result');
  var aiSend = document.getElementById('ai-send');
  var aiClose = document.getElementById('ai-close');
  var isOpen = false;

  if (!window.overlayApi) return;

  window.overlayApi.onToggleAi(function() {
    isOpen = !isOpen;
    aiBar.style.display = isOpen ? 'flex' : 'none';
    if (!isOpen) {
      aiResult.style.display = 'none';
      aiResult.textContent = '';
    }
    if (isOpen) aiInput.focus();
  });

  function sendQuery() {
    var query = aiInput.value.trim();
    if (!query) return;
    aiInput.value = '';
    aiResult.style.display = 'block';
    aiResult.innerHTML = '<div class="ai-loading">思考中...</div>';

    window.overlayApi.aiQuery(query).then(function(result) {
      aiResult.textContent = result.answer || '（无回复）';
    }).catch(function() {
      aiResult.textContent = '❌ 查询失败';
    });
  }

  aiSend.addEventListener('click', sendQuery);
  aiInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendQuery();
  });
  aiClose.addEventListener('click', function() {
    isOpen = false;
    aiBar.style.display = 'none';
    aiResult.style.display = 'none';
    aiResult.textContent = '';
  });
})();
