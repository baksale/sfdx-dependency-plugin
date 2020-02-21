import { Filter } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Package2Version } from 'dx-package-api/lib/main';

export class DxPackageFilter implements Filter<Package2Version> {
    constructor(private packageNamePattern: string) {}
    public accept(element: DependencyTreeNode<Package2Version>): boolean {
        if (this.packageNamePattern && this.packageNamePattern.length !== 0) {
            return element.nodeElement.Package2.Name.indexOf(this.packageNamePattern) >= 0;
        }
        return true;
    }
}
