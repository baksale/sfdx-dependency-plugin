import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Serializer } from 'any-dependency-tree/dist/serializer';
import { Package2Version } from './model';

export class DxPackageSerializer implements Serializer<Package2Version> {
    public constructor(
        private name: boolean = true,
        private version: boolean = true,
        private id: boolean = true
        ) {}
    public serialize(node: DependencyTreeNode<Package2Version>): string {
        const element: Package2Version = node.nodeElement;
        return (this.name ? element.Package2.Name : '')
            + (this.version ? (':' + element.MajorVersion
                                + '.' + element.MinorVersion
                                + '.' + element.PatchVersion
                                + '.' + element.BuildNumber) : '')
            + (this.id ? (':' + element.SubscriberPackageVersionId) : '');
    }
}
