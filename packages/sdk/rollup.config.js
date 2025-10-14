import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';


export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/flowlens-sdk.esm.js', format: 'esm', sourcemap: true },
        { file: 'dist/flowlens-sdk.umd.js', format: 'umd', name: 'FlowLens', sourcemap: true }
    ],
    plugins: [resolve(), typescript()],
};