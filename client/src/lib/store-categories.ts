export type CategoryNode = {
  name: string;
  description: string;
  children?: string[];
};

export const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "Serrano Vehicle Addons",
    description: "Vehicle packs for Serrano — browse by type",
    children: [
      "Serrano Civilian Vehicles",
      "Serrano LEO Vehicles",
      "Serrano EMS Vehicles",
      "Serrano Fire Vehicles",
    ],
  },
  {
    name: "Addons",
    description: "Miscellaneous add-ons and extras",
  },
];

export function getTopLevelCategories(): CategoryNode[] {
  return CATEGORY_TREE;
}

export function getCategoryNode(name: string): CategoryNode | undefined {
  for (const cat of CATEGORY_TREE) {
    if (cat.name === name) return cat;
    if (cat.children) {
      for (const child of cat.children) {
        if (child === name) return { name: child, description: "" };
      }
    }
  }
  return undefined;
}

export function getParentCategory(childName: string): CategoryNode | undefined {
  return CATEGORY_TREE.find(
    (cat) => cat.children?.includes(childName),
  );
}

export function isParentCategory(name: string): boolean {
  return CATEGORY_TREE.some((cat) => cat.name === name && !!cat.children?.length);
}

export function getAllCategoryNames(): string[] {
  const names: string[] = [];
  for (const cat of CATEGORY_TREE) {
    names.push(cat.name);
    if (cat.children) names.push(...cat.children);
  }
  return names;
}
