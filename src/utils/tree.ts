import type { TreeNode } from "@/ui/tree-select-input";
import { chain } from "ramda";

/**
 * Flatten an array containing a tree structure
 * @param {T[]} trees - An array containing a tree structure
 * @returns {T[]} - Flattened array
 */
export function flattenTrees<T extends { children?: T[] }>(trees: T[] = []): T[] {
	return chain((node) => {
		const children = node.children || [];
		return [node, ...flattenTrees(children)];
	}, trees);
}

export function buildFileTree(paths: string[]): TreeNode | null {
	if (!paths.length) return null;

	const root: TreeNode = {
		title: "",
		value: "",
		key: "",
		path: [],
		children: [],
	};

	let i = 1;
	for (const path of paths) {
		const segments = path.split(/[/\\]/);
		let currentNode = root;

		let pathArr: number[] = [];

		for (const segment of segments) {
			if (!segment) continue;
			pathArr = [...pathArr, i];

			let existingChild = currentNode.children?.find((child) => child.title === segment);
			if (!existingChild) {
				existingChild = {
					title: segment,
					value: String(i),
					key: String(i),
					path: pathArr,
					children: [],
				};
				if (!currentNode.children) currentNode.children = [];
				currentNode.children.push(existingChild);
			}

			currentNode = existingChild;
			i++;
		}
	}

	return root.children?.[0] || null; // 返回第一个根节点作为实际的根目录
}
