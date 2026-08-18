/* 모든 화면이 함께 쓰는 상단 내비게이션.

   화면마다 헤더가 조금씩 달라서 "지금 어디에 있고 어디로 갈 수 있는지"가
   일정하지 않았다. 여기서 한 벌로 그린다.

   - 왼쪽 로고가 홈으로 가는 유일한 길이다. 화면 제목은 링크가 아니다.
     (마이페이지에서 제목 "마이페이지"를 누르면 홈으로 가던 동작을 없앴다)
   - 지금 보고 있는 화면은 aria-current="page" 로 표시해 색으로 구분한다.

   supabase 를 직접 import 하지 않는다. 그 모듈은 네트워크에서 받아오므로,
   같이 묶으면 내비게이션이 늦게 그려진다. 로그인 상태는 각 화면이 준비되는
   대로 setAuth() 로 알려준다. */

const ICON = {
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  new: '<circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/>',
  mypage: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
};

function svg(d) {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"
  );
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

// 로그인해야 의미가 있는 곳은 로그인한 뒤에만 보여준다
const ITEMS = [
  { key: "list", href: "./list.html", label: "목록", auth: false },
  { key: "map", href: "./map.html", label: "지도", auth: false },
  { key: "new", href: "./new.html", label: "등록", auth: true },
  { key: "mypage", href: "./mypage.html", label: "마이페이지", auth: true },
];

export function mountNav(opts) {
  const current = opts.current || "";
  const root = opts.mount || document.getElementById("topbar");
  if (!root) return { setAuth() {} };

  root.className = "topbar";
  root.innerHTML =
    '<div class="wrap nav-row">' +
      '<a class="brand" href="./index.html"' +
      (current === "home" ? ' aria-current="page"' : "") +
      ">" +
        '<svg class="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" aria-hidden="true"><circle cx="9" cy="12" r="5"/>' +
        '<circle cx="15" cy="12" r="5"/></svg>' +
        "<span>vlntr</span>" +
      "</a>" +
      '<nav class="nav-links" id="navLinks" aria-label="주요 메뉴"></nav>' +
      '<div class="nav-right">' +
        '<button type="button" class="theme-toggle" id="themeToggle" aria-label="화면 테마 전환"></button>' +
        '<span class="nav-auth" id="navAuth"></span>' +
      "</div>" +
    "</div>";

  const linksEl = root.querySelector("#navLinks");
  const authEl = root.querySelector("#navAuth");

  function renderLinks(signedIn) {
    // 로그인 전이라도 지금 보고 있는 화면은 남겨둔다 (어디에 있는지 알 수 있게)
    linksEl.innerHTML = ITEMS.filter((it) => !it.auth || signedIn || it.key === current)
      .map(
        (it) =>
          '<a href="' + it.href + '"' +
          (it.key === current ? ' aria-current="page"' : "") +
          ' title="' + it.label + '">' +
          svg(ICON[it.key]) +
          "<span>" + it.label + "</span></a>"
      )
      .join("");
  }

  renderLinks(false);

  // 테마 버튼은 지금 막 만들어졌으므로 theme.js 에 다시 붙여달라고 알린다
  if (window.vlntrTheme) window.vlntrTheme.mount();

  return {
    /* user: Supabase 사용자 객체(없으면 null),
       onSignIn / onSignOut: 각 화면이 가진 supabase 클라이언트를 호출하는 함수 */
    setAuth(user, onSignIn, onSignOut) {
      renderLinks(Boolean(user));
      if (user) {
        const name = user.user_metadata?.name || user.email || "로그인됨";
        authEl.innerHTML =
          '<span class="nav-user" title="' + esc(name) + '">' +
            '<span class="nav-avatar" aria-hidden="true">' +
              esc(name.trim().charAt(0).toUpperCase()) +
            "</span>" +
            '<span class="nav-name">' + esc(name) + "</span>" +
          "</span>" +
          '<button type="button" class="nav-out" id="navOut" aria-label="로그아웃" title="로그아웃">' +
          svg(ICON.out) + "</button>";
        const out = authEl.querySelector("#navOut");
        if (onSignOut) out.addEventListener("click", onSignOut);
      } else {
        authEl.innerHTML =
          '<button type="button" class="nav-in" id="navIn">로그인</button>';
        const inBtn = authEl.querySelector("#navIn");
        if (onSignIn) inBtn.addEventListener("click", onSignIn);
      }
    },
  };
}
