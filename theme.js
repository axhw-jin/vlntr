/* 라이트/다크 테마 전환.
   <head>에서 동기적으로 불러 첫 페인트 전에 data-theme을 붙인다 (깜빡임 방지).
   저장값이 없으면 OS 설정(prefers-color-scheme)을 따른다. */
(function () {
  var KEY = "vlntr-theme";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) {
      return null; // 시크릿 모드 등에서 localStorage가 막혀도 동작은 계속한다
    }
  }

  function apply(theme) {
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }

  // 첫 페인트 전에 적용
  apply(stored());

  function current() {
    return stored() || (mq.matches ? "dark" : "light");
  }

  var SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' +
    "</svg>";
  var MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>' +
    "</svg>";

  function mount() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;

    function paint() {
      var dark = current() === "dark";
      btn.innerHTML = dark ? SUN : MOON;
      var label = dark ? "밝은 화면으로 전환" : "어두운 화면으로 전환";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }

    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {}
      apply(next);
      paint();
    });

    // 한 번이라도 직접 고르면 그 선택이 우선이고, 그전까지는 OS 설정을 따라간다
    var onChange = function () {
      if (!stored()) paint();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);

    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
