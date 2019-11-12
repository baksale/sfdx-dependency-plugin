import { Serializer } from "any-dependency-tree/dist/serializer";
import { Package2Version } from "./model";

export class DxPackageSerializer implements Serializer<Package2Version>{
    public constructor(
        private major: boolean = true,
        private minor: boolean = true,
        private patch: boolean = true,
        private build: boolean = false,
        private name: boolean = true,
        private version: boolean = true
        ) {
        
    }
    serialize(element: Package2Version): string {
        return (this.name ? (element.Package2.Name + ":" ) : '')
            + (this.major ? (':' + element.MajorVersion) : '')
            + (this.minor ? ('.' + element.MinorVersion) : '')
            + (this.patch ? ('.' + element.PatchVersion) : '')
            + (this.build ? ('.' + element.BuildNumber) : '')
            + (this.version ? ('.' + element.SubscriberPackageVersionId) : '');
    }
    
}