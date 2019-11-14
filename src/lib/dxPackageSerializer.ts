import { Serializer } from "any-dependency-tree/dist/serializer";
import { Package2Version } from "./model";

export class DxPackageSerializer implements Serializer<Package2Version>{
    public constructor(
        private name    : boolean = true,
        private version : boolean = true,
        private id      : boolean = true
        ) {
        
    }
    serialize(element: Package2Version): string {
        return (this.name ? element.Package2.Name : '')
            + (this.version ? (':' + element.version.MajorVersion
                                + '.' + element.version.MinorVersion
                                + '.' + element.version.PatchVersion
                                + '.' + element.version.BuildNumber) : '')
            + (this.id ? (':' + element.SubscriberPackageVersionId) : '');
    }
    
}