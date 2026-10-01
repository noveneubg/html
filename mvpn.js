// mvpn button: mullvad exit picker.
// server pool stays on the VPS (keys never leave it); this UI only talks
// to /api/mvpn/* (rewritten to the api host at build time).
(function () {
    var BTN_ID = "mvpnBtn";
    var PANEL_ID = "mvpnPanel";
    var CACHE_MS = 5 * 60 * 1000;
    var cache = { at: 0, list: null };
    var panelEl = null;
    var busy = false;

    var MOLE_IMG = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjU0cHgiIGhlaWdodD0iMjU0cHgiIHZpZXdCb3g9IjAgMCAyNTQgMjU0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPGcgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTAuNywxMjcgQzAuNywxOTYuOCA1Ny4zLDI1My4zIDEyNywyNTMuMyBDMTk2LjcsMjUzLjMgMjUzLjMsMTk2LjggMjUzLjMsMTI3IEMyNTMuMyw1Ny4yIDE5Ni44LDAuNyAxMjcsMC43IEM1Ny4yLDAuNyAwLjcsNTcuMiAwLjcsMTI3IEwwLjcsMTI3IEwwLjcsMTI3IEwwLjcsMTI3IFoiIGlkPSJiZyIgZmlsbD0iIzE5MkU0NSIgLz4KICAgICAgICA8cGF0aCBkPSJNMTcuNiwxMTEuOSBMMjcuMiw5OC41IEMyNy4yLDk4LjYgMjYuNiwxMTcuOCAyNi42LDExNy44IEwyOS4zLDEwMy4zIEMzNy4zLDExOS41IDU2LjksMTQxLjkgNzQuOCwxNTMuOSBDNzYuNywxNTUuMiA3OC4zLDE1Ni42IDc5LjQsMTU4IEM4MS43LDE1OC45IDg0LDE1OS40IDg2LjMsMTU5LjggQzg3LjUsMTYwIDg4LjgsMTYwLjEgOTAsMTYwLjIgQzkxLjIsMTYwLjMgOTIuNSwxNjAuMyA5My43LDE2MC4zIEM5NC45LDE2MC4zIDk2LjEsMTYwLjIgOTcuMywxNjAuMSBDOTguNSwxNjAgOTkuNywxNTkuOCAxMDAuOSwxNTkuNiBDMTAyLjEsMTU5LjQgMTAzLjMsMTU5LjIgMTA0LjQsMTU4LjggQzEwNS42LDE1OC41IDEwNi43LDE1OC4yIDEwNy45LDE1Ny44IEMxMDksMTU3LjUgMTEwLjIsMTU3IDExMS4zLDE1Ni42IEMxMTIuNCwxNTYuMSAxMTMuNSwxNTUuNyAxMTQuNiwxNTUuMSBDMTE1LjcsMTU0LjUgMTE2LjgsMTU0IDExNy44LDE1My40IEMxMTguOSwxNTIuOSAxMTkuOSwxNTIuMiAxMjEsMTUxLjYgQzEyMi4xLDE1MSAxMjMuMSwxNTAuMyAxMjQuMiwxNDkuNyBDMTI1LjMsMTQ5LjEgMTI2LjMsMTQ4LjQgMTI3LjMsMTQ3LjggQzEyOC4zLDE0Ny4xIDEyOS40LDE0Ni41IDEzMC40LDE0NS44IEMxMzEuNCwxNDUuMSAxMzIuNSwxNDQuNSAxMzMuNiwxNDMuOCBMMTM0LjYsMTQzLjIgTDEzNS4xLDE0My41IEwxNDIuMywxNDguMyBMMTM1LDE0Ni40IEMxMzQuMywxNDcuMiAxMzMuNiwxNDggMTMyLjgsMTQ4LjggQzEzMS45LDE0OS43IDEzMC45LDE1MC42IDEzMCwxNTEuNSBDMTI5LDE1Mi4zIDEyOCwxNTMuMiAxMjYuOSwxNTMuOSBDMTI1LjgsMTU0LjcgMTI0LjgsMTU1LjQgMTIzLjYsMTU2LjEgQzEyMS40LDE1Ny41IDExOSwxNTguNyAxMTYuNSwxNTkuNyBDMTE1LjMsMTYwLjIgMTE0LDE2MC43IDExMi44LDE2MS4xIEMxMTEuNSwxNjEuNSAxMTAuMywxNjEuOSAxMDksMTYyLjIgQzEwNy43LDE2Mi41IDEwNi40LDE2Mi44IDEwNS4xLDE2MyBDMTAzLjgsMTYzLjIgMTAyLjUsMTYzLjMgMTAxLjIsMTYzLjUgQzk4LjYsMTYzLjYgOTUuOSwxNjMuNiA5My4zLDE2My4yIEM5MiwxNjMgOTAuNywxNjIuOCA4OS40LDE2Mi41IEM4OC4xLDE2Mi4yIDg2LjksMTYxLjggODUuNywxNjEuNCBDODMuNiwxNjAuNiA4MS41LDE1OS42IDc5LjYsMTU4LjQgQzc5LjYsMTU4LjQgNzIuNywxNTkuNCA3NS41LDE2NC42IEM3OC4zLDE2OS44IDgyLjUsMTY5LjMgODAuNSwxNzUuNCBDNzkuMSwxNzguNyA3Ny4xLDE4MS45IDc0LjksMTg0LjkgQzcwLjMsMTkxLjEgNjMuMSwxOTYuNiA2My44LDE5OS45IEM5Ni41LDI0MC4yIDE3MC4yLDIzNC42IDE5OC4yLDE5OC42IEMxOTcuOCwxOTMuNCAxODkuNiwxOTAuOSAxODMuOSwxNzguMiBDMTg1LjUsMTc4LjcgMTg3LjksMTc5LjQgMTg3LjksMTc5LjMgQzE4Ny45LDE3OS4yIDE4MS4xLDE2OC4yIDE4MC44LDE2Ny4xIEwxODUuMiwxNjcuNCBDMTg1LjIsMTY3LjQgMTc5LjQsMTYwLjIgMTc5LjIsMTU5LjUgTDE4NS4xLDE1OC43IEMxODUuMSwxNTguNyAxNzcuNywxNTAuMiAxNzcuNiwxNDkuNSBMMTg1LjEsMTUwLjcgTDE3Ni45LDE0MC44IEwxODAuOCwxNDAuOCBMMTc2LjIsMTM0LjEgQzE3NS40LDEzMy44IDE3NC42LDEzMy42IDE3My44LDEzMy40IEMxNzIuOCwxMzMuMSAxNzEuOCwxMzIuOCAxNzAuOCwxMzIuNSBDMTU5LjYsMTI5IDE0OSwxMjUuOCAxMzguOCwxMTkuNCBDMTI0LjUsMTEwLjUgMTExLjcsOTkuNiAxMDIuMSw5MS4xIEw4Mi44LDgxLjcgQzY0LjMsODAuMyA0Ni45LDgwLjggMzYuMyw4Mi45IEw0My4xLDcxLjMgTDMyLjcsODMuOCBDMzIsODMuNiAzMS44LDgzLjIgMzEuOCw4My4yIEwzMi41LDY3LjggTDI5LjIsODEuNyBDMjguMiw4MS4yIDI3LDgxIDI1LjgsODEgQzIxLjIsODEgMTcuNSw4NC43IDE3LjUsODkuMyBDMTcuNSw5My41IDIwLjYsOTcgMjQuNyw5Ny41IEwxNy42LDExMS45IEwxNy42LDExMS45IEwxNy42LDExMS45IEwxNy42LDExMS45IFoiIGlkPSJNdWxsdmFkX0Z1ciIgZmlsbD0iI0QwOTMzQSIgLz4KICAgICAgICA8cGF0aCBkPSJNMjkuMiw4MS41IEMyOC4yLDgxLjEgMjcsODAuOCAyNS45LDgwLjggQzIxLjMsODAuOCAxNy42LDg0LjUgMTcuNiw4OS4xIEMxNy42LDkzLjEgMjAuNSw5Ni41IDI0LjMsOTcuMyBDMjQuNCw5Ny4zIDI0LjQsOTcuMyAyNC41LDk3LjMgQzI3LDk2LjUgMzIsODkuOCAzMS4yLDg1LjYgQzMwLjksODQuMSAzMC4yLDgyLjcgMjkuMiw4MS41IEwyOS4yLDgxLjUgTDI5LjIsODEuNSBMMjkuMiw4MS41IFoiIGlkPSJNdWxsdmFkX05vc2UiIGZpbGw9IiNGRkNDODYiIC8+CiAgICAgICAgPHBhdGggZD0iTTEwMi4xLDcwLjggQzEwMC42LDY2LjcgMTAxLDYxLjQgMTAzLjEsNTYuNCBDMTA2LjEsNDkuNSAxMTEuOCw0NC45IDExNy4yLDQ0LjkgQzExOC4zLDQ0LjkgMTE5LjMsNDUuMSAxMjAuMyw0NS41IEMxMjMuNCw0Mi43IDEyNyw0MC40IDEzMSwzOC44IEMxNTMuMSwzMCAxODUuNCw0NS43IDE5My43LDY3LjQgQzE5Ny43LDc3LjkgMTk2LjUsODkuNCAxOTMuMSw5OS45IEMxOTAuMywxMDguNSAxODAuMSwxMjAuOSAxODMuOSwxMzAuMyBDMTgyLjQsMTI5LjkgMTUwLjgsMTIwLjEgMTQyLDExNC41IEMxMjcuOSwxMDUuNyAxMTUuMiw5NC45IDEwNS43LDg2LjUgTDEwNS40LDg2LjIgTDczLjMsNzEgQzcyLjksNzAuOCA3Mi41LDcwLjYgNzIuMiw3MC40IEM3Ni44LDcwLjQgOTQuMyw3Mi41IDEwMi4xLDcwLjgiIGlkPSJNdWxsdmFkX0hlbG1ldCIgZmlsbD0iI0ZERDMyMSIgLz4KICAgICAgICA8ZyBpZD0iSGVsbWV0X0xhbXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMy4wMDAwMDAsIDQ2LjAwMDAwMCkiIGZpbGwtcnVsZT0ibm9uemVybyI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik04LjYsMjguNCBDNy43LDI4LjQgNi45LDI4LjIgNi4zLDI3LjkgQzQuNywyNy4yIDMuNSwyNS45IDIuNywyMy45IEMxLjMsMjAuNSAxLjcsMTUuOCAzLjYsMTEuNCBDNi4xLDUuNyAxMC44LDEuNyAxNS4xLDEuNyBDMTUuOSwxLjcgMTYuNywxLjkgMTcuNSwyLjIgQzE5LjYsMy4xIDIxLjEsNS4yIDIxLjYsOC4yIEMyMi4yLDExLjQgMjEuNywxNS4xIDIwLjEsMTguNiBDMTcuNiwyNC4zIDEyLjgsMjguNCA4LjYsMjguNCBaIiBpZD0iUGF0aCIgZmlsbD0iI0ZGRkZGRiIgLz4KICAgICAgICAgICAgPHBhdGggZD0iTTE1LDMuMyBDMTUuNiwzLjMgMTYuMiwzLjQgMTYuOCwzLjcgQzE4LjQsNC40IDE5LjYsNi4yIDIwLDguNiBDMjAuNSwxMS41IDIwLjEsMTQuOSAxOC42LDE4LjEgQzE2LjQsMjMuMiAxMi4xLDI2LjkgOC41LDI2LjkgQzcuOSwyNi45IDcuMywyNi44IDYuOCwyNi42IEw2LjgsMjYuNiBMNi44LDI2LjYgQzUuMywyNiA0LjUsMjQuNiA0LjEsMjMuNSBDMi45LDIwLjUgMy4yLDE2LjEgNC45LDEyLjEgQzcuMiw3IDExLjQsMy4zIDE1LDMuMyBNMTUsMC4zIEMxMC4yLDAuMyA0LjksNC43IDIuMSwxMSBDLTIuMjIwNDQ2MDVlLTE2LDE1LjcgLTAuMywyMC44IDEuMiwyNC43IEMyLjEsMjcgMy42LDI4LjYgNS41LDI5LjUgQzYuNCwyOS45IDcuNCwzMC4xIDguNSwzMC4xIEMxMy4zLDMwLjEgMTguNiwyNS43IDIxLjMsMTkuNCBDMjMsMTUuNiAyMy41LDExLjYgMjIuOSw4LjEgQzIyLjMsNC42IDIwLjUsMi4xIDE3LjksMSBDMTcuMSwwLjUgMTYuMSwwLjMgMTUsMC4zIEwxNSwwLjMgWiIgaWQ9IlNoYXBlIiBmaWxsPSIjMUQyQTNBIiAvPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+Cg==";
    var MOLE = '<img src="' + MOLE_IMG + '" width="18" height="18" alt="mullvad" style="display:block;border-radius:50%;">';

    var CC = { al:"albania", ar:"argentina", at:"austria", au:"australia", be:"belgium", bg:"bulgaria", br:"brazil", ca:"canada", ch:"switzerland", cl:"chile", co:"colombia", cy:"cyprus", cz:"czechia", de:"germany", dk:"denmark", ee:"estonia", es:"spain", fi:"finland", fr:"france", gb:"united kingdom", gr:"greece", hk:"hong kong", hr:"croatia", hu:"hungary", id:"indonesia", ie:"ireland", il:"israel", it:"italy", jp:"japan", mx:"mexico", my:"malaysia", ng:"nigeria", nl:"netherlands", no:"norway", nz:"new zealand", pe:"peru", ph:"philippines", pl:"poland", pt:"portugal", ro:"romania", rs:"serbia", se:"sweden", sg:"singapore", si:"slovenia", sk:"slovakia", th:"thailand", tr:"turkey", ua:"ukraine", us:"united states", za:"south africa" };
    var CITY = { "al:tia":"tirana", "ar:bue":"buenos aires", "at:vie":"vienna", "au:adl":"adelaide", "au:bne":"brisbane", "au:mel":"melbourne", "au:per":"perth", "au:syd":"sydney", "be:bru":"brussels", "bg:sof":"sofia", "br:for":"fortaleza", "br:sao":"sao paulo", "ca:mtr":"montreal", "ca:tor":"toronto", "ca:van":"vancouver", "ca:yyc":"calgary", "ch:zrh":"zurich", "cl:scl":"santiago", "co:bog":"bogota", "cy:nic":"nicosia", "cz:prg":"prague", "de:ber":"berlin", "de:dus":"dusseldorf", "de:fra":"frankfurt", "dk:cph":"copenhagen", "ee:tll":"tallinn", "es:bcn":"barcelona", "es:mad":"madrid", "es:vlc":"valencia", "fi:hel":"helsinki", "fr:bod":"bordeaux", "fr:mrs":"marseille", "fr:par":"paris", "gb:glw":"glasgow", "gb:lon":"london", "gb:mnc":"manchester", "gr:ath":"athens", "hk:hkg":"hong kong", "hr:zag":"zagreb", "hu:bud":"budapest", "id:jpu":"jakarta", "ie:dub":"dublin", "il:tlv":"tel aviv", "it:mil":"milan", "it:pmo":"palermo", "jp:osa":"osaka", "jp:tyo":"tokyo", "mx:qro":"queretaro", "my:kul":"kuala lumpur", "ng:los":"lagos", "nl:ams":"amsterdam", "no:osl":"oslo", "no:svg":"stavanger", "nz:akl":"auckland", "pe:lim":"lima", "ph:mnl":"manila", "pl:waw":"warsaw", "pt:lis":"lisbon", "ro:buh":"bucharest", "rs:beg":"belgrade", "se:got":"gothenburg", "se:mma":"malmo", "se:sto":"stockholm", "sg:sin":"singapore", "si:lju":"ljubljana", "sk:bts":"bratislava", "th:bkk":"bangkok", "tr:ist":"istanbul", "ua:iev":"kyiv", "us:atl":"atlanta", "us:bos":"boston", "us:chi":"chicago", "us:dal":"dallas", "us:den":"denver", "us:det":"detroit", "us:hou":"houston", "us:lax":"los angeles", "us:mia":"miami", "us:mkc":"kansas city", "us:nyc":"new york", "us:phx":"phoenix", "us:sea":"seattle", "us:sfo":"san francisco", "us:sjc":"san jose", "us:slc":"salt lake city", "us:was":"washington", "za:jnb":"johannesburg" };

    function countryOf(l) { return CC[l.cc] || l.cc; }
    function cityOf(l) { return CITY[l.cc + ":" + l.city] || l.city; }
    function flagOf(cc) {
        try {
            return String.fromCodePoint.apply(null, String(cc).toUpperCase().split("").map(function (c) { return 127462 + c.charCodeAt(0) - 65; }));
        } catch (e) { return ""; }
    }
    function labelOf(l) { return cityOf(l) + " - " + l.id; }
    function byId(id) {
        const list = cache.list || [];
        for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return null;
    }
    function labelOfId(id) {
        const l = byId(id);
        return l ? (flagOf(l.cc) + " " + labelOf(l)) : id;
    }

    function btn() { return document.getElementById(BTN_ID); }

    function setDot(color, title) {
        var b = btn();
        if (!b) return;
        var d = b.querySelector(".mvpn-dot");
        if (!d) return;
        d.style.background = color;
        b.title = title || "mullvad vpn";
    }

    async function call(path, opts) {
        try {
            const h = await apiAuthHeaders();
            const r = await fetch("/api/mvpn" + path, Object.assign({ headers: h }, opts || {}));
            if (!r.ok) return null;
            return await r.json().catch(() => null);
        } catch (e) { return null; }
    }

    function fmtAge(sec) {
        if (sec === null || sec === undefined) return "no handshake";
        if (sec < 90) return sec + "s ago";
        return Math.floor(sec / 60) + "m ago";
    }

    function vpnOn(s) {
        return !!(s && s.ok && s.server && s.handshakeSec !== null && s.handshakeSec < 180);
    }

    function syncToggle(on) {
        if (!panelEl) return;
        const t = panelEl.querySelector(".mvpn-toggle");
        if (t) t.setAttribute("aria-checked", on ? "true" : "false");
    }

    async function flipSwitch() {
        if (busy) return;
        const wasOn = panelEl.querySelector(".mvpn-toggle").getAttribute("aria-checked") === "true";
        if (wasOn) {
            busy = true;
            syncToggle(false);
            panelEl.querySelector(".mvpn-status").textContent = "vpn: switching off...";
            let d = null;
            try {
                const h = await apiAuthHeaders();
                const r = await fetch("/api/mvpn/off", { method: "POST", headers: h });
                d = await r.json().catch(() => null);
            } catch (e) {}
            busy = false;
            if (d && d.ok) { setDot("#666", "mullvad vpn: off"); await loadPanel(); }
            else { panelEl.querySelector(".mvpn-status").textContent = "switch failed"; await loadPanel(); }
            return;
        }
        const s = await call("/status");
        const id = (s && (s.server || s.last)) || null;
        if (!id) {
            panelEl.querySelector(".mvpn-status").textContent = "vpn: pick an exit below to switch on";
            return;
        }
        selectExit(id);
    }

    async function refreshDot() {
        const s = await call("/status");
        if (!s || !s.ok) { setDot("#666", "mullvad vpn (unavailable)"); return s; }
        if (!s.server) { setDot("#666", "mullvad vpn: off"); return s; }
        if (s.handshakeSec !== null && s.handshakeSec < 180) {
            const l = byId(s.server);
            setDot("#35b97a", "mullvad vpn: " + (l ? cityOf(l) : s.server));
        } else {
            setDot("#e0a63c", "mullvad vpn: stale tunnel");
        }
        return s;
    }

    function closePanel() {
        if (panelEl) { panelEl.remove(); panelEl = null; }
        document.removeEventListener("click", outsideClose);
    }

    function outsideClose(e) {
        if (busy) return;
        if (panelEl && !panelEl.contains(e.target) && !(btn() && btn().contains(e.target))) closePanel();
    }

    var collapsed = {};
    try { (JSON.parse(localStorage.getItem("novene_mvpngroups") || "[]")).forEach((c) => { collapsed[c] = true; }); } catch (e) {}
    function saveCollapsed() {
        try { localStorage.setItem("novene_mvpngroups", JSON.stringify(Object.keys(collapsed).filter((c) => collapsed[c]))); } catch (e) {}
    }

    function refreshIcons() {
        try { if (typeof createIcons === "function") createIcons(); } catch (e) {}
    }

    function setCaret(caret, shut) {
        caret.innerHTML = '<i data-lucide="' + (shut ? "chevron-right" : "chevron-down") + '" width="14" height="14"></i>';
        refreshIcons();
    }

    function animateBody(body, shut) {
        if (shut) {
            body.style.maxHeight = body.scrollHeight + "px";
            requestAnimationFrame(() => { body.style.maxHeight = "0px"; });
        } else {
            body.style.maxHeight = "0px";
            requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + "px"; });
            setTimeout(() => { if (body.style.maxHeight !== "0px") body.style.maxHeight = "none"; }, 300);
        }
    }

    function renderList(filter, current) {
        const box = panelEl.querySelector(".mvpn-list");
        box.innerHTML = "";
        const q = (filter || "").trim().toLowerCase();
        const groups = {};
        (cache.list || []).forEach((l) => {
            const hay = (countryOf(l) + " " + cityOf(l) + " " + l.id).toLowerCase();
            if (q && hay.indexOf(q) === -1) return;
            (groups[l.cc] = groups[l.cc] || []).push(l);
        });
        const ccs = Object.keys(groups).sort((a, b) => {
            if (a === "us") return -1;
            if (b === "us") return 1;
            return a < b ? -1 : 1;
        });
        if (!ccs.length) {
            const em = document.createElement("div");
            em.style.cssText = "padding:12px;opacity:.6;font-size:13px;";
            em.textContent = "no exits match";
            box.appendChild(em);
            return;
        }
        ccs.forEach((cc) => {
            const shut = !q && !!collapsed[cc];
            const h = document.createElement("button");
            h.type = "button";
            h.dataset.cc = cc;
            h.style.cssText = "display:flex;width:100%;align-items:center;gap:6px;padding:8px 12px 2px;font-size:11px;opacity:.75;letter-spacing:.08em;background:transparent;border:0;color:inherit;font:inherit;cursor:pointer;text-align:left;";
            const caret = document.createElement("span");
            caret.className = "mvpn-caret";
            caret.style.cssText = "width:14px;display:flex;";
            caret.innerHTML = '<i data-lucide="' + (shut ? "chevron-right" : "chevron-down") + '" width="14" height="14"></i>';
            const label = document.createElement("span");
            label.textContent = flagOf(cc) + " " + (CC[cc] || cc) + " - " + groups[cc].length;
            h.appendChild(caret);
            h.appendChild(label);
            box.appendChild(h);
            const body = document.createElement("div");
            body.dataset.ccbody = cc;
            body.style.cssText = "overflow:hidden;transition:max-height .25s ease;max-height:" + (shut ? "0px" : "none") + ";";
            box.appendChild(body);
            h.addEventListener("click", () => {
                collapsed[cc] = !collapsed[cc];
                saveCollapsed();
                const nowShut = !!collapsed[cc];
                setCaret(caret, nowShut);
                if (!nowShut && !body.hasChildNodes()) {
                    setTimeout(() => { if (panelEl) renderList(panelEl.querySelector(".mvpn-search").value, current); }, 0);
                    return;
                }
                animateBody(body, nowShut);
            });
            if (shut) return;
            groups[cc].forEach((l) => {
                const r = document.createElement("button");
                r.type = "button";
                r.dataset.sid = l.id;
                r.style.cssText = "display:flex;width:100%;align-items:center;gap:8px;padding:7px 12px;background:transparent;border:0;color:inherit;font:inherit;font-size:13px;cursor:pointer;text-align:left;";
                const cur = current === l.id;
                r.innerHTML = "";
                const mark = document.createElement("span");
                mark.style.cssText = "width:16px;color:#35b97a;";
                mark.textContent = cur ? "*" : "";
                const nm = document.createElement("span");
                nm.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
                nm.textContent = flagOf(l.cc) + " " + labelOf(l);
                r.appendChild(mark);
                r.appendChild(nm);
                if (!cur && !busy) r.addEventListener("click", () => selectExit(l.id));
                else r.style.opacity = cur ? "1" : ".45";
                if (cur) r.style.cssText += "background:rgba(53,185,122,.14);border-radius:8px;";
                body.appendChild(r);
            });
        });
        refreshIcons();
    }

    async function loadPanel() {
        const statusLine = panelEl.querySelector(".mvpn-status");
        statusLine.textContent = "vpn: loading...";
        const now = Date.now();
        if (!cache.list || now - cache.at > CACHE_MS) {
            try {
                const h = await apiAuthHeaders();
                const r = await fetch("/api/mvpn/locations", { headers: h });
                const d = r.ok ? await r.json() : null;
                if (d && Array.isArray(d.locations)) { cache = { at: now, list: d.locations }; }
            } catch (e) {}
        }
        const s = await call("/status");
        if (!s || !s.ok) {
            statusLine.textContent = "vpn: unavailable";
            renderList(panelEl.querySelector(".mvpn-search").value, null);
            syncToggle(false);
            return;
        }
        statusLine.textContent = s.server
            ? ("vpn: " + labelOfId(s.server))
            : "vpn: off";
        renderList(panelEl.querySelector(".mvpn-search").value, s.server);
        syncToggle(vpnOn(s));
    }

    async function selectExit(id) {
        if (busy) return;
        busy = true;
        const statusLine = panelEl.querySelector(".mvpn-status");
        statusLine.textContent = "vpn: switching to " + (labelOfId(id)) + "...";
        renderList(panelEl.querySelector(".mvpn-search").value, id);
        let d = null;
        try {
            const h = await apiAuthHeaders();
            const r = await fetch("/api/mvpn/select", {
                method: "POST",
                headers: Object.assign({ "Content-Type": "application/json" }, h),
                body: JSON.stringify({ id }),
            });
            d = await r.json().catch(() => null);
        } catch (e) {}
        busy = false;
        if (d && d.ok) {
            const l = byId(id);
            setDot("#35b97a", "mullvad vpn: " + (l ? cityOf(l) : id));
            await loadPanel();
        } else {
            statusLine.textContent = "vpn: switch failed: " + ((d && d.error) || "network error");
            setTimeout(() => { if (panelEl) loadPanel(); }, 4000);
        }
    }

    function openPanel() {
        closePanel();
        const b = btn();
        if (!b) return;
        const r = b.getBoundingClientRect();
        panelEl = document.createElement("div");
        panelEl.id = PANEL_ID;
        panelEl.style.cssText = "position:fixed;z-index:9998;top:" + (r.bottom + 6) + "px;right:" + Math.max(8, window.innerWidth - r.right) + "px;width:300px;max-height:60vh;display:flex;flex-direction:column;background:var(--panel,#0a100c);border:1px solid var(--green,#1f7a4d);border-radius:12px;color:var(--text,#d3e3d9);font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.6);overflow:hidden;";
        const head = document.createElement("div");
        head.style.cssText = "display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line,#152219);";
        head.innerHTML = '<span style="display:flex;color:#ffd524;">' + MOLE + "</span>";
        const ht = document.createElement("span");
        ht.style.cssText = "font-weight:700;";
        ht.textContent = "mullvad vpn";
        head.appendChild(ht);
        const tgl = document.createElement("button");
        tgl.className = "set-toggle mvpn-toggle";
        tgl.type = "button";
        tgl.setAttribute("role", "switch");
        tgl.setAttribute("aria-checked", "false");
        tgl.style.cssText = "margin-left:auto;";
        tgl.innerHTML = '<span class="set-knob"></span>';
        tgl.addEventListener("click", (e) => { e.stopPropagation(); flipSwitch(); });
        head.appendChild(tgl);
        const st = document.createElement("div");
        st.className = "mvpn-status";
        st.style.cssText = "padding:8px 12px;font-size:12px;opacity:.75;border-bottom:1px solid var(--line,#152219);";
        st.textContent = "loading...";
        const search = document.createElement("input");
        search.className = "mvpn-search";
        search.placeholder = "filter country / city...";
        search.style.cssText = "margin:8px 12px 0;padding:7px 10px;border-radius:8px;border:1px solid var(--line,#152219);background:var(--bg,#070c09);color:inherit;font:inherit;font-size:13px;";
        search.addEventListener("input", () => {
            call("/status").then((s) => renderList(search.value, s && s.server));
        });
        const list = document.createElement("div");
        list.className = "mvpn-list";
        list.style.cssText = "overflow-y:auto;padding-bottom:8px;";
        panelEl.appendChild(head);
        panelEl.appendChild(st);
        panelEl.appendChild(search);
        panelEl.appendChild(list);
        document.body.appendChild(panelEl);
        document.addEventListener("click", outsideClose);
        loadPanel();
        refreshDot();
    }

    function init() {
        if (!document.getElementById("mvpn-style")) {
            const css = document.createElement("style");
            css.id = "mvpn-style";
            css.textContent = ".mvpn-toggle[aria-checked=\"true\"]{background:rgba(53,185,122,.16) !important;border-color:rgba(53,185,122,.35) !important;box-shadow:none !important;}.mvpn-toggle[aria-checked=\"true\"] .set-knob{background:#35b97a !important;box-shadow:none !important;}";
            document.head.appendChild(css);
        }
        const bar = document.querySelector(".address-bar");
        if (!bar || btn()) return;
        const b = document.createElement("button");
        b.className = "nav-btn";
        b.id = BTN_ID;
        b.type = "button";
        b.title = "mullvad vpn";
        b.style.cssText = "position:relative;";
        b.innerHTML = MOLE + '<span class="mvpn-dot" style="position:absolute;right:4px;bottom:4px;width:8px;height:8px;border-radius:50%;background:#666;"></span>';
        const cont = bar.querySelector(".url-intainer");
        if (cont && cont.nextSibling) cont.parentNode.insertBefore(b, cont.nextSibling);
        else bar.appendChild(b);
        b.addEventListener("click", (e) => {
            e.stopPropagation();
            if (panelEl) closePanel();
            else openPanel();
        });
        refreshDot();
        setInterval(refreshDot, 60000);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
