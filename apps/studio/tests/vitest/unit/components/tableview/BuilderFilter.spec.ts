import { describe, it, expect } from "vitest";
import BuilderFilter from "@/components/tableview/filter/BuilderFilter.vue";

// #4189: the column picker is a searchable vue-select, which takes plain
// strings as options. Computed props are called on a plain object instead of
// mounting the component (same approach as ResultTable.spec.ts).
const options = (BuilderFilter as any).options ?? BuilderFilter;
const { columnNames } = options.computed;

describe("BuilderFilter", () => {
  it("passes column names, in table order, to the column picker", () => {
    const columns = [
      { columnName: "id", dataType: "INTEGER" },
      { columnName: "name", dataType: "VARCHAR" },
      { columnName: "origin_country_id", dataType: "INTEGER" },
    ];
    expect(columnNames.call({ columns })).toEqual(["id", "name", "origin_country_id"]);
  });

  it("has no options before the columns are loaded", () => {
    expect(columnNames.call({ columns: undefined })).toEqual([]);
  });

  it("registers vue-select", () => {
    expect(Object.keys(options.components)).toContain("vSelect");
  });
});
