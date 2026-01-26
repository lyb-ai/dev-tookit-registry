/**
 * 复制文本到剪贴板
 * 兼容性处理：优先使用 Clipboard API，降级使用 document.execCommand
 * @param text 需要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const handleCopy = async (text: string): Promise<boolean> => {
  // 1. 尝试使用 Modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Clipboard API failed, falling back to execCommand:', error);
      // 继续执行降级方案
    }
  }

  // 2. 降级方案：使用 document.execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // 确保 textArea 不在可视区域内，但保留在 DOM 中以便选中
    // 使用 fixed 定位避免影响页面布局
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    // 设置 readonly 防止在移动端唤起键盘
    textArea.setAttribute('readonly', '');

    document.body.appendChild(textArea);

    textArea.select();
    textArea.setSelectionRange(0, 99999); // 兼容移动端

    const successful = document.execCommand('copy');

    document.body.removeChild(textArea);

    return successful;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
};
