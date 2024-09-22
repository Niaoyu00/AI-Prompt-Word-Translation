const { ipcRenderer } = require('electron');
const { clipboard } = require('electron'); // 引入clipboard模块

document.addEventListener('DOMContentLoaded', () => {
  const inputField = document.querySelector('.input-field');
  const outputWindow = document.querySelector('.output-window');

    // 监听paste事件
    inputField.addEventListener('paste', function(event) {
        // 阻止默认粘贴行为
        event.preventDefault();

        // 获取剪贴板数据
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData('Text');

        // 插入提取的文本内容到inputField中
        document.execCommand('insertText', false, pastedData);
    });

  // 监听来自主进程的更新置顶图标颜色的事件
  ipcRenderer.on('update-top-icon', (event, isTop) => {
    const topIcon = document.querySelector('.top svg');
    if (isTop) {
      topIcon.style.fill = '#e75151'; // 如果是置顶状态，将颜色改为粉红色
          // 显示通知
      const notification = document.getElementById('copyNotification');
      notification.textContent = '已置顶';
      notification.style.display = 'block';
      // 设置一个定时器来隐藏通知
      setTimeout(() => {
        notification.style.display = 'none';
      }, 2000); // 通知显示2秒后自动消失
    } else {
      topIcon.style.fill = 'currentColor'; // 如果不是置顶状态，恢复默认颜色
      // 显示通知
      const notification = document.getElementById('copyNotification');
      notification.textContent = '取消置顶';
      notification.style.display = 'block';
      // 设置一个定时器来隐藏通知
      setTimeout(() => {
        notification.style.display = 'none';
      }, 2000); // 通知显示2秒后自动消失
    }
  });

  // 实时翻译功能
  inputField.addEventListener('input', () => {
    const text = inputField.innerText; // 使用innerText获取div的内容
    if (text) {
      // 向主进程发送翻译请求
      ipcRenderer.send('translate', text);
    }
  });

  // 监听来自主进程的翻译结果
  ipcRenderer.on('translated', (event, translatedText) => {
    // 清空输出窗口
    outputWindow.innerHTML = '';
    // 定义分隔符正则表达式
    const separators = /[,，、(（]/g;
    // 使用正则表达式分割翻译文本
    const words = translatedText.split(separators).filter(Boolean);
    
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word'; // 应用CSS样式
      span.textContent = word+','; // 添加单词
      span.dataset.index = index; // 添加数据属性以跟踪单词索引
      span.addEventListener('mouseover', highlightCorrespondingWord); // 为span添加鼠标悬停事件监听器
      span.addEventListener('mouseout', removeHighlight); // 为span添加鼠标移出事件监听器
      span.addEventListener('click', copyToClipboard); // 为span添加点击事件监听器
      outputWindow.appendChild(span);
    });
      // 在翻译完成后添加复制图标
      addCopyIcon();
  });
});
//高亮显示两侧单词
function highlightCorrespondingWord(event) {
  const highlightedWord = event.target.textContent.trim();
  const spans = document.querySelectorAll('.output-window .word');
  const index = event.target.dataset.index; // 获取单词的索引
  
  // 高亮显示outputWindow中的单词
  spans.forEach(span => {
    if (span.dataset.index === index) {
      span.classList.add('active');
    }
  });

 // 获取inputField中的文本，并使用正则表达式匹配所有可能的分隔符
  const inputText = inputField.innerText;
  const wordSeparators = /[,，、:.]/g; // 这里添加了常见的分隔符，可以继续添加其他分隔符
  const inputWords = inputText.split(wordSeparators).filter(Boolean); // 分割文本并过滤掉空字符串

  // 找到对应的单词并高亮显示
  const correspondingWord = inputWords[index];
  const range = document.createRange();
  const sel = window.getSelection();
  const textNode = inputField.childNodes[0]; // 假设inputField只有一个文本节点
  
  if (textNode && correspondingWord) {
    const wordStartIndex = textNode.textContent.indexOf(correspondingWord);
    if (wordStartIndex !== -1) {
      range.setStart(textNode, wordStartIndex);
      range.setEnd(textNode, wordStartIndex + correspondingWord.length);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
//删除高亮样式
function removeHighlight() {
  const spans = document.querySelectorAll('.output-window .word');
  spans.forEach(span => {
    span.classList.remove('active');
  });
  window.getSelection().removeAllRanges();
}
//单词复制功能和提示
function copyToClipboard(event) {
  const wordToCopy = event.target.textContent.trim().replace(/, /g, '');
  clipboard.writeText(wordToCopy); // 将单词复制到粘贴板
  // 显示复制通知
  const notification = document.getElementById('copyNotification');
  notification.textContent = '已复制：' + wordToCopy;
  notification.style.display = 'block';
  // 设置一个定时器来隐藏通知
  setTimeout(() => {
    notification.style.display = 'none';
  }, 2000); // 通知显示2秒后自动消失
}
// 添加复制图标的函数
function addCopyIcon() {
  const copyIcon = document.createElement('img');
  copyIcon.src = 'https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/copy-icon.png';
  copyIcon.alt = 'Copy';
  copyIcon.className = 'copy-icon';
  copyIcon.title = '复制全部';
  copyIcon.style.position = 'absolute';
  copyIcon.style.bottom = '10px';
  copyIcon.style.right = '10px';
  copyIcon.style.cursor = 'pointer';
  copyIcon.style.width = '20px'; // 根据实际图片大小调整
  copyIcon.style.height = '20px'; // 根据实际图片大小调整
  copyIcon.style.opacity = '0.5'; // 设置初始透明度
  copyIcon.style.transition = 'opacity 0.3s ease'; // 添加透明度变化的过渡效果
  copyIcon.addEventListener('click', () => {
    const outputWindowText = outputWindow.innerText;
    clipboard.writeText(outputWindowText);
    // 显示复制通知
    const notification = document.getElementById('copyNotification');
    notification.textContent = '已复制所有文本';
    notification.style.display = 'block';
    // 设置一个定时器来隐藏通知
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000); // 通知显示2秒后自动消失
  });
  outputWindow.appendChild(copyIcon);
}

// 添加一个新的CSS样式用于激活高亮显示
const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  .word.active, .input-field::selection {
    background-color: yellow;
    cursor: pointer;
  }
`;
document.head.appendChild(style);
