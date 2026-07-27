/** biome-ignore-all lint/correctness/noUnusedVariables: types in *.d.ts are automatically picked up without exporting. */
declare module "*" {
	const content: string;
	export default content;
}
