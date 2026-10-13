(() => {
  const models = [
    { id: "raptor-engine", title: "Двигатель Raptor 2", short: "Двигатель Raptor", category: "РАКЕТНАЯ ТЕХНИКА", technology: "SVG + WebGL", subtitle: "11 узлов · огневой стенд", description: "Двигатель в испытательном стенде: 11 сборочных узлов, сложная сеть трубопроводов и настоящий WebGL-выхлоп.", hint: "Наведите курсор, чтобы разобрать двигатель. Кнопка IGNITE или I запускает огневое испытание. Стрелки выбирают узлы." },
    { id: "ripple-tank", title: "Волновой бассейн", short: "Волновой бассейн", category: "ФИЗИКА ВОЛН", technology: "SVG + WebGL", subtitle: "Волны · свет · интерференция", description: "Два источника создают волны в воде. Лампа проецирует их пересечение на экран под бассейном — свет, отражения и движение связаны общей физической моделью.", hint: "Двигайте курсор по горизонтали, чтобы изменить частоту, и по вертикали — расстояние между источниками. Работают и стрелки." },
    { id: "desk-computer", title: "Компьютер из 1984-го", short: "Ретрокомпьютер", category: "ВЫЧИСЛИТЕЛЬНАЯ ТЕХНИКА", technology: "SVG", subtitle: "Клавиатура · живой CRT", description: "Моноблок в духе 1984 года: CRT-дисплей, дисковод, вентиляция и клавиатура. Каждое нажатие оживляет клавишу и выводит символ на экран.", hint: "Нажмите на модель и печатайте латинскими буквами. Backspace стирает, Enter переносит строку. Escape или щелчок по корпусу выключает экран." },
    { id: "arcade-cabinet", title: "Аркадный автомат", short: "Аркадный автомат", category: "ИГРОВАЯ МЕХАНИКА", technology: "SVG", subtitle: "Монета · схема · мини-игра", description: "Автомат со снятой боковой панелью. Монета проходит по желобу в кассу, замыкает контакт и запускает экран. Более 240 деталей и 15 кабелей.", hint: "Нажмите C или щёлкните по монетам. Стрелки ← → управляют игрой, пробел — действие. Сначала нажмите на модель для фокуса клавиатуры." },
    { id: "dial-indicator", title: "Индикатор часового типа", short: "Измерительный прибор", category: "ТОЧНОЕ ИЗМЕРЕНИЕ", technology: "SVG", subtitle: "Каретка · щуп · показания", description: "Щуп опирается на один из трёх мерных блоков. Движение каретки изменяет высоту щупа и поворачивает стрелку — показания следуют за геометрией.", hint: "Проведите курсором по модели, чтобы передвинуть каретку. Для точного переключения между блоками используйте стрелки, Home и End." },
    { id: "turning-dial", title: "Механический 3D-диск", short: "Механический диск", category: "ПРОСТРАНСТВЕННАЯ МЕХАНИКА", technology: "3D · beta", subtitle: "Вращение · робот · гравитация", description: "Кодовый диск и маленькая роботизированная рука. Около 90 деталей пересчитывают свою проекцию и освещение при каждом повороте в настоящем 3D.", hint: "Перетаскивайте диск или вращайте его стрелками. Клавиша B отрывает модуль, который падает как свободное тело. 3D-режим оригинала — beta." },
  ];
  const $ = (id) => document.getElementById(id);
  const list = $("model-list");
  const frame = $("model-frame");
  let index = 0;
  let theme = "light";
  let resizeObserver;
  let loadTimer;
  try { theme = localStorage.getItem("anatomy-theme") === "dark" ? "dark" : "light"; } catch {}
  const number = (value) => String(value).padStart(2, "0");
  const modelPath = () => `examples/${models[index].id}/${models[index].id}${theme === "light" ? "-light" : ""}.html`;

  models.forEach((model, position) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "model-choice";
    button.dataset.model = model.id;
    const count = document.createElement("span");
    count.className = "choice-number";
    count.textContent = number(position + 1);
    const text = document.createElement("span");
    text.className = "choice-text";
    const title = document.createElement("span");
    title.className = "choice-title";
    title.textContent = model.short;
    const subtitle = document.createElement("span");
    subtitle.className = "choice-subtitle";
    subtitle.textContent = model.subtitle;
    const arrow = document.createElement("span");
    arrow.className = "choice-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    text.append(title, subtitle);
    button.append(count, text, arrow);
    button.addEventListener("click", () => select(position));
    list.append(button);
  });

  function loadModel() {
    resizeObserver?.disconnect();
    clearTimeout(loadTimer);
    $("loading-state").hidden = false;
    $("loading-state").lastChild.textContent = "Собираем модель…";
    $("frame-shell").setAttribute("aria-busy", "true");
    frame.style.height = "800px";
    frame.title = `Интерактивная модель: ${models[index].title}`;
    frame.src = modelPath();
    $("open-model").href = modelPath();
    loadTimer = setTimeout(() => {
      $("loading-state").lastChild.textContent = "Модель загружается дольше обычного. Попробуйте «Сбросить» или «Отдельно».";
    }, 15000);
  }

  function select(position, updateHash = true) {
    index = (position + models.length) % models.length;
    const model = models[index];
    $("model-title").textContent = model.title;
    $("model-category").textContent = model.category;
    $("model-description").textContent = model.description;
    $("model-hint").textContent = model.hint;
    $("technology").textContent = model.technology;
    $("figure-number").textContent = `ЭКСПОНАТ ${number(index + 1)} / ${number(models.length)}`;
    $("page-count").textContent = `${number(index + 1)} / ${number(models.length)}`;
    [...list.children].forEach((button, position) => button.setAttribute("aria-current", String(position === index)));
    if (list.scrollWidth > list.clientWidth) {
      const chosen = list.children[index];
      const left = chosen.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
      list.scrollLeft = left - (list.clientWidth - chosen.offsetWidth) / 2;
    }
    document.title = `${model.title} — Anatomy`;
    if (updateHash) {
      try { history.replaceState(null, "", `#${model.id}`); } catch { location.hash = model.id; }
    }
    loadModel();
  }

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    $("theme-toggle").setAttribute("aria-pressed", String(dark));
    $("theme-toggle").setAttribute("aria-label", dark ? "Включить светлую тему" : "Включить тёмную тему");
    $("theme-label").textContent = dark ? "Светлая тема" : "Тёмная тема";
  }

  frame.addEventListener("load", () => {
    if (frame.getAttribute("src") === "about:blank") return;
    clearTimeout(loadTimer);
    $("loading-state").hidden = true;
    $("frame-shell").setAttribute("aria-busy", "false");
    try {
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      if (!doc.querySelector("svg")) {
        $("loading-state").hidden = false;
        $("loading-state").lastChild.textContent = "Не удалось открыть модель. Попробуйте «Сбросить» или «Отдельно».";
        return;
      }
      const style = doc.createElement("style");
      style.textContent = "html,body{min-height:0!important;height:auto!important}body{display:block!important;padding:18px!important;margin:0!important}.iso-plate{margin:0 auto!important}.iso-plate-corner{max-width:100%;white-space:normal;line-height:1.4}";
      doc.head.append(style);
      const resize = () => { frame.style.height = `${Math.ceil(doc.body.getBoundingClientRect().height) + 2}px`; };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(doc.body);
    } catch {}
  });

  $("theme-toggle").addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    try { localStorage.setItem("anatomy-theme", theme); } catch {}
    applyTheme();
    loadModel();
  });
  $("reset-model").addEventListener("click", loadModel);
  $("previous-model").addEventListener("click", () => select(index - 1));
  $("next-model").addEventListener("click", () => select(index + 1));
  list.addEventListener("keydown", (event) => {
    const current = [...list.children].indexOf(event.target);
    if (current < 0) return;
    let next = current;
    if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (current + 1) % models.length;
    else if (["ArrowUp", "ArrowLeft"].includes(event.key)) next = (current + models.length - 1) % models.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = models.length - 1;
    else return;
    event.preventDefault();
    list.children[next].focus();
    select(next);
  });
  function fromHash() {
    const found = models.findIndex((model) => `#${model.id}` === location.hash);
    select(found < 0 ? 0 : found, false);
  }
  window.addEventListener("hashchange", fromHash);
  applyTheme();
  fromHash();
})();
