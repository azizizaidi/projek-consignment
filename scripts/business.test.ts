import { test, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
function setup() {
  const store = new Map<string, string>();
  store.set("demo_user", JSON.stringify({ id: 2 }));
  const el = {
    innerHTML: "",
    textContent: "",
    focus() {},
    close() {},
    classList: { add() {}, remove() {} },
  };
  class Fields {
    data: any;
    constructor(f: any) {
      this.data = f.values;
    }
    get(n: string) {
      return this.data[n] ?? null;
    }
    has(n: string) {
      return n in this.data;
    }
    getAll(n: string) {
      const v = this.data[n];
      return Array.isArray(v) ? v : v ? [v] : [];
    }
  }
  const context = createContext({
    console,
    URLSearchParams,
    FormData: Fields,
    localStorage: {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
    location: {
      pathname: "/staf-kedai.html",
      search: "?id=2",
      hash: "",
      replace() {},
    },
    document: {
      getElementById: () => el,
      addEventListener() {},
      activeElement: null,
    },
    window: { addEventListener() {} },
    navigator: {},
    setTimeout() {},
  });
  runInContext(readFileSync("ui-demo/assets/data.js", "utf8"), context);
  runInContext(readFileSync("ui-demo/assets/app.js", "utf8"), context);
  runInContext(
    "render = () => {}; closeDialog = () => {}; announce = () => {};",
    context,
  );
  return { context, run: (s: string) => runInContext(s, context), el };
}
test("prepaid completion reuses its existing event and does not charge again; restock creates a new debt", () => {
  const { run } = setup();
  const before = run(
    "({events:DB.collection_events.length,payments:DB.payments.length,stock:product().stok_gudang})",
  );
  run(
    `submitForm({dataset:{form:'finish',id:'2'},values:{placement:'4',method:'cash',receipt:'TEST',restock:'on'}})`,
  );
  expect(run("DB.payments.length")).toBe(before.payments);
  expect(run("DB.collection_events.length")).toBe(before.events + 1);
  expect(run("DB.collection_events.filter(e=>e.placement_id===4).length")).toBe(
    1,
  );
  expect(run("product().stok_gudang")).toBe(before.stock - 2);
  expect(run("bakiBelumKutip(2)")).toBe(120);
});
test("insufficient restock leaves all records unchanged", () => {
  const { run, el } = setup();
  run("product().stok_gudang=0");
  const before = run("JSON.stringify(DB)");
  run(
    `submitForm({dataset:{form:'finish',id:'2'},values:{placement:'4',method:'cash',restock:'on'}})`,
  );
  expect(run("JSON.stringify(DB)")).toBe(before);
  expect(el.textContent).toContain("tidak mencukupi");
});
test("repeat completion is rejected without creating a second event", () => {
  const { run, el } = setup();
  run(
    `submitForm({dataset:{form:'finish',id:'2'},values:{placement:'4',method:'later'}})`,
  );
  const count = run("DB.collection_events.length");
  run(
    `submitForm({dataset:{form:'finish',id:'2'},values:{placement:'4',method:'cash'}})`,
  );
  expect(run("DB.collection_events.length")).toBe(count);
  expect(el.textContent).toContain("tidak lagi aktif");
});
test("partial cash followed by QR updates balance only after simulation, and cannot be confirmed twice", () => {
  const { run, el } = setup();
  run("outletId=3");
  run(
    `submitForm({dataset:{form:'pay',id:'3'},values:{event:'3',amount:'20',method:'cash',receipt:'PARTIAL'}})`,
  );
  expect(run("bakiEvent(3)")).toBe(40);
  expect(run("DB.collection_events.find(e=>e.id===3).status")).toBe("separa");
  run(
    `submitForm({dataset:{form:'pay',id:'3'},values:{event:'3',amount:'40',method:'qr'}})`,
  );
  const pid = run("DB.payments.at(-1).id");
  expect(run("bakiEvent(3)")).toBe(40);
  run(
    `submitForm({dataset:{form:'pay',id:'3'},values:{event:'3',amount:'1',method:'cash'}})`,
  );
  expect(el.textContent).toContain("melebihi baki");
  run(`submitForm({dataset:{form:'simulate',id:'${pid}'},values:{}})`);
  expect(run("bakiEvent(3)")).toBe(0);
  const count = run("DB.payments.length");
  run(`submitForm({dataset:{form:'simulate',id:'${pid}'},values:{}})`);
  expect(run("DB.payments.length")).toBe(count);
});
test("out-of-area submission cannot alter stock or placements", () => {
  const { run, el } = setup();
  run("outletId=4");
  const before = run("JSON.stringify(DB)");
  run(
    `submitForm({dataset:{form:'send',id:'4'},values:{qty:'1',mode:'bayar_kemudian'}})`,
  );
  expect(run("JSON.stringify(DB)")).toBe(before);
  expect(el.textContent).toContain("tidak tersedia");
});

function addSecondProduct(run: (s: string) => any) {
  run(
    `Object.assign(product(2)||{}, {sku:'KOPI-02',nama:'Papan Kopi',harga_papan:45,stok_gudang:30})`,
  );
}
test("multi-product delivery preserves independent quantities, price snapshots and shipment identity", () => {
  const { run } = setup();
  addSecondProduct(run);
  const before = run("product(1).stok_gudang");
  run(
    `submitForm({dataset:{form:'send',id:'2'},values:{qty_1:'2',qty_2:'3',mode:'bayar_dulu'}})`,
  );
  expect(run("product(1).stok_gudang")).toBe(before - 2);
  expect(run("product(2).stok_gudang")).toBe(27);
  expect(run("DB.placements.at(-1).product_id")).toBe(2);
  expect(run("DB.placements.at(-1).harga_papan_unit")).toBe(45);
  expect(run("DB.collection_events.at(-1).jumlah")).toBe(135);
  expect(
    run(
      "DB.placements.at(-1).shipment_ref===DB.placements.at(-2).shipment_ref",
    ),
  ).toBe(true);
});
test("one insufficient product rejects the whole multi-product delivery atomically", () => {
  const { run, el } = setup();
  addSecondProduct(run);
  const before = run("JSON.stringify(DB)");
  run(
    `submitForm({dataset:{form:'send',id:'2'},values:{qty_1:'1',qty_2:'31',mode:'bayar_kemudian'}})`,
  );
  expect(run("JSON.stringify(DB)")).toBe(before);
  expect(el.textContent).toContain("Papan Kopi");
});
test("finishing and restocking second product never changes first-product inventory or snapshot price", () => {
  const { run } = setup();
  addSecondProduct(run);
  run(`addPlacement(outlet(2),2,'bayar_kemudian',2)`);
  const pid = run("DB.placements.at(-1).id");
  const firstStock = run("product(1).stok_gudang");
  run("product(2).harga_papan=50");
  run(
    `submitForm({dataset:{form:'finish',id:'2'},values:{placement:'${pid}',method:'cash',restock:'on'}})`,
  );
  expect(run("product(1).stok_gudang")).toBe(firstStock);
  expect(run("product(2).stok_gudang")).toBe(26);
  expect(run("DB.collection_events.at(-1).jumlah")).toBe(90);
  expect(run("DB.payments.at(-1).jumlah")).toBe(90);
  expect(run("DB.placements.at(-1).product_id")).toBe(2);
  expect(run("DB.placements.at(-1).harga_papan_unit")).toBe(50);
});
test("batch collection allocates partial cash across products without exceeding either balance", () => {
  const { run } = setup();
  addSecondProduct(run);
  run(`outletId=3;addPlacement(outlet(3),2,'bayar_dulu',2)`);
  run(
    `submitForm({dataset:{form:'pay',id:'3'},values:{event:'all',amount:'100',method:'cash',receipt:'BATCH-01'}})`,
  );
  expect(run("bakiEvent(3)")).toBe(0);
  expect(run("bakiEvent(DB.collection_events.at(-1).id)")).toBe(50);
  expect(
    run(
      "DB.payments.at(-1).collection_batch===DB.payments.at(-2).collection_batch",
    ),
  ).toBe(true);
  expect(run("DB.payments.at(-1).rujukan")).toBe("BATCH-01");
});
test("product catalogue enforces unique SKUs and stock adjustments target their selected product", () => {
  const { run, el } = setup();
  run("user=DB.users[0]");
  addSecondProduct(run);
  run(
    `submitForm({dataset:{form:'product',id:'0'},values:{name:'Duplicate',sku:'kopi-02',price:'99',stock:'10'}})`,
  );
  expect(run("DB.products.length")).toBe(2);
  expect(el.textContent).toContain("sudah digunakan");
  const before = run("product(1).stok_gudang");
  run(
    `submitForm({dataset:{form:'adjust-stock',id:'2'},values:{mode:'add',qty:'5',note:'Second product only'}})`,
  );
  expect(run("product(2).stok_gudang")).toBe(35);
  expect(run("product(1).stok_gudang")).toBe(before);
});
