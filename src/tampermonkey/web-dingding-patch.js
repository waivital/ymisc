// ==UserScript==
// @name         Web DingDing Patch
// @namespace    https://im.dingtalk.com/
// @version      0.2
// @description  path web dingding
// @author       waivital
// @match        https://im.dingtalk.com/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const css = `
#layout-main {
  width: 94% !important;
  height: 94% !important;
  flex: 0 1 auto !important;
}
#body {
  height: auto !important;
  flex: 1 !important;
  min-height: 0 !important;
}
`
  const $head = document.querySelector('head')
  const $style = document.createElement('style')
  $style.innerHTML = css
  $head.appendChild($style)
})();
