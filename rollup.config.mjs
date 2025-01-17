import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import banner from "rollup-plugin-banner2";
import pkg from "./package.json" assert { type: "json" };

const external = (id) =>
  [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ].some((d) => id.startsWith(d));

const terserPlugin = terser({
  ecma: 2015,
  module: true,
  compress: { passes: 5, unsafe: true, keep_fargs: false },
  mangle: { properties: { regex: "^_" } },
  format: {
    // https://github.com/terser/terser/pull/550
    // https://github.com/terser/terser/issues/968
    comments: /@preserve|@lic|@cc_on|^\**!|__PURE__/i,
    preserve_annotations: true,
  },
});

export default [
  // react and type
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: ".",
        declaration: true,
        exclude: ["**/*.{spec,stories}.*"],
      }),
      getBabelOutputPlugin({
        plugins: ["@babel/plugin-transform-react-pure-annotations"],
      }),
      terserPlugin,
      banner(() => '"use client";\n'),
    ],
    external,
  },
  // vue
  {
    input: "src/vue/index.ts",
    output: [
      {
        file: pkg.exports["./vue"].default,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: pkg.exports["./vue"].import,
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        outDir: ".",
        // declaration: true,
        exclude: ["**/*.{spec,stories}.*"],
      }),
      terserPlugin,
    ],
    external,
  },
];
