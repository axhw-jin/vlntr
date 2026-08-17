/* 공용 날짜 선택기.

   <input type="date">는 브라우저마다 달력 모양이 다르고 CSS로 손댈 수 없다.
   게다가 크롬에서는 오른쪽 끝 작은 아이콘을 정확히 눌러야만 달력이 열린다.
   그래서 입력창 어디를 눌러도 바로 열리고, theme.css의 색 토큰을 그대로 쓰는
   달력을 직접 그린다.

   쓰는 쪽:
     const p = createDatePicker({ mount: el, id: "fFrom", placeholder: "시작일",
                                  onChange(v) { ... } });
     p.setValue("2026-08-22");   // "" 를 넣으면 비운다
     p.getValue();

   값은 항상 "YYYY-MM-DD" 문자열이거나 "" 다. */

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const CAL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
  '<rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/>' +
  '<path d="M8 3.5v4M16 3.5v4M3.5 10.5h17"/>' +
  "</svg>";

function pad(n) {
  return String(n).padStart(2, "0");
}

function iso(y, m, d) {
  return y + "-" + pad(m + 1) + "-" + pad(d);
}

function isoOf(dt) {
  return iso(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function todayIso() {
  return isoOf(new Date());
}

function parseIso(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

// 화면에 보여줄 형태. "2026-08-22" → "2026.08.22"
function fieldLabel(s) {
  const p = parseIso(s);
  return p ? p.y + "." + pad(p.m + 1) + "." + pad(p.d) : "";
}

// 한 번에 하나만 열어 둔다
let openOne = null;

export function createDatePicker(opts) {
  const root = opts.mount;
  const placeholder = opts.placeholder || "날짜 선택";
  const onChange = opts.onChange || function () {};

  let value = opts.value || "";
  let view = parseIso(value) || parseIso(todayIso()); // 지금 보고 있는 달
  let open = false;

  root.classList.add("dp");
  root.innerHTML = "";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dp-field";
  if (opts.id) btn.id = opts.id;
  btn.setAttribute("aria-haspopup", "dialog");

  const pop = document.createElement("div");
  pop.className = "dp-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", placeholder);

  root.append(btn, pop);

  function renderField() {
    btn.innerHTML =
      '<span class="dp-val' + (value ? "" : " ph") + '">' +
      (value ? fieldLabel(value) : placeholder) +
      "</span>" +
      (value
        ? '<span class="dp-x" data-act="clear" role="button" tabindex="-1" aria-label="날짜 지우기">×</span>'
        : CAL_ICON);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function renderPop() {
    const firstDay = new Date(view.y, view.m, 1).getDay(); // 1일의 요일
    // 항상 6줄을 그려서 달을 넘겨도 달력 높이가 흔들리지 않게 한다
    const start = new Date(view.y, view.m, 1 - firstDay);
    const today = todayIso();

    let days = "";
    for (let i = 0; i < 42; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const s = isoOf(dt);
      let cls = "dp-day";
      if (dt.getMonth() !== view.m) cls += " out";
      if (s === value) cls += " sel";
      else if (s === today) cls += " today";
      days +=
        '<button type="button" class="' + cls + '" data-d="' + s + '">' +
        dt.getDate() +
        "</button>";
    }

    pop.innerHTML =
      '<div class="dp-head">' +
        '<button type="button" class="dp-nav" data-nav="-1" aria-label="이전 달">‹</button>' +
        '<span class="dp-title">' + view.y + "년 " + (view.m + 1) + "월</span>" +
        '<button type="button" class="dp-nav" data-nav="1" aria-label="다음 달">›</button>' +
      "</div>" +
      '<div class="dp-grid dp-wd">' +
        WEEKDAYS.map((w) => "<span>" + w + "</span>").join("") +
      "</div>" +
      '<div class="dp-grid dp-days">' + days + "</div>" +
      '<div class="dp-foot">' +
        '<button type="button" class="dp-lnk" data-act="today">오늘</button>' +
        '<button type="button" class="dp-lnk" data-act="clear">지우기</button>' +
      "</div>";
  }

  // 오른쪽 화면 밖으로 나가면 오른쪽 끝에 맞춘다
  function place() {
    pop.style.left = "0";
    pop.style.right = "auto";
    const r = pop.getBoundingClientRect();
    if (r.right > window.innerWidth - 8) {
      pop.style.left = "auto";
      pop.style.right = "0";
    }
  }

  function setOpen(next) {
    if (next === open) return;
    open = next;
    if (open) {
      if (openOne && openOne !== api) openOne.close();
      openOne = api;
      view = parseIso(value) || parseIso(todayIso());
      renderPop();
      pop.hidden = false;
      place();
    } else {
      pop.hidden = true;
      if (openOne === api) openOne = null;
    }
    renderField();
  }

  function commit(next) {
    value = next;
    renderField();
    onChange(value);
  }

  btn.addEventListener("click", function (e) {
    // 입력창 안의 × 는 달력을 열지 않고 값만 지운다
    if (e.target.closest('[data-act="clear"]')) {
      setOpen(false);
      commit("");
      return;
    }
    setOpen(!open);
  });

  pop.addEventListener("click", function (e) {
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      const step = Number(nav.dataset.nav);
      const dt = new Date(view.y, view.m + step, 1);
      view = { y: dt.getFullYear(), m: dt.getMonth(), d: 1 };
      renderPop();
      return;
    }

    const day = e.target.closest("[data-d]");
    if (day) {
      setOpen(false);
      commit(day.dataset.d);
      return;
    }

    const act = e.target.closest("[data-act]");
    if (!act) return;
    if (act.dataset.act === "today") {
      setOpen(false);
      commit(todayIso());
    } else if (act.dataset.act === "clear") {
      setOpen(false);
      commit("");
    }
  });

  // 바깥을 누르거나 Esc를 누르면 닫는다
  document.addEventListener("mousedown", function (e) {
    if (open && !root.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) {
      setOpen(false);
      btn.focus();
    }
  });

  const api = {
    setValue(v) {
      const next = parseIso(v) ? v : "";
      if (next === value) return;
      value = next;
      renderField();
    },
    getValue() {
      return value;
    },
    close() {
      setOpen(false);
    },
  };

  renderField();
  return api;
}
