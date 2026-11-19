(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QuotePlanner = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => api.mount(document));
    else api.mount(document);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const fields = ["price", "variable", "hours", "hourrate", "fixed", "budget"];
  function calculate(input) {
    const values = {};
    for (const key of fields) {
      const raw = input[key];
      if (raw === null || raw === undefined || String(raw).trim() === "") {
        return { ok: false, error: "请先填写全部六个成本和价格字段；未知数字不能按 0 处理。" };
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) return { ok: false, error: "成本、价格与工时必须是有限的非负数。" };
      values[key] = n;
    }
    if (values.price <= 0) return { ok: false, error: "单客实收价格必须大于 0 元。" };
    const conv = input.conversion;
    if (conv !== null && conv !== undefined && String(conv).trim() !== "") {
      const n = Number(conv);
      if (!Number.isFinite(n) || n <= 0 || n > 100) return { ok: false, error: "有效咨询成交率需大于 0 且不超过 100%；不知道可留空。" };
      values.conversion = n;
    } else values.conversion = null;
    const deliveryLabor = values.hours * values.hourrate;
    const perOrder = values.price - values.variable - deliveryLabor;
    const toCover = values.fixed + values.budget;
    if (![deliveryLabor, perOrder, toCover].every(Number.isFinite)) return { ok: false, error: "输入金额过大，无法保证计算精度。" };
    const rawOrders = perOrder > 0 ? Math.ceil(Math.max(0, toCover / perOrder - 1e-12)) : null;
    if (rawOrders !== null && !Number.isSafeInteger(rawOrders)) return { ok: false, error: "所需订单量超出安全计算范围，请缩小数据。" };
    const leads = rawOrders !== null && values.conversion !== null ? Math.ceil(rawOrders / (values.conversion / 100) - 1e-12) : null;
    if (leads !== null && !Number.isSafeInteger(leads)) return { ok: false, error: "估算有效咨询数超出安全计算范围。" };
    return { ok: true, values, deliveryLabor, perOrder, toCover, orders: rawOrders, leads };
  }
  const money = n => Number.isFinite(n) ? new Intl.NumberFormat("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " 元" : "—";
  function asCSV(data, mode) {
    const r = [["状态", mode === "demo" ? "完全虚构教学模拟" : "用户自行填写（未经外部核验）"], ["项目", "值"],
      ["单客实收价格（元）", data.values.price], ["单客其他变动成本（元）", data.values.variable],
      ["单客服务工时", data.values.hours], ["每小时工时成本（元）", data.values.hourrate],
      ["月固定成本（元）", data.values.fixed], ["当月获客预算（元）", data.values.budget],
      ["有效咨询成交率（%）", data.values.conversion === null ? "未填写" : data.values.conversion],
      ["单客服务人工成本（元）", data.deliveryLabor], ["单客贡献（元）", data.perOrder],
      ["需覆盖总额（元）", data.toCover], ["保本实付订单数", data.orders === null ? "无有限保本单量" : data.orders],
      ["保本所需有效咨询数（估算）", data.leads === null ? "不可计算" : data.leads],
      ["计算说明", "单客贡献=实收价格-变动成本-工时×小时成本；保本订单向上取整；不含税费、平台手续费等未填项目。"],
      ["来源", "AI 酋长 Andy 开源知识付费获客手册；非客户业绩，非收入承诺。"]];
    return "\ufeff" + r.map(cols => cols.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(",")).join("\r\n") + "\r\n";
  }
  function mount(doc) {
    const form = doc.getElementById("quote-form");
    if (!form) return;
    const status = doc.getElementById("quote-status"), exportBtn = doc.getElementById("quote-export");
    const value = id => doc.getElementById(id).value;
    const inputs = [...fields, "conversion"];
    let last = null, mode = "user";
    const results = ["unit-result", "orders-result", "leads-result"];
    const clearResults = () => { last = null; exportBtn.disabled = true; for (const id of results) doc.getElementById(id).textContent = "—"; };
    function compute() {
      clearResults();
      const input = Object.fromEntries(inputs.map(id => [id, value(id)]));
      const out = calculate(input);
      if (!out.ok) { status.textContent = out.error; status.dataset.state = "error"; return; }
      last = out;
      doc.getElementById("unit-result").textContent = money(out.perOrder);
      doc.getElementById("orders-result").textContent = out.orders === null ? "无法靠增单保本" : out.orders.toLocaleString("zh-CN") + " 单";
      doc.getElementById("leads-result").textContent = out.leads === null ? "未提供转化率 / 无法计算" : out.leads.toLocaleString("zh-CN") + " 条有效咨询";
      status.textContent = (mode === "demo" ? "【完全虚构教学模拟】" : "【用户输入，未经核验】") +
        (out.perOrder <= 0 ? "每单贡献不为正；增加订单不能覆盖固定成本。" : "按当前假设估算；订单量需向上取整。") +
        " 本工具未计入未填写的税费、平台扣点、坏账和经营风险。";
      status.dataset.state = "ok"; exportBtn.disabled = false;
    }
    inputs.forEach(id => doc.getElementById(id).addEventListener("input", () => {
      mode = "user"; clearResults(); status.textContent = "输入已变化，请重新计算。"; status.dataset.state = "";
    }));
    form.addEventListener("submit", event => { event.preventDefault(); compute(); });
    doc.getElementById("quote-demo").addEventListener("click", () => {
      const sample = { price: 399, variable: 39, hours: 1, hourrate: 80, fixed: 1000, budget: 300, conversion: 20 };
      for (const id of inputs) doc.getElementById(id).value = sample[id];
      mode = "demo"; compute();
    });
    doc.getElementById("quote-reset").addEventListener("click", () => {
      form.reset(); mode = "user"; clearResults(); status.textContent = "请输入真实数据；或选择有明确标记的教学模拟。"; status.dataset.state = "";
    });
    exportBtn.addEventListener("click", () => {
      if (!last) return;
      const blob = new Blob([asCSV(last, mode)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob), anchor = doc.createElement("a");
      anchor.href = url; anchor.download = "knowledge-product-break-even.csv";
      doc.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    });
    doc.getElementById("copy-wechat").addEventListener("click", async () => {
      const note = doc.getElementById("copy-status");
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error("clipboard unavailable");
        await navigator.clipboard.writeText("AIPMAndy"); note.textContent = "已复制微信号 AIPMAndy";
      } catch (_) { note.textContent = "无法自动复制，请手动复制：AIPMAndy"; }
    });
  }
  return { calculate, asCSV, mount };
});
