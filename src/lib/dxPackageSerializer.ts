import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Serializer } from 'any-dependency-tree/dist/serializer';
import { Package2Version } from 'dx-package-api/lib/main';

export class DxPackageSerializer implements Serializer<Package2Version> {
    public constructor(
        private version: boolean = true,
        private id: boolean = true
        ) {}
    public serialize(node: DependencyTreeNode<Package2Version>): string {
        const element: Package2Version = node.nodeElement;
        return element.Package2.Name
            + (this.version ? (':' + element.MajorVersion
                                + '.' + element.MinorVersion
                                + '.' + element.PatchVersion
                                + '.' + element.BuildNumber) : '')
            + (this.id ? (':' + element.SubscriberPackageVersionId) : '');
    }
}
