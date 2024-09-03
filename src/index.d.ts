export type BuildArg = {
  crate: string;
  release?: boolean;
  target?: string;
  out_name?: string;
  out_dir?: string;
  no_reference_types?: boolean;
  no_weak_refs?: boolean;
  enable_opt?: boolean;
  enable_pack?: boolean;
  enable_typescript?: boolean;
  args?: Array<string>;
  extra_args?: Array<string>;
};
export type WatchArg = {
  include?: Array<string>;
  exclude?: Array<string>;
  debounce?: number;
};
export function viteWasmPackBuild(build: BuildArg): Promise<void>;
export default function viteWasmPack(options: { build: BuildArg; watch: WatchArg }): {
  name: string;
  enforce: string;
  buildStart(): Promise<void>;
  configureServer(server: any): void;
};
